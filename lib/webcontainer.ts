import { WebContainer, type FileSystemTree } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let isInitializing = false;

// Default starter files - React + Vite project
export const defaultFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: `{
  "name": "lakenine-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx,ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "vite": "^5.2.0"
  }
}`,
    },
  },
  'vite.config.js': {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      port: 5173
    }
  }
})`,
    },
  },
  'index.html': {
    file: {
      contents: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LakeNine Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    },
  },
  'src': {
    directory: {
      'main.jsx': {
        file: {
          contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        },
      },
      'App.jsx': {
        file: {
          contents: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <h1>🚀 Welcome to LakeNine Studio!</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Your AI-powered development environment is ready!
        </p>
      </div>
    </div>
  )
}

export default App`,
        },
      },
      'App.css': {
        file: {
          contents: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}`,
        },
      },
      'index.css': {
        file: {
          contents: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
    color: #213547;
  }
}`,
        },
      },
    },
  },
  'public': {
    directory: {
      'vite.svg': {
        file: {
          contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`,
        },
      },
    },
  },
};

// Initialize WebContainer
export async function initWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (isInitializing) {
    // Wait for existing initialization
    return new Promise((resolve, reject) => {
      const checkInit = () => {
        if (webcontainerInstance) {
          resolve(webcontainerInstance);
        } else if (!isInitializing) {
          reject(new Error('Initialization failed'));
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  }

  isInitializing = true;

  try {
    console.log('🚀 Booting WebContainer...');
    webcontainerInstance = await WebContainer.boot();
    console.log('✅ WebContainer booted successfully');
    
    console.log('📁 Mounting project files...');
    await webcontainerInstance.mount(defaultFiles);
    console.log('✅ Files mounted successfully');
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    const installProcess = await webcontainerInstance.spawn('npm', ['install']);
    
    const installExitCode = await installProcess.exit;
    if (installExitCode !== 0) {
      throw new Error(`npm install failed with exit code ${installExitCode}`);
    }
    console.log('✅ Dependencies installed successfully');

    // Start dev server in background
    console.log('🔥 Starting development server...');
    startDevServer().catch(error => {
      console.error('Dev server error:', error);
    });
    
    return webcontainerInstance;
  } catch (error) {
    console.error('❌ Failed to initialize WebContainer:', error);
    isInitializing = false;
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Start development server
export async function startDevServer(): Promise<string> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  try {
    // Start the dev server
    const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'dev'], {
      env: {
        ...process.env,
        PORT: '5173',
        HOST: '0.0.0.0'
      }
    });
    
    // Don't wait for exit, let it run in background
    serverProcess.exit.then(exitCode => {
      console.log(`Dev server exited with code ${exitCode}`);
    }).catch(error => {
      console.error('Dev server process error:', error);
    });

    // Return the expected URL immediately
    const serverUrl = 'http://localhost:5173';
    
    // Emit server-ready event after a short delay to allow server startup
    setTimeout(() => {
      if (webcontainerInstance) {
        webcontainerInstance.on('server-ready', () => {});
        // Manually emit the event since Vite might not trigger it properly
        (webcontainerInstance as any).emit?.('server-ready', 5173, serverUrl);
      }
    }, 3000);

    return serverUrl;
  } catch (error) {
    console.error('Failed to start dev server:', error);
    throw error;
  }
}

// Write file to WebContainer
export async function writeFile(path: string, content: string): Promise<void> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  try {
    await webcontainerInstance.fs.writeFile(path, content);
  } catch (error) {
    console.error(`Failed to write file ${path}:`, error);
    throw error;
  }
}

// Read file from WebContainer
export async function readFile(path: string): Promise<string> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  try {
    return await webcontainerInstance.fs.readFile(path, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file ${path}:`, error);
    throw error;
  }
}

// Get WebContainer instance
export function getWebContainer(): WebContainer | null {
  return webcontainerInstance;
}

// Mount custom files to WebContainer
export async function mountFiles(files: FileSystemTree): Promise<void> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  try {
    await webcontainerInstance.mount(files);
    
    // Install dependencies if package.json changed
    if (files['package.json']) {
      const installProcess = await webcontainerInstance.spawn('npm', ['install']);
      await installProcess.exit;
    }
  } catch (error) {
    console.error('Failed to mount files:', error);
    throw error;
  }
}

// Terminal functionality
export async function runCommand(command: string, args: string[] = []): Promise<{ output: string; exitCode: number }> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  try {
    const process = await webcontainerInstance.spawn(command, args);
    
    let output = '';
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    const exitCode = await process.exit;
    return { output, exitCode };
  } catch (error) {
    console.error(`Failed to run command ${command}:`, error);
    throw error;
  }
}

// Get file tree from WebContainer
export async function getFileTree(directory = '/'): Promise<string[]> {
  if (!webcontainerInstance) {
    return [];
  }

  try {
    const files = await webcontainerInstance.fs.readdir(directory, { withFileTypes: true });
    const result: string[] = [];
    
    for (const file of files) {
      const path = directory === '/' ? `/${file.name}` : `${directory}/${file.name}`;
      
      if (file.isDirectory()) {
        // Add directory to list but mark it as a directory
        result.push(path + '/');
        // Recursively get subdirectory files, but skip node_modules and .git
        if (!file.name.includes('node_modules') && !file.name.startsWith('.')) {
          const subFiles = await getFileTree(path);
          result.push(...subFiles);
        }
      } else {
        // Add file to list
        result.push(path);
      }
    }
    
    return result.filter(path => 
      !path.includes('/node_modules/') && 
      !path.includes('/.git/') &&
      !path.includes('/.next/')
    );
  } catch (error) {
    console.error('Failed to get file tree:', error);
    return [];
  }
}

// Create a shell process for terminal interaction
export async function createShell(): Promise<any> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  try {
    return await webcontainerInstance.spawn('jsh', [], {
      terminal: {
        cols: 80,
        rows: 24,
      },
    });
  } catch (error) {
    console.error('Failed to create shell:', error);
    throw error;
  }
}

// For backwards compatibility
export const initWebContainerAuth = initWebContainer;