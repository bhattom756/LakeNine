'use client';

interface FileTreeProps {
  fileStructure: string[];
}

export default function FileTree({ fileStructure }: FileTreeProps) {
  return (
    <ul className="text-white">
      {fileStructure.map((filePath, index) => (
        <li key={index} className="py-1">
          {filePath}
        </li>
      ))}
    </ul>
  );
}
