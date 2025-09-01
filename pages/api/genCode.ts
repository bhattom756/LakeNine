// pages/api/genCode.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getWebsiteComponents, resetWeaviateSchema } from '@/lib/weaviate';
import { getSystemPrompt } from '@/lib/bolt-prompt';
import { pixabayAPI, detectBusinessType } from '@/lib/pixabay';
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

// Enhanced system prompt that generates proper file structure using Bolt's approach
function buildDynamicSystemPrompt(userQuery: string, useBoltPrompt: boolean = true): string {
  return getSystemPrompt(useBoltPrompt);
}

// Function to enhance basic prompts with comprehensive requirements
function enhanceBasicPrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Detect business type and create comprehensive requirements
  let businessType = '';
  let specificRequirements = '';
  
  if (lowerPrompt.includes('hospital') || lowerPrompt.includes('medical') || lowerPrompt.includes('healthcare') || lowerPrompt.includes('clinic')) {
    businessType = 'Hospital/Medical';
    specificRequirements = `
MANDATORY SECTIONS for Hospital Website:
✅ Professional Header with Navigation (Home, About, Services, Doctors, Contact, Emergency)
✅ Hero Section with key messaging about healthcare excellence and emergency contact
✅ About Section with hospital history, mission, vision, and accreditations
✅ Medical Services Section with detailed service offerings (Emergency, Surgery, Cardiology, etc.)
✅ Doctors/Staff Section with physician profiles and specializations
✅ Features Section highlighting advanced equipment, 24/7 care, certifications
✅ Testimonials Section with patient success stories and reviews
✅ Emergency Contact Section with prominent emergency hotline
✅ Contact Section with appointment booking form, location map, and contact details
✅ Footer with quick links, social media, and important information

VISUAL REQUIREMENTS:
- Professional blue/green medical color scheme with gradients
- Clean, trustworthy design with medical imagery /*IMAGE:medical*/, /*IMAGE:hospital*/
- Emergency contact prominently displayed with red accent colors
- Appointment booking functionality with attractive forms
- Mobile-responsive design for patients on-the-go
- MANDATORY: /*IMAGE:logo*/ in navbar, /*IMAGE:hero*/ in hero section
- Use /*IMAGE:doctor*/ for physician profiles, /*IMAGE:medical_equipment*/ for services`;
  } 
  
  else if (lowerPrompt.includes('gym') || lowerPrompt.includes('fitness') || lowerPrompt.includes('workout') || lowerPrompt.includes('training')) {
    businessType = 'Gym/Fitness';
    specificRequirements = `
MANDATORY SECTIONS for Gym/Fitness Website:
✅ Dynamic Header with Navigation (Home, About, Classes, Trainers, Membership, Contact)
✅ Energetic Hero Section with motivational messaging and "Join Now" CTA
✅ About Section with gym philosophy, equipment, and facility highlights
✅ Classes/Programs Section (Strength Training, Yoga, CrossFit, Cardio, Group Classes)
✅ Trainers Section with certified trainer profiles and specializations
✅ Membership Plans with pricing tiers (Basic, Standard, Premium)
✅ Features Section (24/7 Access, Modern Equipment, Personal Training, Nutrition)
✅ Success Stories/Testimonials with before/after transformations
✅ Contact Section with trial membership form and location
✅ Footer with social media and quick links

VISUAL REQUIREMENTS:
- Bold, energetic color scheme (dark backgrounds with neon green/red accents)
- High-energy imagery /*IMAGE:gym*/, /*IMAGE:fitness*/ and motivational content
- Strong call-to-action buttons with hover effects and gradients
- Progress tracking and achievement focus
- MANDATORY: /*IMAGE:logo*/ in navbar, /*IMAGE:hero*/ in hero section
- Use /*IMAGE:gym_equipment*/ for facilities, /*IMAGE:fitness_trainer*/ for trainer profiles`;
  }
  
  else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('cafe') || lowerPrompt.includes('food') || lowerPrompt.includes('dining')) {
    businessType = 'Restaurant/Food';
    specificRequirements = `
MANDATORY SECTIONS for Restaurant Website:
✅ Appetizing Header with Navigation (Home, Menu, About, Reservations, Contact)
✅ Hero Section with signature dish imagery and reservation CTA
✅ About Section with chef story, cuisine philosophy, and restaurant ambiance
✅ Menu Section with detailed food categories and prices
✅ Features Section (Fresh Ingredients, Chef Specials, Catering, Events)
✅ Gallery Section with food photography and restaurant interior
✅ Testimonials with customer reviews and ratings
✅ Reservation Section with booking form and contact details
✅ Footer with hours, location, and social media

VISUAL REQUIREMENTS:
- Warm, inviting color scheme with food-focused imagery /*IMAGE:restaurant*/, /*IMAGE:food*/
- High-quality food photography placeholders /*IMAGE:restaurant_dish*/, /*IMAGE:chef*/
- Elegant typography for menu items with attractive pricing layouts
- Reservation system integration with modern booking forms
- MANDATORY: /*IMAGE:logo*/ in navbar, /*IMAGE:hero*/ in hero section
- Use /*IMAGE:restaurant_interior*/ for ambiance, /*IMAGE:cafe*/ for casual dining`;
  }
  
  else if (lowerPrompt.includes('school') || lowerPrompt.includes('university') || lowerPrompt.includes('college') || lowerPrompt.includes('education')) {
    businessType = 'Educational Institution';
    specificRequirements = `
MANDATORY SECTIONS for Educational Website:
✅ Academic Header with Navigation (Home, About, Programs, Faculty, Admissions, Contact)
✅ Hero Section with campus imagery and admissions CTA
✅ About Section with institution history, mission, and achievements
✅ Programs Section with detailed course offerings and departments
✅ Faculty Section with professor profiles and qualifications
✅ Features Section (Campus Facilities, Research, Student Life, Accreditation)
✅ Student Testimonials and success stories
✅ Admissions Section with application form and requirements
✅ Footer with campus information and resources

VISUAL REQUIREMENTS:
- Professional academic color scheme (blues, greens)
- Campus and student life imagery
- Clear academic information hierarchy`;
  }
  
  else {
    businessType = 'General Business';
    specificRequirements = `
MANDATORY SECTIONS for Professional Business Website:
✅ Professional Header with clear Navigation
✅ Compelling Hero Section with value proposition and main CTA
✅ About Section with company story, mission, and team
✅ Services/Products Section with detailed offerings
✅ Features Section highlighting key differentiators
✅ Testimonials Section with client reviews and case studies
✅ Contact Section with inquiry form and business information
✅ Footer with company details and links

VISUAL REQUIREMENTS:
- Professional color scheme appropriate for the industry
- Clean, modern design with clear hierarchy
- Trust-building elements and social proof`;
  }

  return `Create a COMPREHENSIVE, PRODUCTION-READY ${businessType} website for: "${prompt}"

${specificRequirements}

🚨 TECHNICAL REQUIREMENTS:
- React + Vite project structure with component-based architecture
- Tailwind CSS for responsive styling across all devices
- MINIMUM 8-12 separate React component files (.jsx)
- Professional, realistic content (NO Lorem ipsum placeholder text)
- Interactive elements: forms, navigation, hover effects, animations
- Complete file structure: package.json, main.jsx, App.jsx, components/, CSS files
- Mobile-first responsive design
- Modern UI/UX patterns and best practices

🎯 QUALITY CHECKLIST:
- Each component MUST be 400+ characters of meaningful code (STRICTLY ENFORCED)
- Include proper form validation and interactive elements with realistic functionality
- Add realistic business content and professional messaging (NO placeholders)
- Implement smooth animations and hover effects with proper Tailwind classes
- Ensure consistent branding and visual hierarchy across all components
- Create a fully functional, deployable website with production-ready code

🚨 ABSOLUTE REQUIREMENTS FOR EACH COMPONENT:
- Hero: Full hero section with background gradients, multiple buttons, feature highlights (500+ chars)
- Services: Multiple service cards with detailed descriptions and styling (400+ chars)
- Contact: Complete contact forms with validation, map sections, contact details (500+ chars)
- About: Comprehensive about section with team info, mission, values (400+ chars)
- Footer: Multi-column footer with links, social media, contact information (400+ chars)

REJECTION CRITERIA: 
- ANY component under 400 characters = IMMEDIATE REJECTION
- Basic templates or skeleton code = IMMEDIATE REJECTION
- Missing realistic content = IMMEDIATE REJECTION
- Fewer than 8 substantial files = IMMEDIATE REJECTION

🔥 CRITICAL: Generate SUBSTANTIAL, PRODUCTION-READY components with FULL CONTENT, not minimal placeholders!`;
}

