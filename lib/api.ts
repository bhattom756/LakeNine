import { ChatResponse } from '../types/chat';

// This function simulates an API call to generate a project with AI
export async function generateProjectWithAI(prompt: string): Promise<ChatResponse> {
  // In a real implementation, this would make an API call to an AI service
  // For now, we'll simulate a response with pre-defined templates
  
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API latency
  
  // Better detection of requested technologies
  const lowerPrompt = prompt.toLowerCase();
  
  // Explicitly detect HTML/CSS/JS request
  const isBasicWeb = lowerPrompt.includes('html') && lowerPrompt.includes('css') && lowerPrompt.includes('js') || 
                     !lowerPrompt.includes('react') && !lowerPrompt.includes('next') && 
                     !lowerPrompt.includes('vue') && !lowerPrompt.includes('angular');
  
  // Only set isReact true if explicitly mentioned AND basic web is not requested
  const isReact = !isBasicWeb && lowerPrompt.includes('react');
  
  const isGymWebsite = lowerPrompt.includes('gym') || lowerPrompt.includes('fitness');
  const isTailwind = lowerPrompt.includes('tailwind');
  
  // Generate a plan based on the prompt
  const plan = generatePlan(isGymWebsite, isReact, isTailwind);
  
  // Generate files based on the prompt and plan
  const files = generateFiles(isGymWebsite, isReact, isTailwind);
  
  return {
    plan,
    files
  };
}

function generatePlan(isGym: boolean, isReact: boolean, isTailwind: boolean): string {
  const framework = isReact ? 'React' : 'vanilla HTML/CSS/JS';
  const styling = isTailwind ? 'Tailwind CSS' : 'custom CSS';
  const websiteType = isGym ? 'Gym/Fitness' : 'Generic';
  
  return `
# Project Plan for ${websiteType} Website

## Technology Stack
- Framework: ${framework}
- Styling: ${styling}
- Images: Dynamic images from Pexels API
- Font: Inter, Roboto

## File Structure
${isReact ? `
- public/
  - index.html
  - favicon.ico
  - manifest.json
- src/
  - components/
    - Navbar.${isReact ? 'jsx' : 'js'}
    - Hero.${isReact ? 'jsx' : 'js'}
    - Features.${isReact ? 'jsx' : 'js'}
    - Testimonials.${isReact ? 'jsx' : 'js'}
    - Pricing.${isReact ? 'jsx' : 'js'}
    - Contact.${isReact ? 'jsx' : 'js'}
    - Footer.${isReact ? 'jsx' : 'js'}
  - assets/
    - styles/
      - main.css
    - images/
      - logo.png
  - App.${isReact ? 'jsx' : 'js'}
  - index.${isReact ? 'jsx' : 'js'}
  - ${isTailwind ? 'tailwind.config.js' : ''}
` : `
- index.html
- css/
  - styles.css
- js/
  - main.js
  - nav.js
- assets/
  - images/
    - logo.png
`}

## Implementation Steps
1. Set up project structure
2. Create core components
3. Implement responsive layouts
4. Add dynamic content
5. Optimize for performance
`;
}

