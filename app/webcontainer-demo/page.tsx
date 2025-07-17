'use client';

import { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import styles from './styles.module.css';

// Store the WebContainer instance at module level
let webcontainerInstance: WebContainer | null = null;

export default function WebContainerDemo() {
  // Use refs for DOM elements with proper types
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to write to terminal (now writes to xterm instance)
  const writeToTerminal = (text: string) => {
    // Ensure the terminal instance exists before writing
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.write(text);
    } else {
      // Fallback for cases where terminal is not yet initialized or disposed
      console.warn("Attempted to write to uninitialized terminal:", text);
    }
  };

  // Helper to create files in WebContainer
  const createFiles = async (files: Record<string, { file: { contents: string } }>) => {
    if (!webcontainerInstance) return;
    for (const filePath in files) {
      await webcontainerInstance.fs.writeFile(filePath, files[filePath].file.contents);
    }
  };

  // This useEffect will now manage xterm initialization and disposal based on showTerminal
  useEffect(() => {
    console.log('showTerminal changed to:', showTerminal);
    if (showTerminal) {
      console.log('Attempting to open terminal. terminalRef.current:', terminalRef.current);
      if (terminalRef.current && !terminalInstanceRef.current) {
        console.log('Initializing new Xterm.js terminal.');
        // Initialize xterm.js terminal
        const terminal = new Terminal({
          convertEol: true, // Convert line feeds to carriage returns + line feeds
          // Optional: add more styling options here
        });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(terminalRef.current);
        terminalInstanceRef.current = terminal;
        fitAddonRef.current = fitAddon;
        
        // Initial write to terminal
        terminal.write('Terminal initialized and opened.\r\n');
      } else if (terminalInstanceRef.current) {
        console.log('Terminal already initialized, ensuring visibility.');
        // If terminal was disposed when hidden, it needs to be re-opened.
        // This case should ideally not happen if conditional rendering is correct,
        // but as a safeguard, we ensure it's re-opened if it somehow got detached.
        if (!terminalInstanceRef.current.element.parentElement && terminalRef.current) {
          console.log('Re-opening disposed terminal.');
          terminalInstanceRef.current.open(terminalRef.current);
        }
      }
      // Ensure terminal is resized when shown or re-shown
      setTimeout(() => {
        console.log('Attempting to fit terminal.');
        fitAddonRef.current?.fit();
      }, 100); 
    } else {
      console.log('Hiding terminal.');
      // Dispose terminal when hidden
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write('\r\nTerminal hidden. Disposing...\r\n');
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
        fitAddonRef.current = null;
        console.log('Terminal disposed.');
      }
    }
  }, [showTerminal]); // Only re-run when showTerminal changes

  // Original useEffect for WebContainer boot
  useEffect(() => {
    // Create a loading.html file in memory and set it as the initial iframe src
    const loadingHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          Booting WebContainer and installing dependencies...
        </body>
      </html>
    `;
    
    const blob = new Blob([loadingHTML], { type: 'text/html' });
    const loadingUrl = URL.createObjectURL(blob);
    
    if (iframeRef.current) {
      iframeRef.current.src = loadingUrl;
    }

    // Immediately show the terminal when starting webcontainer operations
    setShowTerminal(true);
    
    async function startWebContainer() {
      try {
        writeToTerminal('🚀 Booting WebContainer...\r\n'); // Use writeToTerminal for initial messages
        webcontainerInstance = await WebContainer.boot();
        writeToTerminal('✅ WebContainer started\r\n');

        // Fetch initial project files from the API
        writeToTerminal('✨ Generating initial project files...\r\n');
        setIsGenerating(true); // Set generating status
        const response = await fetch('/api/genCode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: prompt || 'Create a simple static HTML, CSS, and JavaScript website.' }), // Use user prompt or default
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch initial files: ${response.statusText}`);
        }

        const data = await response.json();
        // Assuming data.output is a stringified JSON of files, parse it
        const generatedFiles = JSON.parse(data.output);

        // Mount files
        writeToTerminal('📂 Mounting files...\r\n');
        // The API returns a direct map of file paths to content, so convert it to the expected format for createFiles
        const filesToMount = Object.keys(generatedFiles).reduce((acc: Record<string, { file: { contents: string } }>, filePath: string) => {
          acc[filePath] = { file: { contents: generatedFiles[filePath] } };
          return acc;
        }, {});
        await createFiles(filesToMount);
        writeToTerminal('✅ Files mounted\r\n');
        setIsGenerating(false); // Reset generating status

        // Install dependencies
        writeToTerminal('📦 Installing dependencies...\r\n');
        const installProcess = await webcontainerInstance.spawn('npm', ['install']);
        
        // Stream install output to terminal
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            writeToTerminal(data);
          }
        })).catch((error) => {
          console.warn('Install output pipe closed:', error);
        });
        
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error('Installation failed');
        }
        writeToTerminal('✅ Dependencies installed\r\n');

        startDevServer();
      } catch (error: any) {
        writeToTerminal(`❌ Error: ${error.message || 'Unknown error'}\r\n`);
        console.error('WebContainer error:', error);
      }
    }

    async function startDevServer() {
      writeToTerminal('💻 Starting development server...\r\n');
      // Run `npm run dev` to start the Vite app
      const devProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']);

      // Stream dev server output to terminal
      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          writeToTerminal(data);
        }
      })).catch((error) => {
        console.warn('Dev server output pipe closed:', error);
      });
    
      // Wait for `server-ready` event
      webcontainerInstance.on('server-ready', (port, url) => {
        writeToTerminal(`✅ Development server ready on ${url}\r\n`);
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      });
    }

    startWebContainer();

    // Cleanup function for useEffect
    return () => {
      // Dispose WebContainer instance on unmount to free up resources
      // No explicit dispose method, but setting to null allows garbage collection
      webcontainerInstance = null;
      // Revoke the object URL if created
      if (loadingUrl) {
        URL.revokeObjectURL(loadingUrl);
      }
    };
  }, [writeToTerminal, setShowTerminal, prompt, setIsGenerating]); // Dependencies for useEffect

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>WebContainer Demo</h1>
      <p className={styles.description}>
        Enter a prompt below to generate a website and see it running in the preview.
      </p>
      
      <div className={styles.promptContainer}>
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the website you want to generate (e.g., 'Create a portfolio site with a dark theme')"
          className={styles.promptInput}
          disabled={isGenerating}
        />
        <button 
          onClick={() => {
            // Call the startWebContainer function when the button is clicked
            const userPrompt = prompt || 'Create a simple static HTML, CSS, and JavaScript website.';
            // Use existing startWebContainer function or call it here
            // Ensure terminal is visible
            setShowTerminal(true);
          }}
          disabled={isGenerating}
          className={styles.generateButton}
        >
          {isGenerating ? 'Generating...' : 'Generate Website'}
        </button>
      </div>
      
      <div className={styles.workspaceContainer}>
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <button 
              onClick={() => setShowTerminal(!showTerminal)} 
              className={styles.toggleTerminalButton}
            >
              {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            </button>
            <div className={styles.urlBar}>
              <input type="text" value={currentUrl} readOnly className={styles.urlInput} />
            </div>
          </div>
          <iframe ref={iframeRef} className={styles.iframe}></iframe>
        </div>
      </div>

      {showTerminal && (
        <div className={styles.terminalContainer}>
          <div ref={terminalRef} className={styles.terminal}>
            {/* Xterm.js terminal will be rendered here */}
          </div>
        </div>
      )}
    </div>
  );
} 