// Supabase client configuration
const supabaseUrl = 'your-supabase-url'; // Replace with actual URL from .env in production
const supabaseKey = 'your-anon-key'; // Replace with actual key from .env in production

// Initialize Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Authentication functions
const auth = {
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} name - User name
     * @returns {Promise} - Signup result
     */
    signUp: async (email, password, name) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });
            
            if (error) throw error;
            
            // Create user profile
            if (data?.user) {
                await profiles.createProfile(data.user.id, name);
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Error signing up:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Sign in existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Login result
     */
    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error signing in:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Sign out current user
     * @returns {Promise} - Logout result
     */
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error signing out:', error);
            return { error };
        }
    },
    
    /**
     * Get current user session
     * @returns {Promise} - User session
     */
    getCurrentUser: async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error getting current user:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Reset user password
     * @param {string} email - User email
     * @returns {Promise} - Reset result
     */
    resetPassword: async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error resetting password:', error);
            return { error };
        }
    }
};

// Profile management
const profiles = {
    /**
     * Create a new user profile
     * @param {string} userId - User ID
     * @param {string} name - User name
     * @returns {Promise} - Profile creation result
     */
    createProfile: async (userId, name) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({ id: userId, name })
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating profile:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Get user profile
     * @param {string} userId - User ID
     * @returns {Promise} - User profile
     */
    getProfile: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error getting profile:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {object} updates - Profile updates
     * @returns {Promise} - Update result
     */
    updateProfile: async (userId, updates) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating profile:', error);
            return { data: null, error };
        }
    }
};

// User interests management
const interests = {
    /**
     * Get all available categories
     * @returns {Promise} - Categories list
     */
    getCategories: async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error getting categories:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Get user interests
     * @param {string} userId - User ID
     * @returns {Promise} - User interests
     */
    getUserInterests: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_interests')
                .select('*, categories(*)')
                .eq('user_id', userId);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error getting user interests:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Update user interests
     * @param {string} userId - User ID
     * @param {array} categoryIds - Array of category IDs
     * @returns {Promise} - Update result
     */
    updateUserInterests: async (userId, categoryIds) => {
        try {
            // First delete all existing interests
            const { error: deleteError } = await supabase
                .from('user_interests')
                .delete()
                .eq('user_id', userId);
            
            if (deleteError) throw deleteError;
            
            // Then insert new interests
            const interests = categoryIds.map(categoryId => ({
                user_id: userId,
                category_id: categoryId
            }));
            
            const { data, error: insertError } = await supabase
                .from('user_interests')
                .insert(interests)
                .select();
            
            if (insertError) throw insertError;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating user interests:', error);
            return { data: null, error };
        }
    }
};

