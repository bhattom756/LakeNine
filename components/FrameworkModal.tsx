"use client";

import { useState } from "react";

interface FrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (frameworks: string[]) => void;
}

export default function FrameworkModal({ isOpen, onClose, onConfirm }: FrameworkModalProps) {
  const defaultFrameworks = ["React", "Next.js", "TypeScript", "Tailwind CSS"];
  const [input, setInput] = useState<string>(defaultFrameworks.join(", "));

  const handleConfirm = () => {
    const fwList = input
      .split(",")
      .map((fw) => fw.trim())
      .filter((fw) => fw.length > 0);
    onConfirm(fwList);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Select Frameworks</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter frameworks separated by commas..."
          className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a] transition-colors duration-200 border border-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e40af] transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
} 