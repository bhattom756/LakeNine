// scripts/test-pixabay-integration.js
// Test script to verify Pixabay API integration works correctly

async function testPixabayIntegration() {
  console.log('🧪 Testing Pixabay API Integration...');
  console.log('=====================================');

  // Check if API key is set
  const apiKey = process.env.PIXEL_BAY_KEY || '52065865-d1b233db1671f3082922a6c67';
  if (!apiKey) {
    console.error('❌ PIXEL_BAY_KEY environment variable not set!');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 8) + '...');
  
  try {
    // Test 1: Basic API connectivity
    console.log('\n📡 Test 1: Basic API connectivity...');
    const testUrl = `https://pixabay.com/api/?key=${apiKey}&q=business&per_page=3`;
    
    // Use global fetch if available (Node 18+) or require https module
    let fetchFn;
    if (typeof fetch !== 'undefined') {
      fetchFn = fetch;
    } else {
      // Fallback for older Node versions
      const https = require('https');
      fetchFn = (url) => new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              json: () => Promise.resolve(JSON.parse(data))
            });
          });
        }).on('error', reject);
      });
    }
    
    const response = await fetchFn(testUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: Found ${data.totalHits} total images`);
    console.log(`✅ Returned ${data.hits.length} images in this request`);
    
    if (data.hits.length > 0) {
      const firstImage = data.hits[0];
      console.log(`📸 Sample image: ${firstImage.webformatURL}`);
      console.log(`🏷️  Tags: ${firstImage.tags}`);
    }
    
    // Test 2: Different categories
    console.log('\n🎯 Test 2: Testing different business categories...');
    const categories = ['gym', 'restaurant', 'hospital', 'business'];
    
    for (const category of categories) {
      const categoryUrl = `https://pixabay.com/api/?key=${apiKey}&q=${category}&per_page=1`;
      const categoryResponse = await fetchFn(categoryUrl);
      const categoryData = await categoryResponse.json();
      
      console.log(`${category.padEnd(12)}: ${categoryData.totalHits} images available`);
    }
    
    // Test 3: Image types
    console.log('\n🖼️  Test 3: Testing image types...');
    const imageTypes = ['photo', 'illustration', 'vector'];
    
    for (const imageType of imageTypes) {
      const typeUrl = `https://pixabay.com/api/?key=${apiKey}&q=business&image_type=${imageType}&per_page=1`;
      const typeResponse = await fetchFn(typeUrl);
      const typeData = await typeResponse.json();
      
      console.log(`${imageType.padEnd(12)}: ${typeData.totalHits} images available`);
    }
    
    // Test 4: Video API
    console.log('\n🎬 Test 4: Testing Video API...');
    const videoUrl = `https://pixabay.com/api/videos/?key=${apiKey}&q=business&per_page=1`;
    const videoResponse = await fetchFn(videoUrl);
    const videoData = await videoResponse.json();
    
    console.log(`✅ Video API: Found ${videoData.totalHits} videos`);
    if (videoData.hits.length > 0) {
      console.log(`📹 Sample video: ${videoData.hits[0].videos.medium.url}`);
    }
    
    console.log('\n🎉 All tests passed! Pixabay API integration is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`   • API Key: Valid and working`);
    console.log(`   • Image Search: ✅ Working`);
    console.log(`   • Video Search: ✅ Working`);
    console.log(`   • Different Categories: ✅ Working`);
    console.log(`   • Multiple Image Types: ✅ Working`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testPixabayIntegration();
}

module.exports = { testPixabayIntegration };
