'use client';

import { useEffect, useRef, useState } from 'react';
import { initWebContainer, getWebContainer, getFileTree, writeFile, runCommand, readFile } from '@/lib/webcontainer';
import { ClipLoader } from 'react-spinners';
import { IoIosRefresh } from "react-icons/io";
import { Button } from "@/components/ui/button"
import { FaArrowRightToBracket, FaDownload } from "react-icons/fa6";
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';

interface LivePreviewProps {
  generatedCode: string;
  projectFiles?: Record<string, string>;
}

export default function LivePreview({ generatedCode, projectFiles = {} }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webcontainerReady, setWebcontainerReady] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [terminalReady, setTerminalReady] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [serverStarted, setServerStarted] = useState(false);
  const shellProcessRef = useRef<any>(null);
  const inputWriterRef = useRef<any>(null);

  // Initialize terminal
  useEffect(() => {
    if (typeof window === 'undefined' || !showTerminal || terminalInstanceRef.current) return;

    let terminal: any, fitAddon: any;

    const setupTerminal = async () => {
      try {
        const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');

        if (terminalRef.current) {
          terminal = new Terminal({
            convertEol: true,
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
              background: '#1e1e1e',
              foreground: '#ffffff',
              cursor: '#ffffff',
              black: '#1e1e1e',
              red: '#f87171',
              green: '#4ade80',
              yellow: '#facc15',
              blue: '#60a5fa',
              magenta: '#c084fc',
              cyan: '#22d3ee',
              white: '#ffffff',
              brightBlack: '#374151',
              brightRed: '#fca5a5',
              brightGreen: '#86efac',
              brightYellow: '#fde047',
              brightBlue: '#93c5fd',
              brightMagenta: '#d8b4fe',
              brightCyan: '#67e8f9',
              brightWhite: '#f9fafb',
            },
          });

          fitAddon = new FitAddon();
          terminal.loadAddon(fitAddon);
          terminal.open(terminalRef.current);
          
          terminalInstanceRef.current = terminal;
          fitAddonRef.current = fitAddon;
          setTerminalReady(true);

          // Welcome message
          terminal.write('\x1b[1;34m┌─ LakeNine Studio Terminal ─┐\x1b[0m\r\n');
          terminal.write('\x1b[1;32m│  Development Environment   │\x1b[0m\r\n');
          terminal.write('\x1b[1;34m└─────────────────────────────┘\x1b[0m\r\n\r\n');
          terminal.write('\x1b[36m~/lakenine-studio\x1b[0m $ ');

          // Fit terminal to container
          setTimeout(() => fitAddon.fit(), 100);

          // Connect to WebContainer if ready
          const webcontainer = getWebContainer();
          if (webcontainer) {
            connectTerminalToWebContainer(terminal, webcontainer);
          }
        }
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    setupTerminal();

    return () => {
      // Clean up shell connections first
      if (inputWriterRef.current) {
        try {
          inputWriterRef.current.releaseLock();
        } catch (error) {
          console.warn('Error releasing input writer lock:', error);
        }
        inputWriterRef.current = null;
      }
      
      if (shellProcessRef.current) {
        try {
          shellProcessRef.current.kill?.();
        } catch (error) {
          console.warn('Error killing shell process:', error);
        }
        shellProcessRef.current = null;
      }
      
      // Clean up terminal
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
        fitAddonRef.current = null;
        setTerminalReady(false);
      }
    };
  }, [showTerminal]);

  // Connect terminal to WebContainer
  const connectTerminalToWebContainer = (terminal: any, webcontainer: any) => {
    if (!terminal || !webcontainer) return;

    // Start shell process using jsh (WebContainer's built-in shell)
    webcontainer.spawn('jsh', [], {
      terminal: {
        cols: terminal.cols || 80,
        rows: terminal.rows || 24,
      },
    }).then((shellProcess: any) => {
      // Store shell process reference for cleanup
      shellProcessRef.current = shellProcess;
      
      // Connect the shell output to terminal
      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        })
      ).catch((error: any) => {
        console.error('Output pipe error:', error);
      });

      // Get a single writer for the shell input to avoid locking issues
      const inputWriter = shellProcess.input.getWriter();
      inputWriterRef.current = inputWriter;
      
      // Connect terminal input to shell using the single writer
      terminal.onData((data: string) => {
        if (inputWriterRef.current) {
          inputWriterRef.current.write(data).catch((error: any) => {
            console.error('Input write error:', error);
          });
        }
      });

      // Handle shell exit
      shellProcess.exit.then((exitCode: number) => {
        if (inputWriterRef.current) {
          inputWriterRef.current.releaseLock(); // Release the writer lock
          inputWriterRef.current = null;
        }
        terminal.write(`\r\n\x1b[33mShell exited with code ${exitCode}\x1b[0m\r\n`);
      }).catch((error: any) => {
        console.error('Shell exit error:', error);
        if (inputWriterRef.current) {
          inputWriterRef.current.releaseLock(); // Release the writer lock on error
          inputWriterRef.current = null;
        }
      });

    }).catch((error: any) => {
      console.error('Failed to start shell:', error);
      terminal.write('\r\n\x1b[31mFailed to start shell\x1b[0m\r\n');
      terminal.write('\x1b[36m~/lakenine-studio\x1b[0m $ ');
    });
  };

  // Check WebContainer status on mount
  useEffect(() => {
    const webcontainer = getWebContainer();
    if (webcontainer) {
      setWebcontainerReady(true);
      
      // Set up server ready listener
      webcontainer.on('server-ready', (port: number, url: string) => {
        setCurrentUrl(url);
        setServerStarted(true);
        setLoading(false);
        
        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.write(`\r\n\x1b[32m✓ Server ready at ${url}\x1b[0m\r\n`);
          terminalInstanceRef.current.write('\x1b[36m~/lakenine-studio\x1b[0m $ ');
        }
      });

      // If server is already running, check for URL
      setTimeout(() => {
        if (!serverStarted) {
          // Try to get the server URL (usually localhost:5173 for Vite)
          const defaultUrl = 'http://localhost:5173';
          setCurrentUrl(defaultUrl);
          setServerStarted(true);
          setLoading(false);
        }
      }, 2000);
    }
  }, [serverStarted]);

  // Update project files when they change
  useEffect(() => {
    if (!webcontainerReady || Object.keys(projectFiles).length === 0) return;

    const updateFiles = async () => {
      try {
        const webcontainer = getWebContainer();
        if (!webcontainer) return;

        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.write('\r\n\x1b[33m📂 Updating project files...\x1b[0m\r\n');
        }

        // Write each file to the WebContainer
        for (const [path, content] of Object.entries(projectFiles)) {
          await writeFile(path, content);
        }

        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.write('\x1b[32m✓ Files updated\x1b[0m\r\n');
        }

        // If package.json was updated, reinstall dependencies
        if (projectFiles['package.json']) {
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.write('\x1b[33m📦 Reinstalling dependencies...\x1b[0m\r\n');
          }
          const { output } = await runCommand('npm', ['install']);
          if (terminalInstanceRef.current) {
            terminalInstanceRef.current.write(output);
          }
        }

        // Trigger hot reload - Vite should automatically detect file changes
        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.write('\x1b[32m🔥 Hot reload triggered\x1b[0m\r\n');
          terminalInstanceRef.current.write('\x1b[36m~/lakenine-studio\x1b[0m $ ');
        }

        // Force iframe refresh after a short delay to ensure changes are applied
        setTimeout(() => {
          if (iframeRef.current && currentUrl) {
            const timestamp = Date.now();
            iframeRef.current.src = `${currentUrl}?t=${timestamp}`;
          }
        }, 500);

      } catch (error) {
        console.error('Failed to update files:', error);
        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.write(`\r\n\x1b[31m❌ Failed to update files: ${error}\x1b[0m\r\n`);
        }
      }
    };

    updateFiles();
  }, [projectFiles, webcontainerReady, currentUrl]);

  // Handle refresh
  const handleRefresh = async () => {
    if (iframeRef.current && currentUrl) {
      iframeRef.current.src = currentUrl;
    }
  };

  // Handle download project as ZIP
  const handleDownloadProject = async () => {
    try {
      toast.loading('Preparing download...', { id: 'download' });

      const webcontainer = getWebContainer();
      if (!webcontainer) {
        toast.error('WebContainer not ready', { id: 'download' });
        return;
      }

      // Get all files from WebContainer
      const allFiles = await getFileTree();
      const zip = new JSZip();

      // Read all files and add to zip
      for (const filePath of allFiles) {
        try {
          // Skip directories and unwanted files
          if (filePath.endsWith('/') || 
              filePath.includes('/node_modules/') || 
              filePath.includes('/.git/') || 
              filePath.includes('/.next/') ||
              filePath.includes('/dist/') ||
              filePath.includes('/build/')) {
            continue;
          }

          const content = await readFile(filePath);
          // Remove leading slash for zip structure
          const zipPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
          zip.file(zipPath, content);
        } catch (error) {
          console.warn(`Skipped file ${filePath}:`, error);
        }
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lakenine-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Project downloaded!', { id: 'download' });
    } catch (error) {
      console.error('Failed to download project:', error);
      toast.error('Failed to download project', { id: 'download' });
    }
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        setTimeout(() => fitAddonRef.current.fit(), 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Top bar */}
      <div className="w-full px-4 py-3 bg-[#1a1a1a] text-white font-bold text-lg h-[52px] flex items-center">
        <div className="flex items-center gap-2 w-full">
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center p-1 rounded hover:bg-[#23272e] transition-colors" 
            title="Refresh"
            disabled={!currentUrl}
          >
            <IoIosRefresh size={20} />
          </button>
          
          <div className="flex-1 max-w-md">
            <div className="w-full bg-[#23272e] text-white border border-[#36454f] rounded px-3 py-1.5 text-sm flex items-center gap-2">
              {currentUrl ? (
                <>
                  <div className="flex items-center gap-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs">LIVE</span>
                  </div>
                  <div className="text-gray-300 text-xs">
                    localhost:5173
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Starting server...</span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-1 h-9 px-3 text-sm bg-[#23272e] text-white border-[#36454f] hover:bg-[#2a2a2a] ml-auto"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <FaArrowRightToBracket size={16} />
            {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center  h-9 px-3 text-sm bg-[#23272e] text-white border-[#36454f] hover:bg-[#2a2a2a]"
            onClick={handleDownloadProject}
            title="Download project as ZIP"
          >
            <FaDownload size={16} />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <ClipLoader color="#3B82F6" size={40} />
              <p className="mt-4 text-gray-700 font-medium">
                Starting development server...
              </p>
              <p className="mt-2 text-gray-500 text-sm">
                Please wait while we prepare your environment
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-3 text-sm z-10 border-b border-red-200">
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              {error}
            </div>
          </div>
        )}

        {/* WebContainer status indicator */}
        {webcontainerReady && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            WebContainer Ready
          </div>
        )}

        {/* Preview iframe */}
        <iframe
          ref={iframeRef}
          title="Live Preview"
          className={`w-full ${showTerminal ? 'h-1/2' : 'h-full'} border-none bg-white`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          src={currentUrl || undefined}
        />

        {/* Terminal */}
        {showTerminal && (
          <div className="h-1/2 bg-[#1e1e1e] border-t border-gray-700 flex flex-col">
            <div className="bg-[#2d2d2d] px-4 py-2 text-white text-sm flex items-center gap-2 border-b border-gray-600">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-2">Terminal</span>
            </div>
            <div 
              ref={terminalRef} 
              className="flex-1 p-2"
              style={{ fontFamily: 'Menlo, Monaco, "Courier New", monospace' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
