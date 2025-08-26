import { NextApiRequest, NextApiResponse } from 'next';
import { getWeaviateClient } from '@/lib/weaviate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = getWeaviateClient();
    if (!client) {
      return res.status(500).json({ error: 'Weaviate client not initialized' });
    }

    console.log('🔍 Getting Weaviate schema...');

    // Get the schema
    const schema = await client.schema.getter().do();
    
    console.log('📊 Full schema:', JSON.stringify(schema, null, 2));

    // Find WebComponent class
    const webComponentClass = schema.classes?.find((cls: any) => cls.class === 'WebComponent');
    
    if (!webComponentClass) {
      return res.status(404).json({ 
        error: 'WebComponent class not found in schema',
        availableClasses: schema.classes?.map((cls: any) => cls.class) || []
      });
    }

    // Extract field names
    const fields = webComponentClass.properties?.map((prop: any) => ({
      name: prop.name,
      dataType: prop.dataType,
      description: prop.description
    })) || [];

    console.log('✅ WebComponent fields:', fields);

    // Try a simple query to test
    try {
      const testQuery = await client.graphql
        .get()
        .withClassName('WebComponent')
        .withFields('_additional { id }')
        .withLimit(1)
        .do();

      const hasData = testQuery?.data?.Get?.WebComponent?.length > 0;

      return res.status(200).json({
        success: true,
        webComponentClass,
        fields,
        hasData,
        totalClasses: schema.classes?.length || 0,
        sampleQuery: testQuery?.data?.Get?.WebComponent?.[0] || null
      });
    } catch (queryError) {
      return res.status(200).json({
        success: true,
        webComponentClass,
        fields,
        hasData: false,
        queryError: queryError.message,
        totalClasses: schema.classes?.length || 0
      });
    }

  } catch (error) {
    console.error('❌ Error getting Weaviate schema:', error);
    return res.status(500).json({ 
      error: 'Failed to get schema', 
      details: error.message 
    });
  }
}
