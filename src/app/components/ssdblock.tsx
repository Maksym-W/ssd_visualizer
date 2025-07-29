import { ReactNode, useEffect, useState } from "react";
import Ssdpage, { BoxProps } from "./ssdpage"; // Import both component and props

// Extend the BoxProps interface
interface SsdblockProps extends BoxProps {
  pages: Array<{
    bgColor?: string;
    status?: string;
  }>;
  blockNumber: number;
  startPageIndex: number;
}

export default function Ssdblock({ pages,  blockNumber,  startPageIndex, bgColor = "bg-green-200", status = "Empty"}: SsdblockProps) {
  const [uses, setUses] = useState(0);

  useEffect(() => {
    setUses(prev => prev + 1);
  }, [status]);

  return (
    <div className="bg-blue-50 rounded-lg p-3 shadow-inner">
      <h3 className="text-center font-bold mb-2">Block {blockNumber}</h3>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(12)].map((_, i) => {
          const pageIndex = startPageIndex + i;
          return (
            <Ssdpage
              key={`block-${blockNumber}-page-${i}`}
              bgColor={pages[pageIndex]?.bgColor || bgColor}
              pageNumber={pageIndex}
              status={pages[pageIndex]?.status || status}
            />
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Block uses: {uses}
      </div>
    </div>
  );
}