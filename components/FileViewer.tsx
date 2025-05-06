"use client";

import React, { useState, useEffect } from 'react';

interface FileViewerProps {
  fileStructure: string[];
  projectFiles: Record<string, string>;
  onFileSelect: (content: string) => void;
}

export default function FileViewer({ fileStructure, projectFiles, onFileSelect }: FileViewerProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    public: true,
    css: true,
    js: true,
  });

  useEffect(() => {
    // If fileStructure changes and we have files, select the first HTML or index file by default
    if (fileStructure.length > 0 && !selectedFile) {
      const defaultFile = fileStructure.find(file => 
        file === 'index.html' || file.includes('App.js') || file.includes('index.js')
      );
      
      if (defaultFile) {
        handleFileSelect(defaultFile);
      }
    }
  }, [fileStructure, selectedFile]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    
    // Get the content from projectFiles if available
    const content = projectFiles[filePath] || '// No content available';
    onFileSelect(content);
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // Organize files into folders
  const organizeFileStructure = () => {
    const folders: Record<string, string[]> = {};
    const rootFiles: string[] = [];

    fileStructure.forEach(path => {
      if (path.includes('/')) {
        const [folder] = path.split('/');
        if (!folders[folder]) {
          folders[folder] = [];
        }
        folders[folder].push(path);
      } else if (!path.endsWith('/')) {
        rootFiles.push(path);
      }
    });

    return { folders, rootFiles };
  };

  const { folders, rootFiles } = organizeFileStructure();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-900 text-white font-semibold border-b border-gray-700">
        File Structure
      </div>
      <div className="overflow-y-auto flex-1 p-2 bg-gray-900 text-blue-300">
        {/* Root files */}
        {rootFiles.map(file => (
          <div
            key={file}
            className={`py-1 px-2 cursor-pointer rounded hover:bg-gray-800 ${
              selectedFile === file ? 'bg-gray-800 text-blue-400' : ''
            }`}
            onClick={() => handleFileSelect(file)}
          >
            <span className="text-blue-300">📄</span> {file}
          </div>
        ))}

        {/* Folders and their files */}
        {Object.keys(folders).map(folder => (
          <div key={folder}>
            <div
              className="py-1 px-2 cursor-pointer rounded hover:bg-gray-800 flex items-center"
              onClick={() => toggleFolder(folder)}
            >
              <span className="mr-1">
                {expandedFolders[folder] ? '▼' : '►'}
              </span>
              <span className="text-yellow-300">📁</span> {folder}
            </div>
            
            {expandedFolders[folder] && (
              <div className="ml-6">
                {folders[folder]
                  .filter(path => path.split('/').length === 2)
                  .map(file => {
                    const fileName = file.split('/')[1];
                    return (
                      <div
                        key={file}
                        className={`py-1 px-2 cursor-pointer rounded hover:bg-gray-800 ${
                          selectedFile === file ? 'bg-gray-800 text-blue-400' : ''
                        }`}
                        onClick={() => handleFileSelect(file)}
                      >
                        {fileName.endsWith('.js') ? (
                          <span className="text-yellow-300">🟡</span>
                        ) : fileName.endsWith('.css') ? (
                          <span className="text-blue-400">🎨</span>
                        ) : fileName.endsWith('.html') ? (
                          <span className="text-orange-400">🌐</span>
                        ) : (
                          <span className="text-blue-300">📄</span>
                        )}{' '}
                        {fileName}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 