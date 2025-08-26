'use client'

import React, { useState } from 'react';
import './style.css';
import Navbar from '@/components/ui/Navbar';

interface GlassmorphicInterfaceProps {
  className?: string;
}

const page: React.FC<GlassmorphicInterfaceProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const StarIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-yellow-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className={`glassmorphic-interface ${className || ''}`}>
      {/* Background glows */}
      <div className="glow glow-purple" />
      <div className="glow glow-blue" />
      <div className="glow glow-pink" />
      
      <Navbar/>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="hero-title">
                The AI-first <br />
                <span className="gradient-text">code editor</span>
              </h1>
              <p className="hero-description">
                Experience the future of coding with our AI-powered editor that understands your code and helps you write better software, faster.
              </p>
              <div className="hero-buttons">
                <button className="btn-gradient" onClick={() => window.location.href = '/studio'}>Try Now</button>
                <button className="btn-glass demo-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="code-editor">
                <div className="editor-window">
                  <div className="editor-header">
                    <div className="flex space-x-2">
                      <div className="traffic-light traffic-light-red" />
                      <div className="traffic-light traffic-light-yellow" />
                      <div className="traffic-light traffic-light-green" />
                    </div>
                    <div className="editor-title">main.js</div>
                  </div>
                  <div className="editor-content">
                    <pre className="code-function">function <span className="code-function-name">generateResponse</span>(<span className="code-param">prompt</span>) &#123;</pre>
                    <pre className="code-line">  <span className="code-const">const</span> <span className="code-variable">aiModel</span> = <span className="code-function-name">initializeModel</span>();</pre>
                    <pre className="code-line">  <span className="code-const">const</span> <span className="code-variable">context</span> = <span className="code-function-name">getContext</span>();</pre>
                    <pre className="code-line">  </pre>
                    <pre className="code-line">  <span className="code-comment">// Generate AI response based on prompt</span></pre>
                    <pre className="code-line">  <span className="code-const">const</span> <span className="code-variable">response</span> = <span className="code-const">await</span> <span className="code-variable">aiModel</span>.<span className="code-function-name">generate</span>(&#123;</pre>
                    <pre className="code-line">    prompt,</pre>
                    <pre className="code-line">    context,</pre>
                    <pre className="code-line">    maxTokens: 1024,</pre>
                    <pre className="code-line">    temperature: 0.7</pre>
                    <pre className="code-line">  &#125;);</pre>
                    <pre className="code-line">  </pre>
                    <pre className="code-line">  <span className="code-const">return</span> response;</pre>
                    <pre className="code-function">&#125;</pre>
                  </div>
                </div>
              </div>
              <div className="ai-suggestion">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">AI suggestions ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container mx-auto px-6">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">Our editor combines cutting-edge AI with a sleek interface to provide the most productive coding experience.</p>
          </div>
          
          <div className="features-grid">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "AI Code Completion",
                description: "Intelligent suggestions that understand your codebase and help you write better code faster."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Natural Language Commands",
                description: "Simply describe what you want to do, and our AI will generate the code for you."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: "Smart Refactoring",
                description: "Automatically improve your code structure and readability with AI-powered refactoring tools."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Advanced Security",
                description: "Built-in vulnerability detection and security recommendations as you code."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Performance Optimization",
                description: "Identify and fix performance bottlenecks with intelligent suggestions."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Collaborative Editing",
                description: "Real-time collaboration with team members, enhanced by AI assistance for everyone."
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="testimonial-glow" />
        <div className="container mx-auto px-6">
          <div className="section-header">
            <h2 className="section-title">Loved by Developers</h2>
            <p className="section-description">See what developers around the world are saying about our AI-powered editor.</p>
          </div>
          
          <div className="testimonials-grid">
            {[
              {
                name: "Sarah Chen",
                title: "Senior Developer @ Spotify",
                avatar: "S",
                avatarColor: "from-blue-400 to-purple-500",
                content: "This editor has completely transformed my workflow. The AI suggestions are incredibly accurate and have saved me countless hours of debugging."
              },
              {
                name: "Michael Rodriguez",
                title: "Lead Engineer @ Airbnb",
                avatar: "M",
                avatarColor: "from-green-400 to-blue-500",
                content: "The natural language commands feature is a game-changer. I can describe complex operations and the AI understands exactly what I need."
              },
              {
                name: "Aisha Patel",
                title: "CTO @ TechStart",
                avatar: "A",
                avatarColor: "from-pink-400 to-red-500",
                content: "Our entire development team switched to this editor and we've seen a 40% increase in productivity. The collaborative features are exceptional."
              }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className={`testimonial-avatar bg-gradient-to-br ${testimonial.avatarColor}`}>
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-white/60">{testimonial.title}</p>
                  </div>
                </div>
                <p className="testimonial-content">{testimonial.content}</p>
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container mx-auto px-6">
          <div className="cta-card">
            <div className="cta-glow-purple" />
            <div className="cta-glow-blue" />
            
            <div className="cta-content">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="cta-title">Ready to code smarter?</h2>
                <p className="cta-description">
                  Join thousands of developers who are writing better code faster with our AI-powered editor.
                </p>
                <div className="cta-buttons">
                  <button className="btn-gradient">Download Now</button>
                  <button className="btn-glass demo-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Demo
                  </button>
                </div>
              </div>
              <div className="pricing-card">
                <div className="pricing-content">
                  <h3 className="pricing-title">Pro Version</h3>
                  <p className="pricing-subtitle">Unlock all features</p>
                  <div className="pricing-amount">100 INR<span className="pricing-period">/month</span></div>
                  <button className="pricing-button">Get Started</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container mx-auto px-6">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">LakeNine</span>
              </div>
              <p className="footer-description">The AI-first code editor for the modern developer.</p>
              <div className="social-links">
                {['instagram', 'twitter', 'github'].map((social, index) => (
                  <a key={index} href="#" className="social-link">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      {social === 'instagram' && (
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      )}
                      {social === 'twitter' && (
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      )}
                      {social === 'github' && (
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Download", "Updates"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Tutorials", "Blog", "Community"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Press Kit"]
              }
            ].map((section, index) => (
              <div key={index} className="footer-section">
                <h4 className="footer-section-title">{section.title}</h4>
                <ul className="footer-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="footer-link">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="footer-bottom">
            <p className="footer-copyright">© 2025 LakeNine. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default page;
