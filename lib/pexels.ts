import { createClient, ErrorResponse, Photo, PhotosWithTotalResults } from 'pexels';

// Initialize Pexels client with fallback
const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const pexelsClient = apiKey ? createClient(apiKey) : null;

if (!apiKey) {
  console.warn('Warning: NEXT_PUBLIC_PEXELS_API_KEY is not set. Using fallback images only.');
}

// Map common image categories to more specific search terms
const categoryMappings: Record<string, string> = {
  // General categories
  'hero': 'modern professional business',
  'product': 'premium product display',
  'person': 'professional business person',
  'creative': 'creative design workspace',
  'portrait': 'professional headshot portrait',
  'team': 'diverse professional team meeting',
  
  // Business categories
  'business': 'modern business office professional',
  'business_woman': 'professional business woman leader',
  'business_man': 'professional business man executive', 
  'meeting': 'professional business meeting conference',
  'startup': 'modern tech startup office',
  'office': 'modern professional workspace',
  
  // Technology categories
  'tech': 'modern technology device high quality',
  'device': 'premium tech device',
  'laptop': 'premium laptop computer desk',
  'smartphone': 'modern smartphone device',
  'coding': 'programming code on screen developer',
  
  // Fitness and Wellness
  'fitness': 'modern fitness training gym',
  'gym': 'luxury fitness gym equipment',
  'gym_equipment': 'premium fitness equipment gym',
  'workout': 'professional fitness workout training',
  'yoga': 'yoga wellness meditation class',
  'fitness_trainer': 'professional fitness trainer coach',
  
  // Food and Restaurant
  'food': 'gourmet food dish professional',
  'restaurant': 'upscale restaurant interior',
  'restaurant_dish': 'gourmet restaurant dish plated',
  'cafe': 'modern stylish cafe',
  'coffee': 'premium coffee cup artisan',
  'chef': 'professional chef cooking restaurant',
  
  // Logos and Branding
  'logo': 'modern company logo design professional',
  'brand': 'professional brand identity logo',
  'company_logo': 'clean corporate logo design',
  
  // Office and Business  
  'testimonial': 'professional business person portrait',
  'about': 'professional team meeting office',
  
  // Medical and Healthcare
  'medical': 'modern hospital medical professional',
  'hospital': 'modern hospital interior medical',
  'doctor': 'professional doctor medical healthcare',
  'medical_equipment': 'advanced medical equipment hospital',
  'healthcare': 'healthcare medical professional care',
  'clinic': 'modern medical clinic interior',
  
  // Fashion and Beauty
  'fashion': 'high fashion premium clothing',
  'clothing': 'premium fashion clothing apparel',
  'beauty': 'luxury beauty products cosmetics',
  'model': 'professional fashion model',
  
  // Real Estate and Interior
  'interior': 'luxury modern interior design',
  'luxury_interior': 'premium luxury home interior',
  'home': 'modern luxury home interior',
  'real_estate': 'luxury real estate property',
  'architecture': 'modern luxury architecture',
  
  // E-commerce
  'shop': 'modern retail store interior',
  'product_display': 'premium product photography display',
  'shopping': 'modern shopping experience retail',
  
  // Restaurant specific
  'restaurant_interior': 'upscale restaurant dining room interior',
  
  // Education
  'education': 'modern education classroom',
  'student': 'diverse students learning education',
  'classroom': 'modern educational classroom',
  'teacher': 'professional teacher education classroom',
  
  // Default fallbacks by industry
  'travel': 'scenic luxury travel destination',
  'nature': 'stunning landscape nature scenery',
  'city': 'modern urban city skyline',
  'transportation': 'modern transportation vehicle',
};

