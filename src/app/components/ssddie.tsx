import SSDBlock from "./ssdblock";
import { Block } from "../page";

function SSDDie({ blocks, blockRows, blockCols, pageRows, pageCols, text }: { blocks: Block[], blockRows: number, blockCols: number, pageRows: number, pageCols: number, text: string }) {
  const rows = pageRows;
  const cols = pageCols;
  return (
    <div className="bg-yellow-400 p-4 inline-block text-black">
      <p>{text}</p>
      <div
        className="grid gap-4 w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${blockCols}, 1fr)`,
          gridTemplateRows: `repeat(${blockRows}, 1fr)`
        }}
      >
        {blocks.map((block, index) => (
          <SSDBlock key={index} block={block} pageRows={rows} pageCols={cols} blockNumber={index} />
        ))}

      </div>
    </div>
  );  
};

export default SSDDie;
