import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Copy } from 'lucide-react';

interface FileViewerDialogProps {
  fileName: string;
  fileContent: string;
  open: boolean;
  onClose: () => void;
}

const FileViewerDialog: React.FC<FileViewerDialogProps> = ({ fileName, fileContent, open, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  // Helper to determine file type for formatting
  const getFileTypeForFormatting = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'text';
    
    if (ext === 'html' || ext === 'htm' || ext === 'svg') return 'html';
    if (ext === 'css' || ext === 'scss' || ext === 'less') return 'css';
    if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') return 'js';
    if (ext === 'json') return 'json';
    if (ext === 'md' || ext === 'markdown') return 'md';
    
    return 'text';
  };

  // Format code for better readability
  const formattedContent = useMemo(() => {
    try {
      const fileType = getFileTypeForFormatting(fileName);
      let result = '';
      let indentLevel = 0;
      const indentChar = '  ';
      
      // Split by newlines and process each line
      const lines = fileContent.split('\n');
      
      // Common formatting patterns
      const increaseIndentPatterns = [
        /[{(\[]$/,                   // Lines ending with {, (, [
        /^(if|for|while|function)/,  // Control structures
        /=>\s*{$/,                   // Arrow function with block
      ];
      
      const decreaseIndentPatterns = [
        /^[})\]]/,                   // Lines starting with }, ), ]
        /^(else|catch|finally)/,     // Continuation keywords
      ];
      
      // HTML specific patterns
      const htmlIncreaseIndent = /^<(?!\/)(?!area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([a-zA-Z0-9]+)(?!.*\/>).*>$/;
      const htmlDecreaseIndent = /^<\/([a-zA-Z0-9]+)>$/;
      
      // CSS specific patterns
      const cssIncreaseIndent = /{\s*$/;
      const cssDecreaseIndent = /^\s*}/;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) {
          result += '\n';
          continue;
        }
        
        // Check for decrease indent first (for current line)
        if (fileType === 'html' && htmlDecreaseIndent.test(line)) {
          indentLevel = Math.max(0, indentLevel - 1);
        } else if (fileType === 'css' && cssDecreaseIndent.test(line)) {
          indentLevel = Math.max(0, indentLevel - 1);
        } else if (decreaseIndentPatterns.some(pattern => pattern.test(line))) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        // Add the line with proper indentation
        result += indentChar.repeat(indentLevel) + line + '\n';
        
        // Check for increase indent (for next line)
        if (fileType === 'html' && htmlIncreaseIndent.test(line)) {
          indentLevel++;
        } else if (fileType === 'css' && cssIncreaseIndent.test(line)) {
          indentLevel++;
        } else if (increaseIndentPatterns.some(pattern => pattern.test(line))) {
          indentLevel++;
        }
      }
      
      return result;
    } catch (e) {
      console.error('Error formatting code:', e);
      return fileContent; // Return original if formatting fails
    }
  }, [fileContent, fileName]);
  
  // Get file type for syntax highlighting
  const getFileType = useMemo(() => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return 'text';
    
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  }, [fileName]);

  // Determine file icon based on extension
  const fileIcon = useMemo(() => {
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return '🟡';
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return '📘';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.html')) return '🌐';
    if (fileName.endsWith('.json')) return '📋';
    if (fileName.endsWith('.md')) return '📝';
    return '📄';
  }, [fileName]);

  // Handle close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fileContent]);

  // Get code lines for display
  const codeLines = useMemo(() => {
    return formattedContent.split('\n');
  }, [formattedContent]);

  // Apply syntax highlighting based on file type
  const syntaxHighlight = useCallback((line: string, fileType: string): string => {
    // Escape HTML entities
    let highlightedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    if (fileType === 'html') {
      // HTML highlighting
      return highlightedLine
        .replace(/=(['"]).*?\1/g, m => `<span style="color: #ffcc00">${m}</span>`)
        .replace(/&lt;(\/?)([\w-]+)/g, `&lt;$1<span style="color: #ff00ff">$2</span>`)
        .replace(/(class|id|src|href|rel|alt|title)=/g, `<span style="color: #00ff00">$1</span>=`);
    } else if (fileType === 'javascript' || fileType === 'typescript') {
      // JS/TS highlighting
      return highlightedLine
        .replace(/(const|let|var|function|return|if|else|for|while|import|export|from|class|extends)/g, 
          `<span style="color: #ff3377">$1</span>`) // Keywords
        .replace(/('|"|`)(.*?)(\1)/g, 
          `<span style="color: #00ff00">$1$2$3</span>`) // Strings
        .replace(/\b(\d+)\b/g, 
          `<span style="color: #00ffff">$1</span>`) // Numbers
        .replace(/\b(true|false|null|undefined)\b/g, 
          `<span style="color: #ff9900">$1</span>`) // Booleans and null
        .replace(/(\/\/.*$)/g, 
          `<span style="color: #7F85A3">$1</span>`) // Comments
        .replace(/\b([A-Za-z_$][A-Za-z0-9_$]*)\(/g, 
          `<span style="color: #ff6600">$1</span>(`); // Functions
    } else if (fileType === 'css') {
      // CSS highlighting
      return highlightedLine
        .replace(/([.#][A-Za-z0-9_-]+)/g, 
          `<span style="color: #d292ff">$1</span>`) // Selectors
        .replace(/\b([a-z-]+):/g, 
          `<span style="color: #00ff99">$1</span>:`) // Properties
        .replace(/(:\s*[^;]+;)/g, 
          `<span style="color: #ffcc00">$1</span>`) // Values
        .replace(/(@\w+)/g, 
          `<span style="color: #ff3377">$1</span>`); // At-rules
    } else if (fileType === 'json') {
      // JSON highlighting
      return highlightedLine
        .replace(/(".*?"):/g, 
          `<span style="color: #00ff99">$1</span>:`) // Keys
        .replace(/:\s*(".*?")/g, 
          `:<span style="color: #00ff00">$1</span>`) // String values
        .replace(/:\s*([0-9]+)/g, 
          `:<span style="color: #00ffff">$1</span>`) // Number values
        .replace(/:\s*(true|false|null)/g, 
          `:<span style="color: #ff9900">$1</span>`); // Boolean/null values
    } else if (fileType === 'markdown') {
      // Markdown highlighting
      return highlightedLine
        .replace(/^(#{1,6}\s.*$)/g, 
          `<span style="color: #ff00ff">$1</span>`) // Headers
        .replace(/(\*\*.*?\*\*)/g, 
          `<span style="color: #ffcc00">$1</span>`) // Bold
        .replace(/(\*.*?\*)/g, 
          `<span style="color: #00ff00">$1</span>`) // Italic
        .replace(/(`.*?`)/g, 
          `<span style="color: #00ffff">$1</span>`) // Inline code
        .replace(/(!?\[.*?\]\(.*?\))/g, 
          `<span style="color: #ff6600">$1</span>`); // Links and images
    }
    
    // Default: return plain text with basic escape
    return highlightedLine;
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl bg-black p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-8 border border-gray-800 h-[80vh]">
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-3 border-b border-gray-800 bg-black">
            <DialogTitle className="text-white text-base font-mono flex items-center">
              <span className="mr-2">{fileIcon}</span>
              {fileName}
            </DialogTitle>
            <div className="flex items-center gap-2 pr-2">
              <button 
                onClick={handleCopy} 
                className="text-gray-400 hover:text-white transition-colors rounded p-1.5 hover:bg-gray-700 flex items-center gap-1 text-xs"
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button 
                onClick={handleClose} 
                className="text-gray-400 hover:text-white transition-colors rounded-full p-1.5 hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>
          </DialogHeader>
          
          {/* Guaranteed scrollable content */}
          <div className="flex-1 overflow-auto" style={{ maxHeight: "calc(80vh - 60px)" }}>
            <table className="w-full border-collapse">
              <tbody>
                {codeLines.map((line, i) => (
                  <tr key={i} className="leading-tight">
                    <td className="text-right pr-4 pl-2 border-r border-gray-700 text-gray-500 sticky left-0 bg-black select-none w-[50px] font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 whitespace-pre font-mono text-sm">
                      <span dangerouslySetInnerHTML={{ 
                        __html: syntaxHighlight(line, getFileType)
                      }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(FileViewerDialog); 