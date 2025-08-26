"use client"

import Ssdpage from "./components/ssdpage";
import { useEffect, useState } from "react";
import Ssdblock from "./components/ssdblock";

import { greedyWrite, greedyDelete } from "./algorithms/greedy";
import { totalGarbageCollection, efficientGarbageCollection, singleGarbageCollection } from "./utils/utils";
import SSDDie from "./components/ssddie";
import { stripingWrite } from "./algorithms/striping";
export interface Page {
    status: string;
    bgColour: string;
    writtenByFile?: number;
    filePageNumber?: number;
    uses?: number; // TODO Make uses compulsory
};

export interface Block {
  numStalePages: number;
  numBlankPages: number;
  numLivePages: number;
  numErases: number;
  pages: Array<Page>;
}

export class PageHeap {
  heap: Page[] = []; // This is implemented as a min heap

  insert(page: Page) {
    if (page.uses === undefined) {
      throw new Error("Page must have a 'uses' value before inserting into heap");
    }

    this.heap.push(page);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if ((this.heap[parentIndex].uses ?? 0) <= (this.heap[index].uses ?? 0)) {
        break; // Heap property is fine
      }

      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private checkValidity(index: number = 0) {
  const leftIndex = 2 * index + 1;
  const rightIndex = 2 * index + 2;
  let smallestIndex = index;

  if (
    leftIndex < this.heap.length &&
    (this.heap[leftIndex].uses ?? 0) < (this.heap[smallestIndex].uses ?? 0)
  ) {
    smallestIndex = leftIndex;
  }

  if (
    rightIndex < this.heap.length &&
    (this.heap[rightIndex].uses ?? 0) < (this.heap[smallestIndex].uses ?? 0)
  ) {
    smallestIndex = rightIndex;
  }

  if (smallestIndex !== index) {
    [this.heap[index], this.heap[smallestIndex]] = [
      this.heap[smallestIndex],
      this.heap[index],
    ];
    this.checkValidity(smallestIndex); 
  }
}

private peak() {
  return this.heap[0];
}
}

export default function Home() {
  const blockRows = 4;
  const blockCols = 4;
  const pageRows = 4;
  const pageCols = 8;

  const lowThreshold = 0.1;
  const highThreshold = 0.25;

  let newBlocks: Array<Block> = [];
  for (let i = 0; i < blockRows * blockCols; i++) {
    let pages = [];
    for (let j = 0; j < pageRows * pageCols; j++) {
      pages.push({ status: "Empty", bgColour: "bg-green-500" })
    }
    const newBlock: Block = { pages: pages, numStalePages: 0, numBlankPages: pageRows * pageCols, numLivePages: 0, numErases: 0 };
    newBlocks.push(newBlock);
  }

  let newOverprovisionArea = [];
  for (let i = 0; i < blockRows * blockCols / 4; i++) {
    let pages = [];
    for (let j = 0; j < pageRows * pageCols; j++) {
      pages.push({ status: "Empty", bgColour: "bg-green-500" })
    }
    const newBlock: Block = { pages: pages, numStalePages: 0, numBlankPages: pageRows * pageCols, numLivePages: 0, numErases: 0 };
    newOverprovisionArea.push(newBlock);
  }

  const [blocks, setBlocks] = useState(newBlocks);
  const [overprovisionArea, setOverprovisionArea] = useState(newOverprovisionArea)

  // Block we're currently writing to
  const [currentBlock, setCurrentBlock] = useState(-1);

  const [fileSizeValue, setFileSizeValue] = useState("");
  const [fileCounter, setFileCounter] = useState(1); // Track how many files have been written
  const [errorDisplay, setErrorDisplay] = useState("No errors yet");
  const [deleteFileValue, setDeleteFileValue] = useState("");

  const [algorithm, setAlgorithm] = useState('Greedy');

  const [striping, setStriping] = useState(false);

  const [automaticGc, setAutomaticGc] = useState(true);

  const [gcAlgorithm, setGcAlgorithm] = useState("Efficient Garbage Collection");


  const handleWriteFile = () => {
    let gc;
    if (!automaticGc) {
      gc = (blocks: Array[Block], num2: Array[Block], num3: number, num4: number) => blocks;
    } else if (gcAlgorithm == "Efficient Garbage Collection") {
      gc = efficientGarbageCollection;
    } else if (gcAlgorithm == "Single Garbage Collection") {
      gc = singleGarbageCollection;
    } else {
      gc = totalGarbageCollection;
    }
    if (algorithm == "Greedy") {
      if (striping) {
        const updatedBlocks = stripingWrite(parseInt(fileSizeValue), blocks, currentBlock, setCurrentBlock, fileCounter, overprovisionArea, gc, lowThreshold, highThreshold);
        setBlocks(updatedBlocks);
        setFileCounter(fileCounter + 1); // Increment for next file
      } else {
        const updatedBlocks = greedyWrite(parseInt(fileSizeValue), blocks, currentBlock, setCurrentBlock, fileCounter, overprovisionArea, 0, gc, lowThreshold, highThreshold);
        setBlocks(updatedBlocks);
        setFileCounter(fileCounter + 1); // Increment for next file
      }
    } else if (algorithm == ""){
      console.log('no algorithm selected');
    }
    // NOTE: you can remove this but I like resetting the inputValue here so you don't need to backspace
    setFileSizeValue('');
  };

  const handleDeleteFile = () => {
    if (algorithm == "Greedy") {
      const updatedBlocks = greedyDelete(parseInt(deleteFileValue), blocks, setCurrentBlock);

      setBlocks(updatedBlocks);
    } else {
      console.log('no algorithm selected');
    }
    setDeleteFileValue('');
  };

  const handleGarbageCollection = () => {
    // NOTE: right now, this does nothing. This is because our "good" threshold is the exact opposite
    // of our "bad" threshold. In the future, we would have a better good and bad threshold (e.g. 
    // < 0.25 is our bad threshold, >= 0.75 is our good threshold)

  let gc;
  if (gcAlgorithm == "Efficient Garbage Collection") {
    gc = efficientGarbageCollection;
  } else if (gcAlgorithm == "Single Garbage Collection") {
    gc = singleGarbageCollection;
  } else {
    gc = totalGarbageCollection;
  }
  let newBlocks = [...blocks];

  let numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
  let numTotalPages = blocks.reduce((acc, block) => acc += block.pages.length, 0);
  if (numBlankPages / numTotalPages <= lowThreshold) {
    newBlocks = gc(newBlocks, overprovisionArea, lowThreshold, highThreshold);
    setBlocks(newBlocks);
  }
}


  return (
    <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-12">

      <div className="md:mt-10 md:ml-auto mr-20">

        <div className="flex justify-center mx-auto max-w-5xl">
          <div className="card bg-base-300 rounded-box grid m-4">
            <div className="card-body">
              <h2 className="card-title">File Operations</h2>
              <fieldset className="fieldset border-base-100 border w-120 p-4 rounded-box">
                <legend className="fieldset-legend">Create File (size in kb)</legend>
                <div className="flex items-end gap-2">
                  <input 
                    type="text"
                    className="input input-primary"
                    value={fileSizeValue}
                    onChange={(e) => setFileSizeValue(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleWriteFile}
                  >
                    Create File
                  </button>
                </div>
              </fieldset>

              <fieldset className="fieldset border-base-100 border w-120 p-4 rounded-box">
                <legend className="fieldset-legend">Update File (block # and page #)</legend>
                <div className="flex items-end gap-2">
                  <input type="text" className="input input-primary"/>
                  <button className="btn btn-primary">Update File</button>
                </div>
              </fieldset>

              <fieldset className="fieldset border-base-100 border w-120 p-4 rounded-box">
                <legend className="fieldset-legend">Delete File (file #)</legend>
                <div className="flex items-end gap-2">
                  <input 
                    type="text"
                    className="input input-primary"
                    value={deleteFileValue}
                    onChange={(e) => setDeleteFileValue(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleDeleteFile}
                  >
                    Delete File
                  </button>
                </div>
              </fieldset>

              <fieldset className="fieldset border-base-100 border w-50 p-4 rounded-box">
                <legend className="fieldset-legend">Striping Toggle</legend>
                <label className="label">
                  <input type="checkbox" checked={striping} onChange={e => setStriping(e.target.checked)} className="toggle toggle-primary"/>
                  <p>{striping ? "Enabled" : "Disabled"}</p>
                </label>
              </fieldset>
            </div>
          </div>

          <div className="card bg-base-300 rounded-box grid m-4">
            <div className="card-body">
              <h2 className="card-title">Garbage Collection</h2>

              <fieldset className="fieldset border-base-100 border w-120 p-4 rounded-box">
                <legend className="fieldset-legend">Type</legend>
                <div className="flex items-end gap-2">
                  <select
                    className="select select-primary"
                    onChange={e => setGcAlgorithm(e.target.value)}
                  >
                    <option>Efficient Garbage Collection</option>
                    <option>Single Garbage Collection</option>
                    <option>Total Garbage Collection</option>
                  </select>
                  <button
                    className="btn btn-primary"
                    disabled={automaticGc}
                    onClick={handleGarbageCollection}
                  >
                    Trigger GC
                  </button>
                </div>
              </fieldset>

              <fieldset className="fieldset border-base-100 border w-50 p-4 rounded-box">
                <legend className="fieldset-legend">Automatic GC</legend>
                <label className="label">
                  <input type="checkbox" checked={automaticGc} onChange={e => setAutomaticGc(e.target.checked)} className="toggle toggle-primary"/>
                  <p>{automaticGc ? "Enabled" : "Disabled"}</p>
                </label>
              </fieldset>

            </div>
          </div>
        </div>


        <SSDDie blocks={blocks} blockRows={blockRows} blockCols={blockCols} pageRows={pageRows} pageCols={pageCols} text={"Main Storage"} />

        {/* Overprovision Area */}
        <SSDDie blocks={overprovisionArea} blockRows={Math.floor(blockRows/4)} blockCols={blockCols} pageRows={pageRows} pageCols={pageCols} text={"Overprovision Area (OP)"} />

        <div className="bg-blue-500 inline-block">
          <p className="font-bold">Legend</p>
          <p className="font-bold">Blocks</p>
          <ul>
            <li>E: Empty Pages</li>
            <li>L: Live Pages</li>
            <li>B: Blank Pages</li>
            <li>S: Stale Pages</li>
          </ul>
          <p className="font-bold">Pages</p>
          <ul>
            <li>Green: Blank Page</li>
            <li>Grey: Stale Page</li>
            <li>Any other colour: Live Page</li>
            <li>#1 (#2): File #1 (Page #2 of the file)</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
