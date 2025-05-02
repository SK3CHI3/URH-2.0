// Notification preferences handling
async function initializeNotificationPreferences() {
    const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        return;
    }

    // If no preferences exist, create default preferences
    if (!preferences) {
        const { data: user } = await supabase.auth.getUser();
        if (!user) return;

        const { error: insertError } = await supabase
            .from('notification_preferences')
            .insert([
                {
                    user_id: user.id,
                    email_notifications: true,
                    sms_notifications: false,
                    notification_frequency: 'daily',
                    categories: []
                }
            ]);

        if (insertError) {
            console.error('Error creating notification preferences:', insertError);
            return;
        }
    }

    // Update UI with current preferences
    updateNotificationUI(preferences);
}

function updateNotificationUI(preferences) {
    if (!preferences) return;

    // Update email notification toggle
    const emailToggle = document.getElementById('email-notifications');
    if (emailToggle) {
        emailToggle.checked = preferences.email_notifications;
    }

    // Update SMS notification toggle
    const smsToggle = document.getElementById('sms-notifications');
    if (smsToggle) {
        smsToggle.checked = preferences.sms_notifications;
    }

    // Update phone number field
    const phoneInput = document.getElementById('phone-number');
    if (phoneInput) {
        phoneInput.value = preferences.phone_number || '';
    }

    // Update frequency selection
    const frequencySelect = document.getElementById('notification-frequency');
    if (frequencySelect) {
        frequencySelect.value = preferences.notification_frequency;
    }

    // Update category checkboxes
    if (preferences.categories) {
        preferences.categories.forEach(category => {
            const checkbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

async function saveNotificationPreferences(event) {
    event.preventDefault();

    const emailNotifications = document.getElementById('email-notifications').checked;
    const smsNotifications = document.getElementById('sms-notifications').checked;
    const phoneNumber = document.getElementById('phone-number').value;
    const frequency = document.getElementById('notification-frequency').value;
    
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);

    const { error } = await supabase
        .from('notification_preferences')
        .upsert({
            email_notifications: emailNotifications,
            sms_notifications: smsNotifications,
            phone_number: phoneNumber,
            notification_frequency: frequency,
            categories: categories
        });

    if (error) {
        console.error('Error saving notification preferences:', error);
        showNotification('Error saving preferences', 'error');
    } else {
        showNotification('Preferences saved successfully', 'success');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNotificationPreferences();
    
    // Add event listeners
    const form = document.getElementById('notification-preferences-form');
    if (form) {
        form.addEventListener('submit', saveNotificationPreferences);
    }
}); 