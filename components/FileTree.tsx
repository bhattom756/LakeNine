"use client";  // This marks the component as a client-side component.

interface FileTreeProps {
  fileStructure: string[];
}

const FileTree: React.FC<FileTreeProps> = ({ fileStructure }) => {
  return (
    <div className="overflow-auto h-full p-4 bg-gray-100">
      <h2 className="text-lg font-semibold">File Structure</h2>
      <ul className="mt-2">
        {fileStructure.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileTree;
