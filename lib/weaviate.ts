import weaviate, { ApiKey } from 'weaviate-ts-client';

// Component interface matching your sample.json structure exactly
interface ComponentData {
  component_type: string;
  text_summary: string;
  class_keywords: string[];
}

// Initialize Weaviate client with proper error handling
const getWeaviateClient = () => {
  // Check for environment variables with the correct names
  if (!process.env.WEAVIATE_HOST || !process.env.WEAVIATE_API_KEY) {
    console.warn('Weaviate environment variables not set. Using fallback generation.');
    return null;
  }

  try {
  const client = weaviate.client({
    scheme: 'https',
    host: process.env.WEAVIATE_HOST,
    apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    },
  });
  
  return client;
  } catch (error) {
    console.error('Error initializing Weaviate client:', error);
    return null;
  }
};

// Enhanced timeout function with better error handling
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

// Correct schema that matches your sample.json exactly
export async function ensureWeaviateSchema() {
  try {
    const client = getWeaviateClient();
    if (!client) return false;

    // Check if class exists first
    const existingSchema = await client.schema.getter().do();
    const classExists = existingSchema.classes?.some((cls: any) => cls.class === 'WebComponent');

    if (classExists) {
      console.log('WebComponent class already exists, skipping schema creation');
      return true;
    }

    // Define the schema that exactly matches your sample.json structure
    const schema = {
      class: 'WebComponent',
      description: 'UI components for RAG-enhanced website generation',
      properties: [
        {
          name: 'componentType',
          dataType: ['text'],
          description: 'Type of component (Hero Sections, Feature Sections, etc.)'
        },
        {
          name: 'textSummary',
          dataType: ['text'],
          description: 'Brief description of the component variant'
        },
        {
          name: 'classKeywords',
          dataType: ['text[]'],
          description: 'CSS class keywords used in the component'
        },
        {
          name: 'code',
          dataType: ['text'],
          description: 'Generated React/JSX code for the component'
        }
      ],
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'ada',
          modelVersion: '002',
          type: 'text'
        }
      }
    };

    await client.schema.classCreator().withClass(schema).do();
    console.log('✅ Weaviate WebComponent class created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error ensuring Weaviate schema:', error);
    return false;
  }
}

// Store components from your sample.json with correct field mapping
export async function storeComponentsInWeaviate(components: ComponentData[]) {
  try {
    const client = getWeaviateClient();
    if (!client) return false;

    await ensureWeaviateSchema();

    console.log(`📦 Storing ${components.length} components in Weaviate...`);

    // Batch import components
    const batcher = client.batch.objectsBatcher();
    let batchSize = 0;

    for (const component of components) {
      // Generate React code based on component
      const reactCode = generateReactComponent(component);
      
      const weaviateObject = {
        class: 'WebComponent',
        properties: {
          componentType: component.component_type,       // Map component_type -> componentType
          textSummary: component.text_summary,          // Map text_summary -> textSummary  
          classKeywords: component.class_keywords,      // Map class_keywords -> classKeywords
          code: reactCode
        }
      };

      batcher.withObject(weaviateObject);
      batchSize++;

      // Process in batches of 50 to avoid timeouts
      if (batchSize >= 50) {
        await batcher.do();
        console.log(`✅ Processed ${batchSize} components`);
        batchSize = 0;
      }
    }

    // Process remaining items
    if (batchSize > 0) {
      await batcher.do();
      console.log(`✅ Processed final ${batchSize} components`);
    }

    console.log(`🎉 Successfully stored ${components.length} components in Weaviate`);
    return true;
  } catch (error) {
    console.error('❌ Error storing components in Weaviate:', error);
    return false;
  }
}

// Generate React component based on your sample.json structure
function generateReactComponent(component: ComponentData): string {
  const { component_type, text_summary, class_keywords } = component;
  const componentName = component_type.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  
  // Check if it's a dark mode variant
  const isDarkMode = text_summary.toLowerCase().includes('dark mode');
  
  // Use exact class keywords from your sample.json
  const baseClasses = class_keywords.join(' ');
  
  // Enhanced component templates based on type with proper class usage
  const templates: Record<string, string> = {
    'Hero Sections': `
import React from 'react';

const ${componentName} = () => {
  return (
    <section className="${baseClasses} min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100${isDarkMode ? ' dark:from-gray-900 dark:to-gray-800' : ''}">
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 leading-tight">
            Transform Your <span className="text-blue-600">Vision</span> Into Reality
          </h1>
          <p className="text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-2xl mx-auto">
            Cutting-edge solutions that empower your business to reach new heights with innovative technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Get Started Today
            </button>
            <button className="border-2 border-gray-300 hover:border-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} px-8 py-4 rounded-lg font-semibold transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
        <div className="mt-16">
          <img src="/*IMAGE:hero*/" alt="Hero" className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl" />
        </div>
      </div>
    </section>
  );
};

export default ${componentName};`,

    'Feature Sections': `
import React from 'react';

const ${componentName} = () => {
  const features = [
    {
      icon: "🚀",
      title: "Lightning Fast",
      description: "Optimized performance that delivers results in milliseconds"
    },
    {
      icon: "🔒", 
      title: "Secure by Design",
      description: "Enterprise-grade security built into every layer"
    },
    {
      icon: "📱",
      title: "Mobile First",
      description: "Responsive design that works perfectly on any device"
    }
  ];

  return (
    <section className="${baseClasses} py-24 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4">
            Powerful Features
          </h2>
          <p className="text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto">
            Everything you need to build exceptional experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4">
                {feature.title}
              </h3>
              <p className="${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};`,

    'Headers': `
import React, { useState } from 'react';

const ${componentName} = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="${baseClasses} ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}">
              Logo
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {['Home', 'About', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className="${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}"
          >
            ☰
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t">
            {['Home', 'About', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className="block py-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default ${componentName};`,

    'Footers': `
import React from 'react';

const ${componentName} = () => {
  return (
    <footer className="${baseClasses} ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4">
              Company Name
            </div>
            <p className="${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4">
              Building the future with innovative solutions and exceptional user experiences.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Contact', 'Privacy'].map((item) => (
                <li key={item}>
                  <a href="#" className="${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4">Contact</h3>
            <div className="space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
              <p>Email: info@company.com</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>
        </div>
        
        <div className="border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} mt-8 pt-8 text-center">
          <p className="${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
            © 2024 Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ${componentName};`
  };

  return templates[component_type] || templates['Hero Sections'];
}

