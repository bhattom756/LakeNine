"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Image from 'next/image';
import bg from '@/public/images/bg.jpg';

export default function Home() {
  return (
    <div className="bg-[#111318] text-white relative flex size-full min-h-screen flex-col dark group/design-root overflow-x-hidden font-space-grotesk">
      <div className="layout-container flex h-full grow flex-col">
        <Navbar />

        <main className="flex flex-1 flex-col">
          <section 
            className="relative min-h-[500px] flex items-center justify-center py-20 sm:py-32 px-6 sm:px-10 text-center" 
          >
            {/* Background image */}
            <Image
              src={bg}
              alt="Background"
              fill
              priority
              className="object-cover opacity-50 z-0"
              quality={100}
            />
            {/* <div className="absolute inset-0 bg-opacity-60 z-[1]"></div> */}
            <div className="relative glassy display-none z-10 max-w-3xl mx-auto">
              <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
                Build AI apps in minutes
              </h1>
              <p className="text-gray-300 text-base sm:text-lg lg:text-xl font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
                LakeNine is the fastest way to build and deploy AI apps. Build with our low-code platform, or use our APIs and SDKs to integrate AI into your existing apps.
              </p>
              <Link href="/studio" className="inline-flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 sm:h-14 sm:px-8 bg-blue-400 text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] hover:bg-blue-500 transition-transform duration-300 ease-in-out transform hover:scale-105">
                <span className="truncate">Start for free</span>
              </Link>
            </div>
          </section>

          <section className="px-6 sm:px-10 py-16 sm:py-24 bg-[#161920]">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">
                  Build AI apps your way
                </h2>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                  LakeNine offers a flexible platform to build AI apps, whether you prefer low-code tools or custom code integration.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="flex flex-col gap-4 rounded-xl border border-[#3b4454]/50 bg-[#1c1f27] p-6 hover:border-[#135feb]/70 transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-1">
                  <div className="text-[#135feb] mb-2">
                    <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold leading-tight">Low-code platform</h3>
                  <p className="text-gray-400 text-sm font-normal leading-relaxed">Build AI apps visually with our intuitive drag-and-drop interface. No coding required.</p>
                </div>
                
                <div className="flex flex-col gap-4 rounded-xl border border-[#3b4454]/50 bg-[#1c1f27] p-6 hover:border-[#135feb]/70 transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-1">
                  <div className="text-[#135feb] mb-2">
                    <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold leading-tight">APIs and SDKs</h3>
                  <p className="text-gray-400 text-sm font-normal leading-relaxed">Integrate AI into your existing apps with our powerful APIs and SDKs.</p>
                </div>
                
                <div className="flex flex-col gap-4 rounded-xl border border-[#3b4454]/50 bg-[#1c1f27] p-6 hover:border-[#135feb]/70 transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-1">
                  <div className="text-[#135feb] mb-2">
                    <svg fill="currentColor" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M103.77,185.94C103.38,187.49,93.63,224,40,224a8,8,0,0,1-8-8c0-53.63,36.51-63.38,38.06-63.77a8,8,0,0,1,3.88,15.53c-.9.25-22.42,6.54-25.56,39.86C81.7,204.48,88,183,88.26,182a8,8,0,0,1,15.51,4Zm93-67.4L192,123.31v58.33A15.91,15.91,0,0,1,187.32,193L153,227.3A15.91,15.91,0,0,1,141.7,232a16.11,16.11,0,0,1-5.1-.83,15.94,15.94,0,0,1-10.78-12.92l-5.37-38.49L76.24,135.55l-38.47-5.37A16,16,0,0,1,28.7,103L63,68.68A15.91,15.91,0,0,1,74.36,64h58.33l4.77-4.77c26.68-26.67,58.83-27.82,71.41-27.07a16,16,0,0,1,15,15C224.6,59.71,223.45,91.86,196.78,118.54ZM40,114.34l37.15,5.18L116.69,80H74.36ZM91.32,128,128,164.68l57.45-57.45a76.46,76.46,0,0,0,22.42-59.16,76.65,76.65,0,0,0-59.11,22.47ZM176,139.31l-39.53,39.53L141.67,216,176,181.64Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-bold leading-tight">Deploy anywhere</h3>
                  <p className="text-gray-400 text-sm font-normal leading-relaxed">Deploy your AI apps to any platform, including web, mobile, and desktop.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 sm:px-10 py-16 sm:py-24 bg-[#111318]">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">
                  Build AI apps for any use case
                </h2>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                  LakeNine empowers you to create AI apps for a wide range of applications, from internal tools to customer-facing products.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="flex flex-col gap-4 group">
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-[16/10] bg-cover rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300" 
                    style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBuMMaMtT8z5N4v0oJUTZJsusMND6iiRhRzLeaYdgwJdeHg9OlXd3UpuBd_k-Hi0xazrbAQ3GFEfFvLmBlZ_fzqoTQqlw06c2-HP2OfMX0BpjHlZnyMYD6_Rr5cfDbR-VUlarTc4KLw2Ljw-Bi2y5jJcSUCZBuznonPVXByzMO9c0wO4gP6SxbHrbLVOUzaQ5NGO1nF9LBcCyrFgTE1pR5CmvUPqZvISw9GfutUW_9S-cXFskqum4fa3jTkUI8LU7gBoW4aVQGuVkk")'}}
                  ></div>
                  <div>
                    <h3 className="text-white text-lg font-semibold leading-normal mb-1 group-hover:text-[#135feb] transition-colors duration-300">Internal tools</h3>
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">Automate tasks and improve efficiency with AI-powered internal tools.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 group">
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-[16/10] bg-cover rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300" 
                    style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCEEfJMg83mZBvK5JdHkL1oGUg-GRbFvUxjU55_DYhatYwu1ZnOkZQYDqrlz8DeGrdzYlQ4M2bdtL6D3md1E1plgMtAABTSicdtdrQBdIJqXr3gj9I5zDEv6Ty5x_ofz1M__UGyNXgCOPao5izEwg9e2kg8GYsFYusLvcURvt2Lm7bKE5IsGKbTyUXHGIzibgcR50PyxZzT_BDvGTYUMWck3vLfAYGFPfXILYr0tb378pFWejJ9GODeprOLMJJyOqvQT-2bs4xq3Wo")'}}
                  ></div>
                  <div>
                    <h3 className="text-white text-lg font-semibold leading-normal mb-1 group-hover:text-[#135feb] transition-colors duration-300">Customer-facing apps</h3>
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">Enhance customer experiences with AI-driven features and personalized interactions.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 group">
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-[16/10] bg-cover rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300" 
                    style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAwtU3GpEKETgvhopdfdTnn1PFNpF4NaGDFqFpoCXXrTc3FaXptCyjwqeBADx6tchPsWPYekoz_exLj_VPMc7gGykfFO61JCLkSBqbcWkV0Z36R_Shu-pZmJapwYKeF-0Z2bBKOyNk_HSXkE7rRD0emc9sg0E79uM3ZD3Y_B7beOQLuLqkTPJUIrXfz8LS_DKZyHvqVEDQBmizsV2vm36-x546LQbj-bwi89t9ex_G9QgiMcRB-1mL7SRMLBlQip8SkL74QHq8HBK4")'}}
                  ></div>
                  <div>
                    <h3 className="text-white text-lg font-semibold leading-normal mb-1 group-hover:text-[#135feb] transition-colors duration-300">AI-powered workflows</h3>
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">Streamline processes and automate workflows with intelligent AI solutions.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 sm:px-10 py-16 sm:py-24 bg-[#161920]">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">
                Get started with LakeNine today
              </h2>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-10">
                Join thousands of developers building the future of AI apps.
              </p>
              <Link href="/studio" className="inline-flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 sm:h-14 sm:px-8 bg-[#135feb] text-white text-base sm:text-lg font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-transform duration-300 ease-in-out transform hover:scale-105">
                <span className="truncate">Start for free</span>
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#282e39]/70 bg-[#111318]">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
              <div>
                <h5 className="text-white font-semibold mb-3">Product</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Features</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Integrations</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Changelog</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-semibold mb-3">Solutions</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">For Startups</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">For Enterprises</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Case Studies</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-semibold mb-3">Resources</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">API Reference</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Blog</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Tutorials</Link></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-semibold mb-3">Company</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">About Us</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Careers</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Contact Us</Link></li>
                </ul>
              </div>
              
              <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                <h5 className="text-white font-semibold mb-3">Community</h5>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Forum</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Discord</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#135feb] text-sm transition-colors">Events</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-[#282e39]/70 pt-8 flex flex-col sm:flex-row items-center justify-between">
              <p className="text-gray-500 text-sm mb-4 sm:mb-0">© 2025 LakeNine. All rights reserved.</p>
              <div className="flex gap-5">
                <Link href="#" className="text-gray-500 hover:text-[#135feb] transition-colors">
                  <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-[#135feb] transition-colors">
                  <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-[#135feb] transition-colors">
                  <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
