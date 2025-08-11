"use client"

import Ssdpage from "./components/ssdpage";
import { useEffect, useState } from "react";
import Ssdblock from "./components/ssdblock";

import { greedyWrite, greedyDelete } from "./algorithms/greedy";
import SSDDie from "./components/ssddie";

export interface Page {
    status: string;
    bgColour: string;
    writtenByFile?: number;
    filePageNumber?: number;
};

export interface Block {
  numOfStalePages: number;
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
    const newBlock: Block = { pages: pages, numOfStalePages: 0 };
    newBlocks.push(newBlock);
  }

  let newBackupPages = [];
  for (let i = 0; i < 16; i++) {
    newBackupPages.push({ status: "Empty", bgColour: "bg-green-500" })
  }

  const [blocks, setBlocks] = useState(newBlocks);
  const [backupPages, setBackupPages] = useState(newBackupPages)

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
      const updatedBlocks = greedyWrite(parseInt(fileSizeValue), blocks, currentBlock, setCurrentBlock, fileCounter, backupPages, setBackupPages);

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

  let pageCounter = 1;
// export interface Page {
//     status: string;
//     bgColour: string;
//     writtenByFile?: number;
// };


  return (
    <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-12">
      <div className="md:mt-10 md:ml-auto mr-20">

        {/* NOTE: for some reason I can't have both value={} and placeholder= in this... so if you don't like one then yeah */}
        <input type="text"
          onChange={(e) => setFileSizeValue(e.target.value)}
          value={fileSizeValue} 
          className="border border-blue-500 text-blue-500 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
        />

        <button onClick={handleWriteFile}
          className="btn btn-outline btn-primary border-blue-500 text-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg px-4 py-2 rounded"
        >
          Write a file of size n kilobytes
        </button>

        <input type="text" placeholder="Enter value..."
          onChange={(e) => setDeleteFileValue(e.target.value)}
          className="border border-blue-500 text-blue-500 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
        />

        <button onClick={handleDeleteFile}
          className="btn btn-outline btn-primary border-blue-500 text-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg px-4 py-2 rounded"
        >
          Delete file n
        </button>

        <select defaultValue="Greedy" 
        className="select select-bordered text-blue-500 border-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg px-4 py-2 rounded" 
        onChange={e => setAlgorithm(e.target.value)}>
          <option disabled={true}>Select an Algorithm</option>
          <option>Greedy</option>
        </select>
        {/* The below doesnt do anything yet */}
        <select defaultValue="Slow Mo off" 
        className="select select-bordered text-blue-500 border-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg px-4 py-2 rounded" 
        onChange={e => setAlgorithm(e.target.value)}>
          <option>Slow Mo On</option>
          <option>Slow Mo off</option>
        </select>
        
        


        {/* <SSDDie blockRows={4} blockCols={4} pageRows={4} pageCols={8} text={"Main Storage"}/> */}
        <SSDDie blocks={blocks} blockRows={blockRows} blockCols={blockCols} pageRows={pageRows} pageCols={pageCols} text={"Main Storage"} />
        {/* <SSDDie blocks={blocks} text={"Main Storage"} /> */}
      </div>
    </div>
  );
}