function generateFiles(isGym: boolean, isReact: boolean, isTailwind: boolean): Record<string, string> {
  const files: Record<string, string> = {};
  
  if (isReact) {
    // Add React files
    files['src/index.js'] = `
import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/main.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
    `;
    
    files['src/App.js'] = `
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
    `;
    
    // Add component files
    files['src/components/Navbar.jsx'] = `
import React, { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="${isTailwind ? 'bg-white shadow-md py-4 px-6 fixed w-full z-10' : 'navbar'}">
      <div className="${isTailwind ? 'flex justify-between items-center max-w-7xl mx-auto' : 'navbar-container'}">
        <div className="${isTailwind ? 'text-xl font-bold text-blue-600' : 'logo'}">
          ${isGym ? 'FitLife Gym' : 'Company Name'}
        </div>
        
        <div className="${isTailwind ? 'hidden md:flex space-x-8' : 'nav-links'}">
          <a href="#" className="${isTailwind ? 'text-gray-600 hover:text-blue-600' : 'nav-link'}">Home</a>
          <a href="#features" className="${isTailwind ? 'text-gray-600 hover:text-blue-600' : 'nav-link'}">Features</a>
          <a href="#testimonials" className="${isTailwind ? 'text-gray-600 hover:text-blue-600' : 'nav-link'}">Testimonials</a>
          <a href="#pricing" className="${isTailwind ? 'text-gray-600 hover:text-blue-600' : 'nav-link'}">Pricing</a>
          <a href="#contact" className="${isTailwind ? 'text-gray-600 hover:text-blue-600' : 'nav-link'}">Contact</a>
        </div>
        
        <button 
          className="${isTailwind ? 'md:hidden text-gray-500 focus:outline-none' : 'mobile-menu-button'}"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="${isTailwind ? 'md:hidden bg-white py-2 px-4 absolute w-full' : 'mobile-menu'}">
          <a href="#" className="${isTailwind ? 'block py-2 text-gray-600 hover:text-blue-600' : 'mobile-link'}">Home</a>
          <a href="#features" className="${isTailwind ? 'block py-2 text-gray-600 hover:text-blue-600' : 'mobile-link'}">Features</a>
          <a href="#testimonials" className="${isTailwind ? 'block py-2 text-gray-600 hover:text-blue-600' : 'mobile-link'}">Testimonials</a>
          <a href="#pricing" className="${isTailwind ? 'block py-2 text-gray-600 hover:text-blue-600' : 'mobile-link'}">Pricing</a>
          <a href="#contact" className="${isTailwind ? 'block py-2 text-gray-600 hover:text-blue-600' : 'mobile-link'}">Contact</a>
        </div>
      )}
    </nav>
  );
}
    `;
    
    files['src/components/Hero.jsx'] = `
import React from 'react';

export default function Hero() {
  return (
    <section className="${isTailwind ? 'pt-20 pb-12 md:pt-32 md:pb-24 bg-gray-50' : 'hero-section'}" id="hero">
      <div className="${isTailwind ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'container'}">
        <div className="${isTailwind ? 'flex flex-col md:flex-row items-center justify-between' : 'hero-content'}">
          <div className="${isTailwind ? 'md:w-1/2 mb-8 md:mb-0 text-center md:text-left' : 'hero-text'}">
            <h1 className="${isTailwind ? 'text-4xl md:text-5xl font-bold text-gray-900 leading-tight' : 'hero-title'}">
              ${isGym 
                ? 'Transform Your Body, Transform Your Life' 
                : 'Welcome to Our Website'}
            </h1>
            <p className="${isTailwind ? 'mt-4 text-xl text-gray-600 max-w-lg' : 'hero-subtitle'}">
              ${isGym 
                ? 'Join our fitness community and achieve your health goals with expert trainers and state-of-the-art equipment.' 
                : 'We provide the best services for our customers with high quality and support.'}
            </p>
            <div className="${isTailwind ? 'mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4' : 'hero-buttons'}">
              <a href="#pricing" className="${isTailwind ? 'px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors' : 'primary-button'}">
                ${isGym ? 'Join Now' : 'Get Started'}
              </a>
              <a href="#contact" className="${isTailwind ? 'px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-md font-medium hover:bg-gray-50 transition-colors' : 'secondary-button'}">
                Contact Us
              </a>
            </div>
          </div>
          <div className="${isTailwind ? 'md:w-1/2' : 'hero-image'}">
            <img 
              src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Hero image" 
              className="${isTailwind ? 'rounded-lg shadow-xl' : 'img-fluid'}"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
    `;
    
    // Add more component files here
    files['src/components/Features.jsx'] = `
import React from 'react';

export default function Features() {
  const features = [
    {
      title: ${isGym ? '"State-of-the-art Equipment"' : '"Feature One"'},
      description: ${isGym ? 
        '"Access to the latest fitness technology and premium equipment for effective workouts."' : 
        '"Description of feature one and its benefits to the users."'},
      icon: "💪"
    },
    {
      title: ${isGym ? '"Expert Trainers"' : '"Feature Two"'},
      description: ${isGym ? 
        '"Professional trainers to guide your fitness journey and help you achieve your goals."' : 
        '"Description of feature two and its benefits to the users."'},
      icon: "👨‍🏫"
    },
    {
      title: ${isGym ? '"Flexible Memberships"' : '"Feature Three"'},
      description: ${isGym ? 
        '"Choose from a variety of membership options that fit your schedule and budget."' : 
        '"Description of feature three and its benefits to the users."'},
      icon: "📅"
    }
  ];

  return (
    <section className="${isTailwind ? 'py-16 bg-white' : 'features-section'}" id="features">
      <div className="${isTailwind ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'container'}">
        <div className="${isTailwind ? 'text-center mb-16' : 'section-header'}">
          <h2 className="${isTailwind ? 'text-3xl font-bold text-gray-900' : 'section-title'}">
            ${isGym ? 'Why Choose Our Gym?' : 'Our Features'}
          </h2>
          <p className="${isTailwind ? 'mt-4 text-xl text-gray-600 max-w-2xl mx-auto' : 'section-subtitle'}">
            ${isGym ? 
              'We offer the best fitness experience with premium facilities and expert guidance.' : 
              'Discover what makes our services stand out from the competition.'}
          </p>
        </div>
        
        <div className="${isTailwind ? 'grid md:grid-cols-3 gap-8' : 'features-grid'}">
          {features.map((feature, index) => (
            <div key={index} className="${isTailwind ? 'bg-gray-50 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow' : 'feature-card'}">
              <div className="${isTailwind ? 'text-4xl mb-4' : 'feature-icon'}">{feature.icon}</div>
              <h3 className="${isTailwind ? 'text-xl font-semibold text-gray-900 mb-2' : 'feature-title'}">{feature.title}</h3>
              <p className="${isTailwind ? 'text-gray-600' : 'feature-description'}">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
    `;
    
  } else {
    // Add HTML/CSS/JS files - make more complete and modern
    files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isGym ? 'FitLife Gym - Your Path to Fitness' : 'My Website'}</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Replace problematic FontAwesome with a working CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="container">
        <div class="logo">
          ${isGym ? 'FitLife<span>Gym</span>' : 'My Website'}
        </div>
        <ul class="nav-links">
          <li><a href="#" class="active">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#classes">Classes</a></li>
          <li><a href="#trainers">Trainers</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div class="hamburger">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </nav>
  </header>

  <section class="hero" id="home">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1>${isGym ? 'Build Your Body <span>Transform Your Life</span>' : 'Welcome to My Website'}</h1>
          <p>${isGym ? 'Join our fitness community today and achieve your health goals with expert trainers and state-of-the-art equipment.' : 'This is a custom website built with HTML, CSS and JavaScript.'}</p>
          <div class="hero-btns">
            <a href="#pricing" class="btn btn-primary">${isGym ? 'Join Now' : 'Get Started'}</a>
            <a href="#contact" class="btn btn-secondary">Contact Us</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg" alt="Hero">
        </div>
      </div>
    </div>
  </section>

  <section class="features" id="about">
    <div class="container">
      <div class="section-header">
        <h2>${isGym ? 'Why Choose Us' : 'Our Features'}</h2>
        <p>${isGym ? 'We offer the best fitness experience with premium facilities and expert guidance.' : 'What makes us different from others'}</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">💪</div>
          <h3>${isGym ? 'Modern Equipment' : 'Feature One'}</h3>
          <p>${isGym ? 'State-of-the-art fitness equipment for all your workout needs.' : 'Description of the first main feature of your service.'}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🏋️</div>
          <h3>${isGym ? 'Expert Trainers' : 'Feature Two'}</h3>
          <p>${isGym ? 'Professional trainers to guide you through your fitness journey.' : 'Description of the second main feature of your service.'}</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🍎</div>
          <h3>${isGym ? 'Nutrition Plans' : 'Feature Three'}</h3>
          <p>${isGym ? 'Custom nutrition plans tailored to your specific fitness goals.' : 'Description of the third main feature of your service.'}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container">
      <h2>${isGym ? 'Ready to start your fitness journey?' : 'Ready to get started?'}</h2>
      <p>${isGym ? 'Join our gym today and transform your life with our expert guidance.' : 'Take the first step towards achieving your goals.'}</p>
      <a href="#contact" class="btn btn-primary">${isGym ? 'Join Now' : 'Get Started'}</a>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <div class="logo">${isGym ? 'FitLife<span>Gym</span>' : 'My Website'}</div>
          <p>${isGym ? 'Your premier fitness destination committed to helping you achieve your health and fitness goals.' : 'A brief description of your company or personal brand.'}</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-facebook"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#classes">Classes</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h3>Contact Us</h3>
          <p><i class="fas fa-map-marker-alt"></i> 123 Fitness Street, Gym City</p>
          <p><i class="fas fa-phone"></i> (123) 456-7890</p>
          <p><i class="fas fa-envelope"></i> info@fitlifegym.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2023 ${isGym ? 'FitLife Gym' : 'My Website'}. All Rights Reserved.</p>
      </div>
    </div>
  </footer>

  <script src="js/script.js"></script>
</body>
</html>
    `;
    
    files['css/styles.css'] = `/* Base styles */
:root {
  --primary-color: ${isGym ? '#ff5722' : '#4361ee'};
  --secondary-color: ${isGym ? '#263238' : '#3a0ca3'};
  --dark-color: #212121;
  --light-color: #f5f5f5;
  --text-color: #333;
  --text-light: #666;
  --max-width: 1200px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #fff;
}

a {
  text-decoration: none;
  color: var(--text-color);
}

ul {
  list-style: none;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  width: 90%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
}

section {
  padding: 80px 0;
}

/* Button styles */
.btn {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
}

.btn-primary:hover {
  background-color: transparent;
  color: var(--primary-color);
}

.btn-secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Header and Navigation */
.navbar {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  width: 100%;
  z-index: 1000;
  height: 80px;
  display: flex;
  align-items: center;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark-color);
}

