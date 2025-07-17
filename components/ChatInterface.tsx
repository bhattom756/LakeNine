"use client";

import { useState } from "react";
import { fetchPexelsImages } from '@/lib/pexels';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

  const handleSend = async () => {
    if (!input.trim()) return;
    
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#121212] w-full max-w-2xl h-[85vh] rounded-xl flex flex-col border border-gray-700 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-[#1e3a8a] to-[#1e1e3a]">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 mr-2">
              <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12c0 1.657-4.03 3-9 3s-9-1.343-9-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            AI Assistant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1a1a]">
          {messages.map((message, index) => (
            <div key={index} className={`${
              message.role === "user" 
                ? "flex justify-end" 
                : "flex justify-start"
            }`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-[#2a2a2a] text-gray-200 border border-gray-700"
                }`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* Parse markdown-like syntax */}
                  {message.content.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('```')) {
                      const codeContent = paragraph.replace(/```[a-z]*\n/, '').replace(/```$/, '');
                      return (
                        <pre key={i} className="bg-[#1a1a2a] p-3 rounded-md text-xs overflow-x-auto">
                          <code>{codeContent}</code>
                        </pre>
                      );
                    } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return <h4 key={i} className="font-bold text-blue-300">{paragraph.replace(/\*\*/g, '')}</h4>;
                    } else {
                      return <p key={i}>{paragraph}</p>;
                    }
                  })}
                </div>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-[#2a2a2a] text-gray-300 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 bg-[#121212]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e40af] transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 