// lib/pexels.ts
// Pexels API integration for fetching high-quality stock photos

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
  prev_page?: string;
}

// Image category search terms optimized for Pexels
const IMAGE_CATEGORY_SEARCH_TERMS = {
  // Business & General
  logo: 'modern business logo professional branding',
  hero: 'business professional office modern workspace',
  office: 'modern office workspace professional environment',
  about: 'business team professional meeting collaboration',
  service: 'professional services business solutions',
  feature: 'technology innovation modern business',
  
  // Healthcare & Medical
  medical: 'medical healthcare professional clean',
  hospital: 'hospital medical facility healthcare',
  doctor: 'doctor medical professional healthcare',
  medical_equipment: 'medical equipment healthcare technology',
  
  // Fitness & Gym
  gym: 'fitness gym equipment workout modern',
  fitness: 'fitness workout exercise healthy lifestyle',
  gym_equipment: 'gym equipment fitness machines',
  fitness_trainer: 'fitness trainer personal coach',
  workout: 'workout exercise fitness training',
  
  // Restaurant & Food
  restaurant: 'restaurant dining elegant food service',
  food: 'gourmet food culinary professional presentation',
  restaurant_dish: 'restaurant food plating culinary',
  chef: 'chef professional kitchen culinary',
  restaurant_interior: 'restaurant interior dining elegant',
  cafe: 'coffee shop cafe modern interior',
  
  // Education
  education: 'education learning school modern',
  school: 'school classroom learning environment',
  university: 'university campus education modern',
  student: 'students learning education collaboration',
  
  // Technology
  technology: 'technology innovation modern digital',
  computer: 'computer technology workspace modern',
  innovation: 'innovation technology modern business',
  
  // General categories
  team: 'business team professional diverse',
  testimonial: 'professional person business headshot',
  contact: 'business contact professional office',
  
  // E-commerce
  shopping: 'shopping retail modern store',
  product: 'product photography commercial clean',
  store: 'retail store modern shopping',
  
  // Travel & Tourism
  travel: 'travel destination beautiful landscape',
  hotel: 'luxury hotel interior elegant',
  
  // Real Estate
  property: 'modern house property architecture',
  home: 'home interior design modern',
  
  // Finance
  finance: 'finance banking business professional',
  banking: 'banking finance professional business',
  
  // Default fallback
  default: 'business professional modern clean'
};

// Business type specific modifiers
const BUSINESS_SEARCH_MODIFIERS = {
  gym: 'fitness gym equipment workout',
  fitness: 'fitness exercise healthy',
  hospital: 'medical healthcare clean',
  medical: 'medical healthcare professional',
  restaurant: 'restaurant food dining',
  food: 'food culinary gourmet',
  cafe: 'coffee cafe modern',
  education: 'education learning school',
  school: 'school education learning',
  university: 'university education campus',
  business: 'business professional corporate',
  technology: 'technology innovation digital',
  ecommerce: 'shopping retail commerce',
  travel: 'travel tourism destination',
  finance: 'finance banking professional',
  realestate: 'property house real estate'
};

class PexelsAPI {
  private apiKey: string;
  private baseURL = 'https://api.pexels.com/v1';
  private logoCache = new Map<string, string>(); // Cache logos per business type
  private usedImageIds = new Set<number>(); // Track used images to avoid duplicates

  constructor() {
    this.apiKey = process.env.PEXELS_API_TOKEN || '';
    if (!this.apiKey) {
      console.error('❌ PEXELS_API_TOKEN environment variable is not set');
      throw new Error('PEXELS_API_TOKEN environment variable is required');
    }
  }

