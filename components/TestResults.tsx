"use client";  // This marks the component as a client-side component.

interface TestResultsProps {
  testResults: string[];
}

const TestResults: React.FC<TestResultsProps> = ({ testResults }) => {
  return (
    <div className="overflow-auto h-full p-4 bg-gray-100">
      <h2 className="text-lg font-semibold">Test Results</h2>
      <ul className="mt-2">
        {testResults.map((result, index) => (
          <li key={index} className={result.includes("fail") ? "text-red-500" : "text-green-500"}>
            {result}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestResults;
