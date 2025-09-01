// pages/api/test-weaviate-new.ts
// Test endpoint to verify the new Weaviate schema integration

import { NextApiRequest, NextApiResponse } from 'next';
import { getWebsiteComponents, retrieveComponents, getWeaviateClient } from '@/lib/weaviate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query = 'gym website', category, limit = 5 } = req.query;
    
    console.log(`🧪 Testing new Weaviate schema integration...`);
    console.log(`Query: "${query}", Category: ${category || 'all'}, Limit: ${limit}`);
    
    // Test 1: Check Weaviate client connection
    console.log('🔌 Test 1: Weaviate client connection...');
    const client = getWeaviateClient();
    if (!client) {
      throw new Error('Weaviate client initialization failed');
    }
    
    // Test 2: Check schema structure
    console.log('📋 Test 2: Checking schema structure...');
    let schemaInfo = {};
    try {
      const schema = await client.schema.getter().do();
      const webComponentClass = schema.classes?.find((cls: any) => cls.class === 'WebComponent');
      
      schemaInfo = {
        exists: !!webComponentClass,
        properties: webComponentClass?.properties?.map((prop: any) => ({
          name: prop.name,
          dataType: prop.dataType
        })) || [],
        expectedProperties: ['category', 'name', 'description', 'tags', 'code']
      };
    } catch (error) {
      schemaInfo = { error: error instanceof Error ? error.message : String(error) };
    }
    
    // Test 3: Basic component retrieval
    console.log('🔍 Test 3: Basic component retrieval...');
    const basicComponents = await retrieveComponents(query as string, parseInt(limit as string));
    
    // Test 4: Category-specific retrieval
    console.log('🎯 Test 4: Category-specific retrieval...');
    const websiteComponents = await getWebsiteComponents(query as string);
    
    // Test 5: Check component structure
    console.log('🔧 Test 5: Validating component structure...');
    const sampleComponent = basicComponents[0] || websiteComponents[0];
    const componentStructure = sampleComponent ? {
      hasCategory: 'category' in sampleComponent,
      hasName: 'name' in sampleComponent,
      hasDescription: 'description' in sampleComponent,
      hasTags: 'tags' in sampleComponent,
      hasCode: 'code' in sampleComponent,
      actualFields: Object.keys(sampleComponent)
    } : null;
    
    // Test 6: Category breakdown
    console.log('📊 Test 6: Category breakdown...');
    const categoryBreakdown: Record<string, number> = {};
    [...basicComponents, ...websiteComponents].forEach(comp => {
      if (comp.category) {
        categoryBreakdown[comp.category] = (categoryBreakdown[comp.category] || 0) + 1;
      }
    });
    
    const response = {
      success: true,
      weaviateConfigured: {
        host: process.env.WEAVIATE_HOST ? 'Set ✅' : 'Missing ❌',
        apiKey: process.env.WEAVIATE_API_KEY ? 'Set ✅' : 'Missing ❌',
        openaiKey: process.env.OPENAI_API_KEY ? 'Set ✅' : 'Missing ❌'
      },
      tests: {
        clientConnection: {
          status: client ? 'Connected ✅' : 'Failed ❌',
          client: !!client
        },
        schemaStructure: schemaInfo,
        basicRetrieval: {
          query: query,
          retrievedCount: basicComponents.length,
          components: basicComponents.slice(0, 2).map(comp => ({
            category: comp.category,
            name: comp.name,
            description: comp.description?.substring(0, 100) + '...',
            tags: comp.tags,
            hasCode: !!(comp.code && comp.code.length > 0)
          }))
        },
        websiteComponentRetrieval: {
          query: query,
          retrievedCount: websiteComponents.length,
          components: websiteComponents.slice(0, 2).map(comp => ({
            category: comp.category,
            name: comp.name,
            description: comp.description?.substring(0, 100) + '...',
            tags: comp.tags,
            hasCode: !!(comp.code && comp.code.length > 0)
          }))
        },
        componentStructure: componentStructure,
        categoryBreakdown: categoryBreakdown
      },
      summary: {
        totalComponentsFound: basicComponents.length + websiteComponents.length,
        uniqueCategories: Object.keys(categoryBreakdown),
        newSchemaWorking: componentStructure ? 
          (componentStructure.hasCategory && componentStructure.hasName && componentStructure.hasDescription) : false,
        recommendedCategories: [
          'Navbar', 'Hero', 'Footer', 'Pricing', 'Testimonial', 
          'CTA', 'Form', 'Feature', 'Dashboard', 'Card'
        ]
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ New Weaviate schema test completed');
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ New Weaviate schema test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      weaviateConfigured: {
        host: process.env.WEAVIATE_HOST ? 'Set ✅' : 'Missing ❌',
        apiKey: process.env.WEAVIATE_API_KEY ? 'Set ✅' : 'Missing ❌',
        openaiKey: process.env.OPENAI_API_KEY ? 'Set ✅' : 'Missing ❌'
      },
      timestamp: new Date().toISOString()
    });
  }
}