// Enhanced retrieval with better error handling and timeouts
export async function retrieveComponents(query: string, limit: number = 10) {
  try {
    const client = getWeaviateClient();
    if (!client) return [];
    
    const response = await withTimeout(
      client.graphql
      .get()
      .withClassName('WebComponent')
        .withFields('componentType textSummary classKeywords code')  // Use correct field names
      .withNearText({ concepts: [query] })
      .withLimit(limit)
        .do(),
      8000 // 8 second timeout
    );
    
    return response.data?.Get?.WebComponent || [];
  } catch (error) {
    console.error('Error retrieving components from Weaviate:', error);
    return [];
  }
}

// Enhanced component retrieval by type with better matching
export async function retrieveComponentsByType(query: string, componentTypes: string[], limit: number = 3) {
  try {
    const client = getWeaviateClient();
    if (!client) return {};

    const results: Record<string, any[]> = {};
    
    for (const type of componentTypes) {
      try {
        const response = await withTimeout(
          client.graphql
      .get()
      .withClassName('WebComponent')
            .withFields('componentType textSummary classKeywords code')  // Use correct field names
      .withWhere({
              path: ['componentType'],  // Use correct field name
              operator: 'Equal',
              valueText: type
      })
            .withNearText({ concepts: [query, type] })
      .withLimit(limit)
            .do(),
          6000 // 8 second timeout for individual queries
        );
        
        results[type] = response.data?.Get?.WebComponent || [];
        console.log(`✅ Retrieved ${results[type].length} ${type} components`);
      } catch (error) {
        console.error(`❌ Error retrieving ${type} components:`, error);
        results[type] = [];
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in retrieveComponentsByType:', error);
    return {};
  }
}

// Enhanced website component retrieval optimized for your components.json structure
export async function getWebsiteComponents(query: string) {
  try {
    const client = getWeaviateClient();
    if (!client) {
      console.log('Weaviate client not available, returning empty components');
      return { components: {}, available: false };
    }

    // Component types from your sample.json
    const componentTypes = [
      'Hero Sections',
      'Feature Sections', 
      'CTA Sections',
      'Bento Grids',
      'Pricing Sections',
      'Header Sections',
      'Newsletter Sections',
      'Stats',
      'Testimonials',
      'Blog Sections',
      'Contact Sections',
      'Team Sections',
      'Content Sections',
      'Logo Clouds',
      'FAQs',
      'Footers',
      'Headers',
      'Flyout Menus',
      'Banners',
      '404 Pages',
      'Stacked Layouts',
      'Sidebar Layouts',
      'Multi-Column Layouts'
    ];

    // Retrieve components by type with enhanced matching
    const componentResults = await retrieveComponentsByType(query, componentTypes, 2);
    
    // Also get general relevant components
    const generalComponents = await retrieveComponents(query, 5);
    
    const totalComponents = Object.values(componentResults).reduce((sum, arr) => sum + arr.length, 0) + generalComponents.length;
    
    console.log(`✅ Total components retrieved: ${totalComponents}`);
    
    return {
      components: {
        general: generalComponents,
        ...componentResults
      },
      available: true,
      totalComponents: totalComponents
    };
  } catch (error) {
    console.error('❌ Error getting website components:', error);
    return { components: {}, available: false };
  }
}

// Initialize components from your sample.json file
export async function initializeComponentsFromFile() {
  try {
    // Import components from your sample.json
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const componentsPath = path.join(process.cwd(), 'sample.json');
    const componentsData = await fs.readFile(componentsPath, 'utf-8');
    const components: ComponentData[] = JSON.parse(componentsData);
    
    console.log(`📁 Loading ${components.length} components from sample.json`);
    
    // Store in Weaviate
    const success = await storeComponentsInWeaviate(components);
    
    if (success) {
      console.log('✅ Successfully initialized Weaviate with components from sample.json');
    } else {
      console.log('❌ Failed to initialize Weaviate with components');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error initializing components from file:', error);
    return false;
  }
}

export { ComponentData };
