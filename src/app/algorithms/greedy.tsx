import { time } from "console";
import { Block, Page } from "../page";
import { getFileColour, minStalePages, maxStalePages, maxEmptyPages } from "../utils/utils";

export function greedyWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number, overprovisionArea: Array<Block>, numAlreadyWritten: number, gcAlgorithm: Function, lowThreshold: number, highThreshold: number): Array<Block> {

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

  let numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
  let numTotalPages = blocks.reduce((acc, block) => acc += block.pages.length, 0);
  if (numBlankPages / numTotalPages <= lowThreshold) {
    newBlocks = gcAlgorithm(newBlocks, overprovisionArea, lowThreshold, highThreshold);
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
