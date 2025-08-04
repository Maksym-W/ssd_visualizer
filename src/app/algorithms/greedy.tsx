import { Block } from "../page";
import getFileColour from "../utils/utils";


export function greedyWrite(size: number, blocks: Array<Block>, currentBlock: number, setCurrentBlock: Function, fileID: number): Array<Block> {

  if (isNaN(size)) return;

  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    let minNumOfStalePages = Infinity;
    let minIndex = -1;
    let index = 0;
    // Check for the block with the fewest stale blocks
    for (const block of blocks) {
      if (block.numOfStalePages < minNumOfStalePages) {
        minIndex = index;
        minNumOfStalePages = block.numOfStalePages;
      }
      index++;
    }

    setCurrentBlock(index);
  }

  const pagesToUpdate = Math.ceil(size / 4);

  // Find available pages (NOTE: might not work like this)
  const emptyPages = blocks
    .map((page, index) => ({ ...page, index }))
    .filter(page => page.status.startsWith("Empty"));

  // Combine empty and previously written pages (if you want to allow overwrites)
  const availablePages = [...emptyPages];

  if (availablePages.length < pagesToUpdate) {
    console.error("Not enough space!");  // NOTE: in reality, this is where garbage collection would probably be 
    // setErrorDisplay("Not enough space!");
    return;
  }

  // Create updated pages array
  const updatedPages = [...blocks];
  availablePages.slice(0, pagesToUpdate).forEach(page => {
    updatedPages[page.index] = {
      status: `Written by file ${fileID}`,
      bgColour: getFileColour(fileID) // Optional: different colors per file
    };
  });

  console.log(fileID);
  return updatedPages;
}

export function greedyDelete(fileID: number, blocks: Array<Block>): Array<Block> {
  if (isNaN(fileID)) return;

  let newBlocks = [...blocks];

  for (const i in newBlocks) {
    const block = newBlocks[i]
    let newStaleBlocks = 0;
    // Look for pages written by fileID
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

  return newBlocks;
}
