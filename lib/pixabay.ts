// lib/pixabay.ts
// Pixabay API integration for fetching royalty-free images and videos

interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL?: string;
  fullHDURL?: string;
  imageURL?: string;
  views: number;
  downloads: number;
  likes: number;
  user: string;
  userImageURL: string;
}

interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large: {
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    medium: {
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    small: {
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    tiny: {
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
  };
  views: number;
  downloads: number;
  likes: number;
  user: string;
  userImageURL: string;
}

interface PixabayImageResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

interface PixabayVideoResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
}

// Image category mappings for better search results - simplified for API compatibility
const IMAGE_CATEGORY_MAPPINGS = {
  // Business & General
  logo: 'logo business',
  hero: 'business background',
  office: 'office professional',
  about: 'team business',
  service: 'service professional',
  feature: 'technology modern',
  
  // Healthcare & Medical
  medical: 'medical healthcare',
  hospital: 'hospital medical',
  doctor: 'doctor medical',
  medical_equipment: 'medical equipment',
  
  // Fitness & Gym
  gym: 'gym fitness',
  fitness: 'fitness workout',
  gym_equipment: 'gym equipment',
  fitness_trainer: 'fitness trainer',
  workout: 'workout exercise',
  
  // Restaurant & Food
  restaurant: 'restaurant food',
  food: 'food cuisine',
  restaurant_dish: 'food dish',
  chef: 'chef cooking',
  restaurant_interior: 'restaurant interior',
  cafe: 'cafe coffee',
  
  // Education
  education: 'education school',
  school: 'school classroom',
  university: 'university campus',
  student: 'student learning',
  
  // Technology
  technology: 'technology digital',
  computer: 'computer technology',
  innovation: 'innovation modern',
  
  // General business categories
  team: 'team professional',
  testimonial: 'person professional',
  contact: 'office contact',
  
  // E-commerce
  shopping: 'shopping retail',
  product: 'product commerce',
  store: 'store retail',
  
  // Travel & Tourism
  travel: 'travel vacation',
  hotel: 'hotel accommodation',
  
  // Real Estate
  property: 'house property',
  home: 'home interior',
  
  // Finance
  finance: 'finance business',
  banking: 'banking finance',
  
  // Default fallback
  default: 'business professional'
};

// Business type specific search terms
const BUSINESS_TYPE_KEYWORDS = {
  gym: ['fitness', 'workout', 'exercise', 'training', 'gym', 'weights', 'cardio'],
  fitness: ['fitness', 'workout', 'exercise', 'training', 'gym', 'weights', 'cardio'],
  hospital: ['medical', 'healthcare', 'doctor', 'hospital', 'clinic', 'health'],
  medical: ['medical', 'healthcare', 'doctor', 'hospital', 'clinic', 'health'],
  restaurant: ['food', 'restaurant', 'cuisine', 'dining', 'chef', 'kitchen'],
  food: ['food', 'restaurant', 'cuisine', 'dining', 'chef', 'kitchen'],
  cafe: ['coffee', 'cafe', 'restaurant', 'drinks', 'pastry', 'dining'],
  education: ['education', 'school', 'university', 'student', 'learning', 'campus'],
  school: ['education', 'school', 'university', 'student', 'learning', 'campus'],
  university: ['education', 'school', 'university', 'student', 'learning', 'campus'],
  business: ['business', 'professional', 'corporate', 'office', 'team', 'modern'],
  technology: ['technology', 'computer', 'digital', 'innovation', 'software', 'tech'],
  ecommerce: ['shopping', 'retail', 'store', 'product', 'commerce', 'online'],
  travel: ['travel', 'tourism', 'vacation', 'destination', 'hotel', 'journey'],
  finance: ['finance', 'banking', 'money', 'investment', 'business', 'professional'],
  realestate: ['property', 'house', 'home', 'real estate', 'building', 'architecture']
};

class PixabayAPI {
  private apiKey: string;
  private baseURL = 'https://pixabay.com/api/';
  private videoBaseURL = 'https://pixabay.com/api/videos/';

  constructor() {
    this.apiKey = process.env.PIXEL_BAY_KEY || '';
    if (!this.apiKey) {
      console.error('❌ PIXEL_BAY_KEY environment variable is not set');
      throw new Error('PIXEL_BAY_KEY environment variable is required');
    }
  }

  /**
   * Search for images on Pixabay
   */
  async searchImages(
    query: string,
    options: {
      imageType?: 'all' | 'photo' | 'illustration' | 'vector';
      orientation?: 'all' | 'horizontal' | 'vertical';
      category?: string;
      minWidth?: number;
      minHeight?: number;
      safeSearch?: boolean;
      order?: 'popular' | 'latest';
      perPage?: number;
      page?: number;
    } = {}
  ): Promise<PixabayImageResponse> {
    try {
      const {
        imageType = 'photo',
        orientation = 'all',
        category,
        minWidth = 640,
        minHeight = 480,
        safeSearch = true,
        order = 'popular',
        perPage = 20,
        page = 1
      } = options;

      const searchParams = new URLSearchParams({
        key: this.apiKey,
        q: query, // Remove encodeURIComponent as URLSearchParams handles encoding
        image_type: imageType,
        orientation,
        safesearch: safeSearch.toString(),
        order,
        per_page: perPage.toString(),
        page: page.toString(),
        min_width: minWidth.toString(),
        min_height: minHeight.toString()
      });

      if (category) {
        searchParams.append('category', category);
      }

      const url = `${this.baseURL}?${searchParams.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        // Get the error response body for better debugging
        let errorMessage = `Pixabay API error: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error(`❌ Pixabay API Error Response: ${errorText}`);
          errorMessage += ` - ${errorText}`;
        } catch (e) {
          console.error(`❌ Could not read error response body`);
        }
        throw new Error(errorMessage);
      }

      const data: PixabayImageResponse = await response.json();
      console.log(`✅ Found ${data.totalHits} images for "${query}"`);
      
      return data;
    } catch (error) {
      console.error('❌ Error searching Pixabay images:', error);
      throw error;
    }
  }

  /**
   * Search for videos on Pixabay
   */
  async searchVideos(
    query: string,
    options: {
      videoType?: 'all' | 'film' | 'animation';
      category?: string;
      minWidth?: number;
      minHeight?: number;
      safeSearch?: boolean;
      order?: 'popular' | 'latest';
      perPage?: number;
      page?: number;
    } = {}
  ): Promise<PixabayVideoResponse> {
    try {
      const {
        videoType = 'all',
        category,
        minWidth = 640,
        minHeight = 480,
        safeSearch = true,
        order = 'popular',
        perPage = 20,
        page = 1
      } = options;

      const searchParams = new URLSearchParams({
        key: this.apiKey,
        q: query, // Remove encodeURIComponent as URLSearchParams handles encoding
        video_type: videoType,
        safesearch: safeSearch.toString(),
        order,
        per_page: perPage.toString(),
        page: page.toString(),
        min_width: minWidth.toString(),
        min_height: minHeight.toString()
      });

      if (category) {
        searchParams.append('category', category);
      }

      const url = `${this.videoBaseURL}?${searchParams.toString()}`;
      console.log(`🔍 Pixabay Video Search: ${query} (${url})`);

      const response = await fetch(url);
      
      if (!response.ok) {
        // Get the error response body for better debugging
        let errorMessage = `Pixabay API error: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error(`❌ Pixabay Video API Error Response: ${errorText}`);
          errorMessage += ` - ${errorText}`;
        } catch (e) {
          console.error(`❌ Could not read video error response body`);
        }
        throw new Error(errorMessage);
      }

      const data: PixabayVideoResponse = await response.json();
      console.log(`✅ Found ${data.totalHits} videos for "${query}"`);
      
      return data;
    } catch (error) {
      console.error('❌ Error searching Pixabay videos:', error);
      throw error;
    }
  }

  /**
   * Get contextual search terms based on image category and business type
   */
  private getContextualSearchTerms(imageCategory: string, businessContext?: string): string {
    // Get base terms for the image category
    let baseTerms = IMAGE_CATEGORY_MAPPINGS[imageCategory as keyof typeof IMAGE_CATEGORY_MAPPINGS] || 
                    IMAGE_CATEGORY_MAPPINGS.default;

    // Add business-specific context if provided
    if (businessContext) {
      const businessKeywords = BUSINESS_TYPE_KEYWORDS[businessContext as keyof typeof BUSINESS_TYPE_KEYWORDS];
      if (businessKeywords) {
        // Use only top 2 business keywords to avoid long queries
        const topBusinessKeywords = businessKeywords.slice(0, 2).join(' ');
        // Keep total query under 50 characters for better API compatibility
        baseTerms = `${topBusinessKeywords} ${baseTerms}`.substring(0, 50);
      }
    }

    // Ensure query is under Pixabay's 100 character limit
    return baseTerms.length > 100 ? baseTerms.substring(0, 100) : baseTerms;
  }

  /**
   * Get appropriate images for a specific category and business type
   */
  async getImageForCategory(
    imageCategory: string, 
    businessType?: string,
    options: {
      orientation?: 'all' | 'horizontal' | 'vertical';
      imageType?: 'all' | 'photo' | 'illustration' | 'vector';
      count?: number;
    } = {}
  ): Promise<PixabayImage[]> {
    const { orientation = 'all', imageType = 'photo', count = 5 } = options;
    
    try {
      // Get contextual search terms
      const searchQuery = this.getContextualSearchTerms(imageCategory, businessType);
      
      // Search for images
      const response = await this.searchImages(searchQuery, {
        imageType,
        orientation,
        safeSearch: true,
        order: 'popular',
        perPage: Math.max(3, Math.min(count * 2, 20)), // Pixabay minimum is 3, maximum is 200
        minWidth: imageCategory === 'logo' ? 200 : 640,
        minHeight: imageCategory === 'logo' ? 200 : 480
      });

      if (response.hits.length === 0) {
        console.warn(`⚠️ No images found for "${searchQuery}", trying fallback...`);
        
        // Fallback 1: Try simpler category-specific search
        const fallbackQueries = [
          imageCategory === 'logo' ? 'business logo' : imageCategory,
          businessType || 'business',
          'professional'
        ];
        
        for (const fallbackQuery of fallbackQueries) {
          try {
            const fallbackResponse = await this.searchImages(fallbackQuery, {
              imageType,
              orientation,
              safeSearch: true,
              order: 'popular',
              perPage: Math.max(3, 10) // Ensure minimum of 3
            });
            
            if (fallbackResponse.hits.length > 0) {
              return fallbackResponse.hits.slice(0, count);
            }
          } catch (fallbackError) {
            continue;
          }
        }
        
        // If all fallbacks fail, return empty array
        console.warn(`⚠️ All fallback queries failed for category: ${imageCategory}`);
        return [];
      }

      return response.hits.slice(0, count);
    } catch (error) {
      console.error(`❌ Error getting ${imageCategory} images:`, error);
      return [];
    }
  }

  /**
   * Get fallback image URL for categories when Pixabay fails
   */
  private getFallbackImageUrl(category: string): string {
    const fallbackImages = {
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop&crop=center',
      hero: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&crop=center',
      office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&crop=center',
      about: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=center',
      service: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
      feature: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop&crop=center',
      team: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
      testimonial: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      contact: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&h=300&fit=crop&crop=center',
      default: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop&crop=center'
    };
    
    return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.default;
  }

  /**
   * Process image placeholders in generated website code with UNIQUE images per component
   */
  async processImagePlaceholders(
    fileContent: string, 
    businessType?: string
  ): Promise<string> {
    let processedContent = fileContent;
    
    // Find all image placeholders in the format /*IMAGE:category*/
    const imagePlaceholderRegex = /\/\*IMAGE:([^*]+)\*\//g;
    const placeholders = [...fileContent.matchAll(imagePlaceholderRegex)];
    
    if (placeholders.length === 0) {
      return processedContent;
    }

    console.log(`🖼️ Processing ${placeholders.length} image placeholders for ${businessType || 'general'} business`);
    
    // Group placeholders by category and count occurrences
    const categoryCount: Record<string, number> = {};
    placeholders.forEach(match => {
      const category = match[1];
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    console.log('📊 Image category breakdown:', categoryCount);
    
    // Fetch multiple images for each category to ensure uniqueness
    const categoryImages: Record<string, PixabayImage[]> = {};
    const uniqueCategories = Object.keys(categoryCount);
    
    for (const category of uniqueCategories) {
      try {
        // Fetch MORE images than needed to ensure we have variety
        const neededCount = categoryCount[category];
        const fetchCount = Math.max(neededCount + 2, 8); // Get extra images for variety
        
        const images = await this.getImageForCategory(
          category,
          businessType,
          {
            orientation: category === 'hero' ? 'horizontal' : 'all',
            imageType: category === 'logo' ? 'vector' : 'photo',
            count: fetchCount
          }
        );
        
        if (images.length > 0) {
          categoryImages[category] = images;
          console.log(`✅ ${category}: ${images.length} unique images fetched (need ${neededCount})`);
        } else {
          console.warn(`⚠️ No Pixabay images found for category: ${category}`);
          categoryImages[category] = [];
        }
      } catch (error) {
        console.error(`❌ Error fetching images for ${category}:`, error);
        categoryImages[category] = [];
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    // Create unique image assignment for each placeholder occurrence
    const categoryImageIndex: Record<string, number> = {};
    const usedUrls = new Set<string>(); // Track used URLs globally to avoid duplicates
    
    // Process each placeholder individually to assign unique images
    let placeholderIndex = 0;
    processedContent = processedContent.replace(imagePlaceholderRegex, (match, category) => {
      placeholderIndex++;
      
      // Initialize index for this category
      if (!(category in categoryImageIndex)) {
        categoryImageIndex[category] = 0;
      }
      
      const images = categoryImages[category];
      let selectedImageUrl = '';
      
      if (images && images.length > 0) {
        // Try to find an unused image from this category
        let attempts = 0;
        let imageIndex = categoryImageIndex[category];
        
        while (attempts < images.length) {
          const currentImage = images[imageIndex % images.length];
          const imageUrl = currentImage.largeImageURL || currentImage.webformatURL;
          
          if (!usedUrls.has(imageUrl)) {
            // Found unused image
            selectedImageUrl = imageUrl;
            usedUrls.add(imageUrl);
            categoryImageIndex[category] = imageIndex + 1; // Move to next image for next use
            console.log(`🎯 ${category} #${placeholderIndex}: Assigned unique image (index ${imageIndex})`);
            break;
          }
          
          imageIndex++;
          attempts++;
        }
        
        // If we couldn't find unused image, use any available image
        if (!selectedImageUrl && images.length > 0) {
          const fallbackImage = images[imageIndex % images.length];
          selectedImageUrl = fallbackImage.largeImageURL || fallbackImage.webformatURL;
          categoryImageIndex[category] = imageIndex + 1;
          console.log(`⚠️ ${category} #${placeholderIndex}: Using fallback image (all unique images exhausted)`);
        }
      }
      
      // Use fallback URL if no Pixabay image available
      if (!selectedImageUrl) {
        const fallbackUrl = this.getFallbackImageUrl(category);
        // Proxy Unsplash images for WebContainer compatibility
        selectedImageUrl = `http://localhost:5000/api/image-proxy?url=${encodeURIComponent(fallbackUrl)}`;
        console.log(`🔄 ${category} #${placeholderIndex}: Using proxied Unsplash fallback`);
      }
      
      return selectedImageUrl;
    });
    
    const totalReplaced = placeholders.length;
    const uniqueImages = usedUrls.size;
    console.log(`🎯 Images processed: ${totalReplaced} placeholders replaced with ${uniqueImages} unique images`);
    
    // Final verification - check that replacements actually happened
    const finalCheck = (processedContent.match(/\/\*IMAGE:[^*]+\*\//g) || []).length;
    if (finalCheck > 0) {
      console.error(`❌ CRITICAL: ${finalCheck} image placeholders still remain after processing!`);
    } else {
      console.log(`✅ SUCCESS: All ${totalReplaced} image placeholders replaced with real URLs`);
    }
    
    // Log sample of replaced content for verification
    const sampleUrls = processedContent.match(/src="[^"]*\.(jpg|jpeg|png|gif|webp)[^"]*"/g) || [];
    if (sampleUrls.length > 0) {
      console.log(`📸 Sample image URLs (${sampleUrls.length} total):`);
      sampleUrls.slice(0, 3).forEach((url, i) => {
        console.log(`   ${i + 1}: ${url.substring(0, 70)}...`);
      });
    }
    
    // Calculate and report uniqueness ratio
    const uniqueRatio = Math.round((uniqueImages / totalReplaced) * 100);
    console.log(`📈 Image uniqueness: ${uniqueRatio}% (${uniqueImages}/${totalReplaced} unique)`);
    
    return processedContent;
  }

  /**
   * Get sample images for testing
   */
  async getSampleImages(businessType: string = 'business'): Promise<Record<string, string>> {
    const categories = ['logo', 'hero', 'service', 'team', 'about', 'office'];
    const sampleImages: Record<string, string> = {};
    
          for (const category of categories) {
        try {
          const images = await this.getImageForCategory(category, businessType, { count: 1 });
          if (images.length > 0) {
            sampleImages[category] = images[0].webformatURL;
          }
        } catch (error) {
          console.error(`Error getting sample ${category} image:`, error);
          sampleImages[category] = `/*IMAGE:${category}*/`;
        }
        
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    
    return sampleImages;
  }
}

// Export the API class and helper functions
export { PixabayAPI, type PixabayImage, type PixabayVideo, type PixabayImageResponse, type PixabayVideoResponse };

// Create and export a default instance
export const pixabayAPI = new PixabayAPI();

// Helper function to detect business type from prompt
export function detectBusinessType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('gym') || lowerPrompt.includes('fitness') || lowerPrompt.includes('workout')) {
    return 'gym';
  } else if (lowerPrompt.includes('hospital') || lowerPrompt.includes('medical') || lowerPrompt.includes('healthcare')) {
    return 'medical';
  } else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food') || lowerPrompt.includes('dining')) {
    return 'restaurant';
  } else if (lowerPrompt.includes('cafe') || lowerPrompt.includes('coffee')) {
    return 'cafe';
  } else if (lowerPrompt.includes('school') || lowerPrompt.includes('university') || lowerPrompt.includes('education')) {
    return 'education';
  } else if (lowerPrompt.includes('technology') || lowerPrompt.includes('software') || lowerPrompt.includes('tech')) {
    return 'technology';
  } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
    return 'ecommerce';
  } else if (lowerPrompt.includes('travel') || lowerPrompt.includes('hotel') || lowerPrompt.includes('tourism')) {
    return 'travel';
  } else if (lowerPrompt.includes('finance') || lowerPrompt.includes('bank') || lowerPrompt.includes('investment')) {
    return 'finance';
  } else if (lowerPrompt.includes('real estate') || lowerPrompt.includes('property') || lowerPrompt.includes('realty')) {
    return 'realestate';
  }
  
  return 'business';
}
