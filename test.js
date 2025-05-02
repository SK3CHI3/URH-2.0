console.log('Node.js is working!');
console.log('Environment variables:');
require('dotenv').config();
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');
