import { Block } from "../page"
import SSDPage from "./ssdpage"

export default function SSDBlock({ block, pageRows, pageCols, blockNumber }: { block: Block, pageRows: number, pageCols: number, blockNumber: number }) {
  return (
    <div className="bg-white p-2">
      <p>Block{blockNumber}  E: {block.numErases} L: {block.numLivePages} B: {block.numBlankPages} S: {block.numStalePages}</p>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${pageCols}, 40px)`,
          gridTemplateRows: `repeat(${pageRows}, 40px)`,
        }}
      >
        {block.pages.map((page, index) => (
          <SSDPage key={index} page={page} pageNumber={page.writtenByFile} pageIndex={page.filePageNumber} />
        ))}
      </div>

    </div>
  )
};
