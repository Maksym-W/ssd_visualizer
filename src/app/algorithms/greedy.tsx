import getFileColour from "../utils/utils";


export function greedyWrite(size, pages, fileID) {

  if (isNaN(size)) return;

  const pagesToUpdate = Math.ceil(size / 4);

  // Find available pages
  const emptyPages = pages
    .map((page, index) => ({ ...page, index }))
    .filter(page => page.status.startsWith("Empty"));

  // Combine empty and previously written pages (if you want to allow overwrites)
  const availablePages = [...emptyPages];

  if (availablePages.length < pagesToUpdate) {
    console.error("Not enough space!");
    // setErrorDisplay("Not enough space!");
    return;
  }

  // Create updated pages array
  const updatedPages = [...pages];
  availablePages.slice(0, pagesToUpdate).forEach(page => {
    updatedPages[page.index] = {
      status: `Written by file ${fileID}`,
      bgColour: getFileColour(fileID) // Optional: different colors per file
    };
  });

  console.log(fileID);
  return updatedPages;
}

export function greedyDelete(fileID, pages) {
  if (isNaN(fileID)) return;
  return pages.map(page => {
    const isTargetFile = page.status.startsWith(`Written by file ${fileID}`);

    return isTargetFile
      ? { ...page, status: "Stale", bgColour: "bg-gray-500" }
      : page;
  });
}
