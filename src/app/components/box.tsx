import { ReactNode } from "react";

export default function Box({ children }: { children?: ReactNode }) {
  return (
    <div className="p-6 bg-green-200 text-black rounded-box shadow-md border border-green-600">
      <h2 className="text-lg font-bold mb-2">DaisyUI Box</h2>
      <p className="mb-4">This is a simple box using DaisyUI and TailwindCSS utilities.</p>
      {children}
    </div>
  );
}
