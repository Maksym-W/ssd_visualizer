"use client"

import Ssdpage from "./components/ssdpage";
import { useEffect, useState } from "react";
import Ssdblock from "./components/ssdblock";

import { greedyWrite, greedyDelete } from "./algorithms/greedy";

export default function Home() {
  const blockSize = 16;  // Make sure that this is a multiple of 4.

  const [pages, setPages] = useState<Array<{status: string, bgColour: string, writtenByFile?: number}>>( // Maybe turn this into an interface? TODO 
    Array(blockSize * 4).fill({ status: "Empty", bgColour: "bg-green-500" })
  );
  const [inputValue, setInputValue] = useState("");
  const [fileCounter, setFileCounter] = useState(1); // Track how many files have been written
  const [errorDisplay, setErrorDisplay] = useState("No errors yet");
  const [deleteFileValue, setDeleteFileValue] = useState("");
  const [staleCounter, setStaleCounter] = useState(0);

  const [algorithm, setAlgorithm] = useState('');


  useEffect(() => {
    if (staleCounter >= .25){
    console.log("THIS IS NOT IMPLEMENTED!")}
  }, [staleCounter]); 

  const handleWriteFile = () => {
    if (algorithm == "Greedy") {
      const updatedPages = greedyWrite(parseInt(inputValue), pages, fileCounter);

      setPages(updatedPages);
      setFileCounter(fileCounter + 1); // Increment for next file
    } else {
      console.log('no algorithm selected');
    }
    // NOTE: you can remove this but I like resetting the inputValue here so you don't need to backspace
    setInputValue('');
  };

  const handleDeleteFile = () => {
    if (algorithm == "Greedy") {
      const updatedPages = greedyDelete(parseInt(deleteFileValue), pages);

      setPages(updatedPages);
    } else {
      console.log('no algorithm selected');
    }
  };

  let pageCounter = 1;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-12">
      <div className="text-left max-w-xl">
        <h1 className="text-3xl font-bold mb-4">SSD Model</h1>
        <p className="text-lg">
          The stuff on the right is an in-progress attempt of visualizing an ssd. The below is an image of the goal, and the right is what is coded
        </p>
          <img
            src="https://images.anandtech.com/doci/7864/NAND%20die.png"
            alt="A photo of what we want"
            className="w-[600px] h-auto rounded-lg shadow-lg"
          />
        <h1 className="text-3xl font-bold mb-4">The size of the page is 4kb</h1>
        <h1>Last error: {errorDisplay}</h1>
      </div>

      {/* The stuff below is the ssd stuff. The above is info*/}
      <div className="md:mt-10 md:ml-auto mr-20">

        {/* NOTE: for some reason I can't have both value={} and placeholder= in this... so if you don't like one then yeah */}
        <input type="text"
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue} 
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

        <select defaultValue="Select an Algorithm" 
        className="select select-bordered text-blue-500 border-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg px-4 py-2 rounded" 
        onChange={e => setAlgorithm(e.target.value)}>
          <option disabled={true}>Select an Algorithm</option>
          <option>Greedy</option>
        </select>
        


        <Ssdpage bgColour="bg-yellow-300" status="THIS IS SUPPOSED TO BE A PLANE, NOT A PAGE!!!!">
          {/* 2x2 Block Grid */}
          <div className="grid grid-cols-2 gap-8 p-4"> {/* Main block container */}
            {/* Better way to have a grid */}
            {Array(4).fill(0).map((_, i) => (
                  <Ssdblock 
                key={`block-${i}`}
                pages={pages} 
                blockNumber={i+1} 
                startPageIndex={i*blockSize} 
                      blockSize={blockSize}
              />
            ))}

          </div>
        </Ssdpage>

        <Ssdpage bgColour="bg-yellow-300" status="Backup pages">
        <div className="flex space-x-4">
          <div className="grid grid-cols-4 gap-2">
            {[...Array(24)].map((_, i) => (
              <Ssdpage
                key={"left-" + i}
                bgColour={"bg-green-500"}
                pageNumber={pageCounter++}
                status={"Empty"}
              />
            ))}
         </div>
        </div>
        </Ssdpage>  
      </div>
    </div>
  );
}
