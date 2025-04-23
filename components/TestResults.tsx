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
    <div className="text-white">
      <button
        onClick={handleStartTesting}
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        disabled={running}
      >
        {running ? 'Running Tests...' : 'Start Unit Testing'}
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
