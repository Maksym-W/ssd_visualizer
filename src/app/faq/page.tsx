import Link from "next/link";

export default function Faq() {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-12">
        <div className="flex-1">
          <p className="text-3xl font-bold mb-2">How do SSDs work?</p>
          <p className="text-base">
            SSDs consist of blocks, which contain pages. Pages can be written only once before the entire block needs to be erased. 
            This is why garbage collection is required: to consolidate valid data and free up whole blocks.
          </p>
        </div>

        <div className="flex-1">
          <p className="text-3xl font-bold mb-2">How to use the Tool?</p>
          <p className="text-base">
            By default, the tool uses the greedy algorithm. You have two options: write a file of <em>n</em> kilobytes or delete a file.
            When writting, The SSD will allocate <code>ceil(n / 4)</code> pages to that file. (So if you write a 17KB file, it will take 5 pages, 1 of 
            which is for the ceiling overflow.). The algorithm will select which of the blocks to write to based on which one has the least amount of stale pages.
            To delete a file, the SSD does not automatically remove the 1s and 0s which make up the file. Instead, the SSD will mark the corresponding Pages
            as "stale", which means not in use by any file but cannot be overwritten just yet. When the SSD has no more pages it can assign to a file, it must 
            run a garbage collect to free up stale pages. The way the SSD is contructed means that to erase a page, you have the erase the entire block the page resides on.
            Thus, the garbage collector must find the block with the most amount of stale pages, rewrite all the in-use page to a spare block, and then erase the entire block
            to free up pages. Then we can write in the new file.
          </p>
        </div>

        <div className="flex-1">
          <p className="text-3xl font-bold mb-2">Wear leveling</p>
          <p className="text-base">
            One of the downsides to SSDs is that they don't last as long as compared to traditional Hard Drives.
          </p>
        </div>
      </div>
    );
};