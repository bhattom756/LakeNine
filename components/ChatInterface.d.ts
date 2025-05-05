import { ReactNode } from 'react';

export interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  setGeneratedCode: (code: string) => void;
  setFileStructure: (structure: string[]) => void;
  setTestResults: (results: string[]) => void;
}

declare const ChatInterface: React.FC<ChatInterfaceProps>;

export default ChatInterface; 