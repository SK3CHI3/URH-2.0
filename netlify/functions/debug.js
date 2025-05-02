exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
    // Check environment variables (sanitized for security)
    const envVars = {
      supabaseUrl: process.env.SUPABASE_URL ? 'Set ✓' : 'Not set ✗',
      supabaseKey: process.env.SUPABASE_KEY ? 'Set ✓' : 'Not set ✗',
      nodeEnv: process.env.NODE_ENV || 'Not set',
    };

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Environment check',
        environment: envVars,
        path: event.path,
        method: event.httpMethod,
        params: event.queryStringParameters || {},
      })
    };
  } catch (error) {
    console.error('Error in debug function:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Function error',
        message: error.message || 'Unknown error'
      })
    };
  }
}; 