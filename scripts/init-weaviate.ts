import { initializeComponentsFromFile } from '../lib/weaviate';

async function main() {
  console.log('🚀 Initializing Weaviate with components from sample.json...');
  
  try {
    const success = await initializeComponentsFromFile();
    
    if (success) {
      console.log('✅ Successfully initialized Weaviate database');
      console.log('Your components are now available for RAG-enhanced generation!');
    } else {
      console.log('❌ Failed to initialize Weaviate database');
      console.log('Please check your environment variables and try again');
    }
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
}

main().catch(console.error);
