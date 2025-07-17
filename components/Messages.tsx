import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});

  const toggleMessageExpansion = (index: number) => {
    setExpandedMessages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => {
        const isExpanded = expandedMessages[index] === undefined 
          ? !message.isCollapsed 
          : expandedMessages[index];

        if (message.role === "user") {
          return (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-medium text-blue-700 mb-1">You</div>
              <div className="text-gray-800">{message.content}</div>
            </div>
          );
        }

        return (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="font-medium text-gray-700 mb-1">AI</div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
} 