"use client";

import { useState } from "react";
import FileTree from "@/components/FileTree";
import LivePreview from "@/components/LivePreview";
import TestResults from "@/components/TestResults";
import PromptInput from "@/components/PromptInput";
import Navbar from "@/components/ui/Navbar";

type FileStructure = string[];
type TestResultsType = string[]; 

export default function StudioPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [fileStructure, setFileStructure] = useState<FileStructure>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResultsType>([]);

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen">
      <Navbar />
      <div className="flex h-[calc(100vh-60px)] pt-12">
        <div className="w-1/4 bg-[#1e1e1e] border-r border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-lg font-semibold">File Structure</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <FileTree fileStructure={fileStructure} />
          </div>
          <div className="p-4 border-t border-gray-700">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              setGeneratedCode={setGeneratedCode}
              setFileStructure={setFileStructure}
              setTestResults={setTestResults}
            />
          </div>
        </div>

        {/* Center - Live Preview */}
        <div className="w-1/2 p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
          <LivePreview generatedCode={generatedCode} />
        </div>

        {/* Right - Test Results */}
        <div className="w-1/4 bg-[#1e1e1e] p-6 overflow-auto border-l border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <TestResults testResults={testResults} />
        </div>
      </div>
    </div>
  );
}
