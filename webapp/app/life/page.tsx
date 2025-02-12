import React from "react";
import Particles from "@/app/components/particles";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden ">
      <Particles/>
      <h1 className="py-3.5 px-0.5 z-10 text-4xl text-transparent bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
        Life.AI
      </h1>
      
    </div>
  );

}
