"use client";

import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getFileIcon } from '@/lib/utils';
import { Copy } from 'lucide-react';

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
  const getLanguageFromCode = (code: string): string => {
    if (!code) return 'text';
    if (code.includes('<html') || code.includes('<!DOCTYPE html')) {
      return 'html';
    } else if (code.includes('body {') || code.includes('@media')) {
      return 'css';
    } else if (code.includes('import React') || code.includes('function(') || code.includes('() =>')) {
      return 'javascript';
    }
    return language;
  };

  const codeLanguage = getLanguageFromCode(formattedCode);
  const fileIcon = getFileIcon(fileName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="h-full overflow-auto bg-[#282c34] text-gray-300 relative">
      {/* File icon and name */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#23272e] border-b border-gray-700">
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
      <SyntaxHighlighter
        language={codeLanguage}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          height: '100%',
          borderRadius: 0,
          background: '#282c34',
          fontSize: '0.9rem',
        }}
        showLineNumbers
      >
        {formattedCode || '// No code to display'}
      </SyntaxHighlighter>
    </div>
  );
} 