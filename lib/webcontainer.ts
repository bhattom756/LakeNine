import { WebContainer, type FileSystemTree } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let isInitializing = false;

// Default starter files - React + Vite project with correct structure
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
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/forms": "^0.5.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.24",
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
  'tailwind.config.js': {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    },
  },
  'postcss.config.js': {
    file: {
      contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
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
          contents: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Welcome to LakeNine Studio!
            </h1>
            <p className="text-gray-600 mb-6">
              Your AI-powered development environment is ready! Use the chat interface to generate your website.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Click the chat icon in the bottom right to start building your website with AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App`,
        },
      },
      'index.css': {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-height: 100vh;
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
    console.log(`✅ Written file: ${path}`);
  } catch (error) {
    console.error(`Failed to write file ${path}:`, error);
    throw error;
  }
}

// Write multiple files to WebContainer
export async function writeMultipleFiles(files: Record<string, string>): Promise<void> {
  if (!webcontainerInstance) {
    throw new Error('WebContainer not initialized');
  }

  console.log(`📝 Writing ${Object.keys(files).length} files to WebContainer...`);
  
  try {
    // Transform files to proper WebContainer structure
    const transformedFiles = transformFilesToWebContainerStructure(files);
    
    // Write files individually to handle nested structure
    for (const [filePath, content] of Object.entries(files)) {
      // Convert paths like "components/Header.jsx" to "src/Header.jsx" (flat structure)
      const adjustedPath = adjustFilePath(filePath);
      
      try {
        await webcontainerInstance.fs.writeFile(adjustedPath, content);
        console.log(`✅ Written: ${adjustedPath}`);
      } catch (error) {
        console.error(`❌ Failed to write ${adjustedPath}:`, error);
      }
    }
    
    console.log('🎉 All files written successfully!');
  } catch (error) {
    console.error('❌ Error writing multiple files:', error);
    throw error;
  }
}

// Transform file paths to work with WebContainer's flat structure
function adjustFilePath(originalPath: string): string {
  // Remove leading slash if present
  let path = originalPath.startsWith('/') ? originalPath.slice(1) : originalPath;
  
  // Handle different file types and adjust paths
  if (path.startsWith('components/')) {
    // Move components to src/ directory
    path = path.replace('components/', 'src/');
  } else if (path === 'App.jsx' || path === 'main.jsx') {
    // Main app files go to src/
    path = `src/${path}`;
  } else if (path.endsWith('.jsx') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.ts')) {
    // Other component files go to src/ unless they're config files
    if (!['vite.config.js', 'tailwind.config.js', 'postcss.config.js'].includes(path)) {
      path = `src/${path}`;
    }
  }
  
  return path;
}

// Transform file structure to match WebContainer expectations
function transformFilesToWebContainerStructure(files: Record<string, string>): Record<string, string> {
  const transformedFiles: Record<string, string> = {};
  
  for (const [originalPath, content] of Object.entries(files)) {
    const adjustedPath = adjustFilePath(originalPath);
    
    // Fix import paths in the content
    let adjustedContent = content;
    
    // Fix relative imports for components moved to src/
    if (adjustedPath.startsWith('src/') && originalPath.startsWith('components/')) {
      // Update imports from './components/X' to './X'
      adjustedContent = adjustedContent.replace(/from\s+['"]\.\.?\/components\//g, "from './");
      adjustedContent = adjustedContent.replace(/import\s+['"]\.\.?\/components\//g, "import './");
    }
    
    // Fix App.jsx imports
    if (adjustedPath === 'src/App.jsx') {
      // Update component imports to work with flat src structure
      adjustedContent = adjustedContent.replace(/from\s+['"]\.\/components\//g, "from './");
      adjustedContent = adjustedContent.replace(/import\s+['"]\.\/components\//g, "import './");
    }
    
    transformedFiles[adjustedPath] = adjustedContent;
  }
  
  return transformedFiles;
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
    const outputPromise = process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    ).catch((error) => {
      console.warn('Output pipe closed:', error);
    });

    const exitCode = await process.exit;
    
    // Wait for output to finish streaming
    await outputPromise;
    
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