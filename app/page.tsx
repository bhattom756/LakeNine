"use client";
import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import headerImg from "@/public/download.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import clsx from "clsx";
import { Fade } from "react-awesome-reveal";
import card1 from "@/public/card1.png";

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
            
            <Button
              asChild
              variant="outline"
              className={clsx(
                "border-green-400 text-green-400",
                "hover:bg-green-800 hover:text-white",
                "px-6 py-2 rounded-full",
                "text-sm md:text-base transition"
              )}
            >
              <Link href="/webcontainer-demo">WebContainer Demo</Link>
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
      <section className="bg-[#0b0f2e] text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <Fade direction="up">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-bold mb-4">
              Discover Cutting-Edge Frameworks Integrations
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed text-lg">
              At Webversed, we've meticulously crafted a comprehensive suite
              of cutting-edge solutions tailored to elevate your digital presence.
              Immerse yourself in intuitive UI/UX designs, robust web development frameworks,
              and meticulous SEO optimization strategies. Our user-centric approach ensures seamless
              navigation, engaging aesthetics, and enhanced functionality. With Webversed, transform your
              online experience, drive traffic, and achieve unparalleled growth. Embrace innovation in
              design and development with Webversed.
            </p>
          </div>
        </Fade>

        <div className="grid md:grid-cols-2 gap-10">
          {/* UI Design Card */}
          <div
            className="rounded-xl p-8 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://assets-global.website-files.com/6530f97cd208670620175967/653a4c2c77c28e945e6a6bbf_Grid%20BG.svg')",
            }}
          >
            <Fade direction="up">
              <h1 className="text-2xl font-bold">
                Innovative <em className="text-blue-400">UI Designs</em>
              </h1>
              <p className="text-gray-300 pt-4">
                Our Innovative designs bring your data to life, offering dynamic and customizable
                visualization. Uncover trends, identify insights, and make data-driven webpages
                appear more to life. With Webversed, you have the power to explore the designs like never before.
              </p>
              <div className="flex justify-center mt-6">
                <Image src={card1} alt="UI Design" className="w-64 md:w-72 rounded-xl shadow-lg" />
              </div>
            </Fade>
          </div>

          {/* Right Column - 2 Cards */}
          <div className="flex flex-col gap-10">
            {/* Strategic Web Dev Card */}
            <div
              className="rounded-xl p-8 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://assets-global.website-files.com/6530f97cd208670620175967/653a4c2c77c28e945e6a6bbf_Grid%20BG.svg')",
              }}
            >
              <Fade direction="up">
                <h1 className="text-2xl font-bold">Strategic Web Development</h1>
                <p className="text-gray-300 pt-4">
                  Unlock the potential of tailored web solutions with Webversed. Navigate intricate
                  digital landscapes with responsive designs, scalable platforms, and optimized
                  functionalities. Partner with Webversed to ensure your online platform aligns with
                  your business vision and goals.
                </p>
              </Fade>
            </div>

            {/* SEO Strategies Card */}
            <div
              className="rounded-xl p-8 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://assets-global.website-files.com/6530f97cd208670620175967/653a4c2c77c28e945e6a6bbf_Grid%20BG.svg')",
              }}
            >
              <Fade direction="up">
                <h1 className="text-2xl font-bold">Optimized SEO Strategies</h1>
                <p className="text-gray-300 pt-4">
                  Harness the power of effective online visibility with Webversed. Dive into comprehensive
                  keyword research, content optimization, and link-building strategies. With Webversed,
                  position your brand at the forefront of search engine results and drive organic traffic effortlessly.
                </p>
              </Fade>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
