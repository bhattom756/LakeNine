// scripts/test-pixabay-simple.js
// Simple test to isolate Pixabay API issues

async function testSimplePixabayAPI() {
  console.log('🧪 Simple Pixabay API Test...');
  console.log('============================');

  const apiKey = '52065865-d1b233db1671f3082922a6c67';
  
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
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        });
      }).on('error', reject);
    });
  }

  const testQueries = [
    'business',
    'gym',
    'fitness',
    'office',
    'team',
    'logo'
  ];

  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&per_page=1&safesearch=true`;
      console.log(`URL: ${url}`);
      
      const response = await fetchFn(url);
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error response: ${errorText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Success: Found ${data.totalHits} images for "${query}"`);
      
      if (data.hits && data.hits.length > 0) {
        console.log(`   Sample image: ${data.hits[0].webformatURL}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing "${query}":`, error.message);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Simple test completed');
}

// Run the test
if (require.main === module) {
  testSimplePixabayAPI();
}

module.exports = { testSimplePixabayAPI };
