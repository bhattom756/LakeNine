'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { bootWebContainer, createFiles, installDependencies, startDevServer } from '@/lib/webcontainer';
import { WebContainer } from '@webcontainer/api';
import { ClipLoader } from 'react-spinners';

interface LivePreviewProps {
  generatedCode: string;
  projectFiles?: Record<string, string>;
}

export default function LivePreview({ generatedCode, projectFiles = {} }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webcontainerReady, setWebcontainerReady] = useState(false);
  const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer | null>(null);

  // Determine if we should use WebContainer or iframe based on project files
  const shouldUseWebContainer = useMemo(() => {
    // Check if this is a Node.js project
    return Object.keys(projectFiles).some(file => 
      file === 'package.json' || file.includes('node_modules') || 
      file.endsWith('.js') || file.endsWith('.jsx') || 
      file.endsWith('.ts') || file.endsWith('.tsx')
    );
  }, [projectFiles]);

  // Find the main HTML file or use generated code (for iframe fallback)
  const mainHtml = useMemo(() => {
    // If we have an index.html file, use that
    if (projectFiles['index.html']) {
      return projectFiles['index.html'];
    }

    // Otherwise, use the generated code if it looks like HTML
    if (generatedCode && (generatedCode.includes('<!DOCTYPE html>') || generatedCode.includes('<html>'))) {
      return generatedCode;
    }
    
    // Fallback to a basic HTML wrapper
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Live Preview</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Inject the content into the body or root element
            document.getElementById('root').innerHTML = \`${generatedCode.replace(/`/g, '\\`')}\`;
          </script>
        </body>
      </html>
    `;
  }, [generatedCode, projectFiles]);

  // Boot WebContainer
  useEffect(() => {
    async function initWebContainer() {
      if (!shouldUseWebContainer) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Boot the WebContainer
        const webcontainer = await bootWebContainer();
        setWebcontainerInstance(webcontainer);
        setWebcontainerReady(true);
        
      } catch (err) {
        console.error('Failed to boot WebContainer:', err);
        setError('Failed to initialize WebContainer. Falling back to iframe preview.');
        setWebcontainerReady(false);
      } finally {
        setLoading(false);
      }
    }
    
    initWebContainer();
  }, [shouldUseWebContainer]);

  // Set up project in WebContainer when ready and when project files change
  useEffect(() => {
    if (!webcontainerReady || !webcontainerInstance || !shouldUseWebContainer || Object.keys(projectFiles).length === 0) {
      return;
    }

    async function setupProject() {
      try {
        setLoading(true);
        setError(null);
        
        // Create an index.html if none exists
        const filesToMount = { ...projectFiles };
        if (!filesToMount['index.html'] && mainHtml) {
          filesToMount['index.html'] = mainHtml;
        }
        
        // Ensure package.json exists
        if (!filesToMount['package.json']) {
          filesToMount['package.json'] = JSON.stringify({
            name: "generated-app",
            version: "1.0.0",
            private: true,
            scripts: {
              dev: "vite",
              build: "vite build",
              preview: "vite preview"
            },
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            },
            devDependencies: {
              "@vitejs/plugin-react": "^4.0.0",
              "vite": "^4.3.9"
            }
          }, null, 2);
        }
        
        // Mount files
        await createFiles(webcontainerInstance, filesToMount);
        
        // Install dependencies
        await installDependencies(webcontainerInstance);
        
        // Start dev server
        const { serverUrl } = await startDevServer(webcontainerInstance);
        
        // Load the URL in the iframe
        if (iframeRef.current) {
          iframeRef.current.src = serverUrl;
        }
        
      } catch (err) {
        console.error('Failed to setup project in WebContainer:', err);
        setError('Failed to run project in WebContainer. Check the console for details.');
      } finally {
        setLoading(false);
      }
    }
    
    setupProject();
  }, [webcontainerReady, webcontainerInstance, projectFiles, mainHtml, shouldUseWebContainer]);

  // Fallback to iframe if not using WebContainer
  useEffect(() => {
    if (shouldUseWebContainer || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const document = iframe.contentDocument;
    if (!document) return;

    // Clear existing content
    document.open();
  
    // Write the main HTML to the iframe
    document.write(mainHtml);
    
    // Wait for iframe to load before accessing document elements
    const handleLoad = () => {
      // Get the window of the iframe
      const iWindow = iframe.contentWindow;
      if (!iWindow) return;
      
      if (Object.keys(projectFiles).length > 0) {
        // Create a virtual file system with the files
        const originalFetch = iWindow.fetch;
        
        // Override fetch to handle virtual files
        iWindow.fetch = function(url: string, options: RequestInit) {
          const urlString = url.toString();
          
          // Check if the URL is for a file we have in our project files
          if (projectFiles[urlString]) {
            return Promise.resolve(new Response(projectFiles[urlString], {
              status: 200,
              headers: {
                'Content-Type': urlString.endsWith('.css') ? 'text/css' : 
                              urlString.endsWith('.js') ? 'application/javascript' :
                              'text/plain'
              }
            }));
          }
          
          // Otherwise, use the original fetch
          return originalFetch.call(this, url, options);
        };
    
        // Inject CSS files directly
        Object.entries(projectFiles).forEach(([path, content]) => {
          if (path.endsWith('.css') && !mainHtml.includes(path)) {
            if (document.head) {
              const style = document.createElement('style');
              style.textContent = content;
              document.head.appendChild(style);
            }
          }
          
          // Inject JS files that aren't already included
          if (path.endsWith('.js') && !mainHtml.includes(path)) {
            if (document.body) {
              const script = document.createElement('script');
              script.textContent = content;
              document.body.appendChild(script);
            }
          }
        });
      }
    };
    
    // Add load event listener to ensure document is fully loaded
    iframe.addEventListener('load', handleLoad);
    
    document.close();
    
    // Clean up event listener
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [mainHtml, projectFiles, shouldUseWebContainer]);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-center">
            <ClipLoader color="#3B82F6" size={40} />
            <p className="mt-2 text-gray-700">
              {shouldUseWebContainer ? 'Setting up development environment...' : 'Loading preview...'}
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 text-sm z-10">
          {error}
        </div>
      )}
      
      {webcontainerReady && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-10 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          WebContainer Active
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        title="Live Preview"
        className="w-full h-full border-none bg-white"
        sandbox={shouldUseWebContainer ? "allow-scripts allow-same-origin allow-forms" : "allow-scripts allow-same-origin"}
      />
    </div>
  );
}
