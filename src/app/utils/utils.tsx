import { Block, Page } from "../page";

export const getFileColour = (fileID: number) => {
  const colours = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-teal-500"
  ];
  return colours[(fileID - 1) % colours.length];
}


export const minStalePages = (blocks: Array<Block>, ignoredPages: Array<number> = []) => {
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


export const maxStalePages = (blocks: Array<Block>, ignoredPages: Array<number> = []) => {
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


export const maxEmptyPages = (blocks: Array<Block>, ignoredPages: Array<number> = []) => {
  let maxNumOfEmptyPages = -Infinity;
  let maxIndex = -1;

  for (let i = 0; i < blocks.length; i++){
    if (ignoredPages.includes(i)) {
      continue;
    };
    const block = blocks[i];
    let numOfCurrentEmptyPages = block.numBlankPages;

    if (numOfCurrentEmptyPages > maxNumOfEmptyPages) {
      maxNumOfEmptyPages = numOfCurrentEmptyPages;
      maxIndex = i;
    }
  }

  return maxIndex
}

export const efficientGarbageCollection = (blocks: Array<Block>, overprovisionArea: Array<Block>, lowThreshold: number, highThreshold: number) => {
  // Check if there are fewer than 50% free blocks
  let numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
  let numTotalPages = blocks.reduce((acc, block) => acc += block.pages.length, 0);
  while (numBlankPages / numTotalPages <= highThreshold) {
    let blockIndex = maxStalePages(blocks);
    if (blocks[blockIndex].numStalePages == 0) break;

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
    blocks[blockIndex].numBlankPages = blocks[blockIndex].pages.length - newBackupPages.length;
     
    numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
  }

  return blocks;
}

export const singleGarbageCollection = (blocks: Array<Block>, overprovisionArea: Array<Block>, lowThreshold: number, highThreshold: number) => {
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
  blocks[blockIndex].numBlankPages = blocks[blockIndex].pages.length - newBackupPages.length;
   
  return blocks;
}

export const totalGarbageCollection = (blocks: Array<Block>, overprovisionArea: Array<Block>, lowThreshold: number, highThreshold: number) => {

  let blockIndex = maxStalePages(blocks);
  while (blocks[blockIndex].numStalePages > 0) {
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
    blocks[blockIndex].numBlankPages = blocks[blockIndex].pages.length - newBackupPages.length;

    blockIndex = maxStalePages(blocks);
  }
   
  return blocks;
}

export const numWriteablePages = (blocks: Array<Block>) => {
  let sum = 0;
  for (const block of blocks) {
    sum += block.numBlankPages + block.numStalePages;
  }
  return sum;
}

export const listOfFiles = (blocks: Array<Block>) => {
  let files: Array<number> = [];
  for (const block of blocks) {
    for (const page of block.pages) {
      if (page.writtenByFile && !files.includes(page.writtenByFile)) {
        files.push(page.writtenByFile);
      }
    }
  }
  return files;
}

export const updateFile = (blocks: Array<Block>, blockNum: number, pageNum: number) => {
  // Step 1: Invalidate the block
  const page = blocks[blockNum].pages[pageNum];
  const newPage = { ...page, status: "Stale", bgColour: "bg-gray-500" };
  blocks[blockNum].pages[pageNum] = newPage;
  // We also need to adjust the block stats
  blocks[blockNum].numStalePages++;
  blocks[blockNum].numLivePages--;

  // Step 2: place "page" in another block.
  // We want to find the block with the most space. (aside from this block, probably.)
  const newBlock = minStalePages(blocks, [blockNum]);
  // Find the nearest free page
  for (let i = 0; i < blocks[newBlock].pages.length; i++) {
    if (blocks[newBlock].pages[i].status.startsWith("Empty")) {
      blocks[newBlock].pages[i] = page;
      blocks[newBlock].numLivePages++;
      blocks[newBlock].numBlankPages--;
      break;
    }
  }

  return blocks;
}
