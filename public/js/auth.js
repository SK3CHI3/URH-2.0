// Initialize Supabase client
const supabaseUrl = 'https://spkbhpmqxdbqwpwzyykc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwa2JocG1xeGRicXdwd3p5eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NDk1MTYsImV4cCI6MjA1OTUyNTUxNn0.cJU1gjNPMBAIDjc80MR-IXX17Vh09nLtejKMUjIUvco';

// Create Supabase client
const createClient = () => {
    try {
        return window.supabase.createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.error('Error creating Supabase client:', error);
        return null;
    }
};

// Initialize the client when the script loads
let supabase = null;

// Wait for Supabase to be available
const initSupabase = () => {
    if (window.supabase) {
        supabase = createClient();
    } else {
        console.error('Supabase is not loaded yet');
    }
};

// Function to ensure Supabase is initialized
const getSupabase = () => {
    if (!supabase) {
        initSupabase();
    }
    if (!supabase) {
        throw new Error('Supabase client is not initialized');
    }
    return supabase;
};

// Function to handle user signup
async function signUp(email, password, fullName) {
    try {
        const client = getSupabase();
        const { data, error } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: window.location.origin,
                emailVerification: false
            }
        });

        if (error) throw error;

        // Create a profile for the user
        if (data.user) {
            const { error: profileError } = await client
                .from('profiles')
                .upsert([
                    {
                        user_id: data.user.id,
                        full_name: fullName,
                        email: email,
                        username: email.split('@')[0], // Create a default username from email
                        avatar_url: null,
                        interests: []
                    }
                ]);

            if (profileError) throw profileError;
        }

        showNotification('Account created successfully! You can now log in.', 'success');
        // Automatically sign in the user
        await signIn(email, password);
        return data;
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

// Function to handle user login
async function signIn(email, password) {
    try {
        const client = getSupabase();
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        showNotification('Successfully logged in!', 'success');
        window.location.href = '/dashboard.html';
        return data;
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

// Function to handle user logout
async function signOut() {
    try {
        const client = getSupabase();
        const { error } = await client.auth.signOut();
        if (error) throw error;
        
        showNotification('Successfully logged out!', 'success');
        window.location.href = '/index.html';
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}

// Function to get the current user
async function getCurrentUser() {
    try {
        const client = getSupabase();
        const { data: { user }, error } = await client.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting user:', error.message);
        return null;
    }
}

// Function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add styles for the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '5px';
    notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    notification.style.transition = 'all 0.3s ease';

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Function to update UI based on auth state
async function updateAuthUI() {
    try {
        const user = await getCurrentUser();
        const authButtons = document.querySelectorAll('.login-btn');
        
        authButtons.forEach(button => {
            if (user) {
                button.href = 'dashboard.html';
                button.innerHTML = '<i class="fas fa-user"></i> My Dashboard';
            } else {
                button.href = 'login.html';
                button.innerHTML = 'Login / Sign Up';
            }
        });
    } catch (error) {
        console.error('Error updating auth UI:', error);
    }
}

// Initialize Supabase when the script loads
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    updateAuthUI();
});

// Social login functions
async function signInWithGoogle() {
    try {
        const client = getSupabase();
        const { data, error } = await client.auth.signInWithOAuth({
            provider: 'google'
        });
        if (error) throw error;
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function signInWithGithub() {
    try {
        const client = getSupabase();
        const { data, error } = await client.auth.signInWithOAuth({
            provider: 'github'
        });
        if (error) throw error;
    } catch (error) {
        showNotification(error.message, 'error');
    }
} 