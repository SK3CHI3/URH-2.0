// Enhanced resource scraper with Scrapfly.io integration and Axios fallback
require('dotenv').config();
const { ScrapflyClient, ScrapeConfig } = require('scrapfly-sdk');
const cheerio = require('cheerio');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const sources = require('./sources');

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Scrapfly client if API key is available
let scrapfly = null;
if (process.env.SCRAPFLY_API_KEY) {
  try {
    scrapfly = new ScrapflyClient({
      key: process.env.SCRAPFLY_API_KEY,
      maxConcurrency: parseInt(process.env.SCRAPER_MAX_CONCURRENT || '3')
    });
    logWithTime('Scrapfly client initialized successfully');
  } catch (error) {
    logWithTime(`Error initializing Scrapfly client: ${error.message}`);
  }
} else {
  logWithTime('SCRAPFLY_API_KEY not found in environment variables. Scraper functionality will be limited.');
}

// Console log with timestamp
function logWithTime(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Scrape a website using Axios and Cheerio (fallback method)
 * @param {object} site - Site configuration object
 * @returns {Promise<Array>} - Array of extracted resources
 */
async function scrapeWebsiteWithAxios(site) {
  try {
    logWithTime(`[${site.name}] Starting scrape with Axios fallback`);

    // Set user agent to mimic a browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };

    // Make the request with axios
    const response = await axios.get(site.url, {
      headers,
      timeout: 30000, // 30 second timeout
      maxRedirects: 5
    });

    if (!response || !response.data) {
      throw new Error(`Failed to retrieve page content from ${site.url}`);
    }

    // Load the HTML content with cheerio
    const $ = cheerio.load(response.data);

    // Continue with the same parsing logic as the original function
    const resources = [];
    const maxItems = site.category === 'Education' ? 10 : 5;

    let count = 0;
    const elements = $(site.selector).toArray();

    for (const el of elements) {
      if (count >= maxItems) break;

      const $el = $(el);
      const titleEl = $el.find(site.titleSelector);
      let title = '';

      // Handle function or selector for title
      if (typeof site.titleSelector === 'function') {
        title = site.titleSelector($, el);
      } else {
        title = titleEl.text().trim();
      }

      // Skip if no title
      if (!title) continue;

      // Get description - handle function or selector
      let description = '';
      if (typeof site.descriptionSelector === 'function') {
        description = site.descriptionSelector($, el);
      } else {
        description = $el.find(site.descriptionSelector).text().trim();
      }

      description = description || `A resource from ${site.name}`;

      // Create basic resource object
      const resource = {
        title,
        description,
        source: site.name,
        category: site.category,
        tags: site.tags ? [...site.tags] : []
      };

      // Skip if not relevant based on keywords
      if (!isResourceRelevant(resource, site)) {
        continue;
      }

      // Handle image URL
      if (site.imageSelector) {
        const imgEl = $el.find(site.imageSelector);
        const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';

        // Complete relative URLs
        if (imgSrc) {
          resource.image_url = imgSrc.startsWith('http') ? imgSrc :
            `${new URL(site.url).origin}${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
        } else {
          resource.image_url = '';
        }
      }

      // Get the resource URL
      let resourceUrl = '';
      if (typeof site.urlSelector === 'function') {
        resourceUrl = site.urlSelector($, el);
      } else {
        const urlEl = $el.find(site.urlSelector || site.titleSelector);
        resourceUrl = urlEl.attr('href') || '';
      }

      // Complete relative URLs
      if (resourceUrl) {
        resource.url = resourceUrl.startsWith('http') ? resourceUrl :
          `${new URL(site.url).origin}${resourceUrl.startsWith('/') ? '' : '/'}${resourceUrl}`;
      }

      // Add date if available
      if (site.dateSelector) {
        const dateEl = $el.find(site.dateSelector);
        resource.published_date = dateEl.text().trim() || dateEl.attr('datetime') || '';
      }

      resources.push(resource);
      count++;

      logWithTime(`[${site.name}] Found resource: ${title}`);
    }

    logWithTime(`[${site.name}] Scraping complete, found ${resources.length} resources`);
    return resources;
  } catch (error) {
    logWithTime(`[${site.name}] Error scraping website with Axios: ${error.message}`);
    console.error(error.stack);
    return [];
  }
}

/**
 * Scrape a website for resources
 * @param {object} site - Site configuration object
 * @returns {Promise<Array>} - Array of extracted resources
 */
async function scrapeWebsite(site) {
  try {
    logWithTime(`[${site.name}] Starting scrape`);

    // Check if Scrapfly client is available
    if (!scrapfly) {
      logWithTime(`[${site.name}] Scrapfly client not available, using Axios fallback`);
      return scrapeWebsiteWithAxios(site);
    }

    // Create a scrape config following the correct SDK pattern
    const config = new ScrapeConfig({
      url: site.url,
      render_js: site.requiresRendering || false,
      country: 'US',
      asp: true // Anti-scraping protection bypass
    });

    // Make the request
    const result = await scrapfly.scrape(config);

    if (!result || !result.result || !result.result.content) {
      logWithTime(`[${site.name}] Scrapfly request failed, trying Axios fallback`);
      return scrapeWebsiteWithAxios(site);
    }

    const $ = cheerio.load(result.result.content);
    const resources = [];
    const maxItems = site.category === 'Education' ? 10 : 5;

    let count = 0;
    const elements = $(site.selector).toArray();

    for (const el of elements) {
      if (count >= maxItems) break;

      const $el = $(el);
      const titleEl = $el.find(site.titleSelector);
      let title = '';

      // Handle function or selector for title
      if (typeof site.titleSelector === 'function') {
        title = site.titleSelector($, el);
      } else {
        title = titleEl.text().trim();
      }

      // Skip if no title
      if (!title) continue;

      // Get description - handle function or selector
      let description = '';
      if (typeof site.descriptionSelector === 'function') {
        description = site.descriptionSelector($, el);
      } else {
        description = $el.find(site.descriptionSelector).text().trim();
      }

      description = description || `A resource from ${site.name}`;

      // Create basic resource object
      const resource = {
        title,
        description,
        source: site.name,
        category: site.category,
        tags: site.tags ? [...site.tags] : []
      };

      // Skip if not relevant based on keywords
      if (!isResourceRelevant(resource, site)) {
        continue;
      }

      // Handle image URL
      if (site.imageSelector) {
        const imgEl = $el.find(site.imageSelector);
        const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';

        // Complete relative URLs
        if (imgSrc) {
          resource.image_url = imgSrc.startsWith('http') ? imgSrc :
            `${new URL(site.url).origin}${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`;
        } else {
          resource.image_url = '';
        }
      }

      // Get the resource URL
      let resourceUrl = '';
      if (typeof site.urlSelector === 'function') {
        resourceUrl = site.urlSelector($, el);
      } else {
        const urlEl = $el.find(site.urlSelector || site.titleSelector);
        resourceUrl = urlEl.attr('href') || '';
      }

      // Complete relative URLs
      if (resourceUrl) {
        resource.url = resourceUrl.startsWith('http') ? resourceUrl :
          `${new URL(site.url).origin}${resourceUrl.startsWith('/') ? '' : '/'}${resourceUrl}`;
      }

      // Add date if available
      if (site.dateSelector) {
        const dateEl = $el.find(site.dateSelector);
        resource.published_date = dateEl.text().trim() || dateEl.attr('datetime') || '';
      }

      resources.push(resource);
      count++;

      logWithTime(`[${site.name}] Found resource: ${title}`);
    }

    logWithTime(`[${site.name}] Scraping complete, found ${resources.length} resources`);
    return resources;
  } catch (error) {
    logWithTime(`[${site.name}] Error scraping website: ${error.message}`);
    console.error(error.stack);
    return [];
  }
}

/**
 * Check if a resource is relevant based on keyword analysis
 * @param {object} resource - Resource with title and description
 * @param {object} site - Site configuration with relevance keywords
 * @returns {boolean} - Whether the resource is relevant
 */
function isResourceRelevant(resource, site) {
  if (!site.relevanceKeywords && !site.irrelevanceKeywords) return true;

  const titleAndDesc = `${resource.title.toLowerCase()} ${resource.description.toLowerCase()}`;

  // Check for irrelevance keywords first (higher priority)
  if (site.irrelevanceKeywords) {
    for (const keyword of site.irrelevanceKeywords) {
      if (resource.title.toLowerCase().includes(keyword)) {
        return false;
      }
    }
  }

  // Check for relevance keywords
  if (site.relevanceKeywords) {
    for (const keyword of site.relevanceKeywords) {
      if (titleAndDesc.includes(keyword)) {
        return true;
      }
    }
    return false;
  }

  return true;
}

/**
 * Save resources to the database
 * @param {Array} resources - Array of resources to save
 * @returns {Promise<number>} - Number of resources saved
 */
async function saveResourcesToDatabase(resources) {
  let savedCount = 0;

  // Get all categories to map category names to IDs
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name');

  if (catError) {
    logWithTime(`Error fetching categories: ${catError.message}`);
    return 0;
  }

  // Create a mapping of category names to IDs
  const categoryMap = {};
  if (categories) {
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
  }

  logWithTime(`Found ${Object.keys(categoryMap).length} categories in database`);

  for (const resource of resources) {
    try {
      // Map category name to ID
      const category_id = categoryMap[resource.category];

      if (!category_id) {
        logWithTime(`Skipping resource: Category '${resource.category}' not found in database`);
        continue;
      }

      // Create a database-compatible resource object
      const dbResource = {
        title: resource.title,
        description: resource.description,
        source_url: resource.url || '', // Use source_url field to match database schema
        image_url: resource.image_url || '',
        source: resource.source,
        category_id: category_id,
        created_at: new Date().toISOString()
      };

      // Check if resource already exists by title
      const { data, error } = await supabase
        .from('resources')
        .select('id')
        .eq('title', resource.title)
        .limit(1);

      if (error) {
        logWithTime(`Error checking for existing resource: ${error.message}`);
        continue;
      }

      // If doesn't exist, insert it
      if (!data || data.length === 0) {
        const { error: insertError } = await supabase
          .from('resources')
          .insert(dbResource);

        if (insertError) {
          logWithTime(`Error inserting resource: ${insertError.message}`);
        } else {
          savedCount++;
          logWithTime(`Saved resource: ${resource.title}`);
        }
      } else {
        logWithTime(`Resource already exists: ${resource.title}`);
      }
    } catch (err) {
      logWithTime(`Error processing resource ${resource.title}: ${err.message}`);
    }
  }

  return savedCount;
}

/**
 * Update resource counts by category in the database
 * @returns {Promise<Object>} Updated category counts
 */
async function updateResourceCounts() {
  try {
    logWithTime('Updating resource counts by category');

    // First, try to use the server's updateResourceCountCache function if available
    try {
      // Check if running in same process as the server
      if (global.app && typeof global.app.updateResourceCountCache === 'function') {
        logWithTime('Using server\'s updateResourceCountCache function');
        const categoryCounts = await global.app.updateResourceCountCache();

        if (categoryCounts) {
          logWithTime('Resource counts updated via server cache');
          return categoryCounts;
        }
      }
    } catch (err) {
      logWithTime(`Failed to use server's cache function: ${err.message}`);
    }

    // Fallback: Update counts directly
    logWithTime('Updating counts directly via database query');

    // Get the current resource counts directly from the database
    const { data, error } = await supabase
      .from('resources')
      .select('category_id, categories(name)')
      .not('category_id', 'is', null);

    if (error) {
      logWithTime(`Error fetching resource counts: ${error.message}`);
      return null;
    }

    // Count resources per category
    const categoryCounts = {};
    data.forEach(resource => {
      const categoryName = resource.categories?.name;
      if (categoryName) {
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });

    // Try to update the cache file directly as a last resort
    try {
      const fs = require('fs');
      const path = require('path');
      const cacheFilePath = path.join(__dirname, 'resource-counts-cache.json');

      const cacheData = {
        counts: categoryCounts,
        lastUpdated: new Date().toISOString()
      };

      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
      logWithTime('Resource count cache file updated directly');
    } catch (fsErr) {
      logWithTime(`Warning: Could not update cache file: ${fsErr.message}`);
    }

    logWithTime('Updated resource counts:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      logWithTime(`  ${category}: ${count} resources`);
    });

    return categoryCounts;
  } catch (error) {
    logWithTime(`Error updating resource counts: ${error.message}`);
    console.error(error.stack);
    return null;
  }
}

/**
 * Run all scrapers and save results
 */
async function runScrapers() {
  logWithTime('Starting resource scrapers');

  // Check if Scrapfly client is available
  if (!scrapfly) {
    logWithTime('Scrapfly client not available - using Axios fallback for scraping');
    logWithTime('Note: For better scraping results, add SCRAPFLY_API_KEY to your .env file');
  }

  let totalResources = 0;
  let totalSaved = 0;

  // Process each category in sources.js
  for (const category in sources) {
    const sitesInCategory = sources[category];

    logWithTime(`Processing ${sitesInCategory.length} sites in category: ${category}`);

    // Process sites in batches to avoid overwhelming the system
    for (let i = 0; i < sitesInCategory.length; i += 3) {
      const batch = sitesInCategory.slice(i, i + 3);

      // Run batch in parallel
      const promises = batch.map(site => scrapeWebsite(site));
      const results = await Promise.all(promises);

      // Flatten the results
      const allResources = results.flat();
      totalResources += allResources.length;

      // Save to database
      if (allResources.length > 0) {
        const saved = await saveResourcesToDatabase(allResources);
        totalSaved += saved;
      }
    }
  }

  logWithTime(`Scraping complete! Found ${totalResources} resources, saved ${totalSaved} new ones.`);

  // If any new resources were saved, update the counts
  if (totalSaved > 0) {
    logWithTime('New resources were saved, updating category counts');
    await updateResourceCounts();
  }

  return { totalResources, totalSaved };
}

// Export the runScrapers function for use in cron job
module.exports = { runScrapers };

// Run the scrapers if not imported as a module
if (require.main === module) {
  runScrapers()
    .then(() => {
      logWithTime('Resource scraping job completed successfully');
    })
    .catch(error => {
      logWithTime(`Error in scraper: ${error.message}`);
      console.error(error.stack);
    });
}