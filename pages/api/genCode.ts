// pages/api/genCode.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generateProjectWithAI } from "@/lib/api";
import { processImagesInCode, fetchPexelsImages } from "@/lib/pexels";
import { getWebsiteComponents } from "@/lib/weaviate";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ErrorResponse = {
  error: string;
};

interface WebComponent {
  componentType: string;
  textSummary: string;
  classKeywords: string[];
  code: string;
}

// Enhanced system prompt that generates proper file structure
function buildDynamicSystemPrompt(userQuery: string): string {
  const websiteType = detectWebsiteType(userQuery);
  const isDarkModeRequested = userQuery.toLowerCase().includes('dark mode') || userQuery.toLowerCase().includes('dark theme');
  
  return `You are an expert React + Vite + Tailwind CSS developer specializing in creating high-end, professional websites.

CRITICAL REQUIREMENTS:
1. Generate ONLY React + Vite components (.jsx files)
2. Use Tailwind CSS for ALL styling (no custom CSS files)
3. Use FLAT file structure - NO nested folders in imports
4. All components go in src/ directory with proper imports
5. Include proper React imports and exports
6. Use modern React functional components with hooks
7. Implement responsive design with mobile-first approach

WEBSITE TYPE DETECTED: ${websiteType}

DARK MODE REQUIREMENTS:
${isDarkModeRequested ? 
  '- User has requested DARK MODE - use dark mode variants from components with "dark mode" in text_summary' :
  '- User has NOT requested dark mode - use light mode/default variants and avoid dark mode classes'
}

FILE STRUCTURE REQUIREMENTS:
- App.jsx: Main app component that imports and renders all other components
- Header.jsx: Navigation header (REQUIRED)
- Hero.jsx: Hero section (if needed)
- Features.jsx: Features section (if needed)  
- About.jsx: About section (if user mentions about)
- Contact.jsx: Contact section (if user mentions contact)
- Team.jsx: Team section (if user mentions team/faculty/staff)
- Testimonials.jsx: Testimonials (if user mentions reviews/testimonials)
- Footer.jsx: Footer component (REQUIRED)
- package.json: Updated dependencies
- index.html: HTML entry point
- vite.config.js: Vite configuration

IMPORT RULES:
- Use relative imports: import Header from './Header.jsx'
- NO folder paths in imports (components are in same src/ directory)
- All components import React from 'react'

IMAGE INTEGRATION:
- Use /*IMAGE:category*/ placeholders for images
- Categories should be relevant (e.g., /*IMAGE:college*/, /*IMAGE:students*/, /*IMAGE:campus*/)
- These will be automatically replaced with high-quality Pexels images

STYLING REQUIREMENTS:
- Use provided class keywords from RAG components exactly as given
- Implement smooth animations with Tailwind animate classes
- Include hover effects and interactive states
- Use proper spacing and typography scales
${isDarkModeRequested ? '- Include dark: prefixed classes for dark mode support' : '- Focus on light theme with clean, professional styling'}

OUTPUT FORMAT:
Return your response as:

# Project Plan
[Brief description of the website structure and key features]

\`\`\`json
{
  "App.jsx": "[Complete React component code that imports and uses all other components]",
  "Header.jsx": "[Header/Navbar component - REQUIRED]",
  "Hero.jsx": "[Hero section component if needed]",
  "Features.jsx": "[Features section if needed]",
  "About.jsx": "[About section if user mentions about]",
  "Contact.jsx": "[Contact section if user mentions contact]",
  "Team.jsx": "[Team section if user mentions team/faculty/staff]",
  "Testimonials.jsx": "[Testimonials if user mentions reviews/testimonials]",
  "Footer.jsx": "[Footer component - REQUIRED]",
  "package.json": "{\"name\":\"website\",\"private\":true,\"version\":\"0.0.0\",\"type\":\"module\",\"scripts\":{\"dev\":\"vite --host 0.0.0.0 --port 5173\",\"build\":\"vite build\",\"preview\":\"vite preview\"},\"dependencies\":{\"react\":\"^18.2.0\",\"react-dom\":\"^18.2.0\",\"tailwindcss\":\"^3.4.0\"},\"devDependencies\":{\"@types/react\":\"^18.2.66\",\"@types/react-dom\":\"^18.2.22\",\"@vitejs/plugin-react\":\"^4.2.1\",\"autoprefixer\":\"^10.4.14\",\"eslint\":\"^8.57.0\",\"postcss\":\"^8.4.24\",\"vite\":\"^5.2.0\"}}",
  "vite.config.js": "import { defineConfig } from 'vite'\\nimport react from '@vitejs/plugin-react'\\n\\nexport default defineConfig({\\n  plugins: [react()],\\n  server: {\\n    host: '0.0.0.0',\\n    port: 5173,\\n    hmr: { port: 5173 }\\n  }\\n})",
  "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n  <head>\\n    <meta charset=\\"UTF-8\\" />\\n    <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\" />\\n    <title>Website</title>\\n    <script src=\\"https://cdn.tailwindcss.com\\"></script>\\n  </head>\\n  <body>\\n    <div id=\\"root\\"></div>\\n    <script type=\\"module\\" src=\\"/src/main.jsx\\"></script>\\n  </body>\\n</html>"
}
\`\`\`

IMPORTANT: Use exact class keywords provided by RAG components. Generate components that work together as a complete website.`;
}

