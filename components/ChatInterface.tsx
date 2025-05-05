"use client";

import { useState } from "react";
import FrameworkModal from "./FrameworkModal";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  setGeneratedCode: (code: string) => void;
  setFileStructure: (structure: string[]) => void;
  setTestResults: (results: string[]) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface({
  isOpen,
  onClose,
  setGeneratedCode,
  setFileStructure,
  setTestResults,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGymWebsite = async (frameworks: string[]) => {
    setIsGenerating(true);
    
    // Generate the project structure
    const fileStructure = [
      "src/",
      "src/components/",
      "src/components/Header.tsx",
      "src/components/Hero.tsx",
      "src/components/Features.tsx",
      "src/components/Classes.tsx",
      "src/components/Trainers.tsx",
      "src/components/Testimonials.tsx",
      "src/components/Contact.tsx",
      "src/components/Footer.tsx",
      "src/styles/",
      "src/styles/globals.css",
      "src/pages/",
      "src/pages/index.tsx",
      "src/pages/about.tsx",
      "src/pages/classes.tsx",
      "src/pages/contact.tsx",
      "public/",
      "public/images/",
      "package.json",
      "tsconfig.json",
      "next.config.js",
      "README.md"
    ];

    // Generate the main page content
    const mainPageCode = `import { NextPage } from 'next';
import Head from 'next/head';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Classes from '@/components/Classes';
import Trainers from '@/components/Trainers';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>FitLife Gym - Your Path to Fitness</title>
        <meta name="description" content="Join FitLife Gym for professional training and state-of-the-art facilities" />
      </Head>
      <Header />
      <main>
        <Hero />
        <Features />
        <Classes />
        <Trainers />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Home;`;

    // Generate the Header component
    const headerCode = `import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            FitLife Gym
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-blue-400">Home</Link>
            <Link href="/about" className="hover:text-blue-400">About</Link>
            <Link href="/classes" className="hover:text-blue-400">Classes</Link>
            <Link href="/contact" className="hover:text-blue-400">Contact</Link>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-4">
            <Link href="/" className="block hover:text-blue-400">Home</Link>
            <Link href="/about" className="block hover:text-blue-400">About</Link>
            <Link href="/classes" className="block hover:text-blue-400">Classes</Link>
            <Link href="/contact" className="block hover:text-blue-400">Contact</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;`;

    // Generate the Hero component
    const heroCode = `const Hero = () => {
  return (
    <section className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">
            Transform Your Body, Transform Your Life
          </h1>
          <p className="text-xl mb-8">
            Join our state-of-the-art gym and start your fitness journey today.
            Professional trainers, modern equipment, and a supportive community.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;`;

    // Update the state with generated content
    setFileStructure(fileStructure);
    setGeneratedCode(mainPageCode);
    setTestResults([
      "Project structure created successfully",
      "Main page component generated",
      "Header component generated",
      "Hero component generated",
      "Ready to run: npm run dev"
    ]);

    setIsGenerating(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check if the message is about generating a gym website
    if (input.toLowerCase().includes("gym website") || 
        input.toLowerCase().includes("gym site") || 
        input.toLowerCase().includes("fitness website")) {
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          role: "assistant",
          content: "I'll help you create a modern gym website. Let's select the frameworks we'll use.",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsModalOpen(true);
      }, 1000);
    } else {
      // Generic response for other queries
      setTimeout(() => {
        const aiMessage: Message = {
          role: "assistant",
          content: "I'm here to help you with your project. What would you like to create?",
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const handleFrameworkConfirm = (frameworks: string[]) => {
    setIsModalOpen(false);
    
    // Add AI message about starting generation
    const startingMessage: Message = {
      role: "assistant",
      content: "Great! I'll generate a modern gym website using Next.js, React, and Tailwind CSS. This might take a moment...",
    };
    setMessages((prev) => [...prev, startingMessage]);

    // Generate the website
    generateGymWebsite(frameworks);

    // Add completion message
    setTimeout(() => {
      const completionMessage: Message = {
        role: "assistant",
        content: "I've generated a complete gym website with all necessary components and styling. You can now run 'npm run dev' to start the development server.",
      };
      setMessages((prev) => [...prev, completionMessage]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] w-full max-w-2xl h-[80vh] rounded-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-300">AI Assistant</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-[#1e3a8a] text-white"
                      : "bg-[#2a2a2a] text-gray-300"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] text-gray-300 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e40af] transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <FrameworkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFrameworkConfirm}
      />
    </>
  );
} 