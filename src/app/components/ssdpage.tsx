import { ReactNode, useEffect, useState } from "react";

export interface BoxProps {
  children?: ReactNode;
  bgColour?: string; // e.g. "bg-green-200"
  pageNumber?: number;
  status?: string;
}

export default function Ssdpage({ children, bgColour = "bg-green-200", pageNumber = -1, status = "Empty" }: BoxProps) {
  const [uses, setUses] = useState(-1);

  useEffect(() => {
    if (status !== "Stale") { setUses(prevUses => prevUses + 1);}
  }, [status]); 

  return (
    <div className={`p-6 ${bgColour} text-black rounded-box shadow-md border border-green-600`}>
      <h2 className="text-lg font-bold mb-2">Page: {pageNumber}</h2>
      <p className="mb-4">The Status of this is: {status}</p>
      <p className="mb-4">This has been written to: {uses} times</p>
      {children}
    </div>
  );
}
