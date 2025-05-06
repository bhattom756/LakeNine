"use client";

import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodePreviewProps {
  code: string;
  language?: string;
}

export default function CodePreview({ code, language = 'javascript' }: CodePreviewProps) {
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

  const codeLanguage = getLanguageFromCode(code);

  return (
    <div className="h-full overflow-auto bg-[#282c34] text-gray-300">
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
        {code || '// No code to display'}
      </SyntaxHighlighter>
    </div>
  );
} 