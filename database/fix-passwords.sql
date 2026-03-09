-- Quick fix: Update user passwords with correct bcrypt hash for 'admin123'
UPDATE users 
SET password = '$2b$10$onTVtivncwbSXYNfqD/jJOeAtJknIZkITSyuOQiGXsN4qXSQTlRL.' 
WHERE email IN ('admin@ecommerce.com', 'john@example.com', 'jane@example.com');

-- Verify the update
SELECT email, role, created_at FROM users;
