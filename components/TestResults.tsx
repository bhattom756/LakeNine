'use client';

import { useState } from 'react';

interface TestResultsProps {
  testResults: string[];
}

export default function TestResults({ testResults }: TestResultsProps) {
  const [running, setRunning] = useState(false);

  const handleStartTesting = () => {
    setRunning(true);
    // Implement your unit testing logic here
    // For example, trigger an API call to run tests
    // After tests complete, update testResults accordingly
  };

  return (
    <div className="text-white m-1 p-2">
      <button
        onClick={handleStartTesting}
        className="flex items-center justify-center rounded-xl h-10 px-6 text-white text-sm font-medium leading-normal tracking-[0.015em] transition-all duration-300 bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:to-gray-800 shadow-lg"
                      
        disabled={running}
      >
        {running ? 'Running Tests...' : 'Perform Component Validation'}
      </button>
      <ul>
        {testResults.map((result, index) => (
          <li key={index} className="py-1">
            {result}
          </li>
        ))}
      </ul>
    </div>
  );
}
