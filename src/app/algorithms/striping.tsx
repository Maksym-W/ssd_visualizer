import { Block } from "../page";
import { getFileColour, minStalePages, maxEmptyPages } from "../utils/utils";

// TODO the input to this fuction is a mess. Create an interface for it at somepoint, and have 1 input.
export async function stripingWrite(size: number, blocks: Array<Block>, currentBlock: number, fileID: number, 
  overprovisionArea: Array<Block>, gcAlgorithm: "Efficient" | "Greedy" | "One", lowThreshold: number, highThreshold: number, 
  slowmo: boolean, setResume: React.Dispatch<React.SetStateAction<(() => void) | null>>): Promise<Block[]> {
  if (isNaN(size)) return [];

  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    currentBlock = maxEmptyPages(blocks);
  }

  let pagesToUpdate = Math.ceil(size / 4);

  let newBlocks = blocks.slice();

  const ignoredPages = [];

  let numWritten = 0;
  while (pagesToUpdate > 0 && currentBlock != -1) {
    console.log("waiting to resolve");
    if (slowmo == true) await new Promise<void>(resolve => setResume(() => resolve));
    console.log("it resolved.");
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

  const numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
  const numTotalPages = blocks.reduce((acc, block) => acc += block.pages.length, 0);
  if (numBlankPages / numTotalPages <= lowThreshold) {
    newBlocks = gcAlgorithm(newBlocks, overprovisionArea, lowThreshold, highThreshold);
  }

  return newBlocks;
}

export function stripingDelete(fileID: number, blocks: Array<Block>, setCurrentBlock: React.Dispatch<React.SetStateAction<number>>): Array<Block> {
  if (isNaN(fileID)) return [];

  const newBlocks = [...blocks];

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
