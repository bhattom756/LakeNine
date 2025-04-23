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
  prompt, setPrompt,
  setGeneratedCode, setFileStructure, setTestResults,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/genCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setGeneratedCode(data.code);
      setFileStructure(data.fileStructure);
      setTestResults(data.testResults);
    } catch (e: any) {
      console.error("Error generating code:", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="w-full p-2 bg-gray-800 text-white rounded"
        rows={4}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
