// pages/api/genCode.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generateProjectWithAI } from "@/lib/api";
import { processImagesInCode } from "@/lib/pexels";

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A valid prompt is required' });
  }
  
  try {
    // Generate website code
    const result = await generateProjectWithAI(prompt);
    
    // Process images in all files
    const processedFiles: Record<string, string> = {};
    
    // Process each file to replace image placeholders
    for (const [path, content] of Object.entries(result.files)) {
      if (typeof content === 'string') {
        // Only process HTML, CSS, and JS files for image replacements
        if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js') || 
            path.endsWith('.jsx') || path.endsWith('.tsx')) {
          processedFiles[path] = await processImagesInCode(content);
        } else {
          processedFiles[path] = content;
        }
      }
    }
    
    // Return the processed result
    res.status(200).json({
      plan: result.plan,
      files: processedFiles
    });
  } catch (error) {
    console.error("Error generating code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Failed to generate code: ${errorMessage}` });
  }
}
