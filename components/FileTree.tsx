'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FileTreeProps {
  fileStructure: string[];
  onFileClick?: (filePath: string) => void;
}

// Helper to get file icon based on file type
function getFileIcon(fileName: string, isFolder: boolean = false) {
  if (isFolder) {
    return '📁';
  }
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  // React/JSX files
  if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
    return '⚛️';
  }
  
  // JavaScript/TypeScript
  if (ext === 'js') return '🟨';
  if (ext === 'ts') return '🔷';
  
  // Styles
  if (ext === 'css') return '🎨';
  if (ext === 'scss' || ext === 'sass') return '💅';
  
  // HTML
  if (ext === 'html') return '🌐';
  
  // JSON
  if (ext === 'json') return '📋';
  
  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return '🖼️';
  
  // Config files
  if (['config', 'conf'].some(c => fileName.includes(c))) return '⚙️';
  if (fileName.startsWith('.env')) return '🔐';
  if (fileName === 'package.json') return '📦';
  if (fileName === 'package-lock.json') return '🔒';
  if (fileName.includes('vite')) return '⚡';
  if (fileName.includes('tailwind')) return '🎨';
  
  // Markdown
  if (ext === 'md') return '📝';
  
  // Default
  return '📄';
}

// Helper to get text color based on file type
function getFileColor(fileName: string, isFolder: boolean = false) {
  if (isFolder) {
    return 'text-blue-400';
  }
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  // React/JSX files
  if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
    return 'text-cyan-400';
  }
  
  // JavaScript/TypeScript
  if (ext === 'js') return 'text-yellow-400';
  if (ext === 'ts') return 'text-blue-500';
  
  // Styles
  if (ext === 'css' || ext === 'scss' || ext === 'sass') return 'text-pink-400';
  
  // HTML
  if (ext === 'html') return 'text-orange-400';
  
  // JSON
  if (ext === 'json') return 'text-yellow-300';
  
  // Config files
  if (fileName === 'package.json') return 'text-green-400';
  if (fileName.includes('config') || fileName.includes('conf')) return 'text-gray-400';
  
  // Markdown
  if (ext === 'md') return 'text-white';
  
  // Default
  return 'text-gray-300';
}

// Helper to build a tree from flat file paths
function buildTree(paths: string[]) {
  const root: any = {};
  for (const path of paths) {
    // Remove leading slash and handle trailing slash for directories
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const isDirectory = cleanPath.endsWith('/');
    const parts = (isDirectory ? cleanPath.slice(0, -1) : cleanPath).split('/').filter(Boolean);
    
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1 && !isDirectory) {
        node[part] = null; // file
      } else {
        node[part] = node[part] || {};
        node = node[part];
      }
    }
  }
  return root;
}

// Memoize the TreeNode component to prevent unnecessary re-renders
const TreeNode = memo(({ node, path, onFileClick, openFolders, toggleFolder, depth = 0 }: any) => {
  return (
    <div>
      {Object.entries(node).map(([name, child]: any) => {
        const isFolder = child !== null;
        const fullPath = path ? `${path}/${name}` : name;
        const isOpen = openFolders[fullPath];
        const paddingLeft = depth * 16 + 8; // 16px per level + 8px base padding
        
        // Create handler functions outside of the JSX
        const handleClick = () => {
          if (isFolder) {
            toggleFolder(fullPath);
          } else if (onFileClick) {
            // Ensure the file path starts with '/' for consistency with WebContainer paths
            const filePath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
            onFileClick(filePath);
          }
        };
        
        const fileColor = getFileColor(name, isFolder);
        const fileIcon = getFileIcon(name, isFolder);
        
        return (
          <div key={fullPath}>
            <div
              className={`flex items-center cursor-pointer select-none h-6 text-sm transition-colors duration-150 hover:bg-gray-800/60 ${fileColor}`}
              style={{ paddingLeft: `${paddingLeft}px` }}
              onClick={handleClick}
            >
              {isFolder ? (
                <>
                  <div className="flex items-center justify-center w-4 h-4 mr-1">
                    {isOpen ? (
                      <ChevronDown size={12} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={12} className="text-gray-400" />
                    )}
                  </div>
                  <span className="mr-1 text-xs">{fileIcon}</span>
                  <span className="truncate">{name}</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 mr-1"></div> {/* Spacer for alignment */}
                  <span className="mr-1 text-xs">{fileIcon}</span>
                  <span className="truncate">{name}</span>
                </>
              )}
            </div>
            {isFolder && isOpen && (
              <TreeNode
                node={child}
                path={fullPath}
                onFileClick={onFileClick}
                openFolders={openFolders}
                toggleFolder={toggleFolder}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';

export default function FileTree({ fileStructure, onFileClick }: FileTreeProps) {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({
    // Auto-expand common folders
    'src': true,
    'public': true,
    'components': true,
  });
  
  // Memoize the tree construction
  const tree = useMemo(() => buildTree(fileStructure), [fileStructure]);
  
  // Create a stable toggleFolder function using useCallback
  const toggleFolder = useCallback((path: string) => {
    setOpenFolders((prev) => ({ 
      ...prev, 
      [path]: !prev[path] 
    }));
  }, []);
  
  // Create a stable onFileClick callback if it's provided
  const handleFileClick = useCallback((path: string) => {
    if (onFileClick) {
      onFileClick(path);
    }
  }, [onFileClick]);
  
  return (
    <div className="text-white text-sm font-mono bg-[#1a1a1a] min-h-full">
      <TreeNode
        node={tree}
        path=""
        onFileClick={handleFileClick}
        openFolders={openFolders}
        toggleFolder={toggleFolder}
        depth={0}
      />
    </div>
  );
}