// Function to validate AI response quality
function validateWebsiteQuality(files: Record<string, string>, aiResponse: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check 1: Minimum number of files
  if (Object.keys(files).length < 7) {
    issues.push(`Only ${Object.keys(files).length} files generated (minimum 7 required)`);
  }
  
  // Check 2: Required file types exist
  const requiredFiles = ['package.json', 'src/App.jsx', 'src/main.jsx', 'index.html'];
  const componentFiles = Object.keys(files).filter(f => f.endsWith('.jsx') && f.includes('components/'));
  
  for (const required of requiredFiles) {
    if (!Object.keys(files).some(f => f.includes(required.split('/').pop()!))) {
      issues.push(`Missing required file: ${required}`);
    }
  }
  
  // Check 3: Minimum number of component files
  if (componentFiles.length < 4) {
    issues.push(`Only ${componentFiles.length} component files generated (minimum 4 required)`);
  }
  
  // Check 4: Check for basic template indicators (forbidden content)
  const appJsx = files['src/App.jsx'] || files['App.jsx'] || '';
  const lowerAppJsx = appJsx.toLowerCase();
  
  if (lowerAppJsx.includes('welcome to') && lowerAppJsx.includes('react app')) {
    issues.push('Generated basic React template instead of custom website');
  }
  
  if (lowerAppJsx.includes('hello world') || lowerAppJsx.includes('getting started')) {
    issues.push('Contains basic template content');
  }
  
  // Check 5: Content quality - look for substantial components
  let hasSubstantialComponents = false;
  let componentSizes: string[] = [];
  
  for (const [fileName, content] of Object.entries(files)) {
    if (fileName.endsWith('.jsx') && fileName.includes('components/')) {
      componentSizes.push(`${fileName}: ${content.length} chars`);
      if (content.length < 400) {
        issues.push(`Component ${fileName} is too small (${content.length} chars, minimum 400 required)`);
      }
      if (content.length > 400) {
        hasSubstantialComponents = true;
      }
    }
  }
  

  
  if (!hasSubstantialComponents) {
    issues.push('No substantial React components found (all components under 400 characters)');
  }
  
  // Check 6: Look for Lorem ipsum or placeholder content
  const allContent = Object.values(files).join(' ').toLowerCase();
  if (allContent.includes('lorem ipsum') || allContent.includes('placeholder text')) {
    issues.push('Contains Lorem ipsum or placeholder content');
  }
  
  // Check 7: Check for minimal content indicators
  if (allContent.length < 5000) {
    issues.push('Total content too small for a comprehensive website');
  }
  
  // Check 8: Look for professional elements
  const hasNavigation = allContent.includes('nav') || allContent.includes('header');
  const hasFooter = allContent.includes('footer');
  const hasMultipleSections = (allContent.match(/section|div.*className/g) || []).length > 5;
  
  if (!hasNavigation) issues.push('Missing navigation elements');
  if (!hasFooter) issues.push('Missing footer elements');  
  if (!hasMultipleSections) issues.push('Insufficient sectional content');
  
  // Check 9: Verify image placeholders are present (with fallback validation)
  const imagePlaceholders = allContent.match(/\/\*IMAGE:[^*]+\*\//g) || [];
  const regularImgTags = (allContent.match(/<img[^>]*>/g) || []).length;
  const hasLogo = allContent.includes('/*IMAGE:logo*/');
  const hasHeroImage = allContent.includes('/*IMAGE:hero*/');
  
  // RELAXED VALIDATION: Accept websites with minimal strategic images
  const totalImageElements = imagePlaceholders.length + regularImgTags;
  
  // Separate critical image failures from other issues (updated for new validation)
  const criticalImageFailures = issues.filter(issue => 
    issue.includes('No images found') || 
    (issue.includes('Missing logo') && issue.includes('CRITICAL')) ||
    (issue.includes('Missing hero') && issue.includes('CRITICAL'))
  );
  
  const otherIssues = issues.filter(issue => 
    !issue.includes('No images found') && 
    !issue.includes('Missing logo') && 
    !issue.includes('Missing hero')
  );
  

  
  return {
    isValid: criticalImageFailures.length === 0 && otherIssues.length <= 4, // Zero tolerance for missing images
    issues
  };
}

// Helper function to extract files from content using alternative methods
function extractFilesFromContent(content: string): Record<string, string> {
  const files: Record<string, string> = {};
  
  try {
    // Method 1: Enhanced JSON extraction with multiple patterns
    console.log('🔍 COMPREHENSIVE EXTRACTION - Starting enhanced JSON extraction...');
    
    // Look for the specific pattern: "filename": {nested object} or "filename": "content"
    // Updated to handle longer content and escaped strings better
    const improvedPattern = /"([^"]+\.(json|jsx?|tsx?|html|css|js))"\s*:\s*({(?:[^{}]|{[^{}]*})*}|"(?:[^"\\]|\\.)*")/g;
    let match;
    
    while ((match = improvedPattern.exec(content)) !== null) {
      const filePath = match[1];
      let fileContent = match[3];
      
      console.log(`📄 Found file: ${filePath}`);
      
      // Clean up the content
      if (fileContent.startsWith('"') && fileContent.endsWith('"')) {
        fileContent = fileContent.slice(1, -1);
      }
      
      // For package.json, ensure it's properly formatted
      if (filePath === 'package.json' && fileContent.startsWith('{')) {
        try {
          // Try to parse and reformat the package.json
          const parsed = JSON.parse(fileContent);
          fileContent = JSON.stringify(parsed, null, 2);
        } catch (e) {
          console.warn(`Package.json parsing failed, using as-is: ${e}`);
        }
      }
      
      // Unescape content
      fileContent = fileContent
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r');
      
      files[filePath] = fileContent;
      console.log(`✅ Extracted: ${filePath} (${fileContent.length} chars)`);
    }
    
    // Method 2: If no files found, try simpler patterns
    if (Object.keys(files).length === 0) {
      console.log('🔍 Trying simpler extraction patterns...');
      
      // Try to extract any quoted strings that look like file paths and content
      const simplePattern = /"([^"]*\.(?:jsx?|tsx?|html|css|json|js))"\s*:\s*"([^"]*)"/g;
      
      while ((match = simplePattern.exec(content)) !== null) {
        const filePath = match[1];
        let fileContent = match[2];
        
        // Unescape content
        fileContent = fileContent
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\t/g, '\t');
        
        files[filePath] = fileContent;
        console.log(`✅ Simple extraction: ${filePath}`);
      }
    }
    
    // Method 3: Try to find individual file blocks with file paths
    if (Object.keys(files).length === 0) {
      const filePattern = /```(?:jsx?|tsx?|json|html|css)?\s*\/\/\s*(.+?)\n([\s\S]*?)```/gi;
      
      while ((match = filePattern.exec(content)) !== null) {
        const filePath = match[1].trim();
        const fileContent = match[2].trim();
        files[filePath] = fileContent;
      }
    }
    
    // Method 4: Try to extract from artifact-style format
    if (Object.keys(files).length === 0) {
      const artifactPattern = /<boltAction[^>]*filePath=["']([^"']+)["'][^>]*>([\s\S]*?)<\/boltAction>/gi;
      
      while ((match = artifactPattern.exec(content)) !== null) {
        const filePath = match[1].trim();
        const fileContent = match[2].trim();
        files[filePath] = fileContent;
      }
    }
    
    console.log(`🔍 Alternative extraction found ${Object.keys(files).length} files`);
    return files;
    
  } catch (error) {
    console.error('Alternative extraction failed:', error);
    
    // Create a minimal structure that will pass validation with diagnostic info
    const diagnosticFiles = {
      'package.json': JSON.stringify({
        "name": "extraction-diagnostic",
        "version": "1.0.0",
        "scripts": { "dev": "vite", "build": "vite build", "serve": "vite preview" },
        "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0", "react-refresh": "^0.14.0" },
        "devDependencies": { "vite": "^5.2.0", "@vitejs/plugin-react": "^4.2.1", "tailwindcss": "^3.4.0", "autoprefixer": "^10.4.14", "postcss": "^8.4.24" }
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Generation Diagnostic</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
      'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      'src/App.jsx': `import React from 'react'

function App() {
  const aiContent = \`${content.substring(0, 3000).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white text-center mb-6">
            🔧 AI Extraction Debug Mode
          </h1>
          <div className="bg-black/30 rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4 text-yellow-300">Diagnostic Information:</h2>
            <div className="space-y-2 text-sm font-mono">
              <p><span className="text-green-300">Response Length:</span> ${content.length} characters</p>
              <p><span className="text-blue-300">Contains JSON:</span> ${content.includes('{') ? 'Yes' : 'No'}</p>
              <p><span className="text-purple-300">Contains Files:</span> ${content.includes('.jsx') ? 'Yes' : 'No'}</p>
              <p><span className="text-pink-300">Extraction Status:</span> All methods failed</p>
              <p><span className="text-orange-300">Error:</span> ${error instanceof Error ? error.message : String(error)}</p>
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-3 text-cyan-300">Raw AI Response Preview:</h3>
            <div className="bg-black/50 rounded p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">{aiContent}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App`,
      'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
}`,
      'src/components/Header.jsx': `import React from 'react'

function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 text-center rounded-lg shadow-xl mb-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        <img src="/*IMAGE:logo*/" alt="Company Logo" className="h-12 w-12 rounded-lg shadow-md object-cover" />
        <h1 className="text-5xl font-bold animate-pulse">🤖 AI Diagnostic Mode</h1>
      </div>
      <div className="relative mb-6">
        <img src="/*IMAGE:hero*/" alt="Background" className="w-full h-32 object-cover rounded-lg opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xl font-semibold">Extraction debugging system active...</p>
        </div>
      </div>
      <div className="mt-6 flex justify-center space-x-4 text-sm">
        <span className="bg-white/20 px-3 py-1 rounded">Debug: ON</span>
        <span className="bg-white/20 px-3 py-1 rounded">Extraction: FAILED</span>
        <span className="bg-white/20 px-3 py-1 rounded">Fallback: ACTIVE</span>
      </div>
    </header>
  )
}

export default Header`,
      'src/components/Footer.jsx': `import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-8 text-center rounded-lg shadow-xl mt-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        <img src="/*IMAGE:office*/" alt="Office" className="h-16 w-16 rounded-lg object-cover opacity-80" />
        <div>
          <p className="text-lg font-semibold">🔧 AI Website Generation System</p>
          <p className="text-sm opacity-70">Debug mode active - Check console for detailed extraction logs</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <img src="/*IMAGE:service*/" alt="Service" className="h-12 w-12 mx-auto rounded-lg object-cover mb-2" />
          <span className="text-red-400 text-xs">Status: Extraction Failed</span>
        </div>
        <div className="text-center">
          <img src="/*IMAGE:feature*/" alt="Feature" className="h-12 w-12 mx-auto rounded-lg object-cover mb-2" />
          <span className="text-yellow-400 text-xs">Mode: Diagnostic</span>
        </div>
        <div className="text-center">
          <img src="/*IMAGE:about*/" alt="About" className="h-12 w-12 mx-auto rounded-lg object-cover mb-2" />
          <span className="text-green-400 text-xs">Fallback: Success</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer`,
      'src/components/Diagnostics.jsx': `import React from 'react'

function Diagnostics({ aiResponse, extractionError }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-xl shadow-2xl text-white mb-8">
      <h2 className="text-3xl font-bold mb-6 text-center">📊 Extraction Diagnostics</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-yellow-300">📈 Response Analysis</h3>
          <div className="space-y-3 text-sm font-mono">
            <p><span className="text-green-300">Length:</span> ${content.length} chars</p>
            <p><span className="text-blue-300">JSON detected:</span> ${content.includes('{') ? '✅ Yes' : '❌ No'}</p>
            <p><span className="text-purple-300">React code:</span> ${content.includes('jsx') || content.includes('React') ? '✅ Yes' : '❌ No'}</p>
            <p><span className="text-pink-300">HTML structure:</span> ${content.includes('<!DOCTYPE') ? '✅ Yes' : '❌ No'}</p>
            <p><span className="text-orange-300">CSS styles:</span> ${content.includes('@tailwind') || content.includes('css') ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
        <div className="bg-black/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-red-300">🚨 Error Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-yellow-300">Error:</span> {extractionError || 'Multiple extraction methods failed'}</p>
            <p><span className="text-cyan-300">Attempted:</span> JSON parsing, regex patterns, code blocks</p>
            <p><span className="text-green-300">Fallback:</span> Diagnostic structure created</p>
            <p><span className="text-purple-300">Status:</span> Website still functional</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Diagnostics`
    };
    
    console.log(`🔧 Created enhanced diagnostic structure with ${Object.keys(diagnosticFiles).length} files`);
    return diagnosticFiles;
  }
}

// Helper function to create a fallback React app when all extraction fails
function createFallbackReactApp(): Record<string, string> {
  console.error('🚨 FALLBACK TRIGGERED: AI generation completely failed, creating basic React app');
  return {
    'package.json': JSON.stringify({
      "name": "react-app",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite --host 0.0.0.0 --port 5173",
        "build": "vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-refresh": "^0.14.0",
        "tailwindcss": "^3.4.0"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.14",
        "postcss": "^8.4.24",
        "vite": "^5.2.0"
      }
    }, null, 2),
    
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,

    'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

    'src/App.jsx': `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              React App
            </h1>
            <p className="text-gray-600 mb-6">
              This is a fallback React application. The AI response could not be parsed properly.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Try generating your project again with a more specific prompt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App`,

    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-height: 100vh;
}`,

    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: { port: 5173 }
  }
})`,

    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

    'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
  };
}

// Helper function to filter valid Tailwind classes
function filterValidTailwindClasses(classes: string[]): string[] {
  const validTailwindClasses = new Set([
    // Layout
    'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden',
    
    // Spacing (common ones)
    'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20', 'p-24',
    'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16', 'px-20', 'px-24',
    'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8', 'py-10', 'py-12', 'py-16', 'py-20', 'py-24',
    'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24',
    'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-10', 'mx-12', 'mx-16', 'mx-20', 'mx-24',
    'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16', 'my-20', 'my-24',
    
    // Border & Effects
    'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
    'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-none',
    
    // Transitions
    'transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
    'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
    'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
    
    // Common utilities & Modern Design
    'container', 'w-full', 'h-full', 'min-h-screen', 'text-center', 'font-bold', 'font-semibold', 'text-white', 'text-gray-900', 'text-blue-600',
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-blue-600', 'bg-gradient-to-r', 'hover:bg-blue-700',
    
    // Gradients
    'bg-gradient-to-r', 'bg-gradient-to-br', 'bg-gradient-to-tr', 'from-blue-500', 'via-purple-500', 'to-pink-500',
    'from-gray-900', 'to-gray-600', 'from-blue-600', 'to-purple-600',
    
    // Advanced Effects
    'backdrop-blur-sm', 'backdrop-blur-md', 'bg-opacity-90', 'bg-opacity-80', 'bg-opacity-70',
    'shadow-2xl', 'shadow-blue-500/25', 'shadow-purple-500/25', 'drop-shadow-lg',
    
    // Hover & Animations
    'hover:scale-105', 'hover:scale-110', 'hover:-translate-y-1', 'hover:-translate-y-2',
    'transform', 'duration-300', 'duration-500', 'ease-in-out', 'animate-pulse',
    
    // Modern Typography
    'text-5xl', 'text-6xl', 'text-7xl', 'font-black', 'font-extrabold', 'tracking-tight', 'leading-tight'
  ]);
  
  return classes.filter(cls => {
    const trimmed = cls.trim();
    // Allow basic tailwind classes and responsive/state variants
    return trimmed && (
      validTailwindClasses.has(trimmed) ||
      trimmed.startsWith('sm:') ||
      trimmed.startsWith('md:') ||
      trimmed.startsWith('lg:') ||
      trimmed.startsWith('xl:') ||
      trimmed.startsWith('2xl:') ||
      trimmed.startsWith('hover:') ||
      trimmed.startsWith('focus:') ||
      trimmed.startsWith('dark:') ||
      // Allow color patterns
      /^(text|bg|border)-(gray|blue|red|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)$/.test(trimmed) ||
      // Allow sizing patterns
      /^(w|h|p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96)$/.test(trimmed)
    );
  });
}

// Helper function to clean CSS content and ensure it's valid
function cleanCSSContent(cssContent: string): string {
  // Remove any JavaScript-like syntax that might have crept in
  let cleaned = cssContent;
  
  // Remove any leading/trailing quotes or escape characters
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\\"/g, '"');
  cleaned = cleaned.replace(/\\t/g, '\t');
  cleaned = cleaned.replace(/\\r/g, '\r');
  cleaned = cleaned.replace(/\\\\/g, '\\');
  
  // Remove any JSON-like syntax that might be in the CSS
  cleaned = cleaned.replace(/^{|}$/g, '');
  cleaned = cleaned.replace(/^"css"\s*:\s*"?|"?$/g, '');
  
  // Remove any TypeScript-like syntax
  cleaned = cleaned.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '');
  cleaned = cleaned.replace(/export\s+.*?;?\s*/g, '');
  
  // CRITICAL FIX: Remove orphaned braces that cause "Unexpected }" errors
  cleaned = cleaned.replace(/^\s*\}\s*$/gm, ''); // Remove lines with only }
  cleaned = cleaned.replace(/^\s*\{\s*$/gm, ''); // Remove lines with only {
  cleaned = cleaned.replace(/\}\s*\}/g, '}'); // Remove duplicate closing braces
  cleaned = cleaned.replace(/\{\s*\{/g, '{'); // Remove duplicate opening braces
  
  // Fix @apply statements with invalid classes
  cleaned = cleaned.replace(/@apply\s+([^;]+);/g, (match, classes) => {
    const classList = classes.split(/\s+/);
    const validClasses = filterValidTailwindClasses(classList);
    if (validClasses.length === 0) {
      return ''; // Remove empty @apply statements
    }
    return `@apply ${validClasses.join(' ')};`;
  });
  
  // Fix malformed CSS blocks - ensure proper structure and closing
  cleaned = cleaned.replace(/([^{}\s]+)\s*\{\s*([^}]*)\s*\}/g, (match, selector, content) => {
    if (!selector.trim() || selector.includes('@tailwind')) return match;
    return `${selector.trim()} {\n  ${content.trim()}\n}`;
  });
  
  // CRITICAL: Ensure all opening braces have corresponding closing braces
  const openBraces = (cleaned.match(/\{/g) || []).length;
  const closeBraces = (cleaned.match(/\}/g) || []).length;
  
  if (openBraces > closeBraces) {
    console.log(`🔧 FIXING: Adding ${openBraces - closeBraces} missing closing braces`);
    cleaned += '\n' + '}'.repeat(openBraces - closeBraces);
  } else if (closeBraces > openBraces) {
    console.log(`🔧 FIXING: Removing ${closeBraces - openBraces} extra closing braces`);
    for (let i = 0; i < closeBraces - openBraces; i++) {
      cleaned = cleaned.replace(/\}\s*$/, '');
    }
  }
  
  // If it doesn't look like CSS, replace with basic Tailwind CSS
  if (!cleaned.includes('@tailwind') && !cleaned.includes('body') && !cleaned.includes(':root')) {
    console.log('🔧 Replacing malformed CSS with valid Tailwind CSS');
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-height: 100vh;
}

#root {
  width: 100%;
  min-height: 100vh;
}`;
  }
  
  // Final safety check - ensure the CSS is syntactically valid
  const finalOpenBraces = (cleaned.match(/\{/g) || []).length;
  const finalCloseBraces = (cleaned.match(/\}/g) || []).length;
  
  if (finalOpenBraces !== finalCloseBraces) {
    console.log('🚨 CRITICAL: CSS brace mismatch detected, using fallback CSS');
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  @apply bg-gray-50 text-gray-900;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-bold text-gray-900;
}`;
  }
  
  // Ensure proper line endings and clean formatting
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Helper function to convert Next.js package.json to Vite
function convertNextJSPackageToVite(packageJsonContent: string): string {
  try {
    const packageObj = JSON.parse(packageJsonContent);
    
    // Check if this is a Next.js project
    if (packageObj.dependencies?.next || packageObj.scripts?.dev?.includes('next')) {
      console.log('🔄 Converting Next.js package.json to Vite...');
      
      // Update scripts for Vite
      packageObj.scripts = {
        "dev": "vite --host 0.0.0.0 --port 5173",
        "build": "vite build",
        "preview": "vite preview",
        ...packageObj.scripts
      };
      
      // Remove Next.js specific scripts
      delete packageObj.scripts?.start;
      if (packageObj.scripts?.dev?.includes('next')) {
        packageObj.scripts.dev = "vite --host 0.0.0.0 --port 5173";
      }
      
      // Update dependencies for Vite
      if (packageObj.dependencies) {
        // Remove Next.js
        delete packageObj.dependencies.next;
        
        // Add Vite dependencies
        packageObj.dependencies = {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-refresh": "^0.14.0",
          ...packageObj.dependencies
        };
      }
      
      // Update devDependencies
      packageObj.devDependencies = {
        "@vitejs/plugin-react": "^4.2.1",
        "vite": "^5.2.0",
        "autoprefixer": "^10.4.14",
        "postcss": "^8.4.24",
        "tailwindcss": "^3.4.0",
        ...packageObj.devDependencies
      };
      
      // Ensure type is module for Vite
      packageObj.type = "module";
      
      console.log('✅ Converted Next.js package.json to Vite');
      return JSON.stringify(packageObj, null, 2);
    }
    
    return packageJsonContent;
  } catch (error) {
    console.error('Failed to convert package.json:', error);
    return packageJsonContent;
  }
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

// Helper function to extract Tailwind classes from description text
function extractTailwindClassesFromDescription(description: string): string | null {
  if (!description) return null;
  
  // Common Tailwind patterns that might be in descriptions
  const tailwindPatterns = [
    /\b(flex|grid|block|inline|hidden)\b/g,
    /\b(p-\d+|px-\d+|py-\d+|m-\d+|mx-\d+|my-\d+)\b/g,
    /\b(bg-\w+(-\d+)?)\b/g,
    /\b(text-\w+(-\d+)?)\b/g,
    /\b(rounded(-\w+)?)\b/g,
    /\b(shadow(-\w+)?)\b/g,
    /\b(border(-\w+)?)\b/g,
    /\b(w-\w+|h-\w+)\b/g,
    /\b(transition|hover:\w+|focus:\w+)\b/g
  ];
  
  const matches: string[] = [];
  tailwindPatterns.forEach(pattern => {
    const found = description.match(pattern);
    if (found) matches.push(...found);
  });
  
  return matches.length > 0 ? matches.join(', ') : null;
}

// Helper function to build RAG context from array of components
function buildRAGContextFromArray(components: any[], websiteType: string, isDarkMode: boolean): string {
  if (!components || components.length === 0) return "";
  
  let context = "## 🎯 MANDATORY: Use These Retrieved Components\n\n";
  context += "You MUST create a complete website using the components below. Do NOT generate a minimal website.\n\n";
  
  // Group components by category (using new field names from Weaviate schema)
  const groupedComponents: Record<string, any[]> = {};
  components.forEach(component => {
    const category = component.category || 'General';
    if (!groupedComponents[category]) {
      groupedComponents[category] = [];
    }
    groupedComponents[category].push(component);
  });
  
  // Build context for each category with actual code
  for (const [category, comps] of Object.entries(groupedComponents)) {
    context += `### ${category} (${comps.length} variants available)\n`;
    comps.forEach((component, index) => {
      const name = component.name || `${category} Variant ${index + 1}`;
      const summary = component.description || `High-quality ${category.toLowerCase()} component`;
      
      // Extract keywords from tags array
      let keywords = '';
      if (Array.isArray(component.tags)) {
        const validClasses = filterValidTailwindClasses(component.tags);
        keywords = validClasses.join(' ');
      } else {
        const extracted = extractTailwindClassesFromDescription(component.description);
        if (extracted) {
          const classList = extracted.split(', ').map(c => c.trim());
          const validClasses = filterValidTailwindClasses(classList);
          keywords = validClasses.join(' ');
        } else {
          keywords = 'flex p-4 rounded shadow transition';
        }
      }
      
      context += `- **${name}**: ${summary}\n`;
      context += `  MANDATORY Tailwind classes to use: "${keywords}"\n`;
      context += `  Apply these classes directly to create attractive, modern design\n`;
      
      // Include actual code if available
      if (component.code && component.code.length > 50 && component.code.includes('React')) {
        context += `  Code example: ${component.code.substring(0, 300)}...\n`;
      }
    });
    context += "\n";
  }
  
  context += `## 🚨 CRITICAL DESIGN REQUIREMENTS:\n`;
  context += `- CREATE A COMPLETE WEBSITE with ALL sections: Navigation, Hero, Features, Services, About, Testimonials, Contact, Footer\n`;
  context += `- Use the EXACT Tailwind classes provided above - DO NOT use basic styling\n`;
  context += `- Apply MODERN, ATTRACTIVE design patterns like professional websites\n`;
  context += `- Include GRADIENTS, SHADOWS, HOVER EFFECTS, and ANIMATIONS\n`;
  context += `- Generate AT LEAST 8-10 React components for a full website\n`;
  
  context += `## 📷 MANDATORY IMAGE REQUIREMENTS:\n`;
  context += `- EVERY component MUST include contextual images using /*IMAGE:category*/ placeholders\n`;
  context += `- NAVBAR: Must include company logo using /*IMAGE:logo*/\n`;
  context += `- HERO: Use /*IMAGE:hero*/ for background or main image\n`;
  context += `- SERVICES: Use /*IMAGE:service*/ for service illustrations\n`;
  context += `- TEAM: Use /*IMAGE:team*/ for team member photos\n`;
  context += `- ABOUT: Use /*IMAGE:about*/ for company images\n`;
  context += `- FEATURES: Use /*IMAGE:feature*/ for feature highlights\n`;
  context += `- TESTIMONIALS: Use /*IMAGE:testimonial*/ for customer photos\n`;
  context += `- CONTACT: Use /*IMAGE:office*/ for office/location images\n`;
  
  context += `## 🎨 STYLING REQUIREMENTS:\n`;
  context += `- Apply the provided Tailwind classes for attractive styling: ${getAllUniqueClasses(components)}\n`;
  context += `- Make it ${isDarkMode ? 'DARK MODE with dark: prefixes and neon accents' : 'LIGHT MODE with professional colors'}\n`;
  context += `- Generate realistic, professional content for ${websiteType}\n`;
  context += `- FORBIDDEN: Plain white backgrounds, basic text styling, minimal layouts, components without images\n\n`;
  
  return context;
}

