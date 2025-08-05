import { Block, Page } from "../page";
import getFileColour from "../utils/utils";

const minStalePages = (blocks: Array<Block>, ignoredPages: Array<number> = []) => {
  let minNumOfStalePages = Infinity;
  let minIndex = -1;
  let index = 0;
  // Check for the block with the fewest stale blocks (NOT in ignoredPages)
  for (let i = 0; i < blocks.length; i++) {
    if (ignoredPages.includes(i)) {
      index++;
      continue;
    };
    const block = blocks[i];
    if (block.numOfStalePages < minNumOfStalePages) {
      minIndex = index;
      minNumOfStalePages = block.numOfStalePages;
    }
    index++;
  }
  return minIndex;
}

const maxStalePages = (blocks: Array<Block>, ignoredPages: Array<number> = []) => {
  let maxNumOfStalePages = -Infinity;
  let maxIndex = -1;
  let index = 0;
  // Check for the block with the most stale blocks (NOT in ignoredPages)
  for (let i = 0; i < blocks.length; i++) {
    if (ignoredPages.includes(i)) {
      index++;
      continue;
    };
    const block = blocks[i];
    if (block.numOfStalePages > maxNumOfStalePages) {
      maxIndex = index;
      maxNumOfStalePages = block.numOfStalePages;
    }
    index++;
  }
  return maxIndex;
}

export function greedyWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number, backupPages: Array<Page>, setBackupPages: Function): Array<Block> {

  if (isNaN(size)) return;

  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    currentBlock = minStalePages(blocks);
  }

  let pagesToUpdate = Math.ceil(size / 4);

  let newBlocks = blocks.slice();

  let ignoredPages = [];

  while (pagesToUpdate > 0 && currentBlock != -1) {
    // Find available pages (NOTE: might not work like this)
    const emptyPages = newBlocks[currentBlock].pages
      .map((page, index) => ({ ...page, index }))
      .filter(page => page.status.startsWith("Empty"));

    // Combine empty and previously written pages (if you want to allow overwrites)
    const availablePages = [...emptyPages];

    // Create updated pages array
    const updatedPages = [...newBlocks[currentBlock].pages];
    availablePages.slice(0, pagesToUpdate).forEach(page => {
      updatedPages[page.index] = {
        status: `Written by file ${fileID}`,
        bgColour: getFileColour(fileID) // Optional: different colors per file
      };
    });
    newBlocks[currentBlock].pages = updatedPages;

    pagesToUpdate -= availablePages.length;
    if (pagesToUpdate > 0) {
      // Retrigger the currentBlock algorithm
      ignoredPages.push(currentBlock)
      currentBlock = minStalePages(newBlocks, ignoredPages);
    }
  }

  if (currentBlock == -1) {  // NOTE: add sum of all stale pages here
    greedyGarbageCollection(newBlocks, backupPages, setCurrentBlock);
    greedyWrite(size, blocks, currentBlock, setCurrentBlock, fileID, backupPages, setBackupPages);
    return blocks;
  }
  setCurrentBlock(currentBlock);
  return newBlocks;
}

export function greedyDelete(fileID: number, blocks: Array<Block>, setCurrentBlock: Function): Array<Block> {
  if (isNaN(fileID)) return;

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

    block.numOfStalePages += newStaleBlocks;
    newBlocks[i] = block;
  }

  setCurrentBlock(-1);
  return newBlocks;
}

export function greedyGarbageCollection(blocks: Array<Block>, backupPages: Array<Page>, setCurrentBlock: Function): Array<Page> {
  // find the block with the most amount of stale pages
  let blockIndex = maxStalePages(blocks);

  // Step 1: Find each non-stale page, write it to the backup pages
  const newBackupPages: Array<Page> = [];
  
  for (const page of blocks[blockIndex].pages) 
    if (/^Written by file \d+$/.test(page.status)) newBackupPages.push(page);

  for (let pageIndex = 0; pageIndex < newBackupPages.length; pageIndex++) // Note, we are assuming that all of the pages in the backup are empty.
      backupPages[pageIndex] = newBackupPages[pageIndex];

  // Step 2: set all pages in the block to empty pages
  for (let pageIndex = 0; pageIndex < backupPages.length; pageIndex++) blocks[blockIndex].pages[pageIndex] = { status: "Empty", bgColour: "bg-green-500"};

  // Step 3: write back the backup pages
  for (let pageIndex = 0; pageIndex < newBackupPages.length; pageIndex++) 
    blocks[blockIndex].pages[pageIndex] = newBackupPages[pageIndex]; // Maybe call greedywrite here instead?

  return [];
}
