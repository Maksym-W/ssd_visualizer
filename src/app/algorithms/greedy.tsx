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
    if (block.numStalePages < minNumOfStalePages) {
      minIndex = index;
      minNumOfStalePages = block.numStalePages;
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
    if (block.numStalePages > maxNumOfStalePages) {
      maxIndex = index;
      maxNumOfStalePages = block.numStalePages;
    }
    index++;
  }
  return maxIndex;
}

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
    console.log(availablePages);

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

  if (currentBlock == -1) {  // NOTE: add sum of all stale pages here

    // This should get rid of any recursion errors.
    const numOfStalePages = blocks.reduce((acc, block) => acc + block.numStalePages, 0);
    if (pagesToUpdate > numOfStalePages) {
      return blocks;
    }

    // we should check if there are enough spaces to write to.
    // greedyGarbageCollection(newBlocks, overprovisionArea, setCurrentBlock);
    console.log("Stale pages remaining: " + numOfStalePages);
    greedyWrite(pagesToUpdate * 4, newBlocks, currentBlock, setCurrentBlock, fileID, overprovisionArea, setOverprovisionArea, numAlreadyWritten);
  } else {
    return blocks;
  }
  setCurrentBlock(currentBlock);
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

export function greedyGarbageCollection(blocks: Array<Block>, overprovisionArea: Array<Block>, setCurrentBlock: Function): Array<Block> {
  // Right now, this is going to clear EVERY block that has stale pages.
  // Realistically this rarely happens.
  // This will eventually be a toggleable mode. There is a manual mode (this one)
  // that will clear everything, and an automatic mode that will work when a certain
  // condition is met.
  
  // Step 1: iterate over every block.
  const newBlocks = [...blocks];

  const blocksToWipe: number[] = [];
  for (let i = 0; i < newBlocks.length; i++) {
    const block = newBlocks[i];
    for (let index = 0; index < block.pages.length; index++) {
      const page = block.pages[index];
      if (page.status.startsWith("Stale")) {
        // This block needs to be wiped
        blocksToWipe.push(i);
        break;
      }
    }
  }

  console.log(newBlocks);

  // Step 2: Iterate over the blocks to wipe.
  // We're going to first get rid of all of the stale pages.
  // Then we're going to re-distribute all of the non-stale pages.
  for (let i = 0; i < blocksToWipe.length; i++) {
    // Check if i > the number of overprovision blocks we have. In this case, we can't switch out the block
    // to our OP area. Instead, we will increment the erase cycles on that block exactly.
    if (i >= overprovisionArea.length) {
      newBlocks[blocksToWipe[i]].numErases++;
    } else {
      // In this case, we increment the number of erases on the corresponding OP block (we're switching it out)
      // We don't just want to pick any block, though... We want to pick the block with the least erases.
      const minIndex = overprovisionArea.reduce((minIdx, block, i, a) => block.numErases < a[minIdx].numErases ? i : minIdx, 0);
      // Of course, if the number of erases on the current block is less than on the OP block, we will just erase ours.
      if (newBlocks[blocksToWipe[i]].numErases < overprovisionArea[minIndex].numErases) {
        newBlocks[blocksToWipe[i]].numErases++;
      } else {
        overprovisionArea[minIndex].numErases++;
      }
    }

    // Now we get all of the non-stale pages into a backup array
    const newPages = [];
    for (let j = 0; j < newBlocks[blocksToWipe[i]].pages.length; j++) {
      newPages.push({ status: "Empty", bgColour: "bg-green-500" });
    }

    // Now we fill in all of the written pages into the new pages array
    let currentIndex = 0;
    for (let j = 0; j < newBlocks[blocksToWipe[i]].pages.length; j++) {
      const page = newBlocks[blocksToWipe[i]].pages[j];
      if (page.status.startsWith("Written")) {
        newPages[currentIndex] = page;
        currentIndex++;
      } 
    }

    // Finally, we overwrite the block's with our new pages.
    newBlocks[blocksToWipe[i]].pages = newPages;

    // And we also need to get rid of the number of stale pages in the block!! Important!!
    newBlocks[blocksToWipe[i]].numStalePages = 0;
    // And also add the new number of blank pages!
    newBlocks[blocksToWipe[i]].numBlankPages = (newBlocks[blocksToWipe[i]].pages.length - currentIndex);
  }

  // For good measure
  setCurrentBlock(minStalePages(blocks, []));

  return newBlocks;
}
