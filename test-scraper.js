// Test script for the scraper with Axios fallback
require('dotenv').config();
const { runScrapers } = require('./scraper');

console.log('Testing scraper with Axios fallback...');

// Run the scrapers
runScrapers()
  .then(result => {
    console.log('Scraper test completed!');
    console.log(`Total resources found: ${result.totalResources}`);
    console.log(`Total resources saved: ${result.totalSaved}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running scrapers:', error);
    process.exit(1);
  });
