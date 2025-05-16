'use client';

import { useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import styles from './styles.module.css';

// Direct copy of the files from Stackblitz starter
const files = {
  'index.js': {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
    res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
});`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon index.js"
  }
}`,
    },
  },
};

// Store the WebContainer instance at module level
let webcontainerInstance: WebContainer | null = null;

export default function WebContainerDemo() {
  // Use refs for DOM elements with proper types
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a loading.html file in memory and set it as the initial iframe src
    const loadingHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          Installing dependencies...
        </body>
      </html>
    `;
    
    const blob = new Blob([loadingHTML], { type: 'text/html' });
    const loadingUrl = URL.createObjectURL(blob);
    
    if (iframeRef.current) {
      iframeRef.current.src = loadingUrl;
    }
    
    // Boot WebContainer and setup the environment
    async function startWebContainer() {
      // Function to write to terminal
      const writeToTerminal = (text: string) => {
        if (terminalRef.current) {
          const line = document.createElement('div');
          line.textContent = text;
          terminalRef.current.appendChild(line);
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      };

      // Set initial textarea content
      if (textareaRef.current) {
        textareaRef.current.value = files['index.js'].file.contents;
      }

      try {
        // Boot WebContainer
        writeToTerminal('🚀 Booting WebContainer...');
        webcontainerInstance = await WebContainer.boot();
        writeToTerminal('✅ WebContainer started');

        // Mount files
        writeToTerminal('📂 Mounting files...');
        await webcontainerInstance.mount(files);
        writeToTerminal('✅ Files mounted');

        // Setup file writing for the textarea
        if (textareaRef.current) {
          textareaRef.current.addEventListener('input', async (e: Event) => {
            const target = e.target as HTMLTextAreaElement;
            await writeIndexJS(target.value);
          });
        }

        // Install dependencies
        writeToTerminal('📦 Installing dependencies...');
        const installProcess = await webcontainerInstance.spawn('npm', ['install']);
        
        // Stream install output to terminal
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            writeToTerminal(data);
          }
        }));
        
        // Wait for install to complete
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          writeToTerminal('❌ Installation failed');
          throw new Error('Installation failed');
        }
        writeToTerminal('✅ Dependencies installed');

        // Start the server
        writeToTerminal('🚀 Starting dev server...');
        await startDevServer(writeToTerminal);
      } catch (error: any) {
        writeToTerminal(`❌ Error: ${error.message || 'Unknown error'}`);
        console.error('WebContainer error:', error);
      }
    }

    // Function to start the server
    async function startDevServer(writeToTerminal: (text: string) => void) {
      try {
        if (!webcontainerInstance) return;
        
        // Start the server with npm run start
        const startProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
        
        // Stream server output to terminal
        startProcess.output.pipeTo(new WritableStream({
          write(data) {
            writeToTerminal(data);
          }
        }));

        // Listen for server-ready event
        webcontainerInstance.on('server-ready', (port, url) => {
          writeToTerminal(`✅ Server ready on port ${port} at ${url}`);
          
          // Set iframe source to the server URL
          if (iframeRef.current) {
            iframeRef.current.src = url;
          }
        });
      } catch (error: any) {
        writeToTerminal(`❌ Server error: ${error.message || 'Unknown error'}`);
        console.error('Server error:', error);
      }
    }

    // Function to write content to index.js
    async function writeIndexJS(content: string) {
      try {
        if (!webcontainerInstance) return;
        await webcontainerInstance.fs.writeFile('index.js', content);
      } catch (error) {
        console.error('Error writing file:', error);
      }
    }

    // Start WebContainer when component mounts
    if (typeof window !== 'undefined') {
      startWebContainer();
    }

    // Cleanup function
    return () => {
      // Release the URL object
      URL.revokeObjectURL(loadingUrl);
      
      // Teardown WebContainer instance if it exists
      if (webcontainerInstance) {
        webcontainerInstance.teardown();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>WebContainer Demo</h1>
      <p className={styles.description}>
        Edit the code on the left and see live updates in the preview.
      </p>
      
      <div className={styles.workspaceContainer}>
        <div className={styles.editor}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            spellCheck="false"
            placeholder="Loading code editor..."
          />
        </div>
        <div className={styles.preview}>
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            title="WebContainer preview"
            sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts allow-top-navigation"
            allow="cross-origin-isolated"
          />
        </div>
      </div>
      
      <div className={styles.terminalContainer}>
        <div className={styles.terminalHeader}>Terminal</div>
        <div
          ref={terminalRef}
          className={styles.terminal}
        />
      </div>
    </div>
  );
} 