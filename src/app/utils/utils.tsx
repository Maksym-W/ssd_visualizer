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
