'use client';

import { useState, useEffect, useCallback } from 'react';
import FileTree from '@/components/FileTree';
import LivePreview from '@/components/LivePreview';
import TestResults from '@/components/TestResults';
import Navbar from '@/components/ui/Navbar';
import { ResizableLayout } from '@/components/ui/ResizableLayout';
import ChatInterface from '@/components/ChatInterface';
import FileViewerDialog from '@/components/FileViewerDialog';

type FileStructure = string[];
type TestResultsType = string[];

export default function StudioPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [fileStructure, setFileStructure] = useState<FileStructure>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResultsType>([]);
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  
  // Separate state for tracking if files have been initialized
  const [filesInitialized, setFilesInitialized] = useState(false);

  // Use useCallback for the file click handler
  const handleFileClick = useCallback((filePath: string) => {
    setSelectedFile(filePath);
  }, []);

  // Fix the infinite loop by ensuring this effect only runs when necessary
  useEffect(() => {
    if (generatedCode && fileStructure.length > 0 && !filesInitialized) {
      // Only initialize default files if they haven't been initialized yet
      const defaultFiles: Record<string, string> = {};
      
      // If no project files explicitly set, create an example file
      if (Object.keys(projectFiles).length === 0) {
        const mainFile = fileStructure.find(f => 
          f === 'index.html' || f === 'src/App.js' || f === 'src/index.js'
        );
        
        if (mainFile) {
          defaultFiles[mainFile] = generatedCode;
        }
        
        // Add empty content for CSS and JS files to prevent 404s
        if (fileStructure.includes('css/styles.css')) {
          defaultFiles['css/styles.css'] = '/* CSS styles will go here */';
        }
        
        if (fileStructure.includes('js/script.js')) {
          defaultFiles['js/script.js'] = '// JavaScript will go here';
        }
        
        setProjectFiles(prev => ({
          ...defaultFiles,
          ...prev
        }));
        
        // Mark files as initialized to prevent infinite loop
        setFilesInitialized(true);
      }
    }
  }, [generatedCode, fileStructure, filesInitialized]);
  
  // Reset filesInitialized when chat is opened
  const handleChatOpen = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <Navbar />
      <div className="flex h-[calc(100vh-60px)] pt-12 overflow-hidden">
        {/* Left Panel - File Structure */}
        <div 
          className="bg-[#1a1a1a] border-r border-gray-800 flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-300">File Structure</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <FileTree 
              fileStructure={fileStructure} 
              onFileClick={handleFileClick}
            />
          </div>
        </div>

        {/* Resize Handle 1 */}
        <div
          className="h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-400/30 transition-colors duration-200"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startLeftWidth = leftWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const delta = e.clientX - startX;
              const containerWidth = window.innerWidth;
              const newLeftWidth = Math.min(Math.max(startLeftWidth + (delta / containerWidth) * 100, 15), 40);
              setLeftWidth(newLeftWidth);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Center Panel - Live Preview */}
        <div 
          className="p-6 overflow-hidden bg-[#2a2a2a]"
          style={{ width: `${100 - leftWidth - rightWidth}%` }}
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Live Preview</h2>
          <div className="h-full bg-white rounded overflow-hidden">
            <LivePreview generatedCode={generatedCode} projectFiles={projectFiles} />
          </div>
        </div>

        {/* Resize Handle 2 */}
        <div
          className="h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-400/30 transition-colors duration-200"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startRightWidth = rightWidth;
            
            const handleMouseMove = (e: MouseEvent) => {
              const delta = e.clientX - startX;
              const containerWidth = window.innerWidth;
              const newRightWidth = Math.min(Math.max(startRightWidth - (delta / containerWidth) * 100, 15), 40);
              setRightWidth(newRightWidth);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Right Panel - Test Results */}
        <div 
          className="bg-[#1a1a1a] p-6 overflow-hidden border-l border-gray-800"
          style={{ width: `${rightWidth}%` }}
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Test Results</h2>
          <div className="h-full overflow-auto">
            <TestResults testResults={testResults} />
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={handleChatOpen}
        className="fixed bottom-4 right-4 p-3 bg-[#1e3a8a] text-white rounded-full hover:bg-[#1e40af] transition-colors duration-200 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          // Reset the filesInitialized flag when closing the chat
          // This allows a new chat session to set up new files
          setFilesInitialized(false);
        }}
        setGeneratedCode={setGeneratedCode}
        setFileStructure={setFileStructure}
        setTestResults={setTestResults}
        setProjectFiles={files => {
          setProjectFiles(files);
          setFilesInitialized(true);
        }}
      />

      {/* File Viewer Dialog */}
      <FileViewerDialog
        fileName={selectedFile || ''}
        fileContent={selectedFile ? (projectFiles[selectedFile] || '// No content available') : ''}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
}