const { pixabayAPI } = require('./lib/pixabay.ts');

async function testImageFetching() {
  console.log('🧪 TESTING PIXABAY IMAGE FETCHING & UNIQUENESS\n');
  
  try {
    // Test 1: Check if API key is working
    console.log('🔑 Testing API key...');
    const logoImages = await pixabayAPI.getImageForCategory('logo', 'gym', { count: 5 });
    console.log(`✅ API working: Found ${logoImages.length} logo images\n`);
    
    // Test 2: Check multiple images for same category
    console.log('🔍 Testing image variety for same category...');
    const serviceImages = await pixabayAPI.getImageForCategory('service', 'gym', { count: 10 });
    console.log(`📸 Service images found: ${serviceImages.length}`);
    
    if (serviceImages.length >= 3) {
      console.log('✅ Multiple images available for variety');
      console.log(`Image 1: ${serviceImages[0].webformatURL.substring(0, 60)}...`);
      console.log(`Image 2: ${serviceImages[1].webformatURL.substring(0, 60)}...`);
      console.log(`Image 3: ${serviceImages[2].webformatURL.substring(0, 60)}...`);
      
      // Check if they're actually different
      const uniqueUrls = new Set(serviceImages.map(img => img.webformatURL));
      console.log(`✅ Unique URLs: ${uniqueUrls.size}/${serviceImages.length}`);
    } else {
      console.log('❌ Not enough image variety');
    }
    
    // Test 3: Test processing with multiple placeholders of same category
    console.log('\n🔄 Testing placeholder processing with duplicates...');
    const testContent = `
      <div className="service-card-1">
        <img src="/*IMAGE:service*/" alt="Service 1" />
      </div>
      <div className="service-card-2">  
        <img src="/*IMAGE:service*/" alt="Service 2" />
      </div>
      <div className="service-card-3">
        <img src="/*IMAGE:service*/" alt="Service 3" />
      </div>
      <div className="hero-section">
        <img src="/*IMAGE:hero*/" alt="Hero" />
      </div>
    `;
    
    const processedContent = await pixabayAPI.processImagePlaceholders(testContent, 'gym');
    
    // Extract all image URLs from processed content
    const imageUrls = processedContent.match(/src="[^"]+"/g) || [];
    console.log(`📊 Total images replaced: ${imageUrls.length}`);
    
    // Check for uniqueness
    const uniqueImages = new Set(imageUrls);
    console.log(`🎯 Unique images: ${uniqueImages.size}/${imageUrls.length}`);
    
    if (uniqueImages.size === imageUrls.length) {
      console.log('🎉 SUCCESS: All images are unique!');
    } else {
      console.log('❌ PROBLEM: Some images are duplicated');
      console.log('Found URLs:');
      imageUrls.forEach((url, i) => {
        console.log(`  ${i + 1}: ${url.substring(0, 80)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testImageFetching();
