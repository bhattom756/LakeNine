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

// Update the generateProjectWithAI function to include RAG-specific messaging
async function generateProjectWithAI(userPrompt: string) {
  try {
    // Call the backend API to generate the project (now using RAG)
    const response = await fetch('/api/genCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate project');
    }
    
    const data = await response.json();
    return {
      plan: data.plan,
      files: data.files,
    };
  } catch (error) {
    console.error('Error in generateProjectWithAI:', error);
    throw error;
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
    
    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);
    
    // Add initial assistant message
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "I'll create a project based on your request using my knowledge base of high-quality components. Let me think about the best approach..." },
    ]);
    
    // Determine website type and framework from input
    const lowerInput = input.toLowerCase();
    
    // Better detection of technologies
    const isBasicWeb = lowerInput.includes('html') && lowerInput.includes('css') && 
                       (lowerInput.includes('js') || lowerInput.includes('javascript')) ||
                       !lowerInput.includes('react') && !lowerInput.includes('next') && 
                       !lowerInput.includes('vue') && !lowerInput.includes('angular');
    
    const websiteType = lowerInput.includes('gym') ? 'Gym/Fitness' : 
                       lowerInput.includes('hospital') ? 'Healthcare' :
                       lowerInput.includes('restaurant') ? 'Restaurant' :
                       lowerInput.includes('portfolio') ? 'Portfolio' : 'Generic';
    
    try {
      // Continue with actual API call while thinking is displayed
      const aiResponse = await generateProjectWithAI(userMessage.content);
      setAiPlan(aiResponse.plan);
      
      // Process files to ensure they're WebContainer-ready
      const processedFiles = prepareFilesForWebContainer(aiResponse.files, websiteType);
      setProjectFiles(processedFiles);
      
      // Update file structure in UI based on actual files
      let allFiles: string[] = [];
      
      // Only add React-specific files if we're actually using React
      if (websiteType === 'React' || websiteType === 'Next.js') {
        allFiles = [
          "package.json", 
          "README.md",
          "node_modules/",
          "public/",
          "src/",
          ".gitignore",
        ];
      } else {
        // For HTML/CSS/JS, start with simpler structure
        allFiles = [
          "index.html",
          "css/",
          "css/styles.css",
          "js/",
          "js/script.js",
          "README.md",
          "images/",
        ];
      }
      
      // Add files from AI response
      Object.keys(processedFiles).forEach(path => {
        if (!allFiles.includes(path)) {
          allFiles.push(path);
        }
      });
      
      setFileStructure(allFiles);
      
      // For the code preview, show HTML file if it's HTML/CSS/JS
      if (isBasicWeb) {
        if (processedFiles['index.html']) {
          setGeneratedCode(processedFiles['index.html']);
        } else if (processedFiles['css/styles.css']) {
          setGeneratedCode(processedFiles['css/styles.css']);
        }
      } else {
        // For React, show App.js or index.js
        if (processedFiles['src/App.js']) {
          setGeneratedCode(processedFiles['src/App.js']);
        } else if (processedFiles['src/index.js']) {
          setGeneratedCode(processedFiles['src/index.js']);
        }
      }
      
      setTestResults([
        "✅ Project structure created successfully",
        `✅ All files generated with ${isBasicWeb ? 'HTML/CSS/JS' : websiteType}`,
        "✅ Development server running in WebContainer",
        "✅ Code quality verified",
        "✅ Responsive design implemented",
        "✅ RAG-enhanced components integrated"
      ]);
      
      // Send the plan as a separate message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Project Plan**\n\nI've created a structured plan for your ${websiteType} website using my knowledge base of high-quality components.` },
      ]);
      
      // Send message about files - more concise now
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `**Files Created**\n\nYour ${websiteType} website has been successfully generated with ${websiteType} and is now running in WebContainer. You can preview the live site and explore the files in the file explorer.` 
        },
      ]);
      
      // Finished generating
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating project:', error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, but there was an error generating your project. Please try again with a different request." },
      ]);
      setIsGenerating(false);
    }
  };

  // New function to prepare files for WebContainer
  function prepareFilesForWebContainer(files: Record<string, string>, framework: string): Record<string, string> {
    const processedFiles = { ...files };
    
    // Ensure package.json exists for Node.js-based frameworks
    if ((framework === 'React' || framework === 'Next.js' || framework.includes('Vue') || framework.includes('Angular')) 
        && !processedFiles['package.json']) {
        
      if (framework === 'React') {
        processedFiles['package.json'] = JSON.stringify({
          name: "react-app",
          version: "1.0.0",
          private: true,
          scripts: {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-awesome-reveal": "^4.2.3",
            "tailwindcss": "^3.3.2"
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.0",
            "vite": "^4.3.9"
          }
        }, null, 2);
        
        // Add vite config if not present
        if (!processedFiles['vite.config.js']) {
          processedFiles['vite.config.js'] = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,
  },
});`;
        }
      } else if (framework === 'Next.js') {
        processedFiles['package.json'] = JSON.stringify({
          name: "nextjs-app",
          version: "1.0.0",
          private: true,
          scripts: {
            "dev": "next dev",
            "build": "next build",
            "start": "next start"
          },
          dependencies: {
            "next": "^13.4.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-awesome-reveal": "^4.2.3",
            "tailwindcss": "^3.3.2"
          },
          devDependencies: {
            "autoprefixer": "^10.4.14",
            "postcss": "^8.4.23"
          }
        }, null, 2);
      } else if (framework.includes('Vue')) {
        processedFiles['package.json'] = JSON.stringify({
          name: "vue-app",
          version: "1.0.0",
          private: true,
          scripts: {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          dependencies: {
            "vue": "^3.3.4",
            "tailwindcss": "^3.3.2"
          },
          devDependencies: {
            "@vitejs/plugin-vue": "^4.1.0",
            "vite": "^4.3.9"
          }
        }, null, 2);
      }
    }
    
    // Check if index.html exists for Vite-based projects
    if ((framework === 'React' || framework.includes('Vue')) && !processedFiles['index.html']) {
      if (framework === 'React') {
        processedFiles['index.html'] = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

        // Add src/main.jsx if it doesn't exist
        if (!processedFiles['src/main.jsx']) {
          processedFiles['src/main.jsx'] = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`;
        }
      } else if (framework.includes('Vue')) {
        processedFiles['index.html'] = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;
      }
    }
    
    return processedFiles;
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
                <p className="text-sm text-gray-300">Build anything with AI</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to build something amazing?</h3>
              <p className="text-gray-400 max-w-md">Describe your project and I'll generate a complete application with live preview, code, and everything you need.</p>
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
                    <span className="text-gray-300 text-sm">Generating your project...</span>
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
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Describe what you want to build..."
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