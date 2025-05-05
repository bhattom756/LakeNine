import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface FileViewerDialogProps {
  fileName: string;
  fileContent: string;
  open: boolean;
  onClose: () => void;
}

const FileViewerDialog: React.FC<FileViewerDialogProps> = ({ fileName, fileContent, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#18181b] p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#232336]">
          <DialogTitle className="text-white text-base font-mono">{fileName}</DialogTitle>
          <DialogClose asChild>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="p-6 overflow-auto max-h-[70vh] bg-[#18181b]">
          <pre className="rounded-lg text-sm p-4 bg-[#18181b] text-white whitespace-pre-wrap">
            {fileContent}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerDialog; 