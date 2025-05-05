"use client";

import { useState, useRef, useEffect } from 'react';

interface ResizableLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  initialLeftWidth?: number;
}

export function ResizableLayout({ 
  leftContent, 
  rightContent, 
  initialLeftWidth = 50 
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 20% and 80% to prevent windows from becoming too small
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="flex w-full h-full relative"
    >
      {/* Left Content */}
      <div 
        className="h-full overflow-auto"
        style={{ width: `${leftWidth}%` }}
      >
        {leftContent}
      </div>

      {/* Resize Handle */}
      <div
        className={`
          absolute h-full w-1 cursor-col-resize
          ${isDragging ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-300'}
          transition-colors duration-200
        `}
        style={{ left: `${leftWidth}%` }}
        onMouseDown={handleMouseDown}
      />

      {/* Right Content */}
      <div 
        className="h-full overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightContent}
      </div>
    </div>
  );
} 