  /**
   * Search for photos on Pexels
   */
  async searchPhotos(
    query: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'square';
      size?: 'large' | 'medium' | 'small';
      color?: string;
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<PexelsSearchResponse> {
    try {
      const {
        orientation,
        size,
        color,
        page = 1,
        perPage = 15
      } = options;

      const params = new URLSearchParams({
        query: query,
        page: page.toString(),
        per_page: Math.min(perPage, 80).toString() // Pexels max is 80
      });

      if (orientation) params.append('orientation', orientation);
      if (size) params.append('size', size);
      if (color) params.append('color', color);

      const url = `${this.baseURL}/search?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data: PexelsSearchResponse = await response.json();
      console.log(`✅ Found ${data.total_results} photos for "${query}"`);
      
      return data;
    } catch (error) {
      console.error('❌ Error searching Pexels photos:', error);
      throw error;
    }
  }

  /**
   * Get contextual search query based on image category and business type
   */
  private getSearchQuery(imageCategory: string, businessType?: string): string {
    // Get base search terms for category
    let searchTerms = IMAGE_CATEGORY_SEARCH_TERMS[imageCategory as keyof typeof IMAGE_CATEGORY_SEARCH_TERMS] || 
                     IMAGE_CATEGORY_SEARCH_TERMS.default;

    // Add business-specific modifiers if provided
    if (businessType) {
      const businessModifier = BUSINESS_SEARCH_MODIFIERS[businessType as keyof typeof BUSINESS_SEARCH_MODIFIERS];
      if (businessModifier) {
        searchTerms = `${businessModifier} ${searchTerms}`;
      }
    }

    return searchTerms;
  }

  /**
   * Get consistent logo for a business type (cached)
   */
  async getLogoForBusiness(businessType: string): Promise<string> {
    // Check cache first for consistency across website
    if (this.logoCache.has(businessType)) {
      console.log(`📋 Using cached logo for ${businessType}`);
      return this.logoCache.get(businessType)!;
    }

    try {
      const searchQuery = this.getSearchQuery('logo', businessType);
      
      const response = await this.searchPhotos(searchQuery, {
        orientation: 'square',
        size: 'medium',
        perPage: 10
      });

      if (response.photos.length > 0) {
        // Find first unused photo
        let selectedPhoto = response.photos.find(photo => !this.usedImageIds.has(photo.id));
        
        if (!selectedPhoto) {
          // If all are used, use the first one anyway for logos (consistency is key)
          selectedPhoto = response.photos[0];
        }

        const logoUrl = selectedPhoto.src.medium; // Good size for logos
        this.logoCache.set(businessType, logoUrl);
        this.usedImageIds.add(selectedPhoto.id);
        
        console.log(`✅ Selected consistent logo for ${businessType}: ${logoUrl.substring(0, 50)}...`);
        return logoUrl;
      }
      
      throw new Error('No logo photos found');
      
    } catch (error) {
      console.error(`❌ Error getting logo for ${businessType}:`, error);
      // Return fallback logo
      const fallbackLogo = 'https://images.pexels.com/photos/1162964/pexels-photo-1162964.jpeg?auto=compress&cs=tinysrgb&h=200&w=200';
      this.logoCache.set(businessType, fallbackLogo);
      return fallbackLogo;
    }
  }

  /**
   * Get unique image for a specific category
   */
  async getImageForCategory(
    imageCategory: string,
    businessType?: string,
    options: {
      orientation?: 'landscape' | 'portrait' | 'square';
      excludeIds?: number[];
    } = {}
  ): Promise<string> {
    try {
      // Special handling for logos - always return consistent logo
      if (imageCategory === 'logo') {
        return await this.getLogoForBusiness(businessType || 'business');
      }

      const { orientation, excludeIds = [] } = options;
      const searchQuery = this.getSearchQuery(imageCategory, businessType);
      
      // Determine orientation based on category if not specified
      let finalOrientation = orientation;
      if (!finalOrientation) {
        if (imageCategory === 'hero') finalOrientation = 'landscape';
        else if (imageCategory === 'team' || imageCategory === 'testimonial') finalOrientation = 'portrait';
        else finalOrientation = 'landscape';
      }

      const response = await this.searchPhotos(searchQuery, {
        orientation: finalOrientation,
        size: 'medium',
        perPage: 30 // Get more options to avoid duplicates
      });

      if (response.photos.length === 0) {
        throw new Error(`No photos found for category: ${imageCategory}`);
      }

      // Find first unused photo
      const availablePhotos = response.photos.filter(photo => 
        !this.usedImageIds.has(photo.id) && !excludeIds.includes(photo.id)
      );

      let selectedPhoto;
      if (availablePhotos.length > 0) {
        selectedPhoto = availablePhotos[0];
      } else {
        // If all are used, get a random one from the results to at least vary the selection
        const randomIndex = Math.floor(Math.random() * response.photos.length);
        selectedPhoto = response.photos[randomIndex];
        console.warn(`⚠️ All ${imageCategory} images have been used, selecting random fallback`);
      }

      // Mark as used
      this.usedImageIds.add(selectedPhoto.id);

      // Choose appropriate size based on category
      let imageUrl;
      if (imageCategory === 'hero') {
        imageUrl = selectedPhoto.src.large; // Large for hero images
      } else if (imageCategory === 'team' || imageCategory === 'testimonial') {
        imageUrl = selectedPhoto.src.medium; // Medium for people photos
      } else {
        imageUrl = selectedPhoto.src.large; // Large for general use
      }

      console.log(`✅ Selected unique ${imageCategory} image (ID: ${selectedPhoto.id})`);
      return imageUrl;

    } catch (error) {
      console.error(`❌ Error getting ${imageCategory} image:`, error);
      
      // Return category-specific fallback
      const fallbacks = {
        hero: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200',
        team: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        service: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
        office: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=600',
        default: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=600'
      };
      
      return fallbacks[imageCategory as keyof typeof fallbacks] || fallbacks.default;
    }
  }

  /**
   * Process image placeholders in generated website code
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

    console.log(`🖼️ Processing ${placeholders.length} image placeholders using PEXELS for ${businessType || 'general'} business`);
    
    // Group placeholders by category and count occurrences
    const categoryCount: Record<string, number> = {};
    placeholders.forEach(match => {
      const category = match[1];
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    console.log('📊 Image category breakdown:', categoryCount);
    
    // Process each placeholder individually to assign unique images
    const processedPlaceholders = new Set<string>();
    const usedUrlsInThisFile = new Set<string>();
    
    for (let i = 0; i < placeholders.length; i++) {
      const match = placeholders[i];
      const category = match[1];
      const fullMatch = match[0];
      
      try {
        let imageUrl: string;
        
        // For logos, always use the same URL across the entire website
        if (category === 'logo') {
          imageUrl = await this.getLogoForBusiness(businessType || 'business');
        } else {
          // For other categories, ensure uniqueness within this file
          const excludeIds: number[] = [];
          
          // Get unique image for this category occurrence
          imageUrl = await this.getImageForCategory(category, businessType, {
            excludeIds
          });
          
          // If we've already used this URL in this file, try to get another one
          let attempts = 0;
          while (usedUrlsInThisFile.has(imageUrl) && attempts < 3) {
            imageUrl = await this.getImageForCategory(category, businessType);
            attempts++;
          }
        }
        
        usedUrlsInThisFile.add(imageUrl);
        
        // Replace this specific placeholder occurrence
        const placeholderPattern = fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        processedContent = processedContent.replace(
          new RegExp(placeholderPattern), 
          imageUrl
        );
        
        console.log(`🎯 ${category} #${i + 1}: Assigned image from Pexels`);
        
        // Add delay to respect rate limits (avoid overwhelming API)
        if (i < placeholders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        }
        
      } catch (error) {
        console.error(`❌ Failed to process ${category} placeholder #${i + 1}:`, error);
        
        // Use fallback
        const fallbackUrl = `https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=600`;
        processedContent = processedContent.replace(fullMatch, fallbackUrl);
      }
    }
    
    const totalReplaced = placeholders.length;
    const uniqueImages = usedUrlsInThisFile.size;
    console.log(`🎯 Images processed: ${totalReplaced} placeholders replaced with ${uniqueImages} unique Pexels images`);
    
    // Final verification
    const finalCheck = (processedContent.match(/\/\*IMAGE:[^*]+\*\//g) || []).length;
    if (finalCheck > 0) {
      console.error(`❌ CRITICAL: ${finalCheck} image placeholders still remain after processing!`);
    } else {
      console.log(`✅ SUCCESS: All ${totalReplaced} image placeholders replaced with Pexels URLs`);
    }
    
    // Log sample URLs
    const sampleUrls = processedContent.match(/src="[^"]*pexels[^"]*"/g) || [];
    if (sampleUrls.length > 0) {
      console.log(`📸 Sample Pexels URLs (${sampleUrls.length} total):`);
      sampleUrls.slice(0, 3).forEach((url, i) => {
        console.log(`   ${i + 1}: ${url.substring(0, 80)}...`);
      });
    }
    
    // Calculate uniqueness ratio
    const uniqueRatio = Math.round((uniqueImages / totalReplaced) * 100);
    console.log(`📈 Image uniqueness in this file: ${uniqueRatio}% (${uniqueImages}/${totalReplaced} unique)`);
    
    return processedContent;
  }

  /**
   * Reset image usage tracking (call this for each new website generation)
   */
  resetImageTracking(): void {
    this.usedImageIds.clear();
    // Keep logo cache to maintain consistency across websites
    console.log('🔄 Reset image tracking for new website generation');
  }

  /**
   * Test Pexels API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.searchPhotos('business professional', { perPage: 1 });
      console.log('✅ Pexels API connection successful');
      return response.photos.length > 0;
    } catch (error) {
      console.error('❌ Pexels API connection failed:', error);
      return false;
    }
  }
}

// Export the API class
export { PexelsAPI, type PexelsPhoto, type PexelsSearchResponse };

// Create and export a default instance
export const pexelsAPI = new PexelsAPI();

// Helper function to detect business type from prompt (reused from previous implementation)
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
