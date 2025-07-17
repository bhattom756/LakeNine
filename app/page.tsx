"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen text-white relative flex flex-col font-space-grotesk">
      <div className="layout-container flex h-full grow flex-col">
        <Navbar />

        <main className="flex flex-1 flex-col">
          {/* Enhanced Hero Section */}
          <section className="seamless-section relative min-h-[100vh] flex items-center justify-center overflow-hidden">
            {/* Floating Elements */}
            <div className="floating-element"></div>
            <div className="floating-element"></div>
            <div className="floating-element"></div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 gradient-overlay z-[1]"></div>
            
            {/* Enhanced Hero Content */}
            <div className="section-content text-center">
              <div className="relative premium-glass z-10 max-w-4xl mx-auto stagger-item p-12 sm:p-16">
                <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-8">
                  Build <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">AI Apps</span> in Minutes
                </h1>
                <p className="text-gray-300 text-lg sm:text-xl lg:text-2xl font-normal leading-relaxed mb-12 max-w-3xl mx-auto">
                  LakeNine is the fastest way to build and deploy AI apps. Create stunning applications with our advanced low-code platform, or integrate AI seamlessly with our powerful APIs and SDKs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/studio" className="glass-button inline-flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-14 px-8 text-white text-lg font-bold leading-normal tracking-[0.015em] transform hover:scale-105 transition-all duration-300">
                    <span className="truncate">Start Building Free</span>
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link href="#features" className="inline-flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-14 px-8 border border-transparent text-white text-lg font-medium leading-normal tracking-[0.015em] hover:bg-white/10 transition-all duration-300">
                    <span className="truncate">Learn More</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Features Section */}
          <section id="features" className="seamless-section animated-bg relative overflow-hidden">
            <div className="section-content">
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16 sm:mb-20 stagger-item">
                  <h2 className="text-white text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
                    Build AI Apps <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">Your Way</span>
                  </h2>
                  <p className="text-gray-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
                    LakeNine offers a flexible platform to build AI apps, whether you prefer low-code tools or custom code integration.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                  <div className="glass-feature p-8 stagger-item">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mb-4">
                        <svg fill="white" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path>
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600/20 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white text-2xl font-bold leading-tight mb-4">Low-Code Platform</h3>
                    <p className="text-gray-300 text-base leading-relaxed">Build AI apps visually with our intuitive drag-and-drop interface. Create powerful applications without writing a single line of code.</p>
                  </div>
                  
                  <div className="glass-feature p-8 stagger-item">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                        <svg fill="white" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600/20 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white text-2xl font-bold leading-tight mb-4">APIs & SDKs</h3>
                    <p className="text-gray-300 text-base leading-relaxed">Integrate AI into your existing apps with our powerful APIs and SDKs. Seamless integration with comprehensive documentation.</p>
                  </div>
                  
                  <div className="glass-feature p-8 stagger-item">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4">
                        <svg fill="white" height="32px" viewBox="0 0 256 256" width="32px" xmlns="http://www.w3.org/2000/svg">
                          <path d="M103.77,185.94C103.38,187.49,93.63,224,40,224a8,8,0,0,1-8-8c0-53.63,36.51-63.38,38.06-63.77a8,8,0,0,1,3.88,15.53c-.9.25-22.42,6.54-25.56,39.86C81.7,204.48,88,183,88.26,182a8,8,0,0,1,15.51,4Zm93-67.4L192,123.31v58.33A15.91,15.91,0,0,1,187.32,193L153,227.3A15.91,15.91,0,0,1,141.7,232a16.11,16.11,0,0,1-5.1-.83,15.94,15.94,0,0,1-10.78-12.92l-5.37-38.49L76.24,135.55l-38.47-5.37A16,16,0,0,1,28.7,103L63,68.68A15.91,15.91,0,0,1,74.36,64h58.33l4.77-4.77c26.68-26.67,58.83-27.82,71.41-27.07a16,16,0,0,1,15,15C224.6,59.71,223.45,91.86,196.78,118.54ZM40,114.34l37.15,5.18L116.69,80H74.36ZM91.32,128,128,164.68l57.45-57.45a76.46,76.46,0,0,0,22.42-59.16,76.65,76.65,0,0,0-59.11,22.47ZM176,139.31l-39.53,39.53L141.67,216,176,181.64Z"></path>
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500/20 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white text-2xl font-bold leading-tight mb-4">Deploy Anywhere</h3>
                    <p className="text-gray-300 text-base leading-relaxed">Deploy your AI apps to any platform, including web, mobile, and desktop. One codebase, multiple platforms.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Use Cases Section */}
          <section className="seamless-section animated-bg relative overflow-hidden">
            <div className="section-content">
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16 sm:mb-20 stagger-item">
                  <h2 className="text-white text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
                    Build AI Apps for <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Any Use Case</span>
                  </h2>
                  <p className="text-gray-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
                    LakeNine empowers you to create AI apps for a wide range of applications, from internal tools to customer-facing products.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                  <div className="glass-card p-6 stagger-item group">
                    <div className="image-overlay rounded-2xl overflow-hidden mb-6">
                      <Image
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Internal AI Tools Dashboard"
                        width={400}
                        height={250}
                        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold leading-normal mb-3 group-hover:text-blue-400 transition-colors duration-300">Internal Tools</h3>
                      <p className="text-gray-300 text-base leading-relaxed">Automate tasks and improve efficiency with AI-powered internal tools. Streamline workflows and boost productivity across your organization.</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 stagger-item group">
                    <div className="image-overlay rounded-2xl overflow-hidden mb-6">
                      <Image
                        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                        alt="Customer-facing AI Applications"
                        width={400}
                        height={250}
                        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold leading-normal mb-3 group-hover:text-purple-400 transition-colors duration-300">Customer-Facing Apps</h3>
                      <p className="text-gray-300 text-base leading-relaxed">Enhance customer experiences with AI-driven features and personalized interactions. Build engaging applications that delight your users.</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 stagger-item group">
                    <div className="image-overlay rounded-2xl overflow-hidden mb-6">
                      <Image
                        src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80"
                        alt="AI-powered Workflow Automation"
                        width={400}
                        height={250}
                        className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold leading-normal mb-3 group-hover:text-emerald-400 transition-colors duration-300">AI-Powered Workflows</h3>
                      <p className="text-gray-300 text-base leading-relaxed">Streamline processes and automate workflows with intelligent AI solutions. Transform complex operations into seamless experiences.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced CTA Section */}
          <section className="seamless-section animated-bg relative overflow-hidden">
            <div className="section-content">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="premium-glass p-12 sm:p-16">
                  <h2 className="text-white text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
                    Get Started with <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">LakeNine</span> Today
                  </h2>
                  <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
                    Join thousands of developers building the future of AI apps. Start creating powerful applications in minutes, not months.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/studio" className="glass-button inline-flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-16 px-10 text-white text-xl font-bold leading-normal tracking-[0.015em] transform hover:scale-105 transition-all duration-300">
                      <span className="truncate">Start Building Free</span>
                      <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link href="#" className="inline-flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-16 px-10 border border-transparent text-white text-xl font-medium leading-normal tracking-[0.015em] hover:bg-white/10 transition-all duration-300">
                      <span className="truncate">View Documentation</span>
                    </Link>
                  </div>
                  <div className="mt-12 flex items-center justify-center gap-8 text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Free forever plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Deploy in seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer-glass">
          <div className="section-content">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
                <div>
                  <h5 className="text-white font-semibold mb-3">Product</h5>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Features</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Integrations</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Pricing</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Changelog</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-semibold mb-3">Solutions</h5>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">For Startups</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">For Enterprises</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Case Studies</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-semibold mb-3">Resources</h5>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Documentation</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">API Reference</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Blog</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Tutorials</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-semibold mb-3">Company</h5>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">About Us</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Careers</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Contact Us</Link></li>
                  </ul>
                </div>
                
                <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                  <h5 className="text-white font-semibold mb-3">Community</h5>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Forum</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Discord</Link></li>
                    <li><Link href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Events</Link></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between">
                <p className="text-gray-500 text-sm mb-4 sm:mb-0">© 2025 LakeNine. All rights reserved.</p>
                <div className="flex gap-5">
                  <Link href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                    <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                    <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                    <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
