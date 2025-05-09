import { ChatResponse } from '../types/chat';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// High-quality examples of different website sections
const DESIGN_EXAMPLES = {
  // Hero section examples
  hero: {
    html: `<!-- Apple-quality Hero Section -->
<section class="hero">
  <div class="hero-content">
    <h1 class="hero-title">Experience the Future</h1>
    <p class="hero-subtitle">Groundbreaking design meets unparalleled performance</p>
    <div class="hero-cta">
      <a href="#" class="btn btn-primary">Learn more</a>
      <a href="#" class="btn btn-secondary">Buy now</a>
    </div>
  </div>
  <div class="hero-image">
    <img src="/*IMAGE:product*/" alt="Product showcase" class="product-image">
    <div class="hero-gradient"></div>
  </div>
</section>`,
    
    css: `.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 50%;
  padding: 0 5rem;
  z-index: 2;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #000, #333);
  -webkit-background-clip: text;
  color: transparent;
  animation: fadeIn 0.8s ease-out forwards;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: 2.5rem;
  font-weight: 400;
  color: #555;
  animation: fadeIn 1s ease-out 0.3s forwards;
  opacity: 0;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  animation: fadeIn 1.2s ease-out 0.5s forwards;
  opacity: 0;
}

.hero-image {
  position: absolute;
  right: -5%;
  top: 50%;
  transform: translateY(-50%);
  width: 60%;
  height: 80%;
  animation: floatIn 1.5s ease-out forwards;
  opacity: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.15));
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
  z-index: -1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes floatIn {
  from { opacity: 0; transform: translate(50px, -50%); }
  to { opacity: 1; transform: translate(0, -50%); }
}`
  },
  
  // Feature section examples
  features: {
    html: `<!-- Modern Feature Section -->
<section class="features">
  <div class="features-header">
    <h2>Cutting-edge features</h2>
    <p>Discover what makes our product exceptional</p>
  </div>
  
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">
        <svg><!-- Icon SVG --></svg>
      </div>
      <h3>Stunning Design</h3>
      <p>Sleek aesthetics combined with intuitive interfaces for an exceptional user experience.</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">
        <svg><!-- Icon SVG --></svg>
      </div>
      <h3>Powerful Performance</h3>
      <p>State-of-the-art technology ensuring seamless operations even under heavy workloads.</p>
    </div>
    
    <div class="feature-card">
      <div class="feature-icon">
        <svg><!-- Icon SVG --></svg>
      </div>
      <h3>Smart Integration</h3>
      <p>Effortlessly connects with your existing ecosystem for a unified experience.</p>
    </div>
  </div>
</section>`,
    
    css: `.features {
  padding: 8rem 0;
  background-color: #f8f9fa;
}

.features-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 5rem;
}

.features-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.features-header p {
  font-size: 1.2rem;
  color: #555;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 0;
  background: linear-gradient(45deg, #5e72e4, #8392ff);
  transition: height 0.5s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.feature-card:hover::before {
  height: 100%;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: rgba(94, 114, 228, 0.1);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.feature-card p {
  color: #555;
  line-height: 1.6;
}`
  },
  
  // Testimonials section example  
  testimonials: {
    html: `<!-- Modern Testimonials Section -->
<section class="testimonials">
  <div class="testimonials-header">
    <h2>What our customers say</h2>
    <p>Join thousands of satisfied users worldwide</p>
  </div>
  
  <div class="testimonials-slider">
    <div class="testimonial-card">
      <div class="testimonial-content">
        <div class="quote-icon">"</div>
        <p>This product has completely transformed how we operate. The intuitive interface and powerful features have increased our productivity by 200%.</p>
      </div>
      <div class="testimonial-author">
        <img src="/*IMAGE:portrait*/" alt="Sarah Johnson" class="author-image">
        <div class="author-info">
          <h4>Sarah Johnson</h4>
          <p>CEO, TechInnovate</p>
        </div>
      </div>
    </div>
    
    <div class="testimonial-card">
      <div class="testimonial-content">
        <div class="quote-icon">"</div>
        <p>As a designer, I appreciate the attention to detail and sleek aesthetics. But it's the performance that truly sets this apart from everything else on the market.</p>
      </div>
      <div class="testimonial-author">
        <img src="/*IMAGE:portrait*/" alt="Michael Chen" class="author-image">
        <div class="author-info">
          <h4>Michael Chen</h4>
          <p>Design Director, CreativeSphere</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="testimonials-dots">
    <span class="dot active"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </div>
</section>`,
    
    css: `.testimonials {
  padding: 8rem 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow: hidden;
}

.testimonials-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 5rem;
}

.testimonials-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.testimonials-header p {
  font-size: 1.2rem;
  color: #555;
}

.testimonials-slider {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  overflow-x: hidden;
}

.testimonial-card {
  flex: 0 0 100%;
  max-width: 550px;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  transform: scale(0.95);
  opacity: 0.7;
}

.testimonial-card:nth-child(2) {
  transform: scale(1);
  opacity: 1;
}

.testimonial-content {
  position: relative;
  margin-bottom: 2rem;
}

.quote-icon {
  position: absolute;
  top: -30px;
  left: -10px;
  font-size: 5rem;
  color: rgba(94, 114, 228, 0.1);
  font-family: Georgia, serif;
}

.testimonial-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  position: relative;
  z-index: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.author-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #1a1a1a;
}

.author-info p {
  font-size: 0.9rem;
  color: #777;
}

.testimonials-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: #5e72e4;
  transform: scale(1.2);
}`
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
  return `
You are a world-class frontend engineer and designer. 
You generate complete, production-quality websites from a user's prompt, using only the highest standards of modern web design (Apple/Google-level).

Requirements:
- Use advanced, modern HTML5, CSS3 (with variables, grid, flexbox, animations, transitions, glassmorphism, etc.), and JavaScript or React/Tailwind if requested.
- All content must be realistic, domain-appropriate, and high-converting. No Lorem Ipsum.
- All images must use the /*IMAGE:category*/ placeholder format.
- The design must be visually stunning, responsive, and interactive.
- Use only a single, explicit JSON block for the file structure and contents.

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

EXAMPLE OUTPUT:
# Project Plan
A modern, visually stunning landing page for a new smartphone, featuring a hero section, features, and testimonials. Uses glassmorphism, gradients, and smooth animations.
\`\`\`json
{
  "index.html": "<!DOCTYPE html>...<body>...<img src=/*IMAGE:hero*/>...</body></html>",
  "css/styles.css": ":root { --primary: #111; } body { ... animation ... glassmorphism ... }",
  "js/script.js": "// Smooth scroll, reveal animations, etc."
}
\`\`\`

Do not include any other code blocks or explanations. Only output the plan and the JSON block.
`;
} 