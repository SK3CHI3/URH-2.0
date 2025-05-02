// Simple Express server to test
const express = require('express');
const app = express();
const PORT = 3000;

// Load environment variables
require('dotenv').config();

// Log environment variables
console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');

// Simple route
app.get('/', (req, res) => {
  res.send('Server is working!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});
