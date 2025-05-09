"use client";

import React, { useState } from 'react';
import FileViewer from './FileViewer';
import CodePreview from './CodePreview';

interface ProjectPreviewProps {
  fileStructure: string[];
  projectFiles: Record<string, string>;
  initialCode?: string;
}

export default function ProjectPreview({ 
  fileStructure, 
  projectFiles, 
  initialCode = '// Select a file to view code' 
}: ProjectPreviewProps) {
  const [currentCode, setCurrentCode] = useState<string>(initialCode);
  const [currentFile, setCurrentFile] = useState<string>('');

  // Update both code and file name when a file is selected
  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
    setCurrentCode(projectFiles[filePath] || '// No content available');
  };

  return (
    <div className="grid grid-cols-12 h-full border border-gray-700 rounded-lg overflow-hidden">
      <div className="col-span-4 border-r border-gray-700">
        <FileViewer 
          fileStructure={fileStructure} 
          projectFiles={projectFiles}
          onFileSelect={handleFileSelect} 
        />
      </div>
      <div className="col-span-8">
        <CodePreview code={currentCode} fileName={currentFile} />
      </div>
    </div>
  );
} 