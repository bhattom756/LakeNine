import { bootWebContainer, createFiles, installDependencies, startDevServer, initWebContainerAuth } from '@/lib/webcontainer';
import { WebContainer } from '@webcontainer/api';

/**
 * Test files for a simple React app
 */
const TEST_APP_FILES = {
  'package.json': JSON.stringify({
    name: "test-app",
    version: "1.0.0",
    private: true,
    scripts: {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.0.0",
      "vite": "^4.3.9"
    }
  }, null, 2),
  'index.html': `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebContainer Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  'src/main.jsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
  'src/App.jsx': `
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '2rem', 
      maxWidth: '500px',
      margin: '0 auto', 
      textAlign: 'center' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>WebContainer Test App</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        WebContainer is working correctly! This app is running inside the WebContainer environment.
      </p>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        marginBottom: '1.5rem' 
      }}>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Count: {count}
        </button>
      </div>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>
        Click the button to verify that React state updates are working properly.
      </p>
    </div>
  );
}

export default App;`,
  'vite.config.js': `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,
  },
});`
};

/**
 * Test the WebContainer setup by creating and running a simple React app
 * @returns Object with success status, message, and URL if successful
 */
export async function testWebContainer(): Promise<{
  success: boolean;
  message: string;
  url?: string;
  webcontainer?: WebContainer;
}> {
  try {
    // Ensure auth is initialized
    initWebContainerAuth();
    
    // Step 1: Boot WebContainer
    console.log('Booting WebContainer...');
    const webcontainer = await bootWebContainer();
    
    // Step 2: Create test app files
    console.log('Creating test app files...');
    await createFiles(webcontainer, TEST_APP_FILES);
    
    // Step 3: Install dependencies
    console.log('Installing dependencies...');
    const installSuccessful = await installDependencies(webcontainer);
    
    if (!installSuccessful) {
      return {
        success: false,
        message: 'Failed to install dependencies in WebContainer',
        webcontainer
      };
    }
    
    // Step 4: Start dev server
    console.log('Starting development server...');
    const { serverUrl } = await startDevServer(webcontainer);
    
    return {
      success: true,
      message: 'WebContainer test app started successfully!',
      url: serverUrl,
      webcontainer
    };
  } catch (error) {
    console.error('WebContainer test error:', error);
    return {
      success: false,
      message: `WebContainer test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 