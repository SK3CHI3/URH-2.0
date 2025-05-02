const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_KEY');
}

// Initialize Supabase client
let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    // Get category from query parameters
    const params = event.queryStringParameters;
    const category = params?.category;

    // Basic query
    let query = supabase
      .from('resources')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
      .limit(12);

    // Simple category filter
    if (category && category !== 'Featured') {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();

        if (catError) {
          console.error('Error finding category:', catError);
        } else if (catData) {
          query = query.eq('category_id', catData.id);
        }
      } catch (catErr) {
        console.error('Error in category lookup:', catErr);
      }
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw new Error('Database query failed');
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data || [])
    };

  } catch (error) {
    console.error('Error fetching resources:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch resources',
        message: error.message || 'Unknown server error'
      })
    };
  }
}; 