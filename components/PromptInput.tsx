"use client";  // This marks the component as a client-side component.

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  setGeneratedCode: React.Dispatch<React.SetStateAction<string>>;
  setFileStructure: React.Dispatch<React.SetStateAction<string[]>>;
  setTestResults: React.Dispatch<React.SetStateAction<string[]>>;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, setGeneratedCode, setFileStructure, setTestResults }) => {
  const handleGenerate = async () => {
    const response = await fetch("/api/generateCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    setGeneratedCode(data.generatedCode);
    setFileStructure(data.fileStructure);
    setTestResults(data.testResults);
  };

  return (
    <div className="p-4">
      <textarea 
        className="w-full p-2 border rounded-md"
        placeholder="Describe your website..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleGenerate}
      >
        Generate Website
      </button>
    </div>
  );
};

export default PromptInput;