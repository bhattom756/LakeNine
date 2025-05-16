import { WebContainer } from '@webcontainer/api';
import { auth } from '@webcontainer/api';

// Create a singleton instance
let webcontainerInstance: WebContainer | null = null;
let authInitialized = false;

// Initialize auth - only called on client side
export function initWebContainerAuth() {
  // Check if we're in a browser environment and auth hasn't been initialized yet
  if (typeof window !== 'undefined' && !authInitialized) {
    auth.init({
      clientId: 'wc_api_bhattom756_118513e5695a6bae1a97490aacdeed2a',
      scope: '',
      editorOrigin: window.location.origin, // Use current origin instead of StackBlitz default
    });
    authInitialized = true;
  }
}

export async function bootWebContainer() {
  // Make sure auth is initialized
  initWebContainerAuth();

  if (webcontainerInstance) {
    return webcontainerInstance;
  }
  
  try {
    // Boot the WebContainer
    webcontainerInstance = await WebContainer.boot();
    return webcontainerInstance;
  } catch (error) {
    console.error('Failed to boot WebContainer:', error);
    throw error;
  }
}

// Create files from object with file contents
export async function createFiles(
  webcontainer: WebContainer,
  files: Record<string, string>
) {
  const fileEntries: Record<string, any> = {};
  
  for (const [path, content] of Object.entries(files)) {
    // Skip directories
    if (path.endsWith('/')) continue;
    
    // Handle directories in path
    const parts = path.split('/');
    const filename = parts.pop() || '';
    let current = fileEntries;
    
    // Create nested directory structure
    for (const part of parts) {
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }
    
    // Add file with content
    current[filename] = { file: { contents: content } };
  }
  
  try {
    // Mount the files to the WebContainer
    await webcontainer.mount(fileEntries);
    return true;
  } catch (error) {
    console.error('Error mounting files:', error);
    throw error;
  }
}

// Install dependencies (npm install)
export async function installDependencies(webcontainer: WebContainer) {
  try {
    // Start a shell process to run npm install
    const installProcess = await webcontainer.spawn('npm', ['install']);
    
    // Set up listeners for logging output
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('[npm install]:', data);
        }
      })
    );
    
    // Wait for process to exit
    const installExitCode = await installProcess.exit;
    return installExitCode === 0;
  } catch (error) {
    console.error('Error installing dependencies:', error);
    throw error;
  }
}

// Start development server
export async function startDevServer(
  webcontainer: WebContainer,
  command = 'npm',
  args = ['run', 'dev']
) {
  try {
    // Start the dev server
    const serverProcess = await webcontainer.spawn(command, args);
    
    // Set up output listener
    serverProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('[server]:', data);
        }
      })
    );
    
    // Wait for server ready - look for localhost URL in output
    const serverUrl = await new Promise<string>((resolve) => {
      let buffer = '';
      
      // Set up a reader to monitor output
      const reader = serverProcess.output.getReader();
      reader.read().then(function processText({ done, value }): any {
        if (done) return;
        
        buffer += value;
        
        // Look for localhost URL in the output
        const match = buffer.match(/localhost:(\d+)/);
        if (match) {
          reader.releaseLock();
          resolve(`http://localhost:${match[1]}`);
          return;
        }
        
        return reader.read().then(processText);
      });
      
      // Fallback if no URL found after 10 seconds
      setTimeout(() => {
        reader.releaseLock();
        resolve('http://localhost:3000');
      }, 10000);
    });
    
    return { serverProcess, serverUrl };
  } catch (error) {
    console.error('Error starting dev server:', error);
    throw error;
  }
}

// Function to run a full sequence: boot, create files, install, and start server
export async function runProject(files: Record<string, string>) {
  try {
    const webcontainer = await bootWebContainer();
    await createFiles(webcontainer, files);
    await installDependencies(webcontainer);
    const { serverUrl } = await startDevServer(webcontainer);
    return { webcontainer, serverUrl };
  } catch (error) {
    console.error('Error running project:', error);
    throw error;
  }
}