import weaviate, { ApiKey } from 'weaviate-ts-client';

const getWeaviateClient = () => {
  return weaviate.client({
    scheme: 'https',
    host: process.env.WEAVIATE_HOST || '',
    apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || ''),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    },
  });
};

// Generic component retriever based on query only
export async function retrieveComponents(query: string, limit = 5) {
  try {
    const client = getWeaviateClient();
    const response = await client.graphql
      .get()
      .withClassName('WebComponent')
      .withFields('type description code')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();

    return response.data.Get.WebComponent || [];
  } catch (error) {
    console.error('Error retrieving components from Weaviate:', error);
    throw new Error('Failed to retrieve components');
  }
}

// Retrieve components by both type and description
export async function retrieveComponentsByTypeOrDescription(query: string, type: string, limit = 3) {
  try {
    const client = getWeaviateClient();

    const response = await client.graphql
      .get()
      .withClassName('WebComponent')
      .withFields('type description code')
      .withWhere({
        operator: 'Or',
        operands: [
          {
            path: ['type'],
            operator: 'Equal',
            valueString: type
          },
          {
            path: ['description'],
            operator: 'Like',
            valueString: type
          }
        ]
      })
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();

    return response.data.Get.WebComponent || [];
  } catch (error) {
    console.error(`Error retrieving components for type "${type}":`, error);
    return [];
  }
}

// Fetch all necessary component types to build a full site
export async function getWebsiteComponents(query: string) {
  try {
    const general = await retrieveComponents(query, 10);
    const hero = await retrieveComponentsByTypeOrDescription(query, 'hero');
    const navbar = await retrieveComponentsByTypeOrDescription(query, 'navbar');
    const features = await retrieveComponentsByTypeOrDescription(query, 'features');
    const testimonials = await retrieveComponentsByTypeOrDescription(query, 'testimonials');
    const footer = await retrieveComponentsByTypeOrDescription(query, 'footer');

    return {
      general,
      hero,
      navbar,
      features,
      testimonials,
      footer
    };
  } catch (error) {
    console.error('Error aggregating website components:', error);
    throw error;
  }
}
