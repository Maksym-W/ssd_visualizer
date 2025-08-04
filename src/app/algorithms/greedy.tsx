import { Block } from "../page";
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

export function greedyWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number): Array<Block> {

  if (isNaN(size)) return;

  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    currentBlock = minStalePages(blocks);
  }


  let pagesToUpdate = Math.ceil(size / 4);

  let newBlock = blocks.slice();


  let ignoredPages = [];
  while (pagesToUpdate > 0 && currentBlock != -1) {
    console.log("Current size: " + pagesToUpdate)
    console.log("Current block: " + currentBlock)
    // Find available pages (NOTE: might not work like this)
    const emptyPages = blocks[currentBlock].pages
      .map((page, index) => ({ ...page, index }))
      .filter(page => page.status.startsWith("Empty"));

    // Combine empty and previously written pages (if you want to allow overwrites)
    const availablePages = [...emptyPages];

    // Create updated pages array
    const updatedPages = [...blocks[currentBlock].pages];
    availablePages.slice(0, pagesToUpdate).forEach(page => {
      updatedPages[page.index] = {
        status: `Written by file ${fileID}`,
        bgColour: getFileColour(fileID) // Optional: different colors per file
      };
    });
    newBlock[currentBlock].pages = updatedPages;

    pagesToUpdate -= availablePages.length;
    if (pagesToUpdate > 0) {
      // Retrigger the currentBlock algorithm
      ignoredPages.push(currentBlock)
      currentBlock = minStalePages(blocks, ignoredPages);
      console.log("hello!");
    }
  }

  if (currentBlock == -1) {  // we ran out of space
    console.error("Not enough space!");  // NOTE: in reality, this is where garbage collection would probably be 
    return;
  }
  setCurrentBlock(currentBlock);
  return newBlock;
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

export function greedyGarbageCollection() {

}
