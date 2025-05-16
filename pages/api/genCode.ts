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
        contextString = "Use these Tailwind CSS component examples as inspiration for generating high-quality code:\n\n";
        
        // Process each component type and add to context
        const componentTypes = [
          { type: 'hero' as keyof typeof ragComponents, label: 'Hero Component' },
          { type: 'navbar' as keyof typeof ragComponents, label: 'Navbar Component' },
          { type: 'features' as keyof typeof ragComponents, label: 'Features Component' },
          { type: 'footer' as keyof typeof ragComponents, label: 'Footer Component' },
          { type: 'testimonials' as keyof typeof ragComponents, label: 'Testimonials Component' },
          { type: 'pricing' as keyof typeof ragComponents, label: 'Pricing Component' },
          { type: 'cta' as keyof typeof ragComponents, label: 'Call-to-Action Component' },
          { type: 'stats' as keyof typeof ragComponents, label: 'Statistics Component' },
          { type: 'team' as keyof typeof ragComponents, label: 'Team Component' },
          { type: 'contact' as keyof typeof ragComponents, label: 'Contact Component' },
          { type: 'faq' as keyof typeof ragComponents, label: 'FAQ Component' },
          { type: 'gallery' as keyof typeof ragComponents, label: 'Gallery Component' },
          { type: 'blog' as keyof typeof ragComponents, label: 'Blog Component' },
          { type: 'newsletter' as keyof typeof ragComponents, label: 'Newsletter Component' }
        ];
        
        // Add each component type to context string
        componentTypes.forEach(({ type, label }) => {
          if (ragComponents[type] && ragComponents[type].length > 0) {
            contextString += `## ${label} Examples:\n`;
            ragComponents[type].forEach((comp: WebComponent, i: number) => {
              contextString += `### ${label} Example ${i+1}:\n\`\`\`\n${comp.code}\n\`\`\`\n\n`;
            });
          }
        });
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
    
    // Step 3: Generate website code with OpenAI using RAG context and Tailwind
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a world-class frontend engineer and designer. Generate complete, production-quality websites from a user's prompt, using only the highest standards of modern web design (Apple/Google-level).

Requirements:
- Use Tailwind CSS by default for ALL projects. Include the Tailwind CDN or configuration as needed.
- Utilize Tailwind's utility classes for responsive design, animations, and modern UI effects.
- Follow Tailwind's mobile-first approach and use responsive prefixes (sm:, md:, lg:, xl:).
- Use semantic HTML5 elements with appropriate Tailwind classes.
- Use React Awesome Reveal for animations in React-based projects:
  * Include import statements from 'react-awesome-reveal' in relevant files
  * Wrap components with Fade, Slide, Zoom, etc. components from react-awesome-reveal
  * Use direction and duration props for varied animations
  * Examples: 
    - <Fade direction="up" delay={200}><YourComponent /></Fade>
    - <Slide direction="left"><FeatureCard /></Slide>
    - <Zoom delay={500}><Testimonial /></Zoom>
- Apply animations to almost all components (but not excessively):
  * Hero sections with Fade or Slide
  * Feature cards with staggered Slide or Fade
  * Testimonials with Zoom or Fade
  * CTAs with Attention
  * Images with Zoom or Fade
  * Statistics with Bounce or Slide
- All content must be realistic, domain-appropriate, and high-converting. No Lorem Ipsum.
- For images, use specific, descriptive /*IMAGE:category*/ placeholders:
  * Use precise categories that match the website's topic (e.g., "/*IMAGE:gym_equipment*/", "/*IMAGE:restaurant_dish*/")
  * For people, specify demographics that match target audience (e.g., "/*IMAGE:business_woman*/", "/*IMAGE:fitness_trainer*/")
  * Add descriptive adjectives for better image selection (e.g., "/*IMAGE:luxury_interior*/", "/*IMAGE:professional_team*/")
- The design must be visually stunning with:
  * Modern glassmorphism effects and subtle gradients
  * Micro-interactions and hover effects
  * Consistent color schemes throughout components
  * Mobile-first responsive design
  * Clear visual hierarchy and ample whitespace
- Use only a single, explicit JSON block for the file structure and contents.
- Create a cohesive, complete website that includes all necessary sections (hero, features, testimonials, etc.)

Output format (MANDATORY):
# Project Plan
<short, high-level plan>
\`\`\`json
{
  "index.html": "<!DOCTYPE html><html>...<head><script src='https://cdn.tailwindcss.com'></script>...</head><body class='bg-gray-50'>...</body></html>",
  "tailwind.config.js": "module.exports = { theme: { extend: {...} }, plugins: [...] }",
  "css/styles.css": "@tailwind base; @tailwind components; @tailwind utilities; /* Custom styles */",
  "js/script.js": "// Interactive features"
}
\`\`\`

Do not include any other code blocks or explanations. Only output the plan and the JSON block.` 
        },
        { 
          role: 'user', 
          content: `${contextString}\n\nNow, based on these examples, generate a complete website with Tailwind CSS for the following request: ${prompt}` 
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
