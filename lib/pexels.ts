import axios from 'axios';

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

// Expanded list of fallback placeholder images by category
const FALLBACK_IMAGES: Record<string, string[]> = {
  default: [
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg',
    'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg',
  ],
  // People/portrait images
  portrait: [
    'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  ],
  // Hero/banner images
  hero: [
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
  ],
  banner: [
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
  ],
  // Product images
  product: [
    'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
    'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg',
    'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg',
  ],
  // Creative work images
  creative: [
    'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg',
    'https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg',
    'https://images.pexels.com/photos/6444/pencil-typography-black-design.jpg',
  ],
  gym: [
    'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg',
    'https://images.pexels.com/photos/136405/pexels-photo-136405.jpeg',
    'https://images.pexels.com/photos/28080/pexels-photo.jpg',
    'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg',
  ],
  restaurant: [
    'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg',
    'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
    'https://images.pexels.com/photos/302549/pexels-photo-302549.jpeg',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
  ],
  food: [
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
  ],
  travel: [
    'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg',
    'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg',
    'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
  ],
  tech: [
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
    'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  ],
  phone: [
    'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg',
    'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg',
    'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
  ],
  fashion: [
    'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
    'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg',
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
  ],
  realestate: [
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
  ],
  education: [
    'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg',
    'https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg',
    'https://images.pexels.com/photos/159844/book-read-literature-pages-159844.jpeg',
  ],
  gallery: [
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg',
  ],
};

// Category mapping for alternative keywords
const CATEGORY_MAPPING: Record<string, string> = {
  'headshot': 'portrait',
  'person': 'portrait',
  'profile': 'portrait',
  'header': 'hero',
  'cover': 'banner',
  'item': 'product',
  'merchandise': 'product',
  'gadget': 'tech',
  'device': 'phone',
  'mobile': 'phone',
  'clothing': 'fashion',
  'apparel': 'fashion',
  'house': 'realestate',
  'property': 'realestate',
  'home': 'realestate',
  'school': 'education',
  'learning': 'education',
  'course': 'education',
  'dishes': 'food',
  'meal': 'food',
  'cuisine': 'food',
  'cafe': 'restaurant',
  'fitness': 'gym',
  'workout': 'gym',
};

export async function fetchPexelsImages(query: string, perPage: number = 3): Promise<string[]> {
  try {
    // Normalize query and map to proper category if needed
    const normalizedQuery = query.toLowerCase().trim();
    const mappedCategory = CATEGORY_MAPPING[normalizedQuery] || normalizedQuery;
    
    // Check if we have fallback images for this exact category
    if (!PEXELS_API_KEY || FALLBACK_IMAGES[mappedCategory]?.length > 0) {
      if (!PEXELS_API_KEY) {
        console.warn('Pexels API key is not set, using fallback images');
      }
      
      // Return the fallback images for this category if available
      if (FALLBACK_IMAGES[mappedCategory]) {
        return FALLBACK_IMAGES[mappedCategory];
      }
      
      // Try to find fallback images for a similar category
      const fallbackCategory = Object.keys(FALLBACK_IMAGES).find(key => 
        normalizedQuery.includes(key) || key.includes(normalizedQuery)
      );
      
      if (fallbackCategory) {
        return FALLBACK_IMAGES[fallbackCategory];
      }
      
      // Default fallback
      return FALLBACK_IMAGES.default;
    }
    
    // Make the API request if key is available
    const response = await axios.get(PEXELS_API_URL, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query: mappedCategory, // Use mapped category for better search results
        per_page: perPage,
        orientation: mappedCategory === 'hero' || mappedCategory === 'banner' ? 'landscape' : 'square',
      },
      timeout: 5000, // Add timeout to prevent hanging requests
    });
    
    // Check if photos array exists and is not empty
    if (response.data && 
        response.data.photos && 
        Array.isArray(response.data.photos) && 
        response.data.photos.length > 0) {
      // Get medium or large size based on category
      const sizeKey = ['hero', 'banner'].includes(mappedCategory) ? 'large' : 'medium';
      return response.data.photos.map((photo: any) => photo.src[sizeKey]);
    }
    
    throw new Error('No photos returned from Pexels API');
  } catch (error) {
    console.error('Error fetching Pexels images:', error);
    
    // Try to find the most relevant fallback category
    const normalizedQuery = query.toLowerCase().trim();
    const mappedCategory = CATEGORY_MAPPING[normalizedQuery] || normalizedQuery;
    
    // Return fallback images if we have them for this category
    if (FALLBACK_IMAGES[mappedCategory]) {
      return FALLBACK_IMAGES[mappedCategory];
    }
    
    // Try to find a similar category
    const fallbackCategory = Object.keys(FALLBACK_IMAGES).find(key => 
      normalizedQuery.includes(key) || key.includes(normalizedQuery)
    );
    
    if (fallbackCategory) {
      return FALLBACK_IMAGES[fallbackCategory];
    }
    
    // Default fallback
    return FALLBACK_IMAGES.default;
  }
}

/**
 * Processes HTML/CSS code to replace image placeholders with actual image URLs.
 * Supports the IMAGE:category placeholder format (e.g. /*IMAGE:hero*\/).
 */
export async function processImagesInCode(code: string): Promise<string> {
  // Regex to find and extract image placeholders
  const regex = /\/\*IMAGE:(.*?)\*\//g;
  let match;
  let processedCode = code;
  
  // Keep track of categories we've already fetched to avoid duplicate API calls
  const categoryCache: Record<string, string[]> = {};
  
  // Find all image placeholders and replace them
  while ((match = regex.exec(code)) !== null) {
    const placeholder = match[0]; // The full placeholder
    const category = match[1].trim().toLowerCase(); // The category name
    
    let imageUrls: string[];
    
    // Only fetch images once per category
    if (categoryCache[category]) {
      imageUrls = categoryCache[category];
    } else {
      // Get the correct images for this category
      imageUrls = await fetchPexelsImages(category, 3);
      categoryCache[category] = imageUrls;
    }
    
    // If we have images, replace the placeholder with a random one
    if (imageUrls && imageUrls.length > 0) {
      const randomIndex = Math.floor(Math.random() * imageUrls.length);
      const imageUrl = imageUrls[randomIndex];
      
      // Replace all instances of this exact placeholder
      processedCode = processedCode.replace(new RegExp(escapeRegExp(placeholder), 'g'), imageUrl);
    }
  }
  
  return processedCode;
}

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Ensure fetchPexelsImages is exported
export { fetchPexelsImages }; 