// Fetch relevant images based on category
export async function fetchPexelsImages(category: string, count: number = 1): Promise<string[]> {
  try {
    // Normalize category - remove special chars, lowercase, trim
    const normalizedCategory = category.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    
    // If no client is available, return fallback images
    if (!pexelsClient) {
      const fallbackCategory = CATEGORY_MAPPING[normalizedCategory] || normalizedCategory;
      const fallbackImages = FALLBACK_IMAGES[fallbackCategory] || FALLBACK_IMAGES.default;
      return [fallbackImages[0] || `https://via.placeholder.com/1200x800?text=${normalizedCategory}`];
    }
    
    // Get enhanced search term from mapping or use the original category
    const searchTerm = categoryMappings[normalizedCategory] || 
                       categoryMappings[normalizedCategory.replace(/_.*$/, '')] || // Try base category
                       `${normalizedCategory.replace(/_/g, ' ')} high quality`; // Default to category with spaces
                       
    // Set options for higher quality images
    const options = {
      per_page: count * 3, // Get more to choose from
      query: searchTerm,
      orientation: 'landscape',
      size: 'large', // Prefer larger images
      locale: 'en-US'
    };
    
    // Execute query
    const response = await pexelsClient.photos.search(options) as PhotosWithTotalResults;
    
    // Sort by size and quality (larger and better quality first)
    const sortedPhotos = response.photos.sort((a, b) => {
      // Prioritize by resolution
      const aResolution = a.width * a.height;
      const bResolution = b.width * b.height;
      
      // If similar resolution, prioritize newer photos
      if (Math.abs(aResolution - bResolution) < 200000) {
        return (b.id || 0) - (a.id || 0); // Newer photos have higher IDs
      }
      
      return bResolution - aResolution;
    });
    
    // Get URLs of top photos up to requested count
    const imageUrls = sortedPhotos.slice(0, count).map(photo => photo.src.large);
    
    // If no images found, return placeholder
    if (imageUrls.length === 0) {
      return [`https://via.placeholder.com/1200x800?text=${normalizedCategory}`];
    }
    
    return imageUrls;
  } catch (error) {
    console.error(`Error fetching images for ${category}:`, error);
    // Return a fallback image on error
    const fallbackCategory = CATEGORY_MAPPING[category] || category;
    const fallbackImages = FALLBACK_IMAGES[fallbackCategory] || FALLBACK_IMAGES.default;
    return [fallbackImages[0] || `https://via.placeholder.com/1200x800?text=${category}`];
  }
}

// Process code string to extract and replace image placeholders
export async function processImagesInCode(code: string): Promise<string> {
  if (!code) return '';
  
  try {
    const regex = /\/\*IMAGE:([a-zA-Z0-9_-]+)\*\//g;
    let match;
    let processedCode = code;
    const categories = new Set<string>();
    
    // First, collect all unique categories to batch process them
    while ((match = regex.exec(code)) !== null) {
      categories.add(match[1]);
    }
    
    if (categories.size === 0) {
      console.log('🔍 No image placeholders found in code');
      return code;
    }
    
    console.log(`📷 Processing ${categories.size} image categories:`, Array.from(categories));
    
    // Fetch all images at once with better error handling
    const categoryImages: Record<string, string[]> = {};
    for (const category of categories) {
      try {
        console.log(`🔍 Fetching images for category: ${category}`);
        categoryImages[category] = await fetchPexelsImages(category, 1);
        console.log(`✅ Got image for ${category}: ${categoryImages[category][0]}`);
      } catch (error) {
        console.warn(`Failed to fetch images for category: ${category}`, error);
        // Use fallback image for failed categories
        const fallback = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
        categoryImages[category] = [fallback[0]];
        console.log(`🔄 Using fallback for ${category}: ${fallback[0]}`);
      }
    }
    
    // Replace all placeholders with actual image URLs
    for (const [category, images] of Object.entries(categoryImages)) {
      const categoryRegex = new RegExp(`\\/\\*IMAGE:${category}\\*\\/`, 'g');
      const replacements = (processedCode.match(categoryRegex) || []).length;
      processedCode = processedCode.replace(categoryRegex, images[0]);
      console.log(`🔄 Replaced ${replacements} instances of /*IMAGE:${category}*/ with ${images[0]}`);
    }
    
    console.log(`✅ Image processing complete for all categories`);
    return processedCode;
  } catch (error) {
    console.error('Error processing images in code:', error);
    return code; // Return original code if processing fails
  }
}

// Expanded list of fallback placeholder images by category
export const FALLBACK_IMAGES: Record<string, string[]> = {
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
  // Medical/Healthcare
  medical: [
    'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
    'https://images.pexels.com/photos/127873/pexels-photo-127873.jpeg',
    'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg',
  ],
  hospital: [
    'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
    'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg',
    'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
  ],
  doctor: [
    'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg',
    'https://images.pexels.com/photos/612999/pexels-photo-612999.jpeg',
    'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
  ],
  medical_equipment: [
    'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg',
    'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
    'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
  ],
  // Logos and Branding  
  logo: [
    'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg',
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
  ],
  brand: [
    'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg',
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
  ],
  company_logo: [
    'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg',
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
  ],
  // Office and Business
  office: [
    'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg',
    'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg',
    'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg',
  ],
  testimonial: [
    'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
  ],
  about: [
    'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg',
    'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
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
  'profile': 'portrait',
  'header': 'hero',
  'cover': 'banner',
  'item': 'product',
  'merchandise': 'product',
  'gadget': 'tech',
  'mobile': 'phone',
  'clothing': 'fashion',
  'apparel': 'fashion',
  'house': 'realestate',
  'property': 'realestate',
  'school': 'education',
  'learning': 'education',
  'course': 'education',
  'dishes': 'food',
  'meal': 'food',
  'cuisine': 'food',
}; 