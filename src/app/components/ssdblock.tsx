import { ReactNode, useEffect, useState } from "react";
import Ssdpage, { BoxProps } from "./ssdpage"; // Import both component and props

// Extend the BoxProps interface
interface SsdblockProps extends BoxProps {
  pages: Array<{
    bgColour?: string;
    status?: string;
  }>;
  blockNumber: number;
  startPageIndex: number;
  blockSize: number;
}

export default function Ssdblock({ pages,  blockNumber,  startPageIndex, bgColour = "bg-green-200", status = "Empty", blockSize }: SsdblockProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-3 shadow-inner">
      <h3 className="text-center font-bold mb-2">Block {blockNumber}</h3>
      <div className={`grid grid-cols-${Math.floor(blockSize / 4)} gap-2`}>
        {[...Array(blockSize)].map((_, i) => {
          const pageIndex = startPageIndex + i;
          return (
            <Ssdpage
              key={`block-${blockNumber}-page-${i}`}
              bgColour={pages[pageIndex]?.bgColour || bgColour}
              pageNumber={pageIndex}
              status={pages[pageIndex]?.status || status}
            />
          );
        })}
      </div>
    </div>
  );
}
