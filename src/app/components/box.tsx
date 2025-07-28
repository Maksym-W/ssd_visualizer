import { ReactNode } from "react";

interface BoxProps {
  children?: ReactNode;
  bgColor?: string; // e.g. "bg-green-200"
  pageNumber?: number;
  status?: string;
}

export default function Box({ children, bgColor = "bg-green-200", pageNumber = -1, status = "Empty" }: BoxProps) {
  return (
    <div className={`p-6 ${bgColor} text-black rounded-box shadow-md border border-green-600`}>
      <h2 className="text-lg font-bold mb-2">Page: {pageNumber}</h2>
      <p className="mb-4">The Status of this is: {status}</p>
      {children}
    </div>
  );
}
