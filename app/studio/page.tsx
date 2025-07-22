'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import FileTree from '@/components/FileTree';
import LivePreview from '@/components/LivePreview';
import TestResults from '@/components/TestResults';
import Navbar from '@/components/ui/Navbar';
import ChatInterface from '@/components/ChatInterface';
import FileViewerDialog from '@/components/FileViewerDialog';
import { toast } from 'react-hot-toast';
import { initWebContainer, getFileTree, readFile } from '@/lib/webcontainer';

type FileStructure = string[];
type TestResultsType = string[];

// Create a modern chat icon component
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="m2 17 10 5 10-5"></path>
    <path d="m2 12 10 5 10-5"></path>
  </svg>
);

export default function StudioPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [fileStructure, setFileStructure] = useState<FileStructure>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResultsType>([]);
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(25);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [webContainerInitialized, setWebContainerInitialized] = useState(false);
  const [isInitializingWebContainer, setIsInitializingWebContainer] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState('');

  // Initialize WebContainer on mount if user is logged in
  useEffect(() => {
    if (user && !webContainerInitialized && !isInitializingWebContainer) {
      setIsInitializingWebContainer(true);
      initWebContainer()
        .then(async () => {
          setWebContainerInitialized(true);
          toast.success('Development environment ready!');
          
          // Update file structure with default files
          const files = await getFileTree();
          setFileStructure(files);
          
          // Load initial file contents (only for actual files, not directories)
          const initialFiles: Record<string, string> = {};
          for (const filePath of files) {
            try {
              // Skip directories (they typically end with / or don't have extensions for common dirs)
              if (filePath.includes('/node_modules/') || 
                  filePath.endsWith('/') || 
                  filePath === '/public' ||
                  filePath === '/src' ||
                  filePath.includes('/.')) {
                continue;
              }
              
              // Only read files with extensions or known file names
              const fileName = filePath.split('/').pop() || '';
              if (fileName.includes('.') || 
                  ['README', 'LICENSE', 'Dockerfile', 'Makefile'].includes(fileName)) {
                const content = await readFile(filePath);
                initialFiles[filePath] = content;
              }
            } catch (error) {
              // Silently skip files that can't be read (likely directories or special files)
              console.debug(`Skipped reading ${filePath}:`, error);
            }
          }
          setProjectFiles(initialFiles);
        })
        .catch((error) => {
          console.error('Failed to initialize WebContainer:', error);
          toast.error('Failed to initialize development environment');
        })
        .finally(() => {
          setIsInitializingWebContainer(false);
        });
    }
  }, [user, webContainerInitialized, isInitializingWebContainer]);

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Store the current route to redirect back after login
    localStorage.setItem('authRedirectPath', '/studio');
    router.push('/login');
  };

  // File click handler
  const handleFileClick = useCallback(async (filePath: string) => {
    // Don't try to open directories
    if (filePath.endsWith('/')) {
      return;
    }
    
    setSelectedFile(filePath);
    
    // Read the actual file content from WebContainer
    if (webContainerInitialized) {
      try {
        const content = await readFile(filePath);
        setProjectFiles(prev => ({
          ...prev,
          [filePath]: content
        }));
      } catch (error) {
        console.error('Failed to read file:', error);
        setProjectFiles(prev => ({
          ...prev,
          [filePath]: `// Failed to load file content: ${error}`
        }));
      }
    }
  }, [webContainerInitialized]);

  // Handle file update from the editor
  const handleFileUpdate = useCallback(async (filePath: string, content: string) => {
    // Update local project files state
    setProjectFiles(prev => ({
      ...prev,
      [filePath]: content
    }));

    // Update file structure if needed
    try {
      const updatedFiles = await getFileTree();
      setFileStructure(updatedFiles);
    } catch (error) {
      console.error('Failed to update file structure:', error);
    }
  }, []);

  // Chat interface handlers
  const handleChatOpen = useCallback(() => {
    if (!user) {
      toast.error('Please log in to use AI features');
      return;
    }
    setIsChatOpen(true);
  }, [user]);

  const handleChatClose = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <Navbar />

      {/* Studio Layout */}
      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        {/* Left Panel - File Explorer */}
        <div 
          className="bg-[#1a1a1a] border-r border-gray-800 flex flex-col overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="px-4 py-3 bg-[#1a1a1a] text-white font-bold text-lg h-[52px] flex items-center border-b border-gray-800">
            <h2 className="text-lg font-semibold">Explorer</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {webContainerInitialized ? (
              <FileTree 
                fileStructure={fileStructure} 
                onFileClick={handleFileClick}
              />
            ) : (
              <div className="text-gray-400 text-sm">
                {user ? (
                  isInitializingWebContainer ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Initializing...
                    </div>
                  ) : (
                    'Use the AI chat to start building'
                  )
                ) : (
                  'Sign In to view your files.'
                )}
              </div>
            )}
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
        <div style={{ width: `${100 - leftWidth - rightWidth}%` }}>
          {user && webContainerInitialized ? (
            <LivePreview generatedCode={generatedCode} projectFiles={projectFiles} />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center">
              <div className="text-center">
                {!user ? (
                  <>
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-bold mb-4 text-black">Login Required</h2>
                    <p className="text-gray-400 mb-6">Please log in to access the live preview</p>
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleLoginRedirect}
                        className="flex items-center justify-center rounded-xl h-10 px-6 text-white text-sm font-medium leading-normal tracking-[0.015em] transition-all duration-300 bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:to-gray-800 shadow-lg"
                      >
                        Login to Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">⚡</div>
                    <h2 className="text-2xl font-bold mb-4">Development Environment</h2>
                    <p className="text-gray-400 mb-6">
                      {isInitializingWebContainer 
                        ? 'Setting up your development environment...' 
                        : 'Use the AI chat below to start building'}
                    </p>
                    {isInitializingWebContainer && (
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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
          className="bg-[#1a1a1a] overflow-hidden border-l border-gray-800"
          style={{ width: `${rightWidth}%` }}
        >
          <div className="px-4 py-3 bg-[#1a1a1a] text-white font-bold text-lg h-[52px] flex items-center border-b border-gray-800">
            <h2 className="text-lg font-semibold">Component Testing</h2>
          </div>
          <div className="h-full overflow-auto">
            <TestResults testResults={testResults} />
          </div>
        </div>
      </div>


      {/* Chat Interface */}
      {user && (
        <ChatInterface
          isOpen={isChatOpen}
          onClose={handleChatClose}
          setGeneratedCode={setGeneratedCode}
          setFileStructure={setFileStructure}
          setTestResults={setTestResults}
          setProjectFiles={(files) => {
            setProjectFiles(files);
            // Update file structure when files change
            getFileTree().then(updatedFiles => {
              setFileStructure(updatedFiles);
            });
          }}
        />
      )}

      {/* File Viewer Dialog */}
      <FileViewerDialog
        fileName={selectedFile || ''}
        fileContent={selectedFile ? (projectFiles[selectedFile] || '// No content available') : ''}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        onFileUpdate={handleFileUpdate}
      />
    </div>
  );
}