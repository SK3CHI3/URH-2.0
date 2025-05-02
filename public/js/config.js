// Configuration for different environments
const config = {
    development: {
        apiUrl: 'http://localhost:3000'
    },
    production: {
        apiUrl: '/.netlify/functions' // Use Netlify Functions path in production
    }
};

// Helper to detect environment
function detectEnvironment() {
    // More detailed logging
    console.log('Window location:', {
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        href: window.location.href
    });
    
    // Check if running on localhost
    const isLocalhost = window.location.hostname.includes('localhost') || 
                         window.location.hostname.includes('127.0.0.1');
    
    // Check if port is 5500 (Live Server)
    const isLiveServer = window.location.port === '5500' || window.location.port === '5501';
    
    // Force detection logging
    console.log('Environment detection:', {
        isLocalhost,
        isLiveServer,
        hostname: window.location.hostname
    });
    
    // If we're on localhost but using Live Server, we need to point to the Node.js server
    if (isLocalhost && isLiveServer) {
        console.log('Detected Live Server environment, using Node.js server at port 3000');
        return {
            environment: 'development',
            apiUrl: 'http://localhost:3000'
        };
    }
    
    // If we're in production (not localhost)
    if (!isLocalhost) {
        console.log('Detected production environment - using Netlify Functions');
        return {
            environment: 'production',
            apiUrl: config.production.apiUrl
        };
    }
    
    // Default is standard development
    console.log('Detected standard development environment');
    return {
        environment: 'development',
        apiUrl: config.development.apiUrl
    };
}

// Get environment configuration
const envConfig = detectEnvironment();

// Export the configuration
const currentConfig = envConfig.environment === 'production' 
    ? config.production 
    : { apiUrl: envConfig.apiUrl };

// Make config available globally
window.appConfig = currentConfig;
console.log('Using API URL:', window.appConfig.apiUrl);

// Supabase Configuration
const SUPABASE_URL = 'https://spkbhpmqxdbqwpwzyykc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwa2JocG1xeGRicXdwd3p5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NDk1MTYsImV4cCI6MjA1OTUyNTUxNn0.cJU1gjNPMBAIDjc80MR-IXX17Vh09nLtejKMUjIUvco';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase client available globally
window.supabaseClient = supabaseClient; 