import { ChatResponse } from '../types/chat';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// High-quality examples of different website sections
const DESIGN_EXAMPLES = {
  // Hero section examples
  hero: {
    html: `<!-- Modern Hero Section with Tailwind CSS -->
<section class="relative min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
  <div class="container mx-auto px-4 py-32 flex flex-col lg:flex-row items-center justify-between">
    <div class="lg:w-1/2 space-y-8 text-center lg:text-left">
      <h1 class="text-5xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        Experience the Future
      </h1>
      <p class="text-xl lg:text-2xl text-gray-300">
        Groundbreaking design meets unparalleled performance
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <a href="#" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105">
          Learn more
        </a>
        <a href="#" class="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-lg text-lg font-semibold transition-all duration-300">
          Buy now
        </a>
      </div>
    </div>
    <div class="lg:w-1/2 mt-12 lg:mt-0 relative">
      <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-emerald-500/30 rounded-3xl filter blur-3xl"></div>
      <img src="/*IMAGE:product*/" alt="Product showcase" class="relative w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
    </div>
  </div>
  <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
</section>`,
    css: `/* No custom CSS needed - using Tailwind utility classes */`
  },
  
  // Feature section examples
  features: {
    html: `<!-- Modern Features Section with Tailwind CSS -->
<section class="py-24 bg-gray-50">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        Features that Set Us Apart
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Discover why our solution is the perfect choice for modern businesses
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Feature Card 1 -->
      <div class="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
        <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Add your feature icon SVG path here -->
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
        <p class="text-gray-600 leading-relaxed">
          Experience blazing fast performance with our optimized infrastructure
        </p>
      </div>
      
      <!-- Feature Card 2 -->
      <div class="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
        <div class="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Add your feature icon SVG path here -->
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Secure by Design</h3>
        <p class="text-gray-600 leading-relaxed">
          Built with security in mind, protecting your data at every step
        </p>
      </div>
      
      <!-- Feature Card 3 -->
      <div class="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
        <div class="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Add your feature icon SVG path here -->
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
        <p class="text-gray-600 leading-relaxed">
          Our dedicated team is here to help you succeed around the clock
        </p>
      </div>
    </div>
  </div>
</section>`,
    css: `/* No custom CSS needed - using Tailwind utility classes */`
  },
  
  // Testimonials section example  
  testimonials: {
    html: `<!-- Modern Testimonials Section with Tailwind CSS -->
<section class="py-24 bg-gray-900 text-white">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold mb-4">
        What Our Clients Say
      </h2>
      <p class="text-xl text-gray-400 max-w-3xl mx-auto">
        Don't just take our word for it - hear from our satisfied customers
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Testimonial Card 1 -->
      <div class="bg-gray-800 p-8 rounded-2xl">
        <div class="flex items-center mb-6">
          <img src="/*IMAGE:person*/" alt="Client" class="w-16 h-16 rounded-full object-cover mr-4">
          <div>
            <h3 class="text-xl font-semibold">Sarah Johnson</h3>
            <p class="text-gray-400">CEO, TechCorp</p>
          </div>
        </div>
        <p class="text-gray-300 leading-relaxed">
          "The best decision we made was choosing this solution. Our productivity has increased by 200% since implementation."
        </p>
        <div class="mt-6 flex text-yellow-400">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <!-- Add star icon SVG path here -->
          </svg>
          <!-- Repeat star icons -->
        </div>
      </div>
      
      <!-- Add more testimonial cards as needed -->
    </div>
  </div>
</section>`,
    css: `/* No custom CSS needed - using Tailwind utility classes */`
  }
};

// Get examples based on website type
function getWebsiteExamples(websiteType: string): string {
  // Determine which examples to include based on website type
  let exampleStr = '';
  
  exampleStr += `\n\nEXAMPLE HERO SECTION HTML:\n\`\`\`html\n${DESIGN_EXAMPLES.hero.html}\n\`\`\`\n\n`;
  exampleStr += `EXAMPLE HERO SECTION CSS:\n\`\`\`css\n${DESIGN_EXAMPLES.hero.css}\n\`\`\`\n\n`;
  
  // For different website types, include additional specialized examples
  if (websiteType.includes('ecommerce') || websiteType.includes('shop')) {
    exampleStr += `EXAMPLE PRODUCT CARD HTML:\n\`\`\`html\n<div class="product-card">
  <div class="product-image">
    <img src="/*IMAGE:product*/" alt="Product Name">
    <div class="product-badge">New</div>
  </div>
  <div class="product-info">
    <h3>Premium Product</h3>
    <div class="product-price">$199.99</div>
    <div class="product-rating">★★★★★ <span>(42)</span></div>
  </div>
  <button class="add-to-cart">Add to Cart</button>
</div>\n\`\`\`\n\n`;
  } else if (websiteType.includes('portfolio') || websiteType.includes('creative')) {
    exampleStr += `EXAMPLE PORTFOLIO ITEM HTML:\n\`\`\`html\n<div class="portfolio-item">
  <div class="portfolio-image">
    <img src="/*IMAGE:creative*/" alt="Project Title">
    <div class="portfolio-overlay">
      <div class="portfolio-actions">
        <a href="#" class="view-project">View Project</a>
      </div>
    </div>
  </div>
  <div class="portfolio-info">
    <h3>Creative Project</h3>
    <p>UI/UX Design, Development</p>
  </div>
</div>\n\`\`\`\n\n`;
  }
  
  // Always include features and testimonials examples
  exampleStr += `EXAMPLE FEATURES SECTION HTML:\n\`\`\`html\n${DESIGN_EXAMPLES.features.html}\n\`\`\`\n\n`;
  exampleStr += `EXAMPLE TESTIMONIALS SECTION HTML:\n\`\`\`html\n${DESIGN_EXAMPLES.testimonials.html}\n\`\`\`\n\n`;
  
  return exampleStr;
}

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
  const { type, isPlainHtml } = detectWebsiteType(prompt);
  
  // Get any domain-specific requirements
  const domainReqs = DOMAIN_REQUIREMENTS[type] || '';
  
  // Check if this is likely a React project
  const isReactProject = prompt.toLowerCase().includes('react') || prompt.toLowerCase().includes('next.js');
  
  // Add React-specific requirements if needed
  const reactReqs = isReactProject ? `
- For React/Next.js projects, ensure you:
  * Include "react-awesome-reveal": "^4.2.8" in package.json dependencies
  * Import animation components at the top of each file: import { Fade, Slide, Zoom } from 'react-awesome-reveal'
  * Wrap components in animation elements like <Fade>, <Slide>, etc.
  * Use proper configuration and props for animations` : '';
  
  return `
You are a world-class frontend engineer and designer. 
You generate complete, production-quality websites from a user's prompt, using only the highest standards of modern web design (Apple/Google-level).

Requirements:
- Use Tailwind CSS for ALL projects, regardless of framework choice. Include either the CDN or proper configuration.
- Follow Tailwind's utility-first approach and mobile-first responsive design principles.
- Use Tailwind's built-in features for:
  * Responsive design (sm:, md:, lg:, xl:)
  * Dark mode support (dark:)
  * Hover/focus states (hover:, focus:)
  * Animations and transitions (animate-, transition-)
  * Custom colors and gradients
  * Modern UI effects (backdrop-blur, glassmorphism, etc.)
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
- All images must use the /*IMAGE:category*/ placeholder format.
- The design must be visually stunning, responsive, and interactive.
- Use semantic HTML5 elements with appropriate Tailwind classes.
${reactReqs}
${domainReqs}

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

Do not include any other code blocks or explanations. Only output the plan and the JSON block.
`;
} 