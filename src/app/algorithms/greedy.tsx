import { Block } from "../page";
import { getFileColour, minStalePages } from "../utils/utils";

type GCFunction = (
  blocks: Block[],
  overprovisionArea: Block[],
  lowThreshold: number,
  highThreshold: number
) => Block[];

// TODO the input to this fuction is a mess. Create an interface for it at somepoint, and have 1 input.
export async function greedyWrite(size: number, blocks: Array<Block>, currentBlock: number, 
  fileID: number, overprovisionArea: Array<Block>, numAlreadyWritten: number, 
  gcAlgorithm: GCFunction, lowThreshold: number, highThreshold: number, slowmo: boolean, 
  setResume: React.Dispatch<React.SetStateAction<(() => void) | null>>, setSlowmoMessage: React.Dispatch<React.SetStateAction<string>>): Promise<Block[]> {

  if (isNaN(size)) return [];
  // check if the currentBlock exists yet (default value is -1)
  if (currentBlock == -1) {
    currentBlock = minStalePages(blocks);
  }

  let pagesToUpdate = Math.ceil(size / 4);

  let newBlocks = blocks.slice();

  const ignoredPages = [];

  let numWrittenPages = numAlreadyWritten;
  while (pagesToUpdate > 0 && currentBlock != -1) {

    if (slowmo == true) {
      setSlowmoMessage(" Finding where to place the data. Waiting for user to click 'Next step in the SSD'...");
      await new Promise<void>(resolve => setResume(() => resolve));
      setSlowmoMessage(" Resolved. Continuing...");
    }

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

  const numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
  const numTotalPages = blocks.reduce((acc, block) => acc += block.pages.length, 0);
  if (numBlankPages / numTotalPages <= lowThreshold) {
    newBlocks = gcAlgorithm(newBlocks, overprovisionArea, lowThreshold, highThreshold);
  }

  return newBlocks;
}

export async function greedyDelete(fileID: number, blocks: Array<Block>, setCurrentBlock: React.Dispatch<React.SetStateAction<number>>, slowmo: boolean, 
  setSlowmoMessage: React.Dispatch<React.SetStateAction<string>>, setResume: React.Dispatch<React.SetStateAction<(() => void) | null>>): Promise<Block[]> {
  if (isNaN(fileID)) return [];

  const newBlocks = [...blocks];

  for (const i in newBlocks) {

    if (slowmo == true) {
      setSlowmoMessage(" Checking block " + i + " for pages to make stale. Waiting for user to click 'Next step in the SSD'...");
      await new Promise<void>(resolve => setResume(() => resolve));
      setSlowmoMessage(" Resolved. Continuing...");
    }


    const block = newBlocks[i]
    let newStaleBlocks = 0; // Look for pages written by fileID
    for (const j in block.pages) {
      const page = block.pages[j];
      if (page.status == `Written by file ${fileID}`) {
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
