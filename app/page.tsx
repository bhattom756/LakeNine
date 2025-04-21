"use client";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import headerImg from "@/public/download.png";
import seoimg from "@/public/dash.png";
import seoimg2 from "@/public/dash2.png";
import Link from "next/link";
import { Zap } from "lucide-react";

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
            <Link href="/learn">
              <button className="bg-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white px-6 py-2 rounded-full text-sm md:text-base shadow-lg transition">
                Learn more
              </button>
            </Link>
            <Link href="/studio">
              <button className="border border-blue-400 text-blue-400 hover:bg-blue-800 hover:border-blue-800 hover:text-white px-6 py-2 rounded-full text-sm md:text-base transition">
                Try Now
              </button>
            </Link>
          </div>

          <Image
            src="/download.png"
            alt="GenX Showcase"
            width={900}
            height={400}
            className="w-full max-w-[650] object-contain drop-shadow-[0_0_60px_rgba(0,255,255,0.4)]"
          />

          <p className="text-2xl pb-2  text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-orange-400 font-semibold">
            Witness the dawn of Software Engineering.
          </p>
          <p className="text-1xl pb-10  text-white bg-clip-text  font-semibold">
            Starting from 1499 INR only!
          </p>
        </div>
      </div>
      <div className="bg-[#f5f5f7]">
        <h1 className="text-center h-2"></h1>
        <section className="flex flex-col md:flex-row w-full min-h-[60vh]">
          <div className="w-full md:w-1/2 bg-black text-white flex flex-col justify-center px-8 md:px-20 py-10">
            <div className="mb-6">
              <div className="bg-white text-black w-10 h-10 flex items-center justify-center rounded-full mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                Boost Your Online Presence with 0 Coding Knowledge.
              </h2>
              <p className="text-sm text-gray-400 mt-4 max-w-md">
                Lakenine will build your product, deploy it to your Domain and
                maintain future changes as per your requirements.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900 to-teal-500 flex items-center justify-center px-8 py-10">
            <div className="max-w-xs md:max-w-md w-full">
              <Image
                src={seoimg2}
                alt="SEO dashboard"
                className="rounded-[2rem] w-full h-auto object-contain shadow-xl"
              />
            </div>
          </div>
        </section>
        <section className="bg-[#0b0c2a] text-white py-20 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Discover Cutting-Edge Frameworks Integrations
        </h2>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl mx-auto mb-12">
          At Webaverse, we’ve meticulously crafted a comprehensive suite of cutting-edge solutions tailored to elevate your digital presence. Immerse yourself in intuitive UI/UX designs, robust web development frameworks, and meticulous SEO optimization strategies. Our user-centric approach ensures seamless navigation, engaging aesthetics, and enhanced functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left column: Image Card */}
        <div className="bg-[#101233] p-6 rounded-xl border border-gray-700 hover:shadow-xl transition duration-300">
          <h3 className="text-3xl font-semibold mb-3">
            Innovative <span className="text-blue-400">UI Designs</span>
          </h3>
          <p className="text-gray-300 text-lg mb-4">
            Our innovative designs bring your data to life, offering dynamic and customizable visualization. Uncover trends, identify insights, and make data-driven webpages appear more to life.
          </p>
          <div className="mt-4">
            <Image
              src={seoimg}
              alt="UI Design"
              className="rounded-xl w-70 h-auto object-contain border border-gray-600"
            />
          </div>
        </div>

        {/* Right column: Two stacked cards */}
        <div className="flex flex-col gap-8">
          {/* Card 2 */}
          <div className="bg-[#101233] p-6 rounded-xl border border-gray-700 hover:shadow-xl transition duration-300">
            <h3 className="text-3xlfont-semibold mb-3">Strategic Web Development</h3>
            <p className="text-gray-300 text-sm">
              Unlock the potential of tailored web solutions with Webaverse. Navigate intricate digital landscapes with responsive designs, scalable platforms, and optimized functionalities.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#101233] p-6 rounded-xl border border-gray-700 hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold mb-3">Optimized SEO Strategies</h3>
            <p className="text-gray-300 text-sm">
              Harness the power of effective online visibility with Webaverse. Dive into keyword research, content optimization, and link-building strategies to rank and drive traffic effortlessly.
            </p>
          </div>
        </div>
      </div>
    </section>
      </div>
    </>
  );
}
