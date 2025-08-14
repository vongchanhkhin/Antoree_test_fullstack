-- Initialize the education platform database
-- This script runs when the MySQL container starts for the first time

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS education_platform;

-- Use the database
USE education_platform;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON education_platform.* TO 'nestjs_user'@'%';
FLUSH PRIVILEGES;

-- Optional: Create an admin user for testing
-- You can remove this section if you don't want a default admin user
INSERT IGNORE INTO users (email, name, password, role, createdAt, updatedAt) 
VALUES (
    'admin@education.com', 
    'System Administrator', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGQhZRJ5UG.2HDi', -- password: 'password123'
    'ADMIN',
    NOW(),
    NOW()
);