.logo span {
  color: var(--primary-color);
}

.nav-links {
  display: flex;
}

.nav-links li a {
  padding: 10px 15px;
  margin: 0 5px;
  color: var(--text-color);
  font-weight: 500;
  transition: var(--transition);
}

.nav-links li a:hover, .nav-links li a.active {
  color: var(--primary-color);
}

.hamburger {
  display: none;
  cursor: pointer;
}

.bar {
  display: block;
  width: 25px;
  height: 3px;
  margin: 5px auto;
  background-color: var(--dark-color);
  transition: var(--transition);
}

/* Hero section */
.hero {
  padding-top: 150px;
  padding-bottom: 100px;
  background-color: var(--light-color);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 50px;
}

.hero-text {
  flex: 1;
}

.hero-text h1 {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 20px;
  color: var(--dark-color);
}

.hero-text h1 span {
  color: var(--primary-color);
  display: block;
}

.hero-text p {
  font-size: 1.1rem;
  color: var(--text-light);
  margin-bottom: 30px;
  max-width: 600px;
}

.hero-btns {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
}

.hero-image img {
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

/* Features section */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: var(--dark-color);
}

.section-header p {
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: var(--transition);
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--dark-color);
}

.feature-card p {
  color: var(--text-light);
}

/* CTA section */
.cta {
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  padding: 80px 0;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.cta p {
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.1rem;
}

.cta .btn-primary {
  background-color: white;
  color: var(--primary-color);
  border-color: white;
}

.cta .btn-primary:hover {
  background-color: transparent;
  color: white;
}

/* Footer */
footer {
  background-color: var(--dark-color);
  color: white;
  padding: 80px 0 30px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 50px;
}

.footer-about .logo {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.footer-about p {
  margin-bottom: 20px;
  color: rgba(255,255,255,0.7);
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.1);
  color: white;
  transition: var(--transition);
}

.social-links a:hover {
  background-color: var(--primary-color);
}

.footer-links h3, .footer-contact h3 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.footer-links h3:after, .footer-contact h3:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -10px;
  width: 50px;
  height: 2px;
  background-color: var(--primary-color);
}

