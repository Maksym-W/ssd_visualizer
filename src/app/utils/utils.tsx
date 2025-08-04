const getFileColour = (fileID: number) => {
  const colours = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-teal-500"
  ];
  return colours[(fileID - 1) % colours.length];
}

export default getFileColour;
