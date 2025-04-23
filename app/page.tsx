"use client";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import headerImg from "@/public/download.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import clsx from "clsx";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="pt-14 md:pt-16 bg-black max-h-auto">
        <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center px-4 text-center">
          <h1 className="text-4xl md:text-6xl pt-12 font-bold mb-4">
            GenX: Our Most Advanced Model
            <br />
            <span className="text-gray-300 font-medium text-2xl md:text-3xl"></span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-3">
            Presenting the World's first 100% Automated AI.
          </p>

          <div className="flex gap-4">
            <Button
              asChild
              className={clsx(
                "bg-blue-600 hover:bg-blue-700 text-white",
                "px-6 py-2 rounded-full",
                "text-sm md:text-base shadow-lg transition"
              )}
            >
              <Link href="/learn">Learn more</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className={clsx(
                "border-blue-400 text-blue-400",
                "hover:bg-blue-800 hover:text-white",
                "px-6 py-2 rounded-full",
                "text-sm md:text-base transition"
              )}
            >
              <Link href="/studio">Try Now</Link>
            </Button>
          </div>

          <Image
            src="/download.png"
            alt="GenX Showcase"
            width={900}
            height={400}
            className="w-full max-w-[650] object-contain drop-shadow-[0_0_60px_rgba(0,255,255,0.4)]"
          />

          <p className="text-sm  text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-orange-400 font-semibold">
            Witness the dawn of Software Engineering.
          </p>
        </div>
      </div>
      <div className="bg-[#f5f5f7]">
        <h1 className="text-center">Complete automation for you business</h1>
      </div>
    </>
  );
}
