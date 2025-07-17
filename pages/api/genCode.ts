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

// Safely escape code for markdown code blocks
function escapeForCodeBlock(str: string): string {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\`');
}

// Helper function to detect website type from prompt
function detectWebsiteType(prompt: string): { type: string } {
  const promptLower = prompt.toLowerCase();
  
  // Detect website type (simplified as framework is now fixed to React/Vite)
  let type = 'general';
  
  if (promptLower.includes('gym') || promptLower.includes('fitness') || promptLower.includes('workout')) {
    type = 'gym';
  } else if (promptLower.includes('restaurant') || promptLower.includes('food') || promptLower.includes('cafe')) {
    type = 'restaurant';
  } else if (promptLower.includes('travel') || promptLower.includes('tourism') || promptLower.includes('vacation')) {
    type = 'travel';
  } else if (promptLower.includes('tech') || promptLower.includes('technology') || promptLower.includes('software')) {
    type = 'tech';
  } else if (promptLower.includes('phone') || promptLower.includes('smartphone') || promptLower.includes('mobile device')) {
    type = 'phone';
  } else if (promptLower.includes('fashion') || promptLower.includes('clothing') || promptLower.includes('apparel')) {
    type = 'fashion';
  } else if (promptLower.includes('portfolio') || promptLower.includes('creative') || promptLower.includes('designer')) {
    type = 'portfolio';
  } else if (promptLower.includes('real estate') || promptLower.includes('property') || promptLower.includes('home')) {
    type = 'realestate';
  } else if (promptLower.includes('education') || promptLower.includes('course') || promptLower.includes('school')) {
    type = 'education';
  }
  
  return { type };
}

// Build dynamic system prompt based on context
function buildDynamicSystemPrompt(prompt: string): string {
  const { type } = detectWebsiteType(prompt);
  
  return [
    'You are a world-class React developer and designer.',
    'Generate ONLY React + Vite projects with Tailwind CSS. Do NOT generate plain HTML/CSS/JS files.',
    '',
    'MANDATORY REQUIREMENTS:',
    '- Framework: React 18 with Vite',
    '- Styling: Tailwind CSS only',
    '- File structure: Vite React project structure',
    '- Components: Functional components with hooks',
    '- File extensions: .jsx for components, .css for styles',
    '- Entry point: src/main.jsx',
    '- Main component: src/App.jsx', 
    '- Styles: src/index.css with Tailwind imports',
    '',
    'FILE STRUCTURE REQUIREMENTS:',
    '- package.json (with React, Vite, Tailwind dependencies)',
    '- vite.config.js (with React plugin)',
    '- index.html (Vite entry point)',
    '- src/main.jsx (React DOM render)',
    '- src/App.jsx (main component)',
    '- src/index.css (Tailwind imports)',
    '- src/components/ (additional components)',
    '- tailwind.config.js (Tailwind configuration)',
    '- postcss.config.js (PostCSS configuration)',
    '',
    'COMPONENT REQUIREMENTS:',
    '- Use modern React patterns (hooks, functional components)',
    '- Implement responsive design with Tailwind utilities',
    '- Add hover/focus states for interactive elements', 
    '- Use proper semantic HTML elements',
    '- Include accessibility attributes',
    '- Add smooth animations with Tailwind transitions',
    '',
    'Output format (MANDATORY):',
    '# Project Plan',
    '<short, high-level plan for React + Vite project>',
    '```json',
    '{',
    '  "package.json": "...",',
    '  "vite.config.js": "...",', 
    '  "index.html": "...",',
    '  "src/main.jsx": "...",',
    '  "src/App.jsx": "...",',
    '  "src/index.css": "...",',
    '  "src/components/ComponentName.jsx": "...",',
    '  "tailwind.config.js": "...",',
    '  "postcss.config.js": "..."',
    '}',
    '```',
    '',
    'Do not include any other code blocks or explanations. Only output the plan and the JSON block.',
    'Ensure ALL files are React/Vite compatible. NO plain HTML files except index.html as Vite entry point.'
  ].join('\n');
}

// Timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

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
    
    // Step 1: Try to retrieve relevant components from Weaviate with timeout
    try {
      if (process.env.WEAVIATE_HOST && process.env.WEAVIATE_API_KEY) {
        console.log("Attempting RAG retrieval with timeout...");
        const ragComponents = await withTimeout(getWebsiteComponents(prompt), 10000); // 10 second timeout for RAG
        ragAvailable = true;
        
        // Step 2: Format retrieved components to use as context for OpenAI
        contextString = "Use these React component examples as inspiration for generating high-quality code:\n\n";
        
        // Process key component types only to reduce token usage
        const componentTypes = [
          { type: 'hero' as keyof typeof ragComponents, label: 'Hero Component' },
          { type: 'navbar' as keyof typeof ragComponents, label: 'Navbar Component' },
          { type: 'features' as keyof typeof ragComponents, label: 'Features Component' },
          { type: 'footer' as keyof typeof ragComponents, label: 'Footer Component' }
        ];
        
        // Add each component type to context string (limited to reduce token usage)
        componentTypes.forEach(({ type, label }) => {
          if (ragComponents[type] && ragComponents[type].length > 0) {
            contextString += '\n## ' + label + ' Examples:\n';
            // Limit to first 2 examples to prevent token overflow
            ragComponents[type].slice(0, 2).forEach((comp: WebComponent, i: number) => {
              const safeCode = escapeForCodeBlock(comp.code);
              contextString += '\n### ' + label + ' Example ' + (i+1) + ':\n```jsx\n' + safeCode + '\n```\n\n';
            });
          }
        });
      } else {
        console.log("Weaviate environment variables not set, skipping RAG retrieval");
      }
    } catch (error) {
      console.error("Error retrieving components from Weaviate:", error);
      // Continue without RAG components - don't fail the entire request
      ragAvailable = false;
    }
    
    // Step 3: Generate website code with OpenAI using timeout
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: buildDynamicSystemPrompt(prompt) 
          },
          { 
            role: 'user', 
            content: ragAvailable 
              ? `${contextString}\n\nNow, based on these React component examples, generate a complete React + Vite project with Tailwind CSS for: ${prompt}` 
              : `Generate a complete React + Vite project with Tailwind CSS for: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 6000 // Reduced to prevent timeout
      }),
      30000 // 30 second timeout for OpenAI
    );

    const content = completion.choices[0]?.message.content || '';
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    // --- Robust JSON Extraction ---
    const planMatch = content.match(/# Project Plan[\s\S]*?(?=```|$)/i);
    const filesMatch = content.match(/```json[\s\S]*?({[\s\S]*})[\s\S]*?```/i);

    const plan = planMatch ? planMatch[0].trim() : 'React + Vite project plan generated.';
    let files: Record<string, string> = {};

    if (filesMatch && filesMatch[1]) {
      try {
        files = JSON.parse(filesMatch[1]);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Failed to parse JSON from AI response: ' + (e instanceof Error ? e.message : String(e)));
      }
    } else {
      console.error('AI response did not contain valid JSON:', content);
      throw new Error('No valid JSON found in AI response. Please try again.');
    }

    if (Object.keys(files).length === 0) {
      throw new Error('AI generated an empty files object. Please try a more specific prompt.');
    }
    
    // Validate React/Vite structure
    const requiredFiles = ['package.json', 'src/main.jsx', 'src/App.jsx'];
    const missingFiles = requiredFiles.filter(file => !files[file]);
    
    if (missingFiles.length > 0) {
      // Add missing required files
      if (!files['package.json']) {
        files['package.json'] = JSON.stringify({
          "name": "react-vite-project",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
          },
          "devDependencies": {
            "@vitejs/plugin-react": "^4.2.1",
            "tailwindcss": "^3.4.0",
            "vite": "^5.0.8"
          }
        }, null, 2);
      }
      
      if (!files['src/main.jsx']) {
        files['src/main.jsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
      }
      
      if (!files['src/App.jsx']) {
        files['src/App.jsx'] = `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your React App
        </h1>
        <p className="text-gray-600">
          Built with React + Vite + Tailwind CSS
        </p>
      </div>
    </div>
  )
}

export default App`;
      }
    }
    
    // Process images in React components only
    const processedFiles: Record<string, string> = {};
    
    for (const [path, content] of Object.entries(files)) {
      if (typeof content === 'string') {
        // Process JSX and CSS files for image replacements
        if (path.endsWith('.jsx') || path.endsWith('.css')) {
          try {
            processedFiles[path] = await withTimeout(processImagesInCode(content), 5000);
          } catch (error) {
            console.warn(`Image processing timeout for ${path}, using original content`);
            processedFiles[path] = content;
          }
        } else {
          processedFiles[path] = content;
        }
      }
    }
    
    // Return success response
    return res.status(200).json({
      plan,
      files: processedFiles
    });
    
  } catch (error) {
    console.error('Error in genCode API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide helpful error messages
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return res.status(408).json({ 
        error: 'Request timed out. The AI service is taking too long to respond. Please try again with a shorter prompt.' 
      });
    } else if (errorMessage.includes('OpenAI') || errorMessage.includes('API')) {
      return res.status(503).json({ 
        error: 'AI service is temporarily unavailable. Please try again in a moment.' 
      });
    } else if (errorMessage.includes('JSON')) {
      return res.status(422).json({ 
        error: 'AI response format error. Please try rephrasing your prompt.' 
      });
    } else {
      return res.status(500).json({ 
        error: errorMessage 
      });
    }
  }
}
