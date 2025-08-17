"use client"

import Ssdpage from "./components/ssdpage";
import { useEffect, useState } from "react";
import Ssdblock from "./components/ssdblock";

import { greedyWrite, greedyDelete, greedyGarbageCollection } from "./algorithms/greedy";
import SSDDie from "./components/ssddie";

export interface Page {
    status: string;
    bgColour: string;
    writtenByFile?: number;
    filePageNumber?: number;
};

export interface Block {
  numStalePages: number;
  numBlankPages: number;
  numLivePages: number;
  numErases: number;
  pages: Array<Page>;
}

export default function Home() {
  const blockRows = 4;
  const blockCols = 4;
  const pageRows = 4;
  const pageCols = 8;

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
  const [staleCounter, setStaleCounter] = useState(0);

  const [algorithm, setAlgorithm] = useState('Greedy');


  useEffect(() => {
    if (staleCounter >= .25){
    console.log("THIS IS NOT IMPLEMENTED!")}
  }, [staleCounter]); 

  const handleWriteFile = () => {
    if (algorithm == "Greedy") {
      const updatedBlocks = greedyWrite(parseInt(fileSizeValue), blocks, currentBlock, setCurrentBlock, fileCounter, overprovisionArea, setOverprovisionArea, 0);

      setBlocks(updatedBlocks);
      setFileCounter(fileCounter + 1); // Increment for next file
    } else {
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
  };

  const handleGarbageCollection = () => {
    let newBlocks = greedyGarbageCollection(blocks, overprovisionArea, setCurrentBlock);
    setBlocks(newBlocks);
  }

  let pageCounter = 1;


  return (
    <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-12">

      <div className="md:mt-10 md:ml-auto mr-20">
        {/* NOTE: for some reason I can't have both value={} and placeholder= in this... so if you don't like one then yeah */}
        <input type="text"
          onChange={(e) => setFileSizeValue(e.target.value)}
          value={fileSizeValue} 
          className="input input-primary"
        />

        <button onClick={handleWriteFile}
          className="btn btn-primary"
        >
          Write a file of size n kilobytes
        </button>

        <input type="text" placeholder="Enter value..."
          onChange={(e) => setDeleteFileValue(e.target.value)}
          className="input input-primary"
        />

        <button onClick={handleDeleteFile}
          className="btn btn-primary"
        >
          Delete file n
        </button>

        <select defaultValue="Greedy" 
        className="select select-primary" 
        onChange={e => setAlgorithm(e.target.value)}>
          <option disabled={true}>Select an Algorithm</option>
          <option>Greedy</option>
        </select>

        <button onClick={handleGarbageCollection}
          className="btn btn-primary"
        >
          Toggle Garbage Collection
        </button>
        
        


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
