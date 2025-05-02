// Load environment variables
require('dotenv').config();

// Check environment variables
console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');

// Modify the scraper.js file to handle missing SCRAPFLY_API_KEY
const fs = require('fs');
const path = require('path');

// Start the server
console.log('Starting server...');
try {
  require('./server.js');
} catch (error) {
  console.error('Error starting server:', error);
}