function detectWebsiteType(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('college') || lowerQuery.includes('university') || lowerQuery.includes('education')) {
    return 'Educational Institution';
  } else if (lowerQuery.includes('gym') || lowerQuery.includes('fitness') || lowerQuery.includes('workout')) {
    return 'Fitness/Gym';
  } else if (lowerQuery.includes('restaurant') || lowerQuery.includes('food') || lowerQuery.includes('cafe')) {
    return 'Restaurant/Food';
  } else if (lowerQuery.includes('business') || lowerQuery.includes('corporate') || lowerQuery.includes('company')) {
    return 'Business/Corporate';
  } else if (lowerQuery.includes('portfolio') || lowerQuery.includes('personal')) {
    return 'Portfolio/Personal';
  } else if (lowerQuery.includes('ecommerce') || lowerQuery.includes('shop') || lowerQuery.includes('store')) {
    return 'E-commerce';
  }
  
  return 'General Website';
}

// Enhanced context builder with exact class keywords
function buildRAGContext(components: any, websiteType: string, isDarkModeRequested: boolean): string {
  let contextString = `COMPONENT LIBRARY FOR ${websiteType.toUpperCase()}:\n\n`;
  
  // Filter components based on dark mode request
  const filterComponentsByMode = (compList: WebComponent[]) => {
    if (!compList || compList.length === 0) return [];
    
    if (isDarkModeRequested) {
      // Prefer dark mode variants
      const darkModeComps = compList.filter(comp => 
        comp.textSummary && comp.textSummary.toLowerCase().includes('dark mode')
      );
      return darkModeComps.length > 0 ? darkModeComps : compList.slice(0, 1);
    } else {
      // Prefer light mode/responsive variants, avoid dark mode
      const lightModeComps = compList.filter(comp => 
        comp.textSummary && !comp.textSummary.toLowerCase().includes('dark mode')
      );
      return lightModeComps.length > 0 ? lightModeComps : compList.slice(0, 1);
    }
  };

  // Process specific component types in priority order
  const priorityComponents = [
    'Headers',
    'Hero Sections',
    'Feature Sections', 
    'Contact Sections',
    'Team Sections',
    'Testimonials',
    'CTA Sections',
    'Footers'
  ];
  
  priorityComponents.forEach(componentType => {
    if (components[componentType] && components[componentType].length > 0) {
      const filteredComponents = filterComponentsByMode(components[componentType]);
      
      if (filteredComponents.length > 0) {
        contextString += `## ${componentType}:\n`;
        filteredComponents.forEach((comp: WebComponent, i: number) => {
          contextString += `### ${comp.textSummary}\n`;
          contextString += `**Class Keywords:** ${comp.classKeywords ? comp.classKeywords.join(' ') : 'flex p-4 rounded shadow transition'}\n`;
          contextString += `**Usage Notes:** Use these exact class keywords in your components\n\n`;
        });
      }
    }
  });
  
  return contextString;
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
    let ragComponentsUsed = 0; // Initialize the variable properly
    const isDarkModeRequested = prompt.toLowerCase().includes('dark mode') || prompt.toLowerCase().includes('dark theme');
    
    console.log(`🔍 Processing request for: ${prompt}`);
    console.log(`🌙 Dark mode requested: ${isDarkModeRequested}`);
    
    // Step 1: Try to retrieve relevant components from Weaviate
    try {
      const ragResult = await getWebsiteComponents(prompt);
      
      if (ragResult.available && ragResult.totalComponents > 0) {
        ragAvailable = true;
        ragComponentsUsed = ragResult.totalComponents; // Store the value
        const websiteType = detectWebsiteType(prompt);
        contextString = buildRAGContext(ragResult.components, websiteType, isDarkModeRequested);
        
        console.log(`✅ RAG: Retrieved ${ragResult.totalComponents} relevant components`);
      } else {
        console.log("⚠️ RAG: No components retrieved, using direct generation");
      }
    } catch (error) {
      console.error("❌ RAG Error:", error);
      // Continue without RAG components
    }
    
    // Step 2: Generate enhanced prompt with RAG context
    const systemPrompt = buildDynamicSystemPrompt(prompt);
    const userPrompt = ragAvailable 
      ? `${contextString}\n\nIMPORTANT: Use the exact class keywords provided above. ${isDarkModeRequested ? 'Prioritize dark mode variants and include dark: classes.' : 'Use light mode variants and avoid dark mode classes.'}\n\nCreate a comprehensive React + Vite website with FLAT file structure for: ${prompt}`
      : `Create a comprehensive React + Vite website with FLAT file structure for: ${prompt}`;
    
    console.log(`🤖 Generating with ${ragAvailable ? 'RAG-enhanced' : 'direct'} AI...`);
    
    // Step 3: Generate website code with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 8000
    });

    const content = completion.choices[0]?.message.content || '';
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    // Step 4: Extract plan and files from AI response
    const planMatch = content.match(/# Project Plan[\\s\\S]*?(?=```|$)/i);
    const filesMatch = content.match(/```json[\s\S]*?({[\s\S]*})[\s\S]*?```/i);

    const plan = planMatch ? planMatch[0].trim() : `Modern React + Vite website${isDarkModeRequested ? ' with dark mode' : ''} using Tailwind CSS.`;
    let files: Record<string, string> = {};

    if (filesMatch && filesMatch[1]) {
      try {
        files = JSON.parse(filesMatch[1]);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Failed to parse JSON from AI response');
      }
    } else {
      throw new Error('No valid JSON found in AI response');
    }

    if (Object.keys(files).length === 0) {
      throw new Error('AI generated an empty files object');
    }
    
    console.log(`📁 Generated ${Object.keys(files).length} files`);
    
    // Step 5: Process images in all files using enhanced Pexels integration
    const processedFiles: Record<string, string> = {};
    
    for (const [path, content] of Object.entries(files)) {
      if (typeof content === 'string') {
        // Process image placeholders with contextual categories
        let processedContent = await processImagesInCode(content);
        
        // Enhanced image replacement for specific contexts
        if (prompt.toLowerCase().includes('college') || prompt.toLowerCase().includes('university')) {
          processedContent = await enhanceCollegeImages(processedContent);
        } else if (prompt.toLowerCase().includes('gym') || prompt.toLowerCase().includes('fitness')) {
          processedContent = await enhanceGymImages(processedContent);
        } else if (prompt.toLowerCase().includes('restaurant') || prompt.toLowerCase().includes('food')) {
          processedContent = await enhanceRestaurantImages(processedContent);
        }
        
        processedFiles[path] = processedContent;
      } else {
        processedFiles[path] = content;
      }
    }
    
    console.log(`🖼️  Processed images for all files`);
    
    // Step 6: Return the enhanced result
    res.status(200).json({
      plan: plan,
      files: processedFiles,
      ragEnhanced: ragAvailable,
      componentsUsed: ragComponentsUsed, // Use the properly scoped variable
      darkModeEnabled: isDarkModeRequested
    });
    
  } catch (error) {
    console.error("❌ Error generating code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Failed to generate code: ${errorMessage}` });
  }
}

