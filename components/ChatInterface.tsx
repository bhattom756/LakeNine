"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, MessageSquare, Bot, User, History, Clock, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { writeMultipleFiles, getFileTree, getWebContainer } from "@/lib/webcontainer";
import { useUser } from "@/context/UserContext";
import { getBoltConfig } from "@/lib/config";
import PromptSettings from "./PromptSettings";
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  isOpen: boolean; // Not used anymore but kept for compatibility
  onClose: () => void; // Not used anymore but kept for compatibility
  setGeneratedCode: (code: string) => void;
  setFileStructure: (structure: string[]) => void;
  setTestResults: (results: string[]) => void;
  setProjectFiles: (files: Record<string, string>) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    ragEnhanced?: boolean;
    componentsUsed?: number;
    filesGenerated?: number;
    usedBoltPrompt?: boolean;
  };
}

interface ChatHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

interface LoadedChat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Enhanced AI generation function with WebContainer integration
async function generateProjectWithAI(
  userPrompt: string,
  setGeneratedCode: (code: string) => void,
  setFileStructure: (structure: string[]) => void,
  setTestResults: (results: string[]) => void,
  setProjectFiles: (files: Record<string, string>) => void,
  useBoltPrompt: boolean = true
): Promise<{ plan: string; files: Record<string, string>; metadata?: any }> {
  try {
    console.log('🚀 Starting enhanced AI generation for:', userPrompt);
    console.log('🤖 Using Bolt prompt:', useBoltPrompt);
    
    const response = await fetch('/api/genCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: userPrompt, 
        useBoltPrompt 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.files || typeof data.files !== 'object') {
      throw new Error('Invalid response: missing files object');
    }

    // Validate and log file structure
    console.log('📂 Files received from API:');
    Object.entries(data.files).forEach(([path, content]) => {
      console.log(`  - ${path}: ${typeof content} (${typeof content === 'string' ? content.length + ' chars' : 'object'})`);
    });

    console.log('✅ AI generation successful:', Object.keys(data.files).length, 'files generated');
    
    // Ensure all file contents are strings before writing
    const validatedFiles: Record<string, string> = {};
    for (const [path, content] of Object.entries(data.files)) {
      if (typeof content === 'string') {
        validatedFiles[path] = content;
      } else if (typeof content === 'object' && content !== null) {
        validatedFiles[path] = JSON.stringify(content, null, 2);
      } else {
        validatedFiles[path] = String(content || '');
      }
    }
    
    // Check if WebContainer is available before attempting operations
    const webContainer = getWebContainer();
    
    if (webContainer) {
      // WebContainer is ready - write files and update structure
      try {
        await writeMultipleFiles(validatedFiles);
        console.log('✅ Files written to WebContainer successfully');
        
        const updatedStructure = await getFileTree();
        setFileStructure(updatedStructure);
        console.log('✅ File structure updated from WebContainer');
      } catch (webContainerError) {
        console.warn('⚠️ WebContainer operation failed:', webContainerError);
        // Fallback to using the file keys as structure
        const fallbackStructure = Object.keys(validatedFiles).map(path => `/${path}`);
        setFileStructure(fallbackStructure);
        console.log('✅ Using fallback file structure due to WebContainer error');
      }
    } else {
      // WebContainer not ready - use fallback approach
      console.log('💡 WebContainer not ready, using fallback file structure');
      const fallbackStructure = Object.keys(validatedFiles).map(path => `/${path}`);
      setFileStructure(fallbackStructure);
      console.log('✅ Fallback file structure set:', fallbackStructure.length, 'files');
    }
    
    // Set project files
    setProjectFiles(validatedFiles);
    
    // Set generated code (main entry point) - check multiple possible locations
    const possibleMainFiles = [
      'src/App.jsx',
      'App.jsx', 
      'src/main.jsx',
      'main.jsx',
      'src/index.jsx',
      'index.jsx'
    ];
    
    let mainFile = '';
    for (const fileName of possibleMainFiles) {
      if (validatedFiles[fileName]) {
        mainFile = validatedFiles[fileName];
        console.log(`📄 Using ${fileName} as main file`);
        break;
      }
    }
    
    // If no specific main file found, use first .jsx file
    if (!mainFile) {
      const jsxFile = Object.entries(validatedFiles).find(([path]) => path.endsWith('.jsx'));
      if (jsxFile) {
        mainFile = jsxFile[1];
        console.log(`📄 Using ${jsxFile[0]} as fallback main file`);
      }
    }
    
    setGeneratedCode(mainFile || '// No main file found');
    
    return {
      plan: data.plan || 'Project generated successfully!',
      files: validatedFiles,
      metadata: data.metadata
    };
    
  } catch (error) {
    console.error('❌ AI generation failed:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('WebContainer')) {
        console.error('🔧 WebContainer specific error - this should be handled gracefully now');
      } else if (error.message.includes('HTTP')) {
        console.error('🌐 Network/API error - check server connection');
      } else if (error.message.includes('JSON')) {
        console.error('📄 JSON parsing error - check API response format');
      }
    }
    
    throw error;
  }
}

