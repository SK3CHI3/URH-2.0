// Script to manually update resource counts
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cache file path
const CACHE_FILE_PATH = path.join(__dirname, 'resource-counts-cache.json');

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Console log with timestamp
function logWithTime(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Function to update resource counts
async function updateResourceCounts() {
  try {
    logWithTime('Starting manual resource count update');
    
    // Get all resources with their categories
    const { data, error } = await supabase
      .from('resources')
      .select('category_id, categories(name)')
      .not('category_id', 'is', null);
    
    if (error) {
      throw new Error(`Error fetching resources: ${error.message}`);
    }
    
    // Count resources by category
    const categoryCounts = {};
    data.forEach(resource => {
      const categoryName = resource.categories?.name;
      if (categoryName) {
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });
    
    // Create cache data
    const cacheData = {
      counts: categoryCounts,
      lastUpdated: new Date().toISOString()
    };
    
    // Write to cache file
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));
    
    logWithTime('Resource count cache updated successfully:');
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

// Run the update
updateResourceCounts()
  .then(() => {
    logWithTime('Resource count update completed');
    process.exit(0);
  })
  .catch(error => {
    logWithTime(`Unhandled error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }); 