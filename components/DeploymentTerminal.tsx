"use client";

import { useEffect, useRef } from 'react';

interface DeploymentTerminalProps {
  isVisible: boolean;
  onMessage?: (message: string) => void;
}

const DeploymentTerminal = ({ isVisible, onMessage }: DeploymentTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<any>(null);
  const fitAddon = useRef<any>(null);

  useEffect(() => {
    // Only run on client side and when visible
    if (typeof window === 'undefined' || !terminalRef.current || !isVisible || terminal.current) return;

    // Dynamically import xterm.js to avoid SSR issues
    const initTerminal = async () => {
      try {
        // Import xterm.js modules dynamically
        const [
          { Terminal },
          { FitAddon },
          { WebLinksAddon }
        ] = await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit'),
          import('@xterm/addon-web-links')
        ]);

        // Import CSS
        await import('@xterm/xterm/css/xterm.css');

        if (!terminalRef.current) return;

        // Create terminal instance
        terminal.current = new Terminal({
          theme: {
            background: '#1a1a1a',
            foreground: '#ffffff',
            cursor: '#00ff00',
            selection: '#333333',
          },
          fontSize: 12,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          cursorBlink: true,
          rows: 20,
          cols: 80,
        });

        // Add addons
        fitAddon.current = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        
        terminal.current.loadAddon(fitAddon.current);
        terminal.current.loadAddon(webLinksAddon);

        // Open terminal
        terminal.current.open(terminalRef.current);
        fitAddon.current.fit();

        // Welcome message
        writeToTerminal('🚀 LakeNine Deployment Terminal\r\n');
        writeToTerminal('═══════════════════════════════════════\r\n');
        writeToTerminal('Ready for Vercel deployment...\r\n\r\n');

        // Handle resize
        const handleResize = () => {
          if (fitAddon.current) {
            fitAddon.current.fit();
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    initTerminal();

    return () => {
      if (terminal.current) {
        terminal.current.dispose();
        terminal.current = null;
      }
    };
  }, [isVisible]);

  const writeToTerminal = (message: string) => {
    if (terminal.current) {
      terminal.current.write(message);
      onMessage?.(message);
    }
  };

  // Expose write function for parent component
  useEffect(() => {
    // Only set up global terminal object on client side
    if (typeof window === 'undefined') return;

    (window as any).deploymentTerminal = {
      write: writeToTerminal,
      clear: () => {
        if (terminal.current) {
          terminal.current.clear();
        }
      },
      writeLine: (message: string) => writeToTerminal(message + '\r\n'),
      writeSuccess: (message: string) => writeToTerminal(`\x1b[32m✅ ${message}\x1b[0m\r\n`),
      writeError: (message: string) => writeToTerminal(`\x1b[31m❌ ${message}\x1b[0m\r\n`),
      writeInfo: (message: string) => writeToTerminal(`\x1b[36mℹ️  ${message}\x1b[0m\r\n`),
      writeWarning: (message: string) => writeToTerminal(`\x1b[33m⚠️  ${message}\x1b[0m\r\n`),
    };

    return () => {
      // Clean up global reference
      if (typeof window !== 'undefined' && (window as any).deploymentTerminal) {
        delete (window as any).deploymentTerminal;
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-sm font-medium">Deployment Terminal</span>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="h-64 w-full"
        style={{ 
          background: '#1a1a1a',
          padding: '8px'
        }}
      />
    </div>
  );
};

export default DeploymentTerminal;
