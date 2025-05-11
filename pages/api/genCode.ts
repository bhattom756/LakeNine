// pages/api/genCode.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generateProjectWithAI } from "@/lib/api";
import { processImagesInCode } from "@/lib/pexels";
import { retrieveComponents, getWebsiteComponents } from "@/lib/weaviate";
import OpenAI from 'openai';
import { fetchPexelsImages } from "@/lib/pexels";

type ErrorResponse = {
  error: string;
};

// Define component type
interface WebComponent {
  type: string;
  description: string;
  code: string;
  framework: string;
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    let contextString = "";
    let ragAvailable = false;
    
    // Step 1: Try to retrieve relevant components from Weaviate based on the prompt
    try {
      if (process.env.WEAVIATE_HOST && process.env.WEAVIATE_API_KEY) {
        const ragComponents = await getWebsiteComponents(prompt);
        ragAvailable = true;
        
        // Step 2: Format retrieved components to use as context for OpenAI
        contextString = "Use these component examples as inspiration for generating high-quality code:\n\n";
        
        // Add hero component examples
        if (ragComponents.hero && ragComponents.hero.length > 0) {
          contextString += "## Hero Component Examples:\n";
          ragComponents.hero.forEach((comp: WebComponent, i: number) => {
            contextString += `### Hero Example ${i+1}:\n\`\`\`\n${comp.code}\n\`\`\`\n\n`;
          });
        }
        
        // Add navbar component examples
        if (ragComponents.navbar && ragComponents.navbar.length > 0) {
          contextString += "## Navbar Component Examples:\n";
          ragComponents.navbar.forEach((comp: WebComponent, i: number) => {
            contextString += `### Navbar Example ${i+1}:\n\`\`\`\n${comp.code}\n\`\`\`\n\n`;
          });
        }
        
        // Add features component examples
        if (ragComponents.features && ragComponents.features.length > 0) {
          contextString += "## Features Component Examples:\n";
          ragComponents.features.forEach((comp: WebComponent, i: number) => {
            contextString += `### Features Example ${i+1}:\n\`\`\`\n${comp.code}\n\`\`\`\n\n`;
          });
        }
        
        // Add footer component examples
        if (ragComponents.footer && ragComponents.footer.length > 0) {
          contextString += "## Footer Component Examples:\n";
          ragComponents.footer.forEach((comp: WebComponent, i: number) => {
            contextString += `### Footer Example ${i+1}:\n\`\`\`\n${comp.code}\n\`\`\`\n\n`;
          });
        }
      } else {
        console.log("Weaviate environment variables not set, skipping RAG retrieval");
      }
    } catch (error) {
      console.error("Error retrieving components from Weaviate:", error);
      // Continue without RAG components
    }
    
    // If RAG is not available, use the fallback direct generation approach
    if (!ragAvailable) {
      console.log("Falling back to direct OpenAI generation without RAG");
      const result = await generateProjectWithAI(prompt);
      return res.status(200).json({
        plan: result.plan,
        files: result.files
      });
    }
    
    // Step 3: Generate website code with OpenAI using RAG context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a world-class frontend engineer and designer. Generate complete, production-quality websites from a user's prompt, using only the highest standards of modern web design (Apple/Google-level).

Requirements:
- Use advanced, modern HTML5 and Tailwind CSS (with utility-first design, responsive layouts, and custom themes) for all projects, regardless of the framework.
- All content must be realistic, domain-appropriate, and high-converting. No Lorem Ipsum.
- All images must use the /*IMAGE:category*/ placeholder format.
- The design must be visually stunning, responsive, and interactive.
- Use only a single, explicit JSON block for the file structure and contents.
- Use the provided component examples for inspiration to maintain high quality and consistency.

Output format (MANDATORY):
# Project Plan
<short, high-level plan>
\`\`\`json
{
  "index.html": "<full HTML here>",
  "css/styles.css": "<full CSS here>",
  "js/script.js": "<full JS here>"
}
\`\`\`

Do not include any other code blocks or explanations. Only output the plan and the JSON block.` 
        },
        { 
          role: 'user', 
          content: `${contextString}\n\nNow, based on these examples, generate a complete website for the following request: ${prompt}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 8000
    });

    const content = completion.choices[0]?.message.content || '';
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    // --- Robust JSON Extraction ---
    const planMatch = content.match(/# Project Plan[\s\S]*?(?=```|$)/i);
    const filesMatch = content.match(/```json[\s\S]*?({[\s\S]*})[\s\S]*?```/i);

    const plan = planMatch ? planMatch[0].trim() : 'No plan found in AI response.';
    let files: Record<string, string> = {};

    if (filesMatch && filesMatch[1]) {
      try {
        files = JSON.parse(filesMatch[1]);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Failed to parse JSON from AI response: ' + (e instanceof Error ? e.message : String(e)));
      }
    } else {
      // Log the full AI response for debugging
      console.error('AI response did not contain valid JSON:', content);
      throw new Error('No valid JSON found in AI response. This could be due to incorrect formatting in the AI output.');
    }

    if (Object.keys(files).length === 0) {
      throw new Error('AI generated an empty files object. Please try a different prompt or try again.');
    }
    
    // Process images in all files
    const processedFiles: Record<string, string> = {};
    
    // Process each file to replace image placeholders
    for (const [path, content] of Object.entries(files)) {
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
    
    // Ensure ALL image placeholders are replaced using Pexels
    for (const [path, content] of Object.entries(processedFiles)) {
      let updatedContent = content;
      
      // Handle <img src="/*IMAGE:category*/">
      const imgTagRegex = /<img\s+src=["']\/\*IMAGE:([a-zA-Z0-9_-]+)\*\/["'][^>]*>/g;
      let match;
      
      while ((match = imgTagRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const category = match[1];
        try {
          const images = await fetchPexelsImages(category, 1);
          const imageUrl = images[0] || `https://via.placeholder.com/800x600?text=${category}`;
          const newImgTag = fullMatch.replace(/src=["']\/\*IMAGE:[a-zA-Z0-9_-]+\*\/["']/, `src="${imageUrl}" alt="${category}"`);
          updatedContent = updatedContent.replace(fullMatch, newImgTag);
        } catch (error) {
          console.error(`Error processing image for category ${category}:`, error);
        }
      }
      
      // Handle direct /*IMAGE:category*/ placeholders in CSS/HTML
      const directPlaceholderRegex = /\/\*IMAGE:([a-zA-Z0-9_-]+)\*\//g;
      while ((match = directPlaceholderRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const category = match[1];
        try {
          const images = await fetchPexelsImages(category, 1);
          const imageUrl = images[0] || `https://via.placeholder.com/800x600?text=${category}`;
          updatedContent = updatedContent.replace(fullMatch, imageUrl);
        } catch (error) {
          console.error(`Error processing image for category ${category}:`, error);
        }
      }
      
      processedFiles[path] = updatedContent;
    }
    
    // Return the processed result
    res.status(200).json({
      plan: plan,
      files: processedFiles
    });
  } catch (error) {
    console.error("Error generating code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Failed to generate code: ${errorMessage}` });
  }
}
