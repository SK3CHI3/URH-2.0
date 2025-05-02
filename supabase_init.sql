-- Create Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Resources Table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    url VARCHAR(1024) NOT NULL,
    image_url VARCHAR(1024),
    rating DECIMAL(3, 1) CHECK (rating >= 0 AND rating <= 5),
    source VARCHAR(255) NOT NULL,
    source_url VARCHAR(1024),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Resource Tags Junction Table
CREATE TABLE resource_tags (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, tag_name)
);

-- Create Profile table that extends the auth.users table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    avatar_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create User Interests Junction Table
CREATE TABLE user_interests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- Create User Saved Resources Junction Table
CREATE TABLE user_saved_resources (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_id)
);

-- Create Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Categories
INSERT INTO categories (name, icon, description) VALUES
('Technology', 'fa-code', 'Programming tutorials, coding resources, and tech documentation'),
('Design', 'fa-paint-brush', 'UI kits, design templates, and creative assets'),
('Business', 'fa-briefcase', 'Business templates, guides, and entrepreneurship resources'),
('Education', 'fa-graduation-cap', 'Online courses, tutorials, and learning materials'),
('Events', 'fa-calendar-alt', 'Tech events, hackathons, and conferences from different regions'),
('Blogs & News', 'fa-newspaper', 'Latest tech news, industry insights, and expert blogs');

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- User interests policies
CREATE POLICY "User interests are viewable by the user" ON user_interests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interests" ON user_interests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests" ON user_interests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" ON user_interests
    FOR DELETE USING (auth.uid() = user_id);

-- Saved resources policies
CREATE POLICY "User saved resources are viewable by the user" ON user_saved_resources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved resources" ON user_saved_resources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved resources" ON user_saved_resources
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "User notifications are viewable by the user" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        -- In a real system, you'd use a service role or similar
        -- This is a placeholder that allows any insert for now
        true
    );

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new resource notifications
CREATE OR REPLACE FUNCTION notify_users_of_new_resource()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, resource_id, title, message)
    SELECT 
        ui.user_id,
        NEW.id,
        'New resource in ' || c.name,
        'A new resource has been added: ' || NEW.title
    FROM user_interests ui
    JOIN categories c ON ui.category_id = c.id
    WHERE ui.category_id = NEW.category_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER notify_on_new_resource
AFTER INSERT ON resources
FOR EACH ROW
EXECUTE FUNCTION notify_users_of_new_resource(); 