"use client"

import { useRef, useState } from "react";
// import filePresetSmallOne from "./data/one_small_file.json"
// import filePresetSmallTwo from "./data/several_small_files.json"
// import filePresetSmallThree from "./data/lots_of_small_files.json"
// import filePresetBigOne from "./data/one_large_file.json"
// import filePresetBigTwo from "./data/several_large_files.json"
// import filePresetBigThree from "./data/lots_of_large_files.json"
// import filePresetAdvancedOne from "./data/advance_one_gc.json"
// import filePresetAdvancedThree from "./data/advanced_total_gc_is_bad.json"
// import filePresetAdvancedFour from "./data/advanced_all_is_fine.json"

import scenario1 from "./data/scenario1.json"
import scenario2 from "./data/scenario2.json"
import scenario3 from "./data/scenario3.json"

import { Page } from "../lib/Page"

import { greedyWrite, greedyDelete } from "./algorithms/greedy";
import { totalGarbageCollection, efficientGarbageCollection, singleGarbageCollection, numWriteablePages, listOfFiles, updateFile, saveToFile, getFileNumber } from "./utils/utils";
import SSDDie from "./components/ssddie";
import { stripingWrite } from "./algorithms/striping";

export interface Block {
  numStalePages: number;
  numBlankPages: number;
  numLivePages: number;
  numErases: number;
  pages: Array<Page>;
}

export interface Preset {
  name: string;
  blocks: Array<Block>;
}

