"use client"

import Box from "./components/box";
import { useState } from "react";

export default function Home() {
  const [pages, setPages] = useState<Array<{status: string, bgColor: string}>>(
    Array(48).fill({ status: "Empty", bgColor: "bg-green-500" })
  );
  const [inputValue, setInputValue] = useState("");
  const [fileCounter, setFileCounter] = useState(1); // Track how many files have been written
  const [errorDisplay, setErrorDisplay] = useState("No errors yet");

  const handleWriteFile = () => {
    const kbSize = parseInt(inputValue);
    if (isNaN(kbSize)) return;

    const pagesToUpdate = Math.ceil(kbSize / 4);
    
    // Find available pages
    const emptyPages = pages
      .map((page, index) => ({ ...page, index }))
      .filter(page => page.status.startsWith("Empty"));

    // Combine empty and previously written pages (if you want to allow overwrites)
    const availablePages = [...emptyPages];

    if (availablePages.length < pagesToUpdate) {
      console.log("Not enough space!");
      setErrorDisplay("Not enough space!");
      return;
    }

    // Create updated pages array
    const updatedPages = [...pages];
    availablePages.slice(0, pagesToUpdate).forEach(page => {
      updatedPages[page.index] = {
        status: `Written by file ${fileCounter}`,
        bgColor: getFileColor(fileCounter) // Optional: different colors per file
      };
    });

    setPages(updatedPages);
    setFileCounter(fileCounter + 1); // Increment for next file
  };

  const getFileColor = (fileNumber: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-teal-500"
    ];
    return colors[(fileNumber - 1) % colors.length];
  };

  let counter = 1;

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

      <div className="md:mt-10 md:ml-auto mr-20">

          <input type="text" placeholder="Enter value..."
            onChange={(e) => setInputValue(e.target.value)}
            className="border border-blue-500 text-blue-500 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
          />

          <button onClick={handleWriteFile}
            className="btn btn-outline btn-primary border-blue-500 text-blue-500 transition duration-200 hover:scale-105 hover:shadow-lg px-4 py-2 rounded"
          >
            Write a file of size n kilobytes
          </button>

        <Box bgColor="bg-yellow-300">
        <div className="flex space-x-4">
          {/* Left column */}
          <div className="grid grid-cols-4 gap-2">
            {[...Array(24)].map((_, i) => (
              <Box
                key={"left-" + i}
                bgColor={pages[i].bgColor || "bg-green-500"}
                pageNumber={counter++}
                status={pages[i].status || "Empty"}
              />
            ))}
         </div>

          {/* Right column */}
         <div className="grid grid-cols-4 gap-2">
            {[...Array(24)].map((_, i) => (
              <Box
                key={"right-" + i}
                bgColor={pages[i+24].bgColor || "bg-green-500"}
                pageNumber={counter++}
                status={pages[i + 24].status}
              />
            ))}
          </div>
        </div>
        </Box>  

        <Box bgColor="bg-yellow-300" status="Backup pages">
        <div className="flex space-x-4">
          <div className="grid grid-cols-4 gap-2">
            {[...Array(24)].map((_, i) => (
              <Box
                key={"left-" + i}
                bgColor={"bg-green-500"}
                pageNumber={counter++}
                status={"Empty"}
              />
            ))}
         </div>
        </div>
        </Box>  
      </div>
    </div>
  );
}