.footer-links ul li {
  margin-bottom: 10px;
}

.footer-links ul li a {
  color: rgba(255,255,255,0.7);
  transition: var(--transition);
}

.footer-links ul li a:hover {
  color: var(--primary-color);
  padding-left: 5px;
}

.footer-contact p {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.7);
}

.footer-contact p i {
  margin-right: 10px;
  color: var(--primary-color);
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.footer-bottom p {
  color: rgba(255,255,255,0.7);
}

/* Responsive styles */
@media (max-width: 992px) {
  .hero-text h1 {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: auto;
    padding: 15px 0;
  }
  
  .nav-links {
    position: fixed;
    left: -100%;
    top: 80px;
    flex-direction: column;
    background-color: white;
    width: 100%;
    text-align: center;
    transition: var(--transition);
    box-shadow: 0 10px 10px rgba(0,0,0,0.1);
    padding: 20px 0;
  }
  
  .nav-links.active {
    left: 0;
  }
  
  .nav-links li {
    margin: 10px 0;
  }
  
  .hamburger {
    display: block;
  }
  
  .hamburger.active .bar:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger.active .bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }
  
  .hamburger.active .bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .hero-btns {
    justify-content: center;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-text h1 {
    font-size: 2rem;
  }
  
  .btn {
    padding: 10px 20px;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
    `;
    
    files['js/script.js'] = `// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  
  // Close navigation when clicking on a nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
  
  // Highlight active link based on scroll position
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');
  
  window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
        current = section.getAttribute('id');
      }
    });
    
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href').substring(1) === current) {
        item.classList.add('active');
      }
    });
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Simple form validation (if a form exists)
  const contactForm = document.querySelector('#contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form fields
      const nameInput = document.querySelector('#name');
      const emailInput = document.querySelector('#email');
      const messageInput = document.querySelector('#message');
      
      // Simple validation
      let isValid = true;
      
      if (nameInput.value.trim() === '') {
        showError(nameInput, 'Name is required');
        isValid = false;
      } else {
        removeError(nameInput);
      }
      
      if (emailInput.value.trim() === '') {
        showError(emailInput, 'Email is required');
        isValid = false;
      } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
      } else {
        removeError(emailInput);
      }
      
      if (messageInput.value.trim() === '') {
        showError(messageInput, 'Message is required');
        isValid = false;
      } else {
        removeError(messageInput);
      }
      
      // If form is valid, you would typically submit it
      if (isValid) {
        // Here you would normally submit the form
        // For demo purposes, we'll just show a success message
        contactForm.innerHTML = '<div class="success-message">Thank you for your message! We will get back to you soon.</div>';
      }
    });
  }
  
  // Helper functions for form validation
  function showError(input, message) {
    const formControl = input.parentElement;
    formControl.classList.add('error');
    
    const errorMessage = formControl.querySelector('.error-message') || document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    if (!formControl.querySelector('.error-message')) {
      formControl.appendChild(errorMessage);
    }
  }
  
  function removeError(input) {
    const formControl = input.parentElement;
    formControl.classList.remove('error');
    
    const errorMessage = formControl.querySelector('.error-message');
    if (errorMessage) {
      formControl.removeChild(errorMessage);
    }
  }
  
  function isValidEmail(email) {
    const re = /^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
});

