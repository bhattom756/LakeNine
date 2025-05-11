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
    
    // Get specific component types
    const heroComponents = await retrieveComponentsByTypeAndDescription(query, 'hero', 'main banner');
    const navbarComponents = await retrieveComponentsByTypeAndDescription(query, 'navbar', 'navigation');
    const featuresComponents = await retrieveComponentsByTypeAndDescription(query, 'features', 'key benefits');
    const footerComponents = await retrieveComponentsByTypeAndDescription(query, 'footer', 'site information');
    const testimonialsComponents = await retrieveComponentsByTypeAndDescription(query, 'testimonials', 'customer feedback');
    
    return {
      general: generalComponents || [],
      hero: heroComponents || [],
      navbar: navbarComponents || [],
      features: featuresComponents || [],
      footer: footerComponents || [],
      testimonials: testimonialsComponents || [],
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
    };
  }
}
