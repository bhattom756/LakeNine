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
  
  return (
    <div className="grid grid-cols-12 h-full border border-gray-700 rounded-lg overflow-hidden">
      <div className="col-span-4 border-r border-gray-700">
        <FileViewer 
          fileStructure={fileStructure} 
          projectFiles={projectFiles}
          onFileSelect={setCurrentCode} 
        />
      </div>
      <div className="col-span-8">
        <CodePreview code={currentCode} />
      </div>
    </div>
  );
} 