import { Block, Page } from "../page";
import { getFileColour, minStalePages, maxStalePages, maxEmptyPages } from "../utils/utils";

export function stripingWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number, overprovisionArea: Array<Block>, setBackupPages: Function): Array<Block> {
  if (isNaN(size)) return [];

  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    currentBlock = maxEmptyPages(blocks);
  }

  let pagesToUpdate = Math.ceil(size / 4);

  let newBlocks = blocks.slice();

  let ignoredPages = [];

  let numWritten = 0;
  while (pagesToUpdate > 0 && currentBlock != -1) {
    // Find available pages within the current block. (NOTE: might not work like this)
    const emptyPages = newBlocks[currentBlock].pages
      .map((page, index) => ({ ...page, index }))
      .filter(page => page.status.startsWith("Empty"));

    // Combine empty and previously written pages (if you want to allow overwrites)
    const availablePages = [...emptyPages];

    // Write into the first available page.
    const updatedPages = [...newBlocks[currentBlock].pages];

    if (availablePages[0] == undefined) {
      currentBlock = stripingGarbageCollection(blocks, overprovisionArea, setCurrentBlock);
      continue;
    }
    const firstPage = availablePages[0];

    
    updatedPages[firstPage.index] = {
      ...updatedPages[firstPage.index], // keep existing props if needed
      status: `Written by file ${fileID}`,
      bgColour: getFileColour(fileID), // Optional: different colors per file
      writtenByFile: fileID,
      filePageNumber: numWritten,
    };

    newBlocks[currentBlock].pages = updatedPages;
    newBlocks[currentBlock].numBlankPages -= 1;
    newBlocks[currentBlock].numLivePages += 1;

    pagesToUpdate -= 1;
    numWritten++;

    if (pagesToUpdate > 0) {
      currentBlock = maxEmptyPages(blocks);
      if (blocks[currentBlock].numBlankPages == 0){
        ignoredPages.push(currentBlock)
        currentBlock = minStalePages(newBlocks, ignoredPages);
      }
    }
  }

  // Run our GC check down here
  // If there is less than 50% of blocks with "low utilization" (25% blank)
  const lowUtilizationBlocks = newBlocks.filter(block => block.numBlankPages / block.pages.length <= 0.25);
  if (lowUtilizationBlocks.length / newBlocks.length < 0.5) {
    stripingGarbageCollection(newBlocks, overprovisionArea, setCurrentBlock);
  }
  return newBlocks;
}

export function stripingDelete(fileID: number, blocks: Array<Block>, setCurrentBlock: Function): Array<Block> {
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
    newBlocks[i] = block;
  }

  setCurrentBlock(-1);
  return newBlocks;
}

export function stripingGarbageCollection(blocks: Array<Block>, overprovisionArea: Array<Block>, setCurrentBlock: Function, blockIndex = -1): number {
  // find the block with the most amount of stale pages
  if (blockIndex == -1) {
    blockIndex = maxStalePages(blocks);
  } else {
    // Ensure that the block actually has stale pages to evict.
    if (blocks[blockIndex].numStalePages == 0) {
      return blockIndex;
    }
  }

  // Step 1: Find each non-stale page, write it to the backup pages
  const newBackupPages: Array<Page> = [];

  for (const page of blocks[blockIndex].pages) 
    if (/^Written by file \d+$/.test(page.status)) newBackupPages.push(page);

  // Step 2: set all pages in the block to empty pages
  for (let pageIndex = 0; pageIndex < overprovisionArea.length; pageIndex++) blocks[blockIndex].pages[pageIndex] = { status: "Empty", bgColour: "bg-green-500"};

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

  console.log("garbage collection is done.");
  return blockIndex;
}
