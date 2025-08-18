import { Block, Page } from "../page";
import { getFileColour, minStalePages, maxStalePages, maxEmptyPages } from "../utils/utils";

export function greedyWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number, overprovisionArea: Array<Block>, setOverprovisionArea: Function, numAlreadyWritten: number): Array<Block> {

  if (isNaN(size)) return [];

  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    currentBlock = minStalePages(blocks);
  }

  let pagesToUpdate = Math.ceil(size / 4);

  let newBlocks = blocks.slice();

  let ignoredPages = [];

  let pageIndexPlus = 0;
  let numWrittenPages = numAlreadyWritten;
  while (pagesToUpdate > 0 && currentBlock != -1) {
    // Find available pages (NOTE: might not work like this)
    const emptyPages = newBlocks[currentBlock].pages
      .map((page, index) => ({ ...page, index }))
      .filter(page => page.status.startsWith("Empty"));

    // Combine empty and previously written pages (if you want to allow overwrites)
    const availablePages = [...emptyPages];
    const updatedPages = [...newBlocks[currentBlock].pages];

    // Write to the new pages
    let numWrittenOnBlock = 0;
    for (let i = 0; i < Math.min(pagesToUpdate, availablePages.length); i++) {
      const page = availablePages[i];
      updatedPages[page.index] = {
        status: `Written by file ${fileID}`,
        bgColour: getFileColour(fileID),
        writtenByFile: fileID,
        filePageNumber: numWrittenPages
      }
      numWrittenPages++;
      numWrittenOnBlock++;
    }
    newBlocks[currentBlock].pages = updatedPages;
    newBlocks[currentBlock].numLivePages += numWrittenOnBlock;
    newBlocks[currentBlock].numBlankPages -= numWrittenOnBlock;

    pagesToUpdate -= availablePages.length;
    if (pagesToUpdate > 0) {
      // Retrigger the currentBlock algorithm
      ignoredPages.push(currentBlock)
      currentBlock = minStalePages(newBlocks, ignoredPages);
    }
  }
  pageIndexPlus = 0;

  // Check if there are fewer than 50% free blocks
  const freeBlocks = newBlocks.filter(block => block.numBlankPages == block.pages.length);
  if (freeBlocks.length / newBlocks.length < 0.5) {
    newBlocks = greedyGarbageCollection(newBlocks, overprovisionArea, setCurrentBlock);
  }
  return newBlocks;
}

export function greedyDelete(fileID: number, blocks: Array<Block>, setCurrentBlock: Function): Array<Block> {
  if (isNaN(fileID)) return [];

  let newBlocks = [...blocks];

  for (const i in newBlocks) {
    const block = newBlocks[i]
    let newStaleBlocks = 0; // Look for pages written by fileID
    for (const j in block.pages) {
      const page = block.pages[j];
      if (page.status.startsWith(`Written by file ${fileID}`)) {
        newStaleBlocks++;
        const newPage = { ...page, status: "Stale", bgColour: "bg-gray-500" };
        block.pages[j] = newPage;
      }
    }

    block.numStalePages += newStaleBlocks;
    block.numLivePages -= newStaleBlocks;
    newBlocks[i] = block;
  }

  setCurrentBlock(-1);
  return newBlocks;
}

export function greedyGarbageCollection(blocks: Array<Block>, overprovisionArea: Array<Block>, setCurrentBlock: Function, isFullWipe = false): Array<Block> {
  if (isFullWipe) {
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      if (blocks[blockIndex].numStalePages == 0) continue;
      // Step 1: Find each non-stale page, write it to the backup pages
      const newBackupPages: Array<Page> = [];

      for (const page of blocks[blockIndex].pages) 
        if (/^Written by file \d+$/.test(page.status)) newBackupPages.push(page);

      // Step 2: set all pages in the block to empty pages
      for (let pageIndex = 0; pageIndex < blocks[blockIndex].pages.length; pageIndex++) blocks[blockIndex].pages[pageIndex] = { status: "Empty", bgColour: "bg-green-500"};

      // Step 3: write back the backup pages
      for (let pageIndex = 0; pageIndex < newBackupPages.length; pageIndex++) 
        blocks[blockIndex].pages[pageIndex] = newBackupPages[pageIndex];

      // Now we "swap" with a block in OP IF the num of erases on this block is more than any of the blocks in OP.
      const minIndex = overprovisionArea.reduce((minIdx, block, i, a) => block.numErases < a[minIdx].numErases ? i : minIdx, 0);

      if (overprovisionArea[minIndex].numErases <= blocks[blockIndex].numErases) {
        overprovisionArea[minIndex].numErases++;
      } else {
        blocks[blockIndex].numErases++;
      }

      // NOTE: we also need to reset the number of stale pages in the block
      blocks[blockIndex].numStalePages = 0;
      blocks[blockIndex].numLivePages = newBackupPages.length;
      blocks[blockIndex].numBlankPages = blocks[blockIndex].pages.length - blocks[blockIndex].numLivePages;
    }
    return blocks;

  } else {
    let blockIndex = maxStalePages(blocks);
    // Step 1: Find each non-stale page, write it to the backup pages
    const newBackupPages: Array<Page> = [];

    for (const page of blocks[blockIndex].pages) 
      if (/^Written by file \d+$/.test(page.status)) newBackupPages.push(page);

    // Step 2: set all pages in the block to empty pages
    for (let pageIndex = 0; pageIndex < blocks[blockIndex].pages.length; pageIndex++) blocks[blockIndex].pages[pageIndex] = { status: "Empty", bgColour: "bg-green-500"};

    // Step 3: write back the backup pages
    for (let pageIndex = 0; pageIndex < newBackupPages.length; pageIndex++) 
      blocks[blockIndex].pages[pageIndex] = newBackupPages[pageIndex];

    // Now we "swap" with a block in OP IF the num of erases on this block is more than any of the blocks in OP.
    const minIndex = overprovisionArea.reduce((minIdx, block, i, a) => block.numErases < a[minIdx].numErases ? i : minIdx, 0);

    if (overprovisionArea[minIndex].numErases <= blocks[blockIndex].numErases) {
      overprovisionArea[minIndex].numErases++;
    } else {
      blocks[blockIndex].numErases++;
    }

    // NOTE: we also need to reset the number of stale pages in the block
    blocks[blockIndex].numStalePages = 0;

    return blocks;
  }
}