// Enhanced image processing functions (same as before but condensed)
async function enhanceCollegeImages(content: string): Promise<string> {
  const mappings = [
    { placeholder: '/*IMAGE:hero*/', category: 'college_campus' },
    { placeholder: '/*IMAGE:campus*/', category: 'university_campus' },
    { placeholder: '/*IMAGE:students*/', category: 'college_students' },
    { placeholder: '/*IMAGE:faculty*/', category: 'university_professor' }
  ];
  
  let processedContent = content;
  for (const mapping of mappings) {
    if (processedContent.includes(mapping.placeholder)) {
      try {
        const images = await fetchPexelsImages(mapping.category, 1);
        processedContent = processedContent.replace(
          new RegExp(mapping.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          images[0] || `https://via.placeholder.com/800x600?text=${mapping.category}`
        );
      } catch (error) {
        console.error(`Error fetching ${mapping.category} image:`, error);
      }
    }
  }
  return processedContent;
}

async function enhanceGymImages(content: string): Promise<string> {
  const mappings = [
    { placeholder: '/*IMAGE:hero*/', category: 'modern_gym' },
    { placeholder: '/*IMAGE:gym*/', category: 'fitness_gym_equipment' },
    { placeholder: '/*IMAGE:workout*/', category: 'people_working_out' },
    { placeholder: '/*IMAGE:trainer*/', category: 'fitness_trainer' }
  ];
  
  let processedContent = content;
  for (const mapping of mappings) {
    if (processedContent.includes(mapping.placeholder)) {
      try {
        const images = await fetchPexelsImages(mapping.category, 1);
        processedContent = processedContent.replace(
          new RegExp(mapping.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          images[0] || `https://via.placeholder.com/800x600?text=${mapping.category}`
        );
      } catch (error) {
        console.error(`Error fetching ${mapping.category} image:`, error);
      }
    }
  }
  return processedContent;
}

async function enhanceRestaurantImages(content: string): Promise<string> {
  const mappings = [
    { placeholder: '/*IMAGE:hero*/', category: 'elegant_restaurant' },
    { placeholder: '/*IMAGE:restaurant*/', category: 'restaurant_interior' },
    { placeholder: '/*IMAGE:food*/', category: 'gourmet_food' },
    { placeholder: '/*IMAGE:chef*/', category: 'professional_chef' }
  ];
  
  let processedContent = content;
  for (const mapping of mappings) {
    if (processedContent.includes(mapping.placeholder)) {
      try {
        const images = await fetchPexelsImages(mapping.category, 1);
        processedContent = processedContent.replace(
          new RegExp(mapping.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          images[0] || `https://via.placeholder.com/800x600?text=${mapping.category}`
        );
      } catch (error) {
        console.error(`Error fetching ${mapping.category} image:`, error);
      }
    }
  }
  return processedContent;
}
