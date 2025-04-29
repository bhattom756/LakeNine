import React, { useState } from "react";

interface FrameworkModalProps {
  isOpen: boolean;
  suggestedFrameworks: string[];
  onConfirm: (frameworks: string[]) => void;
  onClose: () => void;
}

const FrameworkModal: React.FC<FrameworkModalProps> = ({
  isOpen,
  suggestedFrameworks,
  onConfirm,
  onClose,
}) => {
  const [frameworks, setFrameworks] = useState<string[]>(suggestedFrameworks);
  const [input, setInput] = useState<string>(suggestedFrameworks.join(", "));

  const handleConfirm = () => {
    const fwList = input
      .split(",")
      .map((fw) => fw.trim())
      .filter((fw) => fw.length > 0);
    onConfirm(fwList);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Confirm Frameworks & Libraries</h2>
        <p className="mb-2 text-sm text-gray-700">
          AI suggests the following frameworks/libraries for your project. You can edit the list below:
        </p>
        <input
          className="w-full border border-gray-300 rounded px-2 py-1 mb-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. React, Tailwind CSS, Express"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameworkModal; 