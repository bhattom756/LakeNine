import { ChatResponse } from '../types/chat';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Universal quality standards
const UNIVERSAL_QUALITY_STANDARDS = `
UNIVERSAL DESIGN REQUIREMENTS:
1. Clean Visual Hierarchy
   - Clear distinction between primary, secondary, and tertiary elements
   - Proper use of whitespace to create breathing room
   - Consistent alignment and grid structure

2. Professional Typography System
   - Limited font selection (max 2 font families)
   - Clear typographic scale for headings and body text
   - Proper line heights and letter spacing

3. Color Theory Application
   - Well-balanced primary, secondary, and accent colors
   - Proper contrast for accessibility (WCAG AA compliance)
   - Strategic use of color to guide attention and create depth

4. Animation & Interaction
   - Subtle entrance animations for key elements 
   - Meaningful hover/focus states that enhance usability
   - Micro-interactions that provide feedback (e.g., button hover effects)
   - Smooth transitions between states (0.2-0.5s durations)

5. Image Treatment
   - High-quality, relevant imagery (use placeholders with /*IMAGE:category*/ format)
   - Consistent aspect ratios and image treatment
   - Proper image optimization techniques

6. Advanced CSS Techniques (must use these)
   - CSS Variables for theme consistency
   - Flexbox for component alignment
   - CSS Grid for complex layouts
   - Media queries for responsive design
   - Subtle shadows and gradients for depth
   - Transform/translate for animations
`;

// Domain-specific website requirements
const DOMAIN_REQUIREMENTS: Record<string, string> = {
  gym: `
GYM/FITNESS WEBSITE REQUIREMENTS:
- Bold, energetic color scheme (typically with accent colors like red, orange, or bright blue)
- Motivational headlines and strong call-to-action buttons
- Class schedule with real class names/descriptions
- Trainer profiles with professional bios
- Membership pricing tables with clear feature comparison
- Before/after transformation galleries
- Testimonials from members with specific results achieved
- Equipment showcase with high-quality images
- Contact form with membership inquiry options
  `,
  
  restaurant: `
RESTAURANT WEBSITE REQUIREMENTS:
- Mouth-watering food photography as hero images
- Digital menu with proper categorization and pricing
- Online reservation system or prominent reservation call-to-action
- Restaurant hours and location with embedded map
- About section highlighting culinary philosophy or history
- Chef profiles or kitchen showcase section
- Food gallery with professional dish photography
- Special events or catering information
- Contact information and directions
  `,
  
  tech: `
TECHNOLOGY WEBSITE REQUIREMENTS:
- Clean, modern interface with ample whitespace
- Product showcase with detailed feature highlighting
- Technical specifications presented in clean, scannable format
- Comparison charts or tables for different models/versions
- Interactive product demos or videos
- Customer reviews and testimonials specific to tech products
- Knowledge base or support section
- Call-to-action buttons for purchase and learn more options
- "Tech specs" sections with expandable details
  `,
  
  phone: `
SMARTPHONE/DEVICE WEBSITE REQUIREMENTS:
- Hero section with device showcase and key selling point
- Floating/rotating 3D device imagery or multiple device angles
- Feature highlight sections with micro-animations
- Technical specifications organized in a modern, clean layout
- Color/model variant selector with visual feedback
- Comparison table with competitor models
- Camera/performance showcase with sample imagery
- Battery life and charging speed visualization
- "Buy now" and "Learn more" prominent call-to-action buttons
- Accessory showcase section
  `,
};

// --- MAIN GENERATION FUNCTION ---
export async function generateProjectWithAI(prompt: string): Promise<ChatResponse> {
  try {
    const systemPrompt = buildDynamicSystemPrompt(prompt);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
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

    return { plan, files };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code
      });
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Authentication error. Please check your API key.');
      } else if (error.status === 500) {
        throw new Error('OpenAI service error. Please try again later.');
      }
    }
    console.error('Error in OpenAI API call:', error);
    throw error;
  }
}

// Helper function to detect website type from prompt
function detectWebsiteType(prompt: string): { type: string, isPlainHtml: boolean } {
  const promptLower = prompt.toLowerCase();
  
  // Check if requesting plain HTML/CSS/JS
  const isPlainHtml = promptLower.includes('html') && 
                      promptLower.includes('css') && 
                      (promptLower.includes('js') || promptLower.includes('javascript')) &&
                      !promptLower.includes('react') && 
                      !promptLower.includes('next.js');
  
  // Detect website type
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
  
  return { type, isPlainHtml };
}

// Build dynamic system prompt based on context
function buildDynamicSystemPrompt(prompt: string): string {
  const { type } = detectWebsiteType(prompt);
  
  return `
You are a world-class frontend engineer and designer. 
You generate complete, production-quality websites from a user\\'s prompt, using only the highest standards of modern web design (Apple/Google-level).

Requirements:
- Use Tailwind CSS for ALL projects, unless explicitly told otherwise. 
- Follow Tailwind\\'s utility-first approach and mobile-first responsive design principles.
- Use Tailwind\\'s built-in features for:
  * Responsive design (sm:, md:, lg:, xl:)
  * Dark mode support (dark:)
  * Hover/focus states (hover:, focus:)
  * Animations and transitions (animate-, transition-)
  * Custom colors and gradients
  * Modern UI effects (backdrop-blur, glassmorphism, etc.)
- Apply animations to almost all components (but not excessively) using a library appropriate for the chosen framework (e.g., 'react-awesome-reveal' for React, or equivalent for other frameworks):
  * Hero sections with Fade or Slide
  * Feature cards with staggered Slide or Fade
  * Testimonials with Zoom or Fade
  * CTAs with Attention
  * Images with Zoom or Fade
  * Statistics with Bounce or Slide
- All content must be realistic, domain-appropriate, and high-converting. No Lorem Ipsum.
- All images must use the /*IMAGE:category*/ placeholder format.
- The design must be visually stunning, responsive, and interactive.
- Use semantic HTML5 elements with appropriate Tailwind classes.

Output format (MANDATORY):
# Project Plan
<short, high-level plan>
\\\`\\\`\\\`json
{
  "file_path_1": "file_content_1",
  "file_path_2": "file_content_2",
  // ... etc.
  "package.json": "{\\"name\\": \\"my-project\\",\\"version\\": \\"1.0.0\\",\\"dependencies\\": {\\"tailwindcss\\": \\"^3.4.0\\"}}"
}
\\\`\\\`\\\`

Do not include any other code blocks or explanations. Only output the plan and the JSON block.`;
} 