'use client';

import { useEffect, useRef, useMemo } from 'react';

interface LivePreviewProps {
  generatedCode: string;
  projectFiles?: Record<string, string>;
}

export default function LivePreview({ generatedCode, projectFiles = {} }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Find the main HTML file or use generated code
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

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const document = iframe.contentDocument;
    if (!document) return;

    // Clear existing content
    document.open();
  
    // Write the main HTML to the iframe
    document.write(mainHtml);
    
    // Create a virtual file system for handling asset URLs
    if (Object.keys(projectFiles).length > 0) {
      // Get the window of the iframe
      const iWindow = iframe.contentWindow;
      if (!iWindow) return;
      
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
          const style = document.createElement('style');
          style.textContent = content;
          document.head.appendChild(style);
        }
        
        // Inject JS files that aren't already included
        if (path.endsWith('.js') && !mainHtml.includes(path)) {
          const script = document.createElement('script');
          script.textContent = content;
          document.body.appendChild(script);
        }
      });
    }
    
    document.close();
  }, [mainHtml, projectFiles]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      className="w-full h-full border-none bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
