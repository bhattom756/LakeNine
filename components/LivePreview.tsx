'use client';

import { useEffect, useRef } from 'react';

interface LivePreviewProps {
  generatedCode: string;
}

export default function LivePreview({ generatedCode }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && generatedCode) {
      const document = iframeRef.current.contentDocument;
      if (document) {
        document.open();
        document.write(generatedCode);
        document.close();
      }
    }
  }, [generatedCode]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      className="w-full h-full border-none bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
