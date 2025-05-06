'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { ChevronDown, ChevronRight, Folder, File as FileIcon } from 'lucide-react';

interface FileTreeProps {
  fileStructure: string[];
  onFileClick?: (filePath: string) => void;
}

// Helper to build a tree from flat file paths
function buildTree(paths: string[]) {
  const root: any = {};
  for (const path of paths) {
    const parts = path.split('/').filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1 && !path.endsWith('/')) {
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
const TreeNode = memo(({ node, path, onFileClick, openFolders, toggleFolder }: any) => {
  return (
    <ul className="pl-2">
      {Object.entries(node).map(([name, child]: any) => {
        const isFolder = child !== null;
        const fullPath = path ? `${path}/${name}` : name;
        const isOpen = openFolders[fullPath];
        
        // Create handler functions outside of the JSX
        const handleClick = () => {
          if (isFolder) {
            toggleFolder(fullPath);
          } else if (onFileClick) {
            onFileClick(fullPath);
          }
        };
        
        return (
          <li key={fullPath}>
            <div
              className={`flex items-center gap-1 cursor-pointer select-none py-0.5 px-1 rounded-md transition-colors duration-200 ${
                isFolder
                  ? 'text-yellow-400/80 hover:text-yellow-300'
                  : 'text-blue-400/80 hover:text-blue-300'
              }`}
              onClick={handleClick}
            >
              {isFolder ? (
                <>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Folder size={16} />
                  <span>{name}</span>
                </>
              ) : (
                <>
                  <FileIcon size={16} />
                  <span>{name}</span>
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
              />
            )}
          </li>
        );
      })}
    </ul>
  );
});

TreeNode.displayName = 'TreeNode';

export default function FileTree({ fileStructure, onFileClick }: FileTreeProps) {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
  
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
    <div className="text-white text-sm">
      <TreeNode
        node={tree}
        path=""
        onFileClick={handleFileClick}
        openFolders={openFolders}
        toggleFolder={toggleFolder}
      />
    </div>
  );
}
