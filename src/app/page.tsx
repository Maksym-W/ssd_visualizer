"use client"

import Box from "./components/box";

export default function Home() {
  let counter = 1;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center p-8 gap-12">
      <div className="text-left max-w-xl">
        <h1 className="text-3xl font-bold mb-4">SSD Model</h1>
        <p className="text-lg">
          The stuff on the right is an in-progress attempt of visualizing an ssd. The middle is an image of the goal, and the right is what is coded
        </p>
      </div>
      <div className="md:mt-10 md:ml-auto mr-20">
        <img
          src="https://images.anandtech.com/doci/7864/NAND%20die.png"
          alt="A photo of what we want"
          className="w-[600px] h-auto rounded-lg shadow-lg"
        />
      </div>
    
      {/* Everything below is the SSD model. Everything above is info about the model. */} 

      <Box bgColor="bg-yellow-300">
        <div className="flex space-x-4">
          {/* Left column */}
          <div className="grid grid-cols-4 gap-2">
            {[...Array(24)].map((_, i) => (
              <Box
                key={"left-" + i}
                bgColor="bg-green-500"
                pageNumber={counter++}
              />
            ))}
         </div>

          {/* Right column */}
         <div className="grid grid-cols-4 gap-2">
            {[...Array(24)].map((_, i) => (
              <Box
                key={"right-" + i}
                bgColor="bg-green-500"
                pageNumber={counter++}
              />
            ))}
          </div>
        </div>
      </Box>
    </div>
  );
}
