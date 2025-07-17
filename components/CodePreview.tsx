"use client";

import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getFileIcon } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CodePreviewProps {
  code: string;
  language?: string;
  fileName?: string;
}

export default function CodePreview({ code, language = 'javascript', fileName = '' }: CodePreviewProps) {
  // Fix for double-escaped newlines
  const formattedCode = typeof code === 'string' ? code.replace(/\\n/g, '\n') : code;
  const [copied, setCopied] = useState(false);

  // Determine language from file extension
  const codeLanguage = language || getLanguageFromFileName(fileName);

  // Get appropriate file icon
  const fileIcon = getFileIcon(fileName);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-[#1a1a1a] text-white rounded-lg border border-gray-700 shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header with file info and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#23272e] border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center gap-2 font-mono text-base">
          <span className="text-xl">{fileIcon}</span>
          <span className="text-gray-200">{fileName}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm transition-colors relative"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          <Copy size={16} className="mr-1" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content with improved formatting */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={codeLanguage}
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#6b7280',
            paddingRight: '16px',
            fontSize: '12px',
          }}
          wrapLines={false}
          wrapLongLines={false}
        >
          {formattedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'jsx': return 'javascript';
    case 'ts': return 'typescript';
    case 'tsx': return 'typescript';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'json': return 'json';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp': return 'cpp';
    case 'c': return 'c';
    default: return 'javascript';
  }
} 