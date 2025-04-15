"use client";  // This marks the component as a client-side component.

import { useState } from "react";
import FileTree from "@/components/FileTree";
import LivePreview from "@/components/LivePreview";
import TestResults from "@/components/TestResults";
import PromptInput from "@/components/PromptInput";

// Define the types of the states used in this page.
type FileStructure = string[];
type TestResults = string[];

export default function StudioPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [fileStructure, setFileStructure] = useState<FileStructure>([]); 
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResults>([]); 

  return (
    <div className="flex">
      <div className="w-1/4">
        <FileTree fileStructure={fileStructure} />
      </div>
      <div className="w-1/2">
        <LivePreview generatedCode={generatedCode} />
      </div>
      <div className="w-1/4">
        <TestResults testResults={testResults} />
      </div>
      <PromptInput 
        prompt={prompt}
        setPrompt={setPrompt}
        setGeneratedCode={setGeneratedCode}
        setFileStructure={setFileStructure}
        setTestResults={setTestResults}
      />
    </div>
  );
}
