import weaviate, { ApiKey } from 'weaviate-ts-client';

// Initialize Weaviate client
const getWeaviateClient = () => {
  // Verify environment variables are set
  if (!process.env.WEAVIATE_HOST || !process.env.WEAVIATE_API_KEY) {
    throw new Error('Missing Weaviate environment variables');
  }

  const client = weaviate.client({
    scheme: 'https',
    host: process.env.WEAVIATE_HOST,
    apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    },
  });
  
  return client;
};

// Retrieve relevant components based on user query
export async function retrieveComponents(query: string, limit: number = 10) {
  try {
    const client = getWeaviateClient();
    
    const response = await client.graphql
      .get()
      .withClassName('WebComponent')
      .withFields('type description code')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();
    
    return response.data.Get.WebComponent;
  } catch (error) {
    console.error('Error retrieving components from Weaviate:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Retrieve components by type and description
export async function retrieveComponentsByTypeAndDescription(query: string, type: string, description: string, limit: number = 3) {
  try {
    const client = getWeaviateClient();
    
    const response = await client.graphql
      .get()
      .withClassName('WebComponent')
      .withFields('type description code')
      .withWhere({
        operator: 'And',
        operands: [
          {
            path: ['type'],
            operator: 'Equal',
            valueString: type
          },
          {
            path: ['description'],
            operator: 'Equal',
            valueString: description
          }
        ]
      })
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();
    
    return response.data.Get.WebComponent;
  } catch (error) {
    console.error(`Error retrieving ${type} components from Weaviate:`, error);
    return [];
  }
}

// Get components for a complete website based on user query
export async function getWebsiteComponents(query: string) {
  try {
    // Get general components first
    const generalComponents = await retrieveComponents(query, 10);
    
    // Get specific component types with descriptions
    const heroComponents = await retrieveComponentsByTypeAndDescription(query, 'hero', 'main banner section');
    const navbarComponents = await retrieveComponentsByTypeAndDescription(query, 'navbar', 'navigation menu');
    const featuresComponents = await retrieveComponentsByTypeAndDescription(query, 'features', 'key benefits and features');
    const footerComponents = await retrieveComponentsByTypeAndDescription(query, 'footer', 'site information');
    const testimonialsComponents = await retrieveComponentsByTypeAndDescription(query, 'testimonials', 'customer reviews');
    
    // Additional component types
    const pricingComponents = await retrieveComponentsByTypeAndDescription(query, 'pricing', 'pricing plans and tiers');
    const ctaComponents = await retrieveComponentsByTypeAndDescription(query, 'cta', 'call to action section');
    const statsComponents = await retrieveComponentsByTypeAndDescription(query, 'stats', 'statistics and metrics');
    const teamComponents = await retrieveComponentsByTypeAndDescription(query, 'team', 'team members section');
    const contactComponents = await retrieveComponentsByTypeAndDescription(query, 'contact', 'contact form and info');
    const faqComponents = await retrieveComponentsByTypeAndDescription(query, 'faq', 'frequently asked questions');
    const galleryComponents = await retrieveComponentsByTypeAndDescription(query, 'gallery', 'image gallery or portfolio');
    const blogComponents = await retrieveComponentsByTypeAndDescription(query, 'blog', 'blog posts section');
    const newsletterComponents = await retrieveComponentsByTypeAndDescription(query, 'newsletter', 'email subscription');
    
    return {
      general: generalComponents || [],
      hero: heroComponents || [],
      navbar: navbarComponents || [],
      features: featuresComponents || [],
      footer: footerComponents || [],
      testimonials: testimonialsComponents || [],
      pricing: pricingComponents || [],
      cta: ctaComponents || [],
      stats: statsComponents || [],
      team: teamComponents || [],
      contact: contactComponents || [],
      faq: faqComponents || [],
      gallery: galleryComponents || [],
      blog: blogComponents || [],
      newsletter: newsletterComponents || [],
    };
  } catch (error) {
    console.error('Error getting website components:', error);
    // Return empty structure instead of throwing
    return {
      general: [],
      hero: [],
      navbar: [],
      features: [],
      footer: [],
      testimonials: [],
      pricing: [],
      cta: [],
      stats: [],
      team: [],
      contact: [],
      faq: [],
      gallery: [],
      blog: [],
      newsletter: [],
    };
  }
}
