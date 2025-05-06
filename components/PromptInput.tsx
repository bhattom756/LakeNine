"use client";

import { useState } from "react";

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  setGeneratedCode: (v: string) => void;
  setFileStructure: (v: string[]) => void;
  setTestResults: (v: string[]) => void;
}

export default function PromptInput({
  prompt,
  setPrompt,
  setGeneratedCode,
  setFileStructure,
  setTestResults,
}: Props) {
  return (
    <div className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to build..."
        className="w-full h-32 p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
      />
      <div className="flex gap-3">
        <button
          onClick={() => {
            // Handle code generation
            setGeneratedCode("// Generated code will appear here");
            setFileStructure(["src/", "package.json"]);
            setTestResults(["Test 1: Passed", "Test 2: Passed"]);
          }}
          className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e40af] transition-colors duration-200"
        >
          Generate Code
        </button>
      </div>
    </div>
  );
}
