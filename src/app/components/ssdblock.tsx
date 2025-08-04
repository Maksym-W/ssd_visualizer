import { ReactNode, useEffect, useState } from "react";
import Ssdpage, { BoxProps } from "./ssdpage"; // Import both component and props

import { Page } from "../page";

// Extend the BoxProps interface
interface SsdblockProps extends BoxProps {
  pages: Array<Page>;
  blockNumber: number;
  startPageIndex: number;
  blockSize: number;
}

export default function Ssdblock({ pages,  blockNumber,  startPageIndex, bgColour = "bg-green-200", status = "Empty", blockSize }: SsdblockProps) {
  const [numOfStalePages, setNumOfStalePages] = useState(-1); // The value of kilobytes the user wants to write.

  useEffect(() => {
    let stales = 0; // This will be used to update numOfStalePages
    for (const page of pages) {if (page.status != "empty") {stales++;}} // THIS BETTER THIS WAY!!!!!
    setNumOfStalePages(stales);
  }, [pages]); 

  return (
    <div className="bg-blue-50 rounded-lg p-3 shadow-inner">
      <h3 className="text-center font-bold mb-2">Block: {blockNumber}. Valid pages: {16 - numOfStalePages}</h3>
      <div className={`grid grid-cols-${Math.floor(blockSize / 4)} gap-2`}>
        {[...Array(blockSize)].map((_, i) => {
          const pageIndex = startPageIndex + i;
          return (
            <Ssdpage
              key={`block-${blockNumber}-page-${i}`}
              bgColour={pages[i]?.bgColour || bgColour}
              pageNumber={pageIndex}
              status={pages[i]?.status || status}
            />
          );
        })}
      </div>
    </div>
  );
}
