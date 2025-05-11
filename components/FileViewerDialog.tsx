import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface FileViewerDialogProps {
  fileName: string;
  fileContent: string;
  open: boolean;
  onClose: () => void;
}

const FileViewerDialog: React.FC<FileViewerDialogProps> = ({ fileName, fileContent, open, onClose }) => {
  // Function to detect language from file extension - memoize result
  const language = useMemo(() => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'javascript';
    }
  }, [fileName]);

  // Determine file icon based on extension - memoize result
  const fileIcon = useMemo(() => {
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return '🟡';
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return '📘';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.html')) return '🌐';
    if (fileName.endsWith('.json')) return '📋';
    if (fileName.endsWith('.md')) return '📝';
    return '📄';
  }, [fileName]);

  // Memoize the handle close callback
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize dialog content
  const customStyle = useMemo(() => ({
    margin: 0,
    padding: '1rem',
    background: '#282c34',
    fontSize: '0.9rem',
    borderRadius: 0,
  }), []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-[#282c34] p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-8 border border-gray-700">
        <div className="w-full h-full flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#21252b]">
            <DialogTitle className="text-white text-base font-mono flex items-center">
              <span className="mr-2">{fileIcon}</span>
              {fileName}
            </DialogTitle>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-700"
            >
              <X size={18} />
            </button>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] bg-[#282c34] text-gray-200">
            <SyntaxHighlighter
              language={language}
              style={atomOneDark}
              customStyle={customStyle}
              showLineNumbers
            >
              {fileContent || '// No content available'}
            </SyntaxHighlighter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(FileViewerDialog); 