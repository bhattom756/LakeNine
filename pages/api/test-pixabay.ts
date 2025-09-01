// pages/api/test-pixabay.ts
// Test endpoint to verify Pixabay API integration

import { NextApiRequest, NextApiResponse } from 'next';
import { pixabayAPI, detectBusinessType } from '@/lib/pixabay';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query = 'business', businessType, category = 'hero' } = req.query;
    
    console.log(`🧪 Testing Pixabay API with query: "${query}"`);
    
    // Test 1: Basic image search
    console.log('📸 Test 1: Basic image search...');
    const searchResults = await pixabayAPI.searchImages(query as string, {
      perPage: 5,
      safeSearch: true
    });
    
    // Test 2: Category-specific image search
    console.log('🎯 Test 2: Category-specific image search...');
    const detectedBusinessType = businessType as string || detectBusinessType(query as string);
    const categoryImages = await pixabayAPI.getImageForCategory(
      category as string,
      detectedBusinessType,
      { count: 3 }
    );
    
    // Test 3: Sample images for a business type
    console.log('🏢 Test 3: Sample business images...');
    const sampleImages = await pixabayAPI.getSampleImages(detectedBusinessType);
    
    // Test 4: Image placeholder processing
    console.log('🔄 Test 4: Image placeholder processing...');
    const testHTML = `
      <div>
        <img src="/*IMAGE:logo*/" alt="Logo" className="h-10 w-10" />
        <img src="/*IMAGE:hero*/" alt="Hero" className="w-full h-64" />
        <img src="/*IMAGE:service*/" alt="Service" className="w-16 h-16" />
      </div>
    `;
    
    const processedHTML = await pixabayAPI.processImagePlaceholders(testHTML, detectedBusinessType);
    
    const response = {
      success: true,
      apiKey: process.env.PIXEL_BAY_KEY ? 'Set ✅' : 'Missing ❌',
      detectedBusinessType,
      tests: {
        basicSearch: {
          query: query,
          totalResults: searchResults.total,
          returnedImages: searchResults.hits.length,
          sampleImage: searchResults.hits[0] ? {
            id: searchResults.hits[0].id,
            url: searchResults.hits[0].webformatURL,
            tags: searchResults.hits[0].tags
          } : null
        },
        categorySearch: {
          category: category,
          businessType: detectedBusinessType,
          returnedImages: categoryImages.length,
          sampleImage: categoryImages[0] ? {
            id: categoryImages[0].id,
            url: categoryImages[0].webformatURL,
            tags: categoryImages[0].tags
          } : null
        },
        sampleImages: {
          businessType: detectedBusinessType,
          categories: Object.keys(sampleImages),
          samples: sampleImages
        },
        placeholderProcessing: {
          originalHTML: testHTML,
          processedHTML: processedHTML,
          placeholdersReplaced: (testHTML.match(/\/\*IMAGE:[^*]+\*\//g) || []).length,
          hasRealUrls: processedHTML.includes('https://')
        }
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Pixabay API test completed successfully');
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Pixabay API test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.PIXEL_BAY_KEY ? 'Set ✅' : 'Missing ❌',
      timestamp: new Date().toISOString()
    });
  }
}