// Animate elements when they come into view
const animateOnScroll = function() {
  const elements = document.querySelectorAll('.animate');
  
  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementPosition < windowHeight - 50) {
      element.classList.add('animated');
    }
  });
};

// Add 'animate' class to elements you want to animate
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.classList.add('animate');
  });
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Initial check on page load
});
    `;
    
    // Create a simple about.html file
    files['about.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us - ${isGym ? 'FitLife Gym' : 'My Website'}</title>
  <link rel="stylesheet" href="css/styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Replace problematic FontAwesome with a working CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="container">
        <div class="logo">
          ${isGym ? 'FitLife<span>Gym</span>' : 'My Website'}
        </div>
        <ul class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html" class="active">About</a></li>
          <li><a href="#classes">Classes</a></li>
          <li><a href="#trainers">Trainers</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div class="hamburger">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </nav>
  </header>

  <section class="about-hero">
    <div class="container">
      <h1>About Us</h1>
      <p>Learn more about ${isGym ? 'our fitness journey and mission' : 'our company and team'}</p>
    </div>
  </section>

  <section class="about-content">
    <div class="container">
      <div class="about-grid">
        <div class="about-text">
          <h2>${isGym ? 'Our Story' : 'Our History'}</h2>
          <p>${isGym ? 'Founded in 2010, FitLife Gym was created with a simple mission: to provide a fitness environment where everyone feels welcome and empowered to achieve their health goals.' : 'Our company was founded with a vision to create innovative solutions that make a difference in people\'s lives.'}</p>
          <p>${isGym ? 'What started as a small local gym has grown into a fitness community that helps thousands of members transform their lives every day.' : 'Over the years, we\'ve grown from a small startup to an established company with a team of dedicated professionals.'}</p>
          <h2>${isGym ? 'Our Mission' : 'Our Mission'}</h2>
          <p>${isGym ? 'Our mission is to inspire and support individuals in their fitness journey by providing expert guidance, state-of-the-art facilities, and a motivating community.' : 'Our mission is to deliver exceptional products and services that exceed customer expectations and make a positive impact.'}</p>
        </div>
        <div class="about-image">
          <img src="https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg" alt="About Us">
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <div class="logo">${isGym ? 'FitLife<span>Gym</span>' : 'My Website'}</div>
          <p>${isGym ? 'Your premier fitness destination committed to helping you achieve your health and fitness goals.' : 'A brief description of your company or personal brand.'}</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-facebook"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="#classes">Classes</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h3>Contact Us</h3>
          <p><i class="fas fa-map-marker-alt"></i> 123 Fitness Street, Gym City</p>
          <p><i class="fas fa-phone"></i> (123) 456-7890</p>
          <p><i class="fas fa-envelope"></i> info@fitlifegym.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2023 ${isGym ? 'FitLife Gym' : 'My Website'}. All Rights Reserved.</p>
      </div>
    </div>
  </footer>

  <script src="js/script.js"></script>
</body>
</html>
    `;
  }
  
  return files;
} 