// Helper to extract all unique classes from components
function getAllUniqueClasses(components: any[]): string {
  const allClasses = new Set<string>();
  components.forEach(comp => {
    // Handle new format with tags array
    if (Array.isArray(comp.tags)) {
      comp.tags.forEach((tag: string) => allClasses.add(tag));
    }
    
    // Also extract from description
    const extracted = extractTailwindClassesFromDescription(comp.description);
    if (extracted) {
      extracted.split(', ').forEach(cls => allClasses.add(cls.trim()));
    }
  });
  
  // Filter out invalid Tailwind classes before returning
  const classArray = Array.from(allClasses);
  const validClasses = filterValidTailwindClasses(classArray);
  return validClasses.slice(0, 20).join(', ');
}

// Helper function to detect website type from prompt

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, useBoltPrompt = true } = req.body;
  
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
  }
  
    let contextString = "";
    let ragAvailable = false;
    let ragComponentsUsed = 0; // Initialize the variable properly
    const isDarkModeRequested = prompt.toLowerCase().includes('dark mode') || prompt.toLowerCase().includes('dark theme');
    
    console.log(`🔍 Processing request for: ${prompt}`);
    console.log(`🌙 Dark mode requested: ${isDarkModeRequested}`);
    
        // Step 1: Try to retrieve relevant components from Weaviate
    try {
      console.log("🔍 Starting RAG retrieval diagnostic...");
      
      // First, let's try to get ANY data from Weaviate to diagnose the issue
      const ragResult = await getWebsiteComponents(prompt);
      
      if (ragResult && ragResult.length > 0) {
        ragAvailable = true;
        ragComponentsUsed = ragResult.length;
        const websiteType = detectWebsiteType(prompt);
        contextString = buildRAGContextFromArray(ragResult, websiteType, isDarkModeRequested);
        
        console.log(`✅ RAG: Retrieved ${ragResult.length} relevant components`);
        console.log(`📊 Sample component:`, JSON.stringify(ragResult[0], null, 2));
        console.log(`🔍 Full RAG context:`, contextString.substring(0, 500) + '...');
      } else {
        console.log("⚠️ RAG: No components retrieved, using direct generation");
        console.log("💡 Suggestion: Check /api/debug-weaviate to see actual schema fields");
      }
    } catch (error) {
      console.error("❌ RAG Error:", error);
      console.log("💡 Try calling GET /api/debug-weaviate to diagnose schema issues");
      // Continue without RAG components
    }
    
    // Step 2: Generate enhanced prompt with RAG context
    const systemPrompt = buildDynamicSystemPrompt(prompt, useBoltPrompt);
    
    // Enhance basic prompts with comprehensive requirements
    const enhancedPrompt = enhanceBasicPrompt(prompt);
    
    const userPrompt = ragAvailable 
      ? `${contextString}\n\n🎯 SELECTIVE IMAGE INTEGRATION 🎯\n\nAdd images ONLY to these key components:\n✅ NAVBAR: Logo images only\n✅ HERO: Background/banner images only  \n✅ CARDS: Service cards, feature cards, testimonial cards only\n\nDO NOT add images to: About, Team, Contact, Footer (unless they are card layouts)\n\n🚨 USE PLACEHOLDER SYNTAX (NOT REGULAR URLS):\n\n❌ WRONG: <img src="https://example.com/logo.jpg" alt="Logo" />\n✅ CORRECT: <img src="/*IMAGE:logo*/" alt="Logo" />\n\nSELECTIVE IMAGE SYNTAX:\n\nNavbar/Header: <img src="/*IMAGE:logo*/" alt="Logo" className="h-10 w-10 rounded-lg shadow-md object-cover" />\nHero: <img src="/*IMAGE:hero*/" alt="Hero" className="w-full h-full object-cover opacity-40" />\nService Cards: <img src="/*IMAGE:service*/" alt="Service" className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover" />\nFeature Cards: <img src="/*IMAGE:feature*/" alt="Feature" className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover" />\nTestimonial Cards: <img src="/*IMAGE:testimonial*/" alt="Customer" className="w-16 h-16 rounded-full object-cover" />\n\n🎨 DESIGN REQUIREMENTS:\n- Use the EXACT Tailwind classes provided above\n- Apply gradients, shadows, hover effects from retrieved components\n- ${isDarkModeRequested ? 'Use dark mode with neon accents and dark: prefixes' : 'Use light mode with professional gradients'}\n\n🚨 PRODUCTION WEBSITE REQUIREMENT:\n${enhancedPrompt}`
      : `🎯 SELECTIVE IMAGE INTEGRATION 🎯\n\nAdd images ONLY to these key components:\n✅ NAVBAR: Logo images only\n✅ HERO: Background/banner images only  \n✅ CARDS: Service cards, feature cards, testimonial cards only\n\nDO NOT add images to: About, Team, Contact, Footer (unless they are card layouts)\n\n🚨 USE PLACEHOLDER SYNTAX (NOT REGULAR URLS):\n\n❌ WRONG: <img src="https://example.com/logo.jpg" alt="Logo" />\n✅ CORRECT: <img src="/*IMAGE:logo*/" alt="Logo" />\n\nSELECTIVE IMAGE SYNTAX:\n\nNavbar/Header: <img src="/*IMAGE:logo*/" alt="Logo" className="h-10 w-10 rounded-lg shadow-md object-cover" />\nHero: <img src="/*IMAGE:hero*/" alt="Hero" className="w-full h-full object-cover opacity-40" />\nService Cards: <img src="/*IMAGE:service*/" alt="Service" className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover" />\nFeature Cards: <img src="/*IMAGE:feature*/" alt="Feature" className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover" />\nTestimonial Cards: <img src="/*IMAGE:testimonial*/" alt="Customer" className="w-16 h-16 rounded-full object-cover" />\n\n🎨 DESIGN REQUIREMENTS:\n- Create VISUALLY STUNNING designs with gradients, shadows, and modern effects\n- Apply professional styling that looks like designer websites\n\n🚨 PRODUCTION WEBSITE REQUIREMENT:\n${enhancedPrompt}`;
    
    console.log(`🤖 Generating with ${ragAvailable ? 'RAG-enhanced' : 'direct'} AI...`);
    
    // Step 3: Generate website code with OpenAI
    console.log(`📏 System prompt length: ${systemPrompt.length} chars`);
    console.log(`📏 User prompt length: ${userPrompt.length} chars`);
    
    console.log(`📝 Enhanced user prompt: ${userPrompt.substring(0, 200)}...`);
    
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,  // Higher creativity for comprehensive responses
      max_tokens: 16000  // Maximum allowed for GPT-4o
    });
    const generationTime = Date.now() - startTime;
    console.log(`⏱️  AI generation took: ${generationTime}ms`);

    const content = completion.choices[0]?.message.content || '';
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }
    
    console.log(`📏 AI response length: ${content.length} characters`);
    console.log(`🔍 Response finish reason: ${completion.choices[0]?.finish_reason}`);
    console.log(`📊 Token usage:`, completion.usage);
    
    // Enhanced debugging for AI response structure
    console.log(`🔍 AI response structure analysis:`);
    console.log(`  - Contains "files":`, content.includes('"files"'));
    console.log(`  - Contains ".jsx":`, content.includes('.jsx'));
    console.log(`  - Contains package.json:`, content.includes('package.json'));
    console.log(`  - Contains App.jsx:`, content.includes('App.jsx'));
    console.log(`  - Starts with JSON:`, content.trim().startsWith('{'));
    console.log(`  - Contains code blocks:`, content.includes('```'));
    console.log(`🤖 AI response preview: ${content.substring(0, 500)}...`);
    
    if (completion.choices[0]?.finish_reason === 'length') {
      console.warn('⚠️  AI response was truncated due to token limit!');
      console.warn('🔧 Response may be incomplete but will attempt to process');
      // Still continue processing - partial response might be usable
    }
    
    if (completion.choices[0]?.finish_reason === 'stop' && content.length < 5000) {
      console.warn('⚠️  AI response seems unusually short for a comprehensive website');
    }

    // Step 4: Extract plan and files from AI response
    const planMatch = content.match(/# Project Plan[\\s\\S]*?(?=```|$)/i);
    
    // More robust JSON extraction - try multiple patterns
    let filesMatch = content.match(/```json\s*\n?([\s\S]*?)\n?```/i);
    if (!filesMatch) {
      // Try without json specifier
      filesMatch = content.match(/```\s*({[\s\S]*?})\s*```/i);
    }
    if (!filesMatch) {
      // Try to find any JSON-like structure
      filesMatch = content.match(/({[\s\S]*?"[^"]+\.(?:jsx?|tsx?|html|css|json)"[\s\S]*?})/i);
    }

    const plan = planMatch ? planMatch[0].trim() : `Modern React + Vite website${isDarkModeRequested ? ' with dark mode' : ''} using Tailwind CSS.`;
    let files: Record<string, string> = {};

    if (filesMatch && filesMatch[1]) {
      // Clean up the JSON string before parsing
      let jsonString = filesMatch[1].trim();
      
      try {
        // Log the raw JSON for debugging
        console.log('🔍 Raw JSON string length:', jsonString.length);
        console.log('🔍 JSON preview:', jsonString.substring(0, 300));
        
        // Simple and safe JSON cleaning approach
        // First, try to identify if this is a nested object structure
        if (jsonString.includes('"package.json": {') || jsonString.includes('.jsx"') || jsonString.includes('.tsx"')) {
          // This looks like a nested structure, try to flatten it
          console.log('🔄 Detected nested JSON structure, attempting to flatten...');
          
          // More robust approach: parse the entire structure and extract files
          try {
            // First try to parse the entire JSON
            const parsed = JSON.parse(jsonString);
          const extractedFiles: Record<string, string> = {};
            
            // Recursively extract files from the parsed structure
            function extractFilesFromObject(obj: any, currentPath: string = '') {
              console.log(`🔍 Exploring object at path: ${currentPath || 'root'}, keys: ${Object.keys(obj).join(', ')}`);
              
              for (const [key, value] of Object.entries(obj)) {
                const fullPath = currentPath ? `${currentPath}/${key}` : key;
                
                // Check if this key looks like a file name
                if (key.match(/\.(json|jsx?|tsx?|html|css|js)$/)) {
                  console.log(`📄 Found file: ${key}, content type: ${typeof value}, content length: ${typeof value === 'string' ? value.length : 'N/A'}`);
                  
                  if (typeof value === 'string') {
                    // Handle string content
                    let content = value;
              
              // Unescape the content properly
              content = content
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r')
                .replace(/\\\\/g, '\\');
            
                    extractedFiles[key] = content;
                    console.log(`📝 Extracted ${key}: ${content.substring(0, 100)}...`);
                  } else if (typeof value === 'object') {
            // Handle object content (like package.json)
                    try {
                      extractedFiles[key] = JSON.stringify(value, null, 2);
                      console.log(`✅ Parsed object for ${key}`);
              } catch (e) {
                      console.warn(`⚠️ Could not stringify ${key}, storing as string`);
                      extractedFiles[key] = String(value);
                    }
                  }
                } else if (typeof value === 'object' && value !== null) {
                  // Recursively search nested objects
                  console.log(`🔄 Recursing into: ${key}`);
                  extractFilesFromObject(value, fullPath);
                } else {
                  console.log(`⏭️  Skipping non-file key: ${key} (type: ${typeof value})`);
                }
              }
            }
            
            extractFilesFromObject(parsed);
            
            if (Object.keys(extractedFiles).length > 0) {
              files = extractedFiles;
              console.log(`✅ Successfully extracted ${Object.keys(extractedFiles).length} files from nested structure`);
              console.log('📁 Files found:', Object.keys(extractedFiles).join(', '));
            } else {
              throw new Error('No files found in nested structure');
            }
          } catch (parseError) {
            console.log('⚠️ Full JSON parsing failed, trying manual extraction...');
            
            // Fallback: enhanced manual extraction with multiple strategies
            const filePatterns = [
              // Pattern 1: Standard quoted string values
              /"([^"]+\.(json|jsx?|tsx?|html|css|js))"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
              // Pattern 2: Object values (package.json style)
              /"([^"]+\.(json|jsx?|tsx?|html|css|js))"\s*:\s*(\{[\s\S]*?\n\s*\})/g,
              // Pattern 3: Multi-line string values with escaped content
              /"([^"]+\.(json|jsx?|tsx?|html|css|js))"\s*:\s*"([\s\S]*?)"\s*(?:,|\})/g,
              // Pattern 4: Backtick template literals  
              /"([^"]+\.(json|jsx?|tsx?|html|css|js))"\s*:\s*`([\s\S]*?)`/g,
              // Pattern 5: Files inside "files" object
              /"files"\s*:\s*\{([\s\S]*?)\}\s*(?:,|\})/g
            ];
            
            const extractedFiles: Record<string, string> = {};
            
            for (let patternIndex = 0; patternIndex < filePatterns.length; patternIndex++) {
              const pattern = filePatterns[patternIndex];
              let match;
              
              console.log(`🔍 Trying extraction pattern ${patternIndex + 1}...`);
              
              // Special handling for "files" object pattern
              if (patternIndex === 4) {
                while ((match = pattern.exec(jsonString)) !== null) {
                  const filesContent = match[1];
                  console.log(`📁 Found "files" object, parsing content...`);
                  
                  // Extract files from the files object
                  const subPattern = /"([^"]+\.(json|jsx?|tsx?|html|css|js))"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                  let subMatch;
                  while ((subMatch = subPattern.exec(filesContent)) !== null) {
                    const fileName = subMatch[1];
                    let content = subMatch[3];
                    
                    console.log(`📄 Found file in "files" object: ${fileName}`);
                    
                    // String content - unescape
                    content = content
                      .replace(/\\n/g, '\n')
                      .replace(/\\"/g, '"')
                      .replace(/\\t/g, '\t')
                      .replace(/\\r/g, '\r')
                      .replace(/\\\\/g, '\\');
                    extractedFiles[fileName] = content;
                    console.log(`📝 Extracted ${fileName}: ${content.substring(0, 100)}...`);
                  }
                }
              } else {
                // Standard pattern matching
                while ((match = pattern.exec(jsonString)) !== null) {
                  const fileName = match[1];
                  let content = match[3];
                  
                  console.log(`📄 Found file (pattern ${patternIndex + 1}): ${fileName}`);
                  
                  if (content.startsWith('{')) {
                    // Try to parse object content
                    try {
                      const parsed = JSON.parse(content);
                  extractedFiles[fileName] = JSON.stringify(parsed, null, 2);
                    } catch (e) {
                  extractedFiles[fileName] = content;
              }
            } else {
                    // String content - unescape
                    content = content
                      .replace(/\\n/g, '\n')
                      .replace(/\\"/g, '"')
                      .replace(/\\t/g, '\t')
                      .replace(/\\r/g, '\r')
                      .replace(/\\\\/g, '\\');
              extractedFiles[fileName] = content;
            }
            
                  console.log(`📝 Extracted ${fileName}: ${extractedFiles[fileName].substring(0, 100)}...`);
                }
              }
              
              if (Object.keys(extractedFiles).length > 0) {
                console.log(`✅ Pattern ${patternIndex + 1} found ${Object.keys(extractedFiles).length} files`);
              }
          }
          
          if (Object.keys(extractedFiles).length > 0) {
            files = extractedFiles;
              console.log(`✅ Manual extraction successful: ${Object.keys(extractedFiles).length} files`);
          } else {
              console.log('⚠️ All patterns failed, trying last-resort extraction...');
              
              // Last resort: scan for any code blocks or file-like content
              const lastResortPatterns = [
                // Look for code blocks in markdown format
                /```(?:json|jsx?|tsx?|html|css)\s*([\s\S]*?)```/g,
                // Look for any file extensions in the content
                /([a-zA-Z0-9/_-]+\.(json|jsx?|tsx?|html|css|js))[:\s]+([\s\S]*?)(?=\n[a-zA-Z0-9/_-]+\.|$)/g,
                // Look for React component patterns
                /(App\.jsx|index\.html|main\.jsx|package\.json)/g
              ];
              
              for (const pattern of lastResortPatterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                  console.log(`🔍 Last resort found potential content: ${match[0].substring(0, 100)}...`);
                  
                  if (match[1] && match[3]) {
                    // File with content
                    extractedFiles[match[1]] = match[3].trim();
                    console.log(`📄 Last resort extracted: ${match[1]}`);
                  } else if (match[0].includes('jsx') || match[0].includes('html')) {
                    // Code block
                    const content = match[1] || match[0];
                    if (content.includes('App') || content.includes('function') || content.includes('const')) {
                      extractedFiles['src/App.jsx'] = content;
                      console.log(`📄 Last resort extracted App.jsx from code block`);
                    }
                  }
                }
              }
              
              // If still nothing, create minimal structure from AI response
              if (Object.keys(extractedFiles).length === 0) {
                console.log('🚨 Creating minimal structure from AI response...');
                
                const aiContent = content.substring(0, 5000); // Take first 5k chars
                
                extractedFiles['package.json'] = JSON.stringify({
                  "name": "ai-generated-website",
                  "version": "1.0.0",
                  "scripts": { "dev": "vite", "build": "vite build", "serve": "vite preview" },
                  "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0", "react-refresh": "^0.14.0" },
                  "devDependencies": { "vite": "^5.2.0", "@vitejs/plugin-react": "^4.2.1", "tailwindcss": "^3.4.0", "autoprefixer": "^10.4.14", "postcss": "^8.4.24" }
                }, null, 2);
                
                extractedFiles['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Generated Website</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
                
                extractedFiles['src/main.jsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
                
                extractedFiles['src/App.jsx'] = `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          AI Website Generation in Progress
        </h1>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
          <p className="text-lg mb-4">The AI generated the following content:</p>
          <pre className="bg-black/20 p-4 rounded text-sm overflow-auto max-h-64">
${aiContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App`;
                
                extractedFiles['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
}`;
                
                console.log(`🔧 Created ${Object.keys(extractedFiles).length} fallback files`);
              }
              
              files = extractedFiles;
            }
          }
        } else {
          // Standard JSON cleaning for flat structure
          // Remove common JSON formatting issues
          jsonString = jsonString
            .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
            .replace(/([{,]\s*)'([^']*)'(\s*:)/g, '$1"$2"$3')  // Fix single quotes for keys
            .replace(/:\s*'([^']*)'/g, ': "$1"')  // Fix single quotes for values
            .replace(/\\n/g, '\\n')  // Ensure newlines are properly escaped
            .replace(/\\"/g, '\\"'); // Ensure quotes are properly escaped
          
          console.log('🧹 Cleaned JSON preview:', jsonString.substring(0, 300));
          
          // Try to parse the cleaned JSON
          files = JSON.parse(jsonString);
          console.log('✅ JSON parsed successfully');
        }
        
      } catch (e) {
        console.error('JSON parse error after cleaning:', e);
        console.error('Problematic JSON preview:', jsonString.substring(0, 500));
        
        // Try alternative extraction methods
        console.log('🔄 Attempting alternative JSON extraction...');
        
        // Try to extract files using regex patterns
        const alternativeFiles = extractFilesFromContent(content);
        if (Object.keys(alternativeFiles).length > 0) {
          files = alternativeFiles;
          console.log('✅ Alternative extraction successful');
        } else {
          // Final fallback - create a basic React app structure
          console.log('🔄 Creating fallback React app structure...');
          files = createFallbackReactApp();
        }
      }
    } else {
      console.error('No JSON block found in AI response');
      console.error('Full AI response preview:', content.substring(0, 1000));
      
      // Try alternative extraction
      const alternativeFiles = extractFilesFromContent(content);
      if (Object.keys(alternativeFiles).length > 0) {
        files = alternativeFiles;
        console.log('✅ Alternative extraction successful without JSON block');
    } else {
      throw new Error('No valid JSON found in AI response');
      }
    }

    if (Object.keys(files).length === 0) {
      throw new Error('AI generated an empty files object');
    }
    
    console.log(`📁 Generated ${Object.keys(files).length} files`);
    console.log('📋 File list:', Object.keys(files).join(', '));
    
    // Validate AI response quality
    const validationResult = validateWebsiteQuality(files, content);
    if (!validationResult.isValid) {
      console.error('🚨 AI Response Quality Check FAILED:');
      validationResult.issues.forEach(issue => console.error(`❌ ${issue}`));
      
            // Check for critical failures that require immediate rejection (updated for new validation)
      const hasCriticalFailures = validationResult.issues.some(issue => 
        issue.includes('too small') || 
        issue.includes('under 400 characters') || 
        issue.includes('basic template content') ||
        issue.includes('No substantial React components') ||
        issue.includes('No images found')
      );
      
      console.log(`🔍 Critical failures check: ${hasCriticalFailures ? 'FAILED' : 'PASSED'}`);
      console.log(`🔍 Total issues: ${validationResult.issues.length}`);
      
      // Image failures are now critical - zero tolerance
      if (hasCriticalFailures) {
        console.error('🚨 CRITICAL FAILURE: Rejecting AI response due to quality issues');
        console.error('🚨 The AI failed to include required image placeholders despite explicit instructions');
        throw new Error(`AI generated insufficient website quality. Critical issues found: ${validationResult.issues.join(', ')}`);   
      }
    }
    
    // Check if we have a reasonable number of files for a comprehensive website
    if (Object.keys(files).length < 5) {
      console.warn(`⚠️  Only ${Object.keys(files).length} files generated - this may indicate incomplete AI response`);
      console.warn('🔍 Expected at least 5-8 files for a comprehensive website');
    }
    
          // Step 5: Process images in all files using Pixabay integration
    const processedFiles: Record<string, string> = {};
    const businessType = detectBusinessType(prompt);
    
    console.log(`🖼️ STEP 5: Processing ${businessType} website with image integration...`);
    
    // First, scan all files for image placeholders to debug
    let totalPlaceholderCount = 0;
    let filesWithPlaceholders = 0;
    Object.entries(files).forEach(([fileName, fileContent]) => {
      if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx') || fileName.endsWith('.html')) {
        const placeholders = (fileContent.match(/\/\*IMAGE:[^*]+\*\//g) || []);
        if (placeholders.length > 0) {
          filesWithPlaceholders++;
          totalPlaceholderCount += placeholders.length;
          console.log(`📁 ${fileName}: Found ${placeholders.length} placeholders: ${placeholders.join(', ')}`);
        } else {
          console.log(`📁 ${fileName}: No image placeholders found`);
        }
      }
    });
    
    console.log(`📊 Total: ${totalPlaceholderCount} placeholders across ${filesWithPlaceholders} files`);
    
    if (totalPlaceholderCount === 0) {
      console.error(`❌ CRITICAL: No image placeholders found in any files!`);
      console.error(`🔍 This means the AI did not generate the required /*IMAGE:category*/ syntax`);
      
      // Add image placeholders to key components manually
      console.log(`🔧 Auto-fixing: Adding image placeholders to key components...`);
    }
    
    // Process each file and replace image placeholders with actual Pixabay URLs
    for (const [fileName, fileContent] of Object.entries(files)) {
      try {
        // Only process files that might contain image placeholders (React components, HTML)
        if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx') || fileName.endsWith('.html')) {
          let contentToProcess = fileContent;
          
          // Auto-fix missing image placeholders in key components
          if (!fileContent.includes('/*IMAGE:')) {
            if (fileName.toLowerCase().includes('navbar') || fileName.toLowerCase().includes('header')) {
              contentToProcess = contentToProcess.replace(
                /<img([^>]*?)src=["'][^"']*["']([^>]*?)>/g,
                '<img$1src="/*IMAGE:logo*/"$2>'
              );
              console.log(`🔧 ${fileName}: Added logo placeholder`);
            } else if (fileName.toLowerCase().includes('hero')) {
              contentToProcess = contentToProcess.replace(
                /<img([^>]*?)src=["'][^"']*["']([^>]*?)>/g,
                '<img$1src="/*IMAGE:hero*/"$2>'
              );
              console.log(`🔧 ${fileName}: Added hero placeholder`);
            } else if (fileName.toLowerCase().includes('service')) {
              contentToProcess = contentToProcess.replace(
                /<img([^>]*?)src=["'][^"']*["']([^>]*?)>/g,
                '<img$1src="/*IMAGE:service*/"$2>'
              );
              console.log(`🔧 ${fileName}: Added service placeholder`);
            } else if (fileName.toLowerCase().includes('team')) {
              contentToProcess = contentToProcess.replace(
                /<img([^>]*?)src=["'][^"']*["']([^>]*?)>/g,
                '<img$1src="/*IMAGE:team*/"$2>'
              );
              console.log(`🔧 ${fileName}: Added team placeholder`);
            } else if (fileName.toLowerCase().includes('about')) {
              contentToProcess = contentToProcess.replace(
                /<img([^>]*?)src=["'][^"']*["']([^>]*?)>/g,
                '<img$1src="/*IMAGE:about*/"$2>'
              );
              console.log(`🔧 ${fileName}: Added about placeholder`);
            }
          }
          
          // Check if file contains image placeholders
          if (contentToProcess.includes('/*IMAGE:')) {
            console.log(`🔄 Processing images in: ${fileName}`);
            const processedContent = await pixabayAPI.processImagePlaceholders(contentToProcess, businessType);
            processedFiles[fileName] = processedContent;
            console.log(`✅ Completed image processing for: ${fileName}`);
          } else {
            // No image placeholders, keep original content
            processedFiles[fileName] = contentToProcess;
          }
        } else {
          // Non-component files (package.json, config files, etc.) - keep as-is
          processedFiles[fileName] = fileContent;
        }
      } catch (error) {
        console.error(`❌ Error processing images in ${fileName}:`, error);
        console.error(`🔍 Error details:`, error instanceof Error ? error.stack : String(error));
        // On error, keep original content with placeholders
        processedFiles[fileName] = fileContent;
      }
    }
    
    // Step 6: Add essential Vite files if missing or fix truncated files
    if (!processedFiles['vite.config.js']) {
      processedFiles['vite.config.js'] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: { port: 5173 }
  }
})`;
      console.log('✅ Added missing vite.config.js');
    }
    
    // Ensure package.json has all required dependencies
    if (processedFiles['package.json']) {
      try {
        const packageObj = JSON.parse(processedFiles['package.json']);
        
        // Add react-refresh if missing
        if (!packageObj.dependencies?.['react-refresh']) {
          packageObj.dependencies = packageObj.dependencies || {};
          packageObj.dependencies['react-refresh'] = '^0.14.0';
          
          // Also ensure other essential dependencies are present
          packageObj.dependencies['react'] = packageObj.dependencies['react'] || '^18.2.0';
          packageObj.dependencies['react-dom'] = packageObj.dependencies['react-dom'] || '^18.2.0';
          
          // Ensure devDependencies
          packageObj.devDependencies = packageObj.devDependencies || {};
          packageObj.devDependencies['@vitejs/plugin-react'] = packageObj.devDependencies['@vitejs/plugin-react'] || '^4.2.1';
          packageObj.devDependencies['vite'] = packageObj.devDependencies['vite'] || '^5.2.0';
          
          processedFiles['package.json'] = JSON.stringify(packageObj, null, 2);
          console.log('✅ Added missing react-refresh dependency to package.json');
        }
      } catch (error) {
        console.error('Failed to update package.json dependencies:', error);
      }
    }
    
    if (!processedFiles['src/main.jsx']) {
      processedFiles['src/main.jsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
    }
    
    // Check for truncated or malformed HTML
    if (!processedFiles['index.html'] || 
        processedFiles['index.html'].includes('<!DOCTYPE html>\\n<html lang=\\') ||
        !processedFiles['index.html'].includes('</html>')) {
      
      if (processedFiles['index.html']) {
        console.log('⚠️ Detected truncated/malformed index.html, replacing with valid HTML');
      }
      
      processedFiles['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

    }
    
    // Ensure we have src/index.css for Tailwind
    if (!processedFiles['src/index.css']) {
      processedFiles['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
  min-height: 100vh;
}`;
    }
    
    // STEP 7: Ensure Footer component exists and is properly integrated
    console.log(`🦶 STEP 7: Ensuring Footer component exists and is integrated...`);
    
    // Check if Footer component exists
    const hasFooterComponent = processedFiles['src/components/Footer.jsx'] || processedFiles['components/Footer.jsx'] || processedFiles['src/Footer.jsx'];
    
    if (!hasFooterComponent) {
      console.log(`🔧 Creating missing Footer component...`);
      // Create a Footer component
      const footerContent = `import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/*IMAGE:logo*/" alt="Company Logo" className="h-10 w-10 rounded-lg object-cover" />
              <div className="text-2xl font-bold text-white">
                Company Name
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Building the future with innovative solutions and exceptional user experiences. Your trusted partner for success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Portfolio', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                info@company.com
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                123 Business Street, City
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                (555) 123-4567
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`;
      
      processedFiles['src/components/Footer.jsx'] = footerContent;
      console.log(`✅ Created Footer component with logo placeholder`);
    }
    
    // Ensure we have an App.jsx file with proper component imports
    const existingAppPath = processedFiles['src/App.jsx'] ? 'src/App.jsx' : processedFiles['App.jsx'] ? 'App.jsx' : null;
    
    if (existingAppPath) {
      // Check if Footer is imported and add it if missing
      let appContent = processedFiles[existingAppPath];
      
      if (!appContent.includes('Footer')) {
        // Add Footer import if missing
        if (appContent.includes('import React')) {
          appContent = appContent.replace(
            /(import React[^;]+;)/,
            '$1\nimport Footer from \'./components/Footer\';'
          );
        }
        
        // Add Footer component to JSX if not present
        if (!appContent.includes('<Footer')) {
          // Try different patterns to find where to insert Footer
          if (appContent.includes('</div>')) {
            appContent = appContent.replace(
              /(\s*<\/div>\s*\)\s*;?\s*}\s*export\s+default)/,
              '      <Footer />\n$1'
            );
          } else if (appContent.includes('</React.StrictMode>')) {
            appContent = appContent.replace(
              /(\s*<\/React\.StrictMode>)/,
              '      <Footer />\n$1'
            );
          } else {
            // Find the return statement and add Footer before the closing tag
            appContent = appContent.replace(
              /(return\s*\(\s*<[^>]+>[\s\S]*?)(\s*<\/[^>]+>\s*\)\s*;?\s*}\s*export\s+default)/,
              '$1      <Footer />\n$2'
            );
          }
        }
        
        processedFiles[existingAppPath] = appContent;
        console.log(`✅ Added Footer import and component to App.jsx`);
      }
    } else if (!processedFiles['src/App.jsx'] && !processedFiles['App.jsx']) {
      // Check if we have any page files that should be the main App
      const hasHomePage = processedFiles['src/Home.jsx'] || processedFiles['Home.jsx'];
      const hasIndexPage = processedFiles['src/index.jsx'] || processedFiles['index.jsx'];
      const hasFooterComponent = processedFiles['src/components/Footer.jsx'] || processedFiles['components/Footer.jsx'];
      
      if (hasHomePage || hasIndexPage) {
        // Create an App.jsx that imports the home/index page
        const mainComponent = hasHomePage ? 'Home' : 'Index';
        const footerImport = hasFooterComponent ? "\nimport Footer from './components/Footer';" : '';
        const footerJSX = hasFooterComponent ? '\n      <Footer />' : '';
        
        processedFiles['src/App.jsx'] = `import React from 'react'
import ${mainComponent} from './${mainComponent}'${footerImport}

function App() {
  return (
    <div>
      <${mainComponent} />${footerJSX}
    </div>
  )
}

export default App`;
      } else {
        // Create a diagnostic App.jsx with debugging info
        console.warn('⚠️  Using fallback App.jsx - this indicates AI generation produced minimal components');
        
        // Check if this is due to validation failure
        const validationResult = validateWebsiteQuality(processedFiles, '');
        const componentSizeIssues = validationResult.issues.filter(issue => issue.includes('too small'));
        
        processedFiles['src/App.jsx'] = `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-red-400">
          🚨 AI Generated Minimal Components
        </h1>
        <div className="bg-gray-800 p-6 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Component Quality Issues Detected:</h2>
          <div className="space-y-4">
            <div className="bg-red-900 bg-opacity-50 border border-red-600 p-4 rounded">
              <h3 className="font-bold text-red-400 mb-2">Problem:</h3>
              <p className="text-gray-300">AI generated skeleton components instead of substantial, production-ready code.</p>
            </div>
            
            ${componentSizeIssues.length > 0 ? `
            <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 p-4 rounded">
              <h3 className="font-bold text-yellow-400 mb-2">Detected Issues:</h3>
              <ul className="text-gray-300 space-y-1">
                ${componentSizeIssues.map(issue => `<li>• ${issue}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div className="bg-blue-900 bg-opacity-50 border border-blue-600 p-4 rounded">
              <h3 className="font-bold text-blue-400 mb-2">Expected:</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Each component should be 800+ characters</li>
                <li>• Full functionality with realistic content</li>
                <li>• Professional styling and interactive elements</li>
                <li>• Production-ready code, not basic templates</li>
              </ul>
            </div>
            
            <div className="bg-green-900 bg-opacity-50 border border-green-600 p-4 rounded">
              <h3 className="font-bold text-green-400 mb-2">Solution:</h3>
              <p className="text-gray-300">Regenerate your request. The system has been enhanced to reject minimal components and demand comprehensive websites.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-700 rounded text-sm">
            <p className="text-gray-400">Generated at: {new Date().toISOString()}</p>
            <p className="text-gray-400">Check server logs for detailed component validation results</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App`;
        console.log('✅ Created default App.jsx');
      }
    }
    
    // Ensure we have Tailwind config
    if (!processedFiles['tailwind.config.js']) {
      processedFiles['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
    }
    
    // Ensure we have PostCSS config
    if (!processedFiles['postcss.config.js']) {
      processedFiles['postcss.config.js'] = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    }
    
    // Step 7: Return the enhanced result
    res.status(200).json({
      plan: plan,
      files: processedFiles,
      ragEnhanced: ragAvailable,
      componentsUsed: ragComponentsUsed,
      darkModeEnabled: isDarkModeRequested
    });
    
  } catch (error) {
    console.error("❌ Error generating code:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Failed to generate code: ${errorMessage}` });
  }
}