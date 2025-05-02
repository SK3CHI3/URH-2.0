/**
 * Image Utilities for Reliable Image Loading
 * This module provides advanced features for ensuring images always load
 */

// Configuration
const imageConfig = {
  // Default fallback image by category
  fallbacks: {
    'Technology': 'public/images/fallbacks/technology.jpg',
    'Design': 'public/images/fallbacks/design.jpg',
    'Business': 'public/images/fallbacks/business.jpg',
    'Education': 'public/images/fallbacks/education.jpg',
    'Events': 'public/images/fallbacks/events.jpg',
    'Blogs & News': 'public/images/fallbacks/news.jpg',
    'default': 'https://via.placeholder.com/400x200?text=Resource'
  },
  
  // Public image proxy services for when direct loading fails
  proxyServices: [
    // Format: url => `${proxyUrl}${encodeURIComponent(url)}`
    url => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
    url => `https://wsrv.nl/?url=${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ],
  
  // Maximum retry attempts
  maxRetries: 3,
  
  // Delay between retries (ms)
  retryDelay: 2000,
  
  // Enable image proxy fallback
  useProxyFallback: true,
  
  // Enable preloading images 
  preloadImages: true
};

/**
 * Check if an image URL is valid and accessible
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Promise resolves to true if image is valid
 */
function isImageValid(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Set timeout to avoid hanging
    setTimeout(() => resolve(false), 10000);
  });
}

/**
 * Try loading an image through multiple proxy services
 * @param {string} originalUrl - Original image URL
 * @returns {Promise<string|null>} - Working URL or null if all fail
 */
async function findWorkingImageUrl(originalUrl) {
  // Try original URL first
  if (await isImageValid(originalUrl)) {
    return originalUrl;
  }
  
  // Skip proxy attempts if disabled
  if (!imageConfig.useProxyFallback) {
    return null;
  }
  
  // Try each proxy service
  for (const proxyGenerator of imageConfig.proxyServices) {
    try {
      const proxyUrl = proxyGenerator(originalUrl);
      if (await isImageValid(proxyUrl)) {
        console.log(`Found working proxy for image: ${originalUrl} => ${proxyUrl}`);
        return proxyUrl;
      }
    } catch (error) {
      console.error('Error with image proxy:', error);
    }
  }
  
  // All proxies failed
  return null;
}

/**
 * Fix all images on the page with advanced fallback mechanisms
 */
function fixAllImages() {
  document.querySelectorAll('img:not([data-fixed])').forEach(async img => {
    // Mark as fixed to prevent duplicate processing
    img.setAttribute('data-fixed', 'true');
    
    // Check for data-category to use appropriate fallback
    const category = img.getAttribute('data-category') || 'default';
    const fallbackImage = imageConfig.fallbacks[category] || imageConfig.fallbacks['default'];
    
    // Store original source
    const originalSrc = img.src;
    img.setAttribute('data-original-src', originalSrc);
    
    // Add loading attribute if not present
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Setup error handler with multiple fallbacks
    img.onerror = async function() {
      const currentRetries = parseInt(this.getAttribute('data-retries') || '0');
      
      if (currentRetries < imageConfig.maxRetries) {
        // Increment retry counter
        this.setAttribute('data-retries', (currentRetries + 1).toString());
        
        // Try to find a working URL (original or through proxy)
        const workingUrl = await findWorkingImageUrl(originalSrc);
        
        if (workingUrl) {
          console.log(`Recovered image with proxy: ${originalSrc}`);
          setTimeout(() => {
            this.src = workingUrl;
          }, imageConfig.retryDelay);
          return;
        }
      }
      
      // All retries failed, use category fallback
      console.warn(`All attempts to load image failed: ${originalSrc}`);
      this.src = fallbackImage;
      
      // Add failure class for styling
      this.classList.add('image-load-failed');
    };
    
    // Check already loaded images
    if (img.complete) {
      if (img.naturalWidth === 0) {
        img.onerror();
      }
    }
  });
}

/**
 * Preload important images to ensure they're in browser cache
 * @param {Array} urls - Array of image URLs to preload
 */
function preloadImages(urls) {
  if (!imageConfig.preloadImages) return;
  
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// Auto-initialize when included
document.addEventListener('DOMContentLoaded', () => {
  // Fix all existing images
  fixAllImages();
  
  // Watch for new images
  if (window.MutationObserver) {
    const observer = new MutationObserver(mutations => {
      let hasNewImages = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const images = [...mutation.addedNodes]
            .filter(node => node.nodeName === 'IMG' || 
                   (node.nodeType === 1 && node.querySelector('img')));
          
          if (images.length > 0) {
            hasNewImages = true;
          }
        }
      });
      
      if (hasNewImages) {
        fixAllImages();
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Preload category fallback images
  preloadImages(Object.values(imageConfig.fallbacks));
});

// Export utilities for use in other scripts
window.imageUtils = {
  isImageValid,
  findWorkingImageUrl,
  fixAllImages,
  preloadImages,
  imageConfig
}; 