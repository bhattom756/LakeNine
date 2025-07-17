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
  // The AI will now decide the framework (e.g., HTML/CSS/JS, React, Vue, etc.)
  // based on the prompt, or default to a basic structure if not specified.
  return [
    'You are a world-class frontend engineer and designer.',
    "You generate complete, production-quality websites from a user's prompt, using only the highest standards of modern web design (Apple/Google-level).",
    '',
    'Requirements:',
    '- Use Tailwind CSS for ALL projects, unless explicitly told otherwise.',
    "- Follow Tailwind's utility-first approach and mobile-first responsive design principles.",
    "- Use Tailwind's built-in features for:",
    '  * Responsive design (sm:, md:, lg:, xl:)',
    '  * Dark mode support (dark:)',
    '  * Hover/focus states (hover:, focus:)',
    '  * Animations and transitions (animate-, transition-)',
    '  * Custom colors and gradients',
    '  * Modern UI effects (backdrop-blur, glassmorphism, etc.)',
    "- Apply animations to almost all components (but not excessively) using a library appropriate for the chosen framework (e.g., 'react-awesome-reveal' for React, or equivalent for other frameworks):",
    '  * Hero sections with Fade or Slide',
    '  * Feature cards with staggered Slide or Fade',
    '  * Testimonials with Zoom or Fade',
    '  * CTAs with Attention',
    '  * Images with Zoom or Fade',
    '  * Statistics with Bounce or Slide',
    '- All content must be realistic, domain-appropriate, and high-converting. No Lorem Ipsum.',
    '- All images must use the /*IMAGE:category*/ placeholder format.',
    '- The design must be visually stunning, responsive, and interactive.',
    '- Use semantic HTML5 elements with appropriate Tailwind classes.',
    '',
    'Output format (MANDATORY):',
    '# Project Plan',
    '<short, high-level plan>',
    '```json',
    '{',
    '  "file_path_1": "file_content_1",',
    '  "file_path_2": "file_content_2",',
    '  // ... etc.',
    '  "package.json": "{\"name\": \"my-project\",\"version\": \"1.0.0\",\"dependencies\": {\"tailwindcss\": \"^3.4.0\"}}"',
    '}',
    '```',
    '',
    'Do not include any other code blocks or explanations. Only output the plan and the JSON block.'
  ].join('\n');
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
          { type: 'newsletter' as keyof typeof ragComponents, label: 'Newsletter Component' },
          // Add all the new component types
          { type: 'bentoGrid' as keyof typeof ragComponents, label: 'Bento Grid Component' },
          { type: 'headerSection' as keyof typeof ragComponents, label: 'Header Section Component' },
          { type: 'contactSection' as keyof typeof ragComponents, label: 'Contact Section Component' },
          { type: 'teamSection' as keyof typeof ragComponents, label: 'Team Section Component' },
          { type: 'contentSection' as keyof typeof ragComponents, label: 'Content Section Component' },
          { type: 'logoCloud' as keyof typeof ragComponents, label: 'Logo Cloud Component' },
          { type: 'faqs' as keyof typeof ragComponents, label: 'FAQs Component' },
          { type: 'headers' as keyof typeof ragComponents, label: 'Headers Component' },
          { type: 'flyoutMenu' as keyof typeof ragComponents, label: 'Flyout Menu Component' },
          { type: 'banner' as keyof typeof ragComponents, label: 'Banner Component' },
          { type: 'notFoundPage' as keyof typeof ragComponents, label: '404 Page Component' },
          { type: 'landingPage' as keyof typeof ragComponents, label: 'Landing Page Component' },
          { type: 'pricingPage' as keyof typeof ragComponents, label: 'Pricing Page Component' },
          { type: 'aboutPage' as keyof typeof ragComponents, label: 'About Page Component' },
          { type: 'stackedLayout' as keyof typeof ragComponents, label: 'Stacked Layout Component' },
          { type: 'sidebarLayout' as keyof typeof ragComponents, label: 'Sidebar Layout Component' },
          { type: 'multiColumnLayout' as keyof typeof ragComponents, label: 'Multi-Column Layout Component' },
          { type: 'pageHeading' as keyof typeof ragComponents, label: 'Page Heading Component' },
          { type: 'cardHeading' as keyof typeof ragComponents, label: 'Card Heading Component' },
          { type: 'sectionHeading' as keyof typeof ragComponents, label: 'Section Heading Component' },
          { type: 'descriptionList' as keyof typeof ragComponents, label: 'Description List Component' },
          { type: 'calendar' as keyof typeof ragComponents, label: 'Calendar Component' },
          { type: 'stackedList' as keyof typeof ragComponents, label: 'Stacked List Component' },
          { type: 'table' as keyof typeof ragComponents, label: 'Table Component' },
          { type: 'gridList' as keyof typeof ragComponents, label: 'Grid List Component' },
          { type: 'feed' as keyof typeof ragComponents, label: 'Feed Component' },
          { type: 'formLayout' as keyof typeof ragComponents, label: 'Form Layout Component' },
          { type: 'inputGroup' as keyof typeof ragComponents, label: 'Input Group Component' },
          { type: 'selectMenu' as keyof typeof ragComponents, label: 'Select Menu Component' },
          { type: 'signInRegistration' as keyof typeof ragComponents, label: 'Sign-in and Registration Component' },
          { type: 'textarea' as keyof typeof ragComponents, label: 'Textarea Component' },
          { type: 'radioGroup' as keyof typeof ragComponents, label: 'Radio Group Component' },
          { type: 'checkbox' as keyof typeof ragComponents, label: 'Checkbox Component' },
          { type: 'toggle' as keyof typeof ragComponents, label: 'Toggle Component' },
          { type: 'actionPanel' as keyof typeof ragComponents, label: 'Action Panel Component' },
          { type: 'combobox' as keyof typeof ragComponents, label: 'Combobox Component' },
          { type: 'alert' as keyof typeof ragComponents, label: 'Alert Component' },
          { type: 'emptyState' as keyof typeof ragComponents, label: 'Empty State Component' },
          { type: 'navbars' as keyof typeof ragComponents, label: 'Navbars Component' },
          { type: 'pagination' as keyof typeof ragComponents, label: 'Pagination Component' },
          { type: 'tabs' as keyof typeof ragComponents, label: 'Tabs Component' },
          { type: 'verticalNavigation' as keyof typeof ragComponents, label: 'Vertical Navigation Component' },
          { type: 'sidebarNavigation' as keyof typeof ragComponents, label: 'Sidebar Navigation Component' },
          { type: 'breadcrumb' as keyof typeof ragComponents, label: 'Breadcrumb Component' },
          { type: 'progressBar' as keyof typeof ragComponents, label: 'Progress Bar Component' },
          { type: 'commandPalette' as keyof typeof ragComponents, label: 'Command Palette Component' },
          { type: 'modalDialog' as keyof typeof ragComponents, label: 'Modal Dialog Component' },
          { type: 'drawer' as keyof typeof ragComponents, label: 'Drawer Component' },
          { type: 'notification' as keyof typeof ragComponents, label: 'Notification Component' },
          { type: 'avatar' as keyof typeof ragComponents, label: 'Avatar Component' },
          { type: 'badge' as keyof typeof ragComponents, label: 'Badge Component' },
          { type: 'dropdown' as keyof typeof ragComponents, label: 'Dropdown Component' },
          { type: 'button' as keyof typeof ragComponents, label: 'Button Component' },
          { type: 'buttonGroup' as keyof typeof ragComponents, label: 'Button Group Component' },
          { type: 'container' as keyof typeof ragComponents, label: 'Container Component' },
          { type: 'card' as keyof typeof ragComponents, label: 'Card Component' },
          { type: 'listContainer' as keyof typeof ragComponents, label: 'List Container Component' },
          { type: 'mediaObject' as keyof typeof ragComponents, label: 'Media Object Component' },
          { type: 'divider' as keyof typeof ragComponents, label: 'Divider Component' },
          { type: 'homeScreen' as keyof typeof ragComponents, label: 'Home Screen Component' },
          { type: 'detailScreen' as keyof typeof ragComponents, label: 'Detail Screen Component' },
          { type: 'settingsScreen' as keyof typeof ragComponents, label: 'Settings Screen Component' },
          { type: 'productOverview' as keyof typeof ragComponents, label: 'Product Overview Component' },
          { type: 'productList' as keyof typeof ragComponents, label: 'Product List Component' },
          { type: 'categoryPreview' as keyof typeof ragComponents, label: 'Category Preview Component' },
          { type: 'shoppingCart' as keyof typeof ragComponents, label: 'Shopping Cart Component' },
          { type: 'categoryFilter' as keyof typeof ragComponents, label: 'Category Filter Component' },
          { type: 'productQuickview' as keyof typeof ragComponents, label: 'Product Quickview Component' },
          { type: 'productFeature' as keyof typeof ragComponents, label: 'Product Feature Component' },
          { type: 'storeNavigation' as keyof typeof ragComponents, label: 'Store Navigation Component' },
          { type: 'promoSection' as keyof typeof ragComponents, label: 'Promo Section Component' },
          { type: 'review' as keyof typeof ragComponents, label: 'Review Component' },
          { type: 'orderSummary' as keyof typeof ragComponents, label: 'Order Summary Component' },
          { type: 'orderHistory' as keyof typeof ragComponents, label: 'Order History Component' },
          { type: 'incentive' as keyof typeof ragComponents, label: 'Incentive Component' },
          { type: 'storefrontPage' as keyof typeof ragComponents, label: 'Storefront Page Component' },
          { type: 'productPage' as keyof typeof ragComponents, label: 'Product Page Component' },
          { type: 'categoryPage' as keyof typeof ragComponents, label: 'Category Page Component' },
          { type: 'shoppingCartPage' as keyof typeof ragComponents, label: 'Shopping Cart Page Component' },
          { type: 'checkoutPage' as keyof typeof ragComponents, label: 'Checkout Page Component' },
          { type: 'orderDetailPage' as keyof typeof ragComponents, label: 'Order Detail Page Component' },
          { type: 'orderHistoryPage' as keyof typeof ragComponents, label: 'Order History Page Component' },
          // Add responsive and dark mode variants
          { type: 'responsiveHeroSections' as keyof typeof ragComponents, label: 'Responsive Hero Section' },
          { type: 'darkModeHeroSections' as keyof typeof ragComponents, label: 'Dark Mode Hero Section' },
          { type: 'responsiveCards' as keyof typeof ragComponents, label: 'Responsive Card' },
          { type: 'darkModeCards' as keyof typeof ragComponents, label: 'Dark Mode Card' }
        ];
        
        // Add each component type to context string
        componentTypes.forEach(({ type, label }) => {
          if (ragComponents[type] && ragComponents[type].length > 0) {
            contextString += '\n## ' + label + ' Examples:\n';
            ragComponents[type].forEach((comp: WebComponent, i: number) => {
              const safeCode = escapeForCodeBlock(comp.code);
              contextString += '\n### ' + label + ' Example ' + (i+1) + ':\n```\n' + safeCode + '\n```\n\n';
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
          content: buildDynamicSystemPrompt(prompt) 
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
    const planMatch = content.match(/# Project Plan[\\s\\S]*?(?=```|$)/i);
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
