-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS revenue CASCADE;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication and user management)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table (for shopping cart functionality)
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- Insert sample data

-- Sample admin user (password: admin123 - bcrypt hashed)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@ecommerce.com', '$2b$10$onTVtivncwbSXYNfqD/jJOeAtJknIZkITSyuOQiGXsN4qXSQTlRL.', 'admin'),
('John Doe', 'john@example.com', '$2b$10$onTVtivncwbSXYNfqD/jJOeAtJknIZkITSyuOQiGXsN4qXSQTlRL.', 'customer'),
('Jane Smith', 'jane@example.com', '$2b$10$onTVtivncwbSXYNfqD/jJOeAtJknIZkITSyuOQiGXsN4qXSQTlRL.', 'customer');

-- Sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Electronic devices and accessories', '/categories/electronics.jpg'),
('Clothing', 'Fashion and apparel', '/categories/clothing.jpg'),
('Books', 'Books and literature', '/categories/books.jpg'),
('Home & Garden', 'Home improvement and garden supplies', '/categories/home-garden.jpg'),
('Sports', 'Sports equipment and accessories', '/categories/sports.jpg');

-- Sample products
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('Wireless Headphones', 'High-quality Bluetooth headphones with noise cancellation', 129.99, 50, (SELECT id FROM categories WHERE name = 'Electronics'), '/products/headphones.jpg'),
('Smartphone', 'Latest model smartphone with 5G capability', 699.99, 30, (SELECT id FROM categories WHERE name = 'Electronics'), '/products/smartphone.jpg'),
('Laptop', 'Powerful laptop for work and gaming', 1299.99, 20, (SELECT id FROM categories WHERE name = 'Electronics'), '/products/laptop.jpg'),
('Cotton T-Shirt', 'Comfortable cotton t-shirt', 24.99, 100, (SELECT id FROM categories WHERE name = 'Clothing'), '/products/tshirt.jpg'),
('Jeans', 'Classic blue jeans', 59.99, 75, (SELECT id FROM categories WHERE name = 'Clothing'), '/products/jeans.jpg'),
('Running Shoes', 'Professional running shoes', 89.99, 60, (SELECT id FROM categories WHERE name = 'Sports'), '/products/running-shoes.jpg'),
('Yoga Mat', 'Non-slip yoga mat', 34.99, 40, (SELECT id FROM categories WHERE name = 'Sports'), '/products/yoga-mat.jpg'),
('Fiction Novel', 'Bestselling fiction novel', 14.99, 200, (SELECT id FROM categories WHERE name = 'Books'), '/products/novel.jpg'),
('Cookbook', 'Delicious recipes cookbook', 29.99, 80, (SELECT id FROM categories WHERE name = 'Books'), '/products/cookbook.jpg'),
('Garden Tools Set', 'Complete garden tools set', 79.99, 35, (SELECT id FROM categories WHERE name = 'Home & Garden'), '/products/garden-tools.jpg');

-- Sample orders
INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 154.98, 'delivered', '123 Main St, City, State 12345'),
((SELECT id FROM users WHERE email = 'jane@example.com'), 699.99, 'shipped', '456 Oak Ave, Town, State 67890');

-- Sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
((SELECT id FROM orders LIMIT 1 OFFSET 0), (SELECT id FROM products WHERE name = 'Wireless Headphones'), 1, 129.99),
((SELECT id FROM orders LIMIT 1 OFFSET 0), (SELECT id FROM products WHERE name = 'Cotton T-Shirt'), 1, 24.99);

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
((SELECT id FROM orders LIMIT 1 OFFSET 1), (SELECT id FROM products WHERE name = 'Smartphone'), 1, 699.99);

-- Sample cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), (SELECT id FROM products WHERE name = 'Laptop'), 1),
((SELECT id FROM users WHERE email = 'jane@example.com'), (SELECT id FROM products WHERE name = 'Running Shoes'), 2);