// Resources management
const resources = {
    /**
     * Get all resources
     * @param {object} options - Filter options
     * @returns {Promise} - Resources list
     */
    getResources: async (options = {}) => {
        try {
            let query = supabase
                .from('resources')
                .select('*, categories(*)');
            
            // Apply filters if provided
            if (options.categoryId) {
                query = query.eq('category_id', options.categoryId);
            }
            
            // Apply sorting
            if (options.sort === 'rating') {
                query = query.order('rating', { ascending: false });
            } else {
                query = query.order('date_added', { ascending: false });
            }
            
            // Apply pagination
            if (options.page && options.limit) {
                const from = (options.page - 1) * options.limit;
                const to = from + options.limit - 1;
                query = query.range(from, to);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            // If resources were found, fetch tags for each resource
            if (data && data.length > 0) {
                const resourceIds = data.map(resource => resource.id);
                
                const { data: tagsData, error: tagsError } = await supabase
                    .from('resource_tags')
                    .select('*')
                    .in('resource_id', resourceIds);
                
                if (tagsError) throw tagsError;
                
                // Add tags to each resource
                data.forEach(resource => {
                    resource.tags = tagsData
                        .filter(tag => tag.resource_id === resource.id)
                        .map(tag => tag.tag_name);
                });
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Error getting resources:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Get a single resource by ID
     * @param {number} resourceId - Resource ID
     * @returns {Promise} - Resource details
     */
    getResourceById: async (resourceId) => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*, categories(*)')
                .eq('id', resourceId)
                .single();
            
            if (error) throw error;
            
            // Fetch tags for the resource
            const { data: tagsData, error: tagsError } = await supabase
                .from('resource_tags')
                .select('tag_name')
                .eq('resource_id', resourceId);
            
            if (tagsError) throw tagsError;
            
            // Add tags to the resource
            data.tags = tagsData.map(tag => tag.tag_name);
            
            return { data, error: null };
        } catch (error) {
            console.error('Error getting resource:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Save a resource to user bookmarks
     * @param {string} userId - User ID
     * @param {number} resourceId - Resource ID
     * @returns {Promise} - Save result
     */
    saveResource: async (userId, resourceId) => {
        try {
            const { data, error } = await supabase
                .from('user_saved_resources')
                .insert({ user_id: userId, resource_id: resourceId })
                .select()
                .single();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error saving resource:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Remove a resource from user bookmarks
     * @param {string} userId - User ID
     * @param {number} resourceId - Resource ID
     * @returns {Promise} - Remove result
     */
    unsaveResource: async (userId, resourceId) => {
        try {
            const { error } = await supabase
                .from('user_saved_resources')
                .delete()
                .match({ user_id: userId, resource_id: resourceId });
            
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error unsaving resource:', error);
            return { error };
        }
    },
    
    /**
     * Get user saved resources
     * @param {string} userId - User ID
     * @returns {Promise} - Saved resources list
     */
    getSavedResources: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_saved_resources')
                .select('*, resources(*, categories(*))')
                .eq('user_id', userId);
            
            if (error) throw error;
            
            // Extract resources from the join
            const resources = data.map(item => item.resources);
            
            // Fetch tags for each resource
            const resourceIds = resources.map(resource => resource.id);
            
            if (resourceIds.length > 0) {
                const { data: tagsData, error: tagsError } = await supabase
                    .from('resource_tags')
                    .select('*')
                    .in('resource_id', resourceIds);
                
                if (tagsError) throw tagsError;
                
                // Add tags to each resource
                resources.forEach(resource => {
                    resource.tags = tagsData
                        .filter(tag => tag.resource_id === resource.id)
                        .map(tag => tag.tag_name);
                });
            }
            
            return { data: resources, error: null };
        } catch (error) {
            console.error('Error getting saved resources:', error);
            return { data: null, error };
        }
    }
};

// Notifications management
const notifications = {
    /**
     * Get user notifications
     * @param {string} userId - User ID
     * @param {object} options - Pagination options
     * @returns {Promise} - Notifications list
     */
    getNotifications: async (userId, options = {}) => {
        try {
            let query = supabase
                .from('notifications')
                .select('*, resources(*, categories(*))')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            // Apply pagination
            if (options.page && options.limit) {
                const from = (options.page - 1) * options.limit;
                const to = from + options.limit - 1;
                query = query.range(from, to);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error getting notifications:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Mark notification as read
     * @param {string} userId - User ID
     * @param {number} notificationId - Notification ID
     * @returns {Promise} - Update result
     */
    markAsRead: async (userId, notificationId) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .match({ id: notificationId, user_id: userId })
                .select();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Mark all notifications as read
     * @param {string} userId - User ID
     * @returns {Promise} - Update result
     */
    markAllAsRead: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false)
                .select();
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Delete a notification
     * @param {string} userId - User ID
     * @param {number} notificationId - Notification ID
     * @returns {Promise} - Delete result
     */
    deleteNotification: async (userId, notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .match({ id: notificationId, user_id: userId });
            
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting notification:', error);
            return { error };
        }
    }
};

// Export all modules
const supabaseClient = {
    auth,
    profiles,
    interests,
    resources,
    notifications
};

// Make available globally
window.supabaseClient = supabaseClient; 