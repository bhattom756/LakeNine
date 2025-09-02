const http = require('http');

console.log('🧪 TESTING UNIQUE IMAGE ASSIGNMENT\n');

const testData = JSON.stringify({
  prompt: "Create a gym website with multiple service cards and team members",
  useBoltPrompt: true
});

const req = http.request('http://localhost:5000/api/genCode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      
      if (!result.files) {
        console.error('❌ No files found in response');
        return;
      }
      
      console.log(`📁 Generated ${Object.keys(result.files).length} files\n`);
      
      // Analyze all image URLs across all generated files
      const allImageUrls = [];
      const imagesByFile = {};
      
      Object.entries(result.files).forEach(([filename, content]) => {
        if (filename.endsWith('.jsx') || filename.endsWith('.js')) {
          // Extract all image URLs from this file
          const imageMatches = content.match(/src="[^"]*\.(jpg|jpeg|png|gif|webp|svg)[^"]*"/g) || [];
          const urls = imageMatches.map(match => match.replace(/src="|"/g, ''));
          
          if (urls.length > 0) {
            imagesByFile[filename] = urls;
            allImageUrls.push(...urls);
            console.log(`📄 ${filename}: ${urls.length} images`);
          }
        }
      });
      
      console.log(`\n📊 TOTAL ANALYSIS:`);
      console.log(`Total images found: ${allImageUrls.length}`);
      console.log(`Unique images: ${new Set(allImageUrls).size}`);
      
      // Check for duplicates
      const urlCounts = {};
      allImageUrls.forEach(url => {
        urlCounts[url] = (urlCounts[url] || 0) + 1;
      });
      
      const duplicates = Object.entries(urlCounts).filter(([url, count]) => count > 1);
      
      if (duplicates.length === 0) {
        console.log('🎉 SUCCESS: All images are unique!');
      } else {
        console.log(`❌ DUPLICATES FOUND: ${duplicates.length} URLs used multiple times:`);
        duplicates.forEach(([url, count]) => {
          console.log(`   ${count}x: ${url.substring(0, 60)}...`);
        });
      }
      
      // Check image sources
      const pixabayImages = allImageUrls.filter(url => url.includes('pixabay.com'));
      const unsplashImages = allImageUrls.filter(url => url.includes('unsplash.com') || url.includes('image-proxy'));
      const otherImages = allImageUrls.filter(url => !url.includes('pixabay.com') && !url.includes('unsplash.com') && !url.includes('image-proxy'));
      
      console.log(`\n🌐 IMAGE SOURCES:`);
      console.log(`Pixabay: ${pixabayImages.length} (${Math.round(pixabayImages.length/allImageUrls.length*100)}%)`);
      console.log(`Unsplash: ${unsplashImages.length} (${Math.round(unsplashImages.length/allImageUrls.length*100)}%)`);
      console.log(`Other: ${otherImages.length} (${Math.round(otherImages.length/allImageUrls.length*100)}%)`);
      
      // Show sample URLs
      if (pixabayImages.length > 0) {
        console.log(`\n📸 SAMPLE PIXABAY URLS:`);
        pixabayImages.slice(0, 3).forEach((url, i) => {
          console.log(`   ${i + 1}: ${url.substring(0, 70)}...`);
        });
      }
      
      // Check specific components for image variety
      console.log(`\n🔍 PER-FILE ANALYSIS:`);
      Object.entries(imagesByFile).forEach(([filename, urls]) => {
        const uniqueCount = new Set(urls).size;
        const uniqueRatio = Math.round((uniqueCount / urls.length) * 100);
        console.log(`   ${filename}: ${urls.length} images, ${uniqueCount} unique (${uniqueRatio}%)`);
      });
      
      if (new Set(allImageUrls).size === allImageUrls.length) {
        console.log('\n✅ IMAGE UNIQUENESS TEST: PASSED');
        console.log('🎯 Each component now has its own unique image!');
      } else {
        const uniqueRatio = Math.round((new Set(allImageUrls).size / allImageUrls.length) * 100);
        console.log(`\n⚠️ IMAGE UNIQUENESS TEST: ${uniqueRatio}% UNIQUE`);
        console.log('Some images are still being reused');
      }
      
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(testData);
req.end();
