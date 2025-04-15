"use client";  // This marks the component as a client-side component.

interface LivePreviewProps {
  generatedCode: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ generatedCode }) => {
  return (
    <div className="h-full bg-white p-4">
      <h2 className="text-lg font-semibold">Live Preview</h2>
      <iframe 
        className="w-full h-full mt-4 border"
        srcDoc={generatedCode}
        title="Live Preview"
      />
    </div>
  );
};

export default LivePreview;

