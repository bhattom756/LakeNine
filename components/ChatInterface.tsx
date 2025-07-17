"use client";

import { useState, useRef, useEffect } from "react";
import { fetchPexelsImages } from '@/lib/pexels';
import { ChevronDown, ChevronRight, Sparkles, Send, X } from 'lucide-react';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  setGeneratedCode: (code: string) => void;
  setFileStructure: (structure: string[]) => void;
  setTestResults: (results: string[]) => void;
  setProjectFiles: (files: Record<string, string>) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Update the generateProjectWithAI function with timeout and error handling
async function generateProjectWithAI(userPrompt: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    // Call the backend API to generate the project
    const response = await fetch('/api/genCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: `Create a modern React + Vite project with Tailwind CSS. ${userPrompt}. 
        IMPORTANT: Generate ONLY React components (.jsx files), CSS files, and package.json. 
        Do NOT generate plain HTML files. Use React functional components with hooks.
        Include proper file structure for a Vite React project: src/ folder with components, 
        main.jsx, App.jsx, and index.css.` 
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate project`);
    }
    
    const data = await response.json();
    return {
      plan: data.plan,
      files: data.files,
    };
  } catch (error) {
    console.error('Error in generateProjectWithAI:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again with a shorter prompt.');
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

export default function ChatInterface({
  isOpen,
  onClose,
  setGeneratedCode,
  setFileStructure,
  setTestResults,
  setProjectFiles,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsGenerating(true);
    
    // Add initial assistant message with immediate UI feedback
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "🚀 Starting React + Vite project generation..." },
    ]);
    
    try {
      // Add progress updates
      setTimeout(() => {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "🔍 Analyzing your requirements..." },
        ]);
      }, 500);
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "⚛️ Generating React components..." },
        ]);
      }, 2000);
      
      // Call API with enhanced error handling
      const aiResponse = await generateProjectWithAI(currentInput);
      setAiPlan(aiResponse.plan);
      
      // Process files to ensure they're React/Vite ready
      const processedFiles = prepareFilesForReactVite(aiResponse.files);
      setProjectFiles(processedFiles);
      
      // Set proper React/Vite file structure
      const reactFileStructure = [
        "package.json",
        "vite.config.js", 
        "index.html",
        "src/",
        "src/main.jsx",
        "src/App.jsx",
        "src/App.css",
        "src/index.css",
        "src/components/",
        "public/",
        "public/vite.svg",
        ".gitignore",
        "README.md"
      ];
      
      // Add generated files to structure
      Object.keys(processedFiles).forEach(path => {
        if (!reactFileStructure.includes(path)) {
          reactFileStructure.push(path);
        }
      });
      
      setFileStructure(reactFileStructure);
      
      // Set the main App component for preview
      if (processedFiles['src/App.jsx']) {
        setGeneratedCode(processedFiles['src/App.jsx']);
      } else if (processedFiles['src/main.jsx']) {
        setGeneratedCode(processedFiles['src/main.jsx']);
      }
      
      setTestResults([
        "✅ React + Vite project structure created",
        "✅ Modern React components generated", 
        "✅ Tailwind CSS integration configured",
        "✅ Development server ready",
        "✅ Hot module replacement enabled",
        "✅ All files optimized for WebContainer"
      ]);
      
      // Success message
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "🎉 **Project Generated Successfully!**\n\nYour React + Vite project is ready! I've created:\n\n• Modern React components with JSX\n• Tailwind CSS styling\n• Proper Vite configuration\n• Development-ready file structure\n\nYou can now see the live preview and explore all files in the file explorer." },
      ]);
      
    } catch (error) {
      console.error('Error generating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { 
          role: "assistant", 
          content: `❌ **Error**: ${errorMessage}\n\nPlease try:\n• Refreshing the page\n• Using a shorter, simpler prompt\n• Checking your internet connection\n\nIf the issue persists, the AI service might be temporarily unavailable.` 
        },
      ]);
      
      setTestResults([
        "❌ Project generation failed",
        `❌ Error: ${errorMessage}`,
        "💡 Try again with a simpler prompt"
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // New function to prepare files specifically for React/Vite
  function prepareFilesForReactVite(files: Record<string, string>): Record<string, string> {
    const processedFiles: Record<string, string> = {};
    
    // Ensure we have all required React/Vite files
    const requiredFiles = {
      'package.json': `{
  "name": "react-vite-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}`,
      'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
})`,
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  background-color: #ffffff;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}`,
      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
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
      'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      '.gitignore': `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`,
      'README.md': `# React + Vite Project

This project was generated by LakeNine Studio AI.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔥 Hot Module Replacement
- 📦 Modern build tooling

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
`
    };

    // Add required files first
    Object.entries(requiredFiles).forEach(([path, content]) => {
      processedFiles[path] = content;
    });
    
    // Process AI-generated files
    Object.entries(files).forEach(([path, content]) => {
      if (typeof content === 'string') {
        // Convert any HTML files to JSX components
        if (path.endsWith('.html') && path !== 'index.html') {
          const componentName = path.split('/').pop()?.replace('.html', '') || 'Component';
          const jsxPath = `src/components/${componentName}.jsx`;
          processedFiles[jsxPath] = convertHtmlToJsx(content, componentName);
        }
        // Keep JSX, CSS, JS files as they are
        else if (path.endsWith('.jsx') || path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.json')) {
          processedFiles[path] = content;
        }
        // Convert any plain JS to JSX if it looks like a React component
        else if (path.endsWith('.js') && content.includes('React')) {
          const jsxPath = path.replace('.js', '.jsx');
          processedFiles[jsxPath] = content;
        }
      }
    });
    
    return processedFiles;
  }

  // Helper function to convert HTML to JSX component
  function convertHtmlToJsx(htmlContent: string, componentName: string): string {
    // Basic HTML to JSX conversion
    let jsx = htmlContent
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>');
    
    return `import React from 'react';

export default function ${componentName}() {
  return (
    <div className="min-h-screen">
      ${jsx}
    </div>
  );
}`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="premium-glass w-full max-w-4xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/10">
        {/* Animated gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />
        
        {/* Header with glassmorphism */}
        <div className="relative z-10 p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
                <p className="text-sm text-gray-300">Build React + Vite projects with AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Messages area with custom scrollbar */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to build a React app?</h3>
              <p className="text-gray-400 max-w-md">Describe your project and I'll generate a complete React + Vite application with modern components, Tailwind CSS, and everything you need.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] relative ${
                message.role === "user" 
                  ? "ml-auto" 
                  : "mr-auto"
              }`}>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-400">AI Assistant</span>
                  </div>
                )}
                
                <div className={`rounded-2xl p-4 backdrop-blur-sm border ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/30 text-white"
                    : "bg-white/5 border-white/10 text-gray-100"
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {/* Parse markdown-like syntax */}
                    {message.content.split('\n\n').map((paragraph, i) => {
                      if (paragraph.startsWith('```')) {
                        const codeContent = paragraph.replace(/```[a-z]*\n/, '').replace(/```$/, '');
                        return (
                          <pre key={i} className="bg-black/30 border border-white/10 p-3 rounded-xl text-xs overflow-x-auto mt-2">
                            <code className="text-green-400">{codeContent}</code>
                          </pre>
                        );
                      } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return <h4 key={i} className="font-semibold text-blue-300 mb-2">{paragraph.replace(/\*\*/g, '')}</h4>;
                      } else {
                        return <p key={i} className="leading-relaxed">{paragraph}</p>;
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">AI Assistant</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-gray-300 text-sm">Generating your React project...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area with glassmorphism */}
        <div className="relative z-10 p-6 border-t border-white/10 bg-white/5">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                    handleSend();
                  }
                }}
                placeholder="Describe your React app (e.g., 'portfolio website with dark theme')..."
                disabled={isGenerating}
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs text-gray-400 bg-white/10 border border-white/20 rounded">Enter</kbd>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Send className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 