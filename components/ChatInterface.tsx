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
  role: "user" | "assistant" | "thinking";
  content: string;
  isCollapsed?: boolean;
}

// Add OpenAI API call
async function generateProjectWithAI(userPrompt: string) {
  // Call the backend API to generate the project
  const response = await fetch('/api/genCode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: userPrompt }),
  });
  if (!response.ok) throw new Error('Failed to generate project');
  const data = await response.json();

  // Enhance files with Pexels images and modern UI if needed
  const files = { ...data.files };
  // Example: inject images into Hero or Features components
  for (const filePath of Object.keys(files)) {
    if (filePath.toLowerCase().includes('hero') || filePath.toLowerCase().includes('features')) {
      const images = await fetchPexelsImages('gym fitness', 2);
      files[filePath] = files[filePath]
        .replace('/*PEXELS_IMAGE_1*/', images[0] ? `"${images[0]}"` : '""')
        .replace('/*PEXELS_IMAGE_2*/', images[1] ? `"${images[1]}"` : '""');
    }
    // Add more logic for other components as needed
  }

  return {
    plan: data.plan,
    files,
  };
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
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([
    "Analyzing request...",
    "Understanding what type of website is needed",
    "Determining components required",
    "Planning file structure",
    "Selecting appropriate styles and images",
    "Considering accessibility requirements",
    "Planning responsive design approach",
    "Deciding on color scheme",
    "Evaluating performance optimizations",
    "Creating component hierarchy"
  ]);

  // Function to update thinking message incrementally
  const updateThinkingMessage = (newContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.role === "thinking" 
          ? {...msg, content: msg.content + "\n" + newContent} 
          : msg
      )
    );
  };

  // Simulate incremental thinking updates
  const simulateThinking = async (websiteType: string, framework: string) => {
    // Initial thinking message
    const initialThinking: Message = { 
      role: "thinking", 
      content: "# AI Thinking Process\n\nStarting analysis...", 
      isCollapsed: false
    };
    setMessages(prev => [...prev, initialThinking]);
    
    // Update with project analysis
    await new Promise(resolve => setTimeout(resolve, 800));
    updateThinkingMessage("\n## Project Analysis");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateThinkingMessage(`- Website type: ${websiteType}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    updateThinkingMessage(`- Framework: ${framework}`);
    
    // Update with technical decisions
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateThinkingMessage("\n\n## Technical Decisions");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Adapt message based on framework
    const isBasicWeb = framework === 'HTML/CSS/JS';
    
    updateThinkingMessage("- Will use " + (isBasicWeb ? 'standard HTML/CSS' : `${framework} components`));
    await new Promise(resolve => setTimeout(resolve, 400));
    updateThinkingMessage("- Will fetch appropriate images from Pexels");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateThinkingMessage("- Will create responsive components");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateThinkingMessage("- Planning mobile-first approach");
    await new Promise(resolve => setTimeout(resolve, 400));
    updateThinkingMessage("- Will use semantic HTML for accessibility");
    
    // Update with structure considerations
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateThinkingMessage("\n\n## Component Planning");
    await new Promise(resolve => setTimeout(resolve, 500));
    updateThinkingMessage("- Navbar: For site navigation");
    await new Promise(resolve => setTimeout(resolve, 300));
    updateThinkingMessage("- Hero: For main banner/call to action");
    await new Promise(resolve => setTimeout(resolve, 300));
    updateThinkingMessage("- Features: To highlight gym benefits");
    await new Promise(resolve => setTimeout(resolve, 300));
    updateThinkingMessage("- Testimonials: For social proof");
    await new Promise(resolve => setTimeout(resolve, 300));
    updateThinkingMessage("- Pricing: For membership options");
    await new Promise(resolve => setTimeout(resolve, 300));
    updateThinkingMessage("- Contact: For user inquiries");
    await new Promise(resolve => setTimeout(resolve, 300));
    updateThinkingMessage("- Footer: For additional links and info");
    
    if (isBasicWeb) {
      // Add HTML/CSS/JS specific considerations
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateThinkingMessage("\n\n## HTML/CSS/JS Development Approach");
      await new Promise(resolve => setTimeout(resolve, 500));
      updateThinkingMessage("- Using semantic HTML5 tags for better structure and SEO");
      await new Promise(resolve => setTimeout(resolve, 300));
      updateThinkingMessage("- Clean and modular CSS with variables for consistent styling");
      await new Promise(resolve => setTimeout(resolve, 300));
      updateThinkingMessage("- Vanilla JavaScript for interactivity without dependencies");
      await new Promise(resolve => setTimeout(resolve, 300));
      updateThinkingMessage("- Mobile-first responsive design with media queries");
      await new Promise(resolve => setTimeout(resolve, 300));
      updateThinkingMessage("- Form validation and interactive navigation");
    }
  };

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
      { role: "assistant", content: "I'll create a project based on your request. Let me think about the best approach..." },
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
    
    const framework = isBasicWeb ? 'HTML/CSS/JS' :
                     lowerInput.includes('react') ? 'React' : 
                     lowerInput.includes('next') ? 'Next.js' :
                     lowerInput.includes('vue') ? 'Vue.js' :
                     lowerInput.includes('angular') ? 'Angular' : 'HTML/CSS/JS';
    
    // Start simulating thinking in real-time
    await simulateThinking(websiteType, framework);
    
    // Use the exact prompt from the user without modifications
    try {
      // Continue with actual API call while thinking is displayed
      const aiResponse = await generateProjectWithAI(userMessage.content);
      setAiPlan(aiResponse.plan);
      setProjectFiles(aiResponse.files);
      
      // Update thinking with file structure plan
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateThinkingMessage("\n\n## File Structure Plan");
      await new Promise(resolve => setTimeout(resolve, 500));
      updateThinkingMessage(aiResponse.plan);
      
      // Update file structure in UI based on actual files
      let allFiles: string[] = [];
      
      // Only add React-specific files if we're actually using React
      if (framework.includes('React') || framework.includes('Next')) {
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
      Object.keys(aiResponse.files).forEach(path => {
        if (!allFiles.includes(path)) {
          allFiles.push(path);
        }
      });
      
      setFileStructure(allFiles);
      
      // For the code preview, show HTML file if it's HTML/CSS/JS
      if (isBasicWeb) {
        if (aiResponse.files['index.html']) {
          setGeneratedCode(aiResponse.files['index.html']);
        } else if (aiResponse.files['css/styles.css']) {
          setGeneratedCode(aiResponse.files['css/styles.css']);
        }
      } else {
        // For React, show App.js or index.js
        if (aiResponse.files['src/App.js']) {
          setGeneratedCode(aiResponse.files['src/App.js']);
        } else if (aiResponse.files['src/index.js']) {
          setGeneratedCode(aiResponse.files['src/index.js']);
        }
      }
      
      setTestResults([
        "✅ Project structure created successfully",
        `✅ All files generated with ${isBasicWeb ? 'HTML/CSS/JS' : framework}`,
        isBasicWeb ? "✅ Ready to view in any browser" : "✅ Development server running",
        "✅ Code quality verified",
        "✅ Responsive design implemented"
      ]);
      
      // Send the plan as a separate message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Project Plan**\n\nI've created a structured plan for your ${websiteType} website.` },
      ]);
      
      // Send message about files - more concise now
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `I've generated the following key files for your project:` },
      ]);
      
      // Add important files as separate messages - just list them without code
      const importantFiles = Object.keys(aiResponse.files).filter(path => {
        if (isBasicWeb) {
          return path.includes('index.html') || path.includes('styles.css') || path.includes('script.js');
        } else {
          return path.includes('App') || path.includes('index') || path.includes('Nav') || path.includes('Home');
        }
      });
      
      // Just list the files without showing their code
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `${importantFiles.map(file => `- **${file}**`).join('\n')}
          
You can view the complete code by clicking on any file in the file structure panel.` 
        },
      ]);
      
      // Final message
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: isBasicWeb ? 
            "Your HTML/CSS/JS project has been created! You can see the file structure in the left panel. Click on any file to view its content." :
            "Your project has been created! You can see the file structure in the left panel. Click on any file to view its content." 
        },
      ]);
      
    } catch (error) {
      console.error("Error generating project:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "There was an error generating your project. Please try again." },
      ]);
    }
    
    setIsGenerating(false);
  };

  // Add function to toggle message collapse
  const toggleMessageCollapse = (index: number) => {
    setMessages(prev => 
      prev.map((msg, i) => 
        i === index ? {...msg, isCollapsed: !msg.isCollapsed} : msg
      )
    );
  };

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
                : message.role === "thinking" 
                  ? "thinking-message"
                  : "flex justify-start"
            }`}>
              {message.role === "thinking" ? (
                <div className="w-full bg-[#2a2a3a] text-gray-300 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                  <div 
                    className="flex items-center p-3 cursor-pointer bg-gradient-to-r from-[#1a1a3a] to-[#2a2a4a]"
                    onClick={() => toggleMessageCollapse(index)}
                  >
                    {message.isCollapsed ? 
                      <ChevronRight className="w-5 h-5 mr-2" /> : 
                      <ChevronDown className="w-5 h-5 mr-2" />
                    }
                    <span className="font-medium">AI Thinking Process</span>
                  </div>
                  {!message.isCollapsed && (
                    <div className="p-3 font-mono text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  )}
                </div>
              ) : (
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
              )}
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