export default function Home() {
  const blockRows = 4;
  const blockCols = 4;
  const pageRows = 4;
  const pageCols = 8;

  const lowThreshold = 0.1;
  const highThreshold = 0.25;

  const newBlocks: Array<Block> = [];
  for (let i = 0; i < blockRows * blockCols; i++) {
    const pages = [];
    for (let j = 0; j < pageRows * pageCols; j++) {
      pages.push({ status: "Empty", bgColour: "bg-green-500" })
    }
    const newBlock: Block = { pages: pages, numStalePages: 0, numBlankPages: pageRows * pageCols, numLivePages: 0, numErases: 0 };
    newBlocks.push(newBlock);
  }

  const newOverprovisionArea = [];
  for (let i = 0; i < blockRows * blockCols / 4; i++) {
    const pages = [];
    for (let j = 0; j < pageRows * pageCols; j++) {
      pages.push({ status: "Empty", bgColour: "bg-green-500" })
    }
    const newBlock: Block = { pages: pages, numStalePages: 0, numBlankPages: pageRows * pageCols, numLivePages: 0, numErases: 0 };
    newOverprovisionArea.push(newBlock);
  }

  // const tempPresets: Preset[] = [{ name: "Empty Pages", blocks: newBlocks }, { name: "One Small File", blocks: filePresetSmallOne }, 
  //   { name: "Several Small Files", blocks: filePresetSmallTwo }, { name: "Lots of Small Files", blocks: filePresetSmallThree }, 
  //   { name: "One Large File", blocks: filePresetBigOne }, { name: "Several Large Files", blocks: filePresetBigTwo }, 
  //   { name: "Lots of Large Files", blocks: filePresetBigThree },  { name: "Advanced: One GC Trigger", blocks: filePresetAdvancedOne }, 
  //   { name: "Advanced: Total GC is Bad", blocks: filePresetAdvancedThree }, { name: "Advanced: All is Fine", blocks: filePresetAdvancedFour }];
  
  const tempPresets : Preset[] = [{ name: "Empty Pages", blocks: newBlocks },
        { name: "Scenario 1", blocks: scenario1 },
        { name: "Scenario 2", blocks: scenario2 },
        { name: "Scenario 3", blocks: scenario3 }];

  const [blocks, setBlocks] = useState(newBlocks);
  const [presets, setPresets] = useState(tempPresets);
  const [overprovisionArea, ] = useState(newOverprovisionArea)

  // Block we're currently writing to
  const [currentBlock, setCurrentBlock] = useState(-1);

  const [fileSizeValue, setFileSizeValue] = useState(""); // Total jank to have this as let
  const [fileCounter, setFileCounter] = useState(1); // Track how many files have been written
  const [deleteFileValue, setDeleteFileValue] = useState("");

  const [striping, setStriping] = useState(false);
  const [slowMo, setSlowMo] = useState(false);
  const [slowmoMessage, setSlowmoMessage] = useState(" No messages from Slowmo Yet.")
  const [resume, setResume] = useState<(() => void) | null>(null);

  const [automaticGc, setAutomaticGc] = useState(false);

  const [gcAlgorithm, setGcAlgorithm] = useState("Efficient");

  const [isCreateFileValid, setIsCreateFileValid] = useState(true);

  const [isUpdateFileValid, setIsUpdateFileValid] = useState(true);
  const [updateFileValue, setUpdateFileValue] = useState('');

  const [isDeleteFileValid, setIsDeleteFileValid] = useState(true);

  const [presetIndex, setPresetIndex] = useState(0);

  const [, setTick] = useState(0);
  const algorithm = "Greedy" // SHOULD WE EVEN HAVE THIS

  const forceUpdate = () => setTick(tick => tick + 1);

  const handleWriteFile = async () => {
  /* Maybe add some visual stuff here */
  if (numWriteablePages(blocks) < parseInt(fileSizeValue) / 4) {
    setFileSizeValue('');
    return;
  }
    let gc;
    if (!automaticGc) {
      gc = (blocks: Array<Block>) => blocks;
    } else if (gcAlgorithm == "Efficient") {
      gc = efficientGarbageCollection;
    } else if (gcAlgorithm == "Single") {
      gc = singleGarbageCollection;
    } else {
      gc = totalGarbageCollection;
    }

    if (algorithm == "Greedy") {
      if (striping) {
        const updatedBlocks = stripingWrite(parseInt(fileSizeValue), blocks, currentBlock, fileCounter, overprovisionArea, gc, lowThreshold, highThreshold, slowMo, setResume);
        setBlocks(await updatedBlocks);
        setFileCounter(fileCounter + 1); // Increment for next file
      } else {
        const updatedBlocks = greedyWrite(parseInt(fileSizeValue), blocks, currentBlock, fileCounter, overprovisionArea, 0, gc, lowThreshold, highThreshold, slowMo, setResume, setSlowmoMessage);
        setBlocks(await updatedBlocks);
        setFileCounter(fileCounter + 1); // Increment for next file
      }
    } else if (algorithm == ""){
      console.log('no algorithm selected');
    }
    // NOTE: you can remove this but I like resetting the inputValue here so you don't need to backspace
    setFileSizeValue('');
  };

  const handleUpdateFile = () => {
    const pIndex = updateFileValue.indexOf('P');
    const bNum = updateFileValue.slice(0, pIndex).slice(1);
    const pNum = updateFileValue.slice(pIndex).slice(1);
    const updatedBlocks = updateFile(blocks, +bNum, +pNum, striping);
    console.log(updatedBlocks);
    setBlocks(updatedBlocks);
    setUpdateFileValue('');
    forceUpdate();
  }

  const handleDeleteFile = async () => {
    if (algorithm == "Greedy") {
      const updatedBlocks = await greedyDelete(parseInt(deleteFileValue), blocks, setCurrentBlock, slowMo, setSlowmoMessage, setResume);

      setBlocks(updatedBlocks);
    } else {
      console.log('no algorithm selected');
    }
    setDeleteFileValue('');
  };

  const nextStep = () => {
    if (resume) {
      resume();        // continues execution
      setResume(null); // clear it so it doesn't get called twice
    }
  }

  const handleGarbageCollection = () => {
    // NOTE: right now, this does nothing. This is because our "good" threshold is the exact opposite
    // of our "bad" threshold. In the future, we would have a better good and bad threshold (e.g. 
    // < 0.25 is our bad threshold, >= 0.75 is our good threshold)

    let gc;
    if (gcAlgorithm == "Efficient") {
      gc = efficientGarbageCollection;
    } else if (gcAlgorithm == "Single") {
      gc = singleGarbageCollection;
    } else {
      gc = totalGarbageCollection;
    }
    let newBlocks = [...blocks];

    const numBlankPages = blocks.reduce((acc, block) => acc += block.numBlankPages, 0);
    const numTotalPages = blocks.reduce((acc, block) => acc += block.pages.length, 0);
    if (gcAlgorithm == "Efficient" && numBlankPages / numTotalPages <= lowThreshold) {
      newBlocks = gc(newBlocks, overprovisionArea, lowThreshold, highThreshold);
      setBlocks(newBlocks);
    } else if (gcAlgorithm != "Efficient") {
      newBlocks = gc(newBlocks, overprovisionArea, lowThreshold, highThreshold);
      setBlocks(newBlocks);
    } 
  }

  const handleCreateFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (parseInt(e.target.value) / 4 > numWriteablePages(blocks)) {
      setIsCreateFileValid(false);
    } else if (!/^\d+$/.test(e.target.value) || e.target.value === '0') {
      setIsCreateFileValid(false);
    } else {
      setIsCreateFileValid(true);
    }
    setFileSizeValue(e.target.value);
  }

  const isValidBlockPage = (str: string) => {
    const regex = /^B(1[0-5]|[0-9])P(3[0-1]|[12][0-9]|[0-9])$/;
    if (regex.test(str)) {
      // determine the block and page #
      const pIndex = str.indexOf('P');
      const bNum = parseInt(str.slice(0, pIndex).slice(1), 10);
      const pNum = parseInt(str.slice(pIndex).slice(1), 10);
      return (blocks[bNum].pages[pNum].writtenByFile && !blocks[bNum].pages[pNum].status.startsWith("Stale")) ? true : false
    }
    return regex.test(str);
  }

  const handleUpdateFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isValidBlockPage(e.target.value))
    console.log(isValidBlockPage(e.target.value));
    setIsUpdateFileValid(isValidBlockPage(e.target.value));
    setUpdateFileValue(e.target.value);
  }

  const handleDeleteFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = listOfFiles(blocks);
    console.log(files);
    setIsDeleteFileValid(files.includes(parseInt(e.target.value)));
    setDeleteFileValue(e.target.value);
  }
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click(); // opens file picker
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: Block[] = JSON.parse(text);
        console.log("Loaded object:", parsed);

        const filename = file.name.replace(/\.json$/i, "");

        setPresets([...presets, {name: filename, blocks: parsed}]);
        setPresetIndex(presets.length);

        setBlocks(parsed);
        setFileCounter(getFileNumber(parsed));
      } catch {
        alert("Invalid or corrupt file. Could not parse JSON.");
      }
    };

    reader.readAsText(file);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // iterate over presets
    for (let i = 0; i < presets.length; i++) {
      if (presets[i].name.startsWith(e.target.value)) {
        setPresetIndex(i);
        setBlocks(presets[i].blocks);
        setFileCounter(getFileNumber(presets[i].blocks));
        return;
      }
    }
  }


  return (
    <div className="flex flex-col items-center gap-12">

      <div>

        <div className="flex justify-center mx-auto max-w-5xl">
          <div className="card bg-base-300 rounded-box grid m-2">
            <div className="card-body">
              <div className="tooltip" data-tip="Must be a number within the SSD's size limits [1, 1024]">
                <fieldset className="fieldset border-base-100 border w-90 p-2 rounded-box">
                  <legend className="fieldset-legend">Create File (size in kb)</legend>
                  <div className="flex items-end gap-2">
                    <input 
                      type="text"
                      className={`input ${isCreateFileValid ? 'input-primary' : 'input-error'}`}
                      value={fileSizeValue}
                      onChange={handleCreateFileUpdate}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleWriteFile}
                      disabled={!isCreateFileValid}
                    >
                      Create File
                    </button>
                  </div>
                </fieldset>
              </div>
              <div className="tooltip" data-tip="Format: B<BLOCK #>P<PAGE #> (do not include angle brackets, just numbers)">
                <fieldset className="fieldset border-base-100 border w-90 p-2 rounded-box">
                  <legend className="fieldset-legend">Update File (block # and page #)</legend>
                  <div className="flex items-end gap-2">
                    <input type="text" className={`input ${isUpdateFileValid ? 'input-primary' : 'input-error'}`} value={updateFileValue} onChange={handleUpdateFileUpdate}/>
                    <button
                      className="btn btn-primary"
                      disabled={!isUpdateFileValid}
                      onClick={handleUpdateFile}
                    >
                      Update File
                    </button>
                  </div>
                </fieldset>
              </div>
              <div className="tooltip" data-tip="Must be a valid file #">
                <fieldset className="fieldset border-base-100 border w-90 p-2 rounded-box">
                  <legend className="fieldset-legend">Delete File (file #)</legend>
                  <div className="flex items-end gap-2">
                    <input 
                      type="text"
                      className={`input ${isDeleteFileValid ? 'input-primary' : 'input-error'}`}
                      value={deleteFileValue}
                      onChange={handleDeleteFileUpdate}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleDeleteFile}
                      disabled={!isDeleteFileValid}
                    >
                      Delete File
                    </button>
                  </div>
                </fieldset>
              </div>

              <div className="tooltip [--tooltip-tail:0px] before:whitespace-pre-line" data-tip={`Enabled: distribute a file across pages from several blocks\nDisabled: store file in contiguous pages in the same block before moving onto a new block`}>
                <fieldset className="fieldset border-base-100 border w-50 p-2 rounded-box">
                  <legend className="fieldset-legend">Striping Toggle</legend>
                  <label className="label">
                    <input type="checkbox" checked={striping} onChange={e => setStriping(e.target.checked)} className="toggle toggle-primary"/>
                    <p>{striping ? "Enabled" : "Disabled"}</p>
                  </label>
                </fieldset>
              </div>
            </div>
          </div>

          <div className="card bg-base-300 rounded-box grid m-2">
            <div className="card-body">

              <div className="tooltip [--tooltip-tail:0px] before:whitespace-pre-line" data-tip={`Efficient: triggers if 10% or less of pages are free; done when 25% are free\nSingle: clears a single block of stale pages\nTotal: clears every stale page`}>
                <fieldset className="fieldset border-base-100 border w-65 p-2 rounded-box">
                  <legend className="fieldset-legend">GC Algorithm</legend>
                  <div className="flex items-end gap-2">
                    <select
                      className="select select-primary"
                      onChange={e => setGcAlgorithm(e.target.value)}
                    >
                      <option>Efficient</option>
                      <option>Single</option>
                      <option>Total</option>
                    </select>
                    <button
                      className="btn btn-primary"
                      disabled={automaticGc}
                      onClick={handleGarbageCollection}
                    >
                      Trigger GC
                    </button>
                  </div>
                </fieldset>
              </div>

              <div className="tooltip" data-tip="Toggles whether the Garbage Collection is to be triggered manually using the 'Trigger GC' button, or automatically triggered when free blocks are <10% of all blocks in the main storage area.">
                <fieldset className="fieldset border-base-100 border w-50 p-2 rounded-box">
                  <legend className="fieldset-legend">Automatic GC</legend>
                  <label className="label">
                    <input type="checkbox" checked={automaticGc} onChange={e => setAutomaticGc(e.target.checked)} className="toggle toggle-primary"/>
                    <p>{automaticGc ? "Disabled" : "Enabled"}</p>
                  </label>
                </fieldset>
              </div>

            </div>
          </div>

          <div className="card bg-base-300 rounded-box grid m-2">
            <div className="card-body">
              <fieldset className="fieldset border-base-100 border w-65 p-2 rounded-box">
                <legend className="fieldset-legend">Select a Scenario</legend>
                <div className="flex items-end gap-2">
                  <select
                    className="select select-primary"
                    onChange={handlePresetChange}
                    value={presets[presetIndex].name}
                  >
                    {presets.map((item, i) => (
                      <option key={i} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
              </fieldset>
              <div className="flex space-x-4 justify-center">
                <button className="btn btn-primary" onClick={handleImportClick}>
                  Import
                </button>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  style={{display: "none" }}
                  onChange={handleFileChange}
                />
                <button className="btn btn-primary" onClick={() => saveToFile(blocks)}>
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-300 rounded-box grid m-2">
            <div className="card-body">
              <fieldset className="fieldset border-base-100 border w-50 p-2 rounded-box">
                <legend className="fieldset-legend">Slow-mo</legend>
                <label className="label">
                  <input type="checkbox" checked={slowMo} onChange={e => setSlowMo(e.target.checked)} className="toggle toggle-primary"/>
                  <p>{slowMo ? "Enabled" : "Disabled"}</p>
                </label>
              </fieldset>
              <button className="btn btn-primary" onClick={nextStep} disabled={!slowMo}>Step Forward</button>
            </div>
          </div>

        </div>


        <div className="w-full flex flex-col items-center">
          <SSDDie blocks={blocks} blockRows={blockRows} blockCols={blockCols} pageRows={pageRows} pageCols={pageCols} text={"Main Storage  Status:" + slowmoMessage} />

          {/* Overprovision Area */}
          <SSDDie blocks={overprovisionArea} blockRows={Math.floor(blockRows/4)} blockCols={blockCols} pageRows={pageRows} pageCols={pageCols} text={"Overprovision Area (OP)"} />
        </div>

      </div>
    </div>
  );
}
