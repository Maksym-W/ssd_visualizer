import { Block, Page } from "../page";
import { getFileColour, minStalePages, maxStalePages, maxEmptyPages, garbageCollection, efficientGarbageCollection } from "../utils/utils";

export function stripingWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number, overprovisionArea: Array<Block>, setBackupPages: Function, gcAlgorithm: Function): Array<Block> {
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

    // if (availablePages[0] == undefined) {
    //   currentBlock = stripingGarbageCollection(blocks, overprovisionArea, setCurrentBlock);
    //   continue;
    // }
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

  let lowUtilizationBlocks = newBlocks.filter(block => block.numBlankPages / block.pages.length >= 0.75);
  if (lowUtilizationBlocks.length / newBlocks.length <= 0.5) {
    newBlocks = gcAlgorithm(newBlocks, overprovisionArea, setCurrentBlock);
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