// Chat API functions
const saveChatToHistory = async (
  userId: string,
  userEmail: string,
  userName: string | undefined,
  messages: Message[],
  chatId?: string
) => {
  try {
    console.log('💾 Saving chat to MongoDB...', { userId, userEmail, messageCount: messages.length });
    
    const response = await fetch('/api/chat/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        userName,
        messages,
        chatId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save chat: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Chat saved successfully:', data.chatId);
    return data;
  } catch (error) {
    console.error('❌ Error saving chat:', error);
    throw error;
  }
};

const fetchChatHistory = async (userId: string, userEmail: string): Promise<ChatHistoryItem[]> => {
  try {
    console.log('📜 Fetching chat history...', { userId, userEmail });
    
    const response = await fetch(`/api/chat/history?userId=${userId}&userEmail=${encodeURIComponent(userEmail)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Chat history fetched:', data.chats.length, 'conversations');
    return data.chats || [];
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    return [];
  }
};

const loadChatConversation = async (chatId: string, userId: string): Promise<LoadedChat | null> => {
  try {
    console.log('📁 Loading chat conversation...', { chatId, userId });
    
    const response = await fetch(`/api/chat/load?chatId=${chatId}&userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load chat: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Chat conversation loaded:', data.chat.messages.length, 'messages');
    return data.chat;
  } catch (error) {
    console.error('❌ Error loading chat:', error);
    return null;
  }
};

const ChatInterface = ({
  setGeneratedCode,
  setFileStructure,
  setTestResults,
  setProjectFiles,
}: ChatInterfaceProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when user is available
  useEffect(() => {
    if (user && popoverOpen && !loadingHistory && chatHistory.length === 0) {
      loadUserChatHistory();
    }
  }, [user, popoverOpen]);

  // Load user's chat history
  const loadUserChatHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const history = await fetchChatHistory(user.uid, user.email || '');
      setChatHistory(history);
    } catch (error) {
      toast.error('Failed to load chat history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load a specific chat conversation
  const loadChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const loadingToast = toast.loading('Loading conversation...');
      
      const chat = await loadChatConversation(chatId, user.uid);
      if (chat) {
        setMessages(chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setCurrentChatId(chat.id);
        toast.success('Conversation loaded!', { id: loadingToast });
      } else {
        toast.error('Failed to load conversation', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Error loading conversation');
    }
  };

  // Start a new chat
  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(undefined);
    setInput("");
    toast.success('Started new conversation');
  };

  // Save current chat
  const saveCurrentChat = async () => {
    if (!user || messages.length === 0) return;

    try {
      await saveChatToHistory(
        user.uid,
        user.email || '',
        user.displayName || undefined,
        messages,
        currentChatId
      );
      
      // Refresh chat history
      await loadUserChatHistory();
      
      if (!currentChatId) {
        // This was a new chat, so we should get the chatId from the response
        // For now, we'll just refresh the history
        toast.success('Chat saved successfully!');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      // Don't show error toast as this is automatic
    }
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    
    const userMessage: Message = { 
      role: "user", 
      content: input.trim(),
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);
    
    try {
      // Get current configuration
      const config = getBoltConfig();
      
      // Add thinking message with dots animation
      const thinkingMessage: Message = { 
        role: "assistant", 
        content: "I'm analyzing your request and generating the perfect solution for you...",
        timestamp: new Date()
      };
      setMessages([...newMessages, thinkingMessage]);
      
      // Generate project with AI using current configuration
      const result = await generateProjectWithAI(
        userMessage.content,
        setGeneratedCode,
        setFileStructure,
        setTestResults,
        setProjectFiles,
        config.useBoltPrompt
      );
      
      // Create a more conversational and detailed response
      const responseContent = createChatGPTLikeResponse(userMessage.content, result);
      
      // Replace thinking message with actual response
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        metadata: {
          ragEnhanced: result.metadata?.ragEnhanced || false,
          componentsUsed: result.metadata?.componentsUsed || 0,
          filesGenerated: Object.keys(result.files).length,
          usedBoltPrompt: config.useBoltPrompt
        }
      };
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Auto-save chat if user is logged in
      if (user) {
        try {
          console.log('💾 Auto-saving chat...', { 
            userId: user.uid, 
            messageCount: finalMessages.length 
          });
          
          const saveResult = await saveChatToHistory(
            user.uid,
            user.email || '',
            user.displayName || undefined,
            finalMessages,
            currentChatId
          );
          
          // Update current chat ID if this was a new chat
          if (!currentChatId && saveResult.chatId) {
            setCurrentChatId(saveResult.chatId);
          }
          
          console.log('✅ Chat auto-saved successfully');
        } catch (saveError) {
          console.error('❌ Auto-save failed:', saveError);
          // Don't show error to user for auto-save failures
        }
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      
      // Replace thinking message with error
      const errorMessage: Message = {
        role: "assistant",
        content: `I apologize, but I encountered an issue while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. 

Please try rephrasing your request or being more specific about what you'd like me to build. I'm here to help you create amazing websites and applications!`,
        timestamp: new Date()
      };
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create ChatGPT-like conversational response
  const createChatGPTLikeResponse = (userPrompt: string, result: any): string => {
    const websiteType = detectWebsiteType(userPrompt);
    const filesCount = Object.keys(result.files).length;
    const hasRAG = result.metadata?.ragEnhanced;
    
    let response = `Great! I've created a ${websiteType.toLowerCase()} for you. Here's what I've built:\n\n`;
    
    // Add personalized intro based on request
    if (userPrompt.toLowerCase().includes('modern')) {
      response += `✨ **Modern Design**: I've crafted a contemporary, sleek interface that will make your ${websiteType.toLowerCase()} stand out.\n\n`;
    }
    
    if (userPrompt.toLowerCase().includes('responsive')) {
      response += `📱 **Fully Responsive**: Your site will look perfect on all devices - desktop, tablet, and mobile.\n\n`;
    }
    
    // Technical details
    response += `🛠️ **Technical Implementation**:\n`;
    response += `• Generated ${filesCount} optimized files\n`;
    response += `• Built with React + Vite for lightning-fast performance\n`;
    response += `• Styled with Tailwind CSS for modern aesthetics\n`;
    
    if (hasRAG) {
      response += `• Enhanced with ${result.metadata?.componentsUsed || 0} pre-optimized components\n`;
    }
    
    response += `\n🎯 **Key Features Included**:\n`;
    
    // Analyze what was built based on files
    const fileNames = Object.keys(result.files);
    if (fileNames.some(f => f.includes('Hero'))) {
      response += `• Compelling hero section to capture attention\n`;
    }
    if (fileNames.some(f => f.includes('Header') || f.includes('Navbar'))) {
      response += `• Professional navigation header\n`;
    }
    if (fileNames.some(f => f.includes('Features'))) {
      response += `• Features showcase to highlight key benefits\n`;
    }
    if (fileNames.some(f => f.includes('Contact'))) {
      response += `• Contact section for easy communication\n`;
    }
    if (fileNames.some(f => f.includes('Footer'))) {
      response += `• Complete footer with links and information\n`;
    }
    
    response += `\n🚀 **What's Next?**\n`;
    response += `Your website is now running in the live preview! You can:\n`;
    response += `• See the live preview on the right\n`;
    response += `• Edit any file in the file explorer\n`;
    response += `• Ask me to modify or add new features\n`;
    response += `• Download the complete project when ready\n\n`;
    
    response += `💡 **Want to customize further?** Just let me know what changes you'd like - I can modify colors, add new sections, adjust layouts, or implement additional functionality!`;
    
    return response;
  };

  // Helper function to detect website type
  const detectWebsiteType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('college') || lowerQuery.includes('university') || lowerQuery.includes('education')) {
      return 'Educational Website';
    } else if (lowerQuery.includes('gym') || lowerQuery.includes('fitness') || lowerQuery.includes('workout')) {
      return 'Fitness Website';
    } else if (lowerQuery.includes('restaurant') || lowerQuery.includes('food') || lowerQuery.includes('cafe')) {
      return 'Restaurant Website';
    } else if (lowerQuery.includes('business') || lowerQuery.includes('corporate') || lowerQuery.includes('company')) {
      return 'Business Website';
    } else if (lowerQuery.includes('portfolio') || lowerQuery.includes('personal')) {
      return 'Portfolio Website';
    } else if (lowerQuery.includes('ecommerce') || lowerQuery.includes('shop') || lowerQuery.includes('store')) {
      return 'E-commerce Website';
    }
    
    return 'Professional Website';
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center group bg-gradient-to-br from-blue-500/10 to-purple-600/10 hover:from-blue-500/20 hover:to-purple-600/20 hover:scale-110 shadow-lg hover:shadow-blue-500/25 z-50"
          aria-label="Open AI Chat"
        >
          <MessageSquare className="h-6 w-6 text-blue-400 group-hover:text-blue-300" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 h-[600px] p-0 bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl"
        side="left"
        align="end"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <PromptSettings onConfigChange={() => {
                // Force re-render when config changes
                setMessages([...messages]);
              }} />
              {user && (
                <>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Chat History"
                  >
                    <History className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={startNewChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="New Chat"
                  >
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chat History Section */}
          {showHistory && user && (
            <div className="border-b border-white/10 max-h-48 overflow-y-auto">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Recent Chats</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                
                {loadingHistory ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-xs text-gray-400 mt-2">Loading history...</p>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No chat history yet</p>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          loadChat(chat.id);
                          setShowHistory(false);
                        }}
                        className="w-full text-left p-2 hover:bg-white/10 rounded-lg transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <Clock className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-white truncate">{chat.title}</p>
                            <p className="text-xs text-gray-400 truncate">{chat.preview}</p>
                            <p className="text-xs text-gray-500">{formatTimestamp(chat.updatedAt)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Welcome to AI Assistant!</p>
                <p className="text-gray-400 text-sm">
                  I can help you build websites, create components, and generate code. Just describe what you want to build!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" 
                        ? "bg-blue-600" 
                        : "bg-purple-600"
                    }`}>
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 text-white"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.metadata && (
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                          {message.metadata.ragEnhanced && <Zap className="h-3 w-3" />}
                          {message.metadata.filesGenerated && (
                            <span>{message.metadata.filesGenerated} files</span>
                          )}
                          {message.metadata.usedBoltPrompt !== undefined && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              message.metadata.usedBoltPrompt 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {message.metadata.usedBoltPrompt ? 'Bolt' : 'Original'}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-50 mt-1">{formatTimestamp(message.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Describe what you want to build..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-400"
                disabled={isGenerating}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg p-2 transition-colors flex items-center justify-center"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
            {!user && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Sign in to save your chat history
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChatInterface; 