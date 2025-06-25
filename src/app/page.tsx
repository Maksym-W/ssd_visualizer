"use client"

import Box from "./components/box";

export default function Home() {
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

      <Box>
        <Box>
          <Box>
            <p>This is a nested box!</p>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
