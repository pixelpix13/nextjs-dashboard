# E-Commerce Application Setup Guide

## Overview
This application has been transformed from an invoice management system into a full-featured e-commerce platform with product management, shopping cart, order processing, and user authentication.

## Database Setup

### Step 1: Connect to PostgreSQL in pgAdmin

1. Open **pgAdmin**
2. Navigate to your **PostgreSQL 17** server
3. Right-click on the **ecommerce_db** database
4. Select **Query Tool**

### Step 2: Run the Database Schema

1. Open the file: `database/schema.sql`
2. Copy all the SQL code
3. Paste it into the pgAdmin Query Tool
4. Click **Execute** (F5) to run the script

This will:
- Drop all old tables (invoices, customers, revenue)
- Create new tables (users, products, categories, orders, order_items, cart_items)
- Insert sample data for testing

### Step 3: Configure Environment Variables

1. Open the file: `.env.local`
2. Update the **POSTGRES_URL** with your PostgreSQL password:
   ```
   POSTGRES_URL=postgres://postgres:YOUR_PASSWORD_HERE@localhost:5432/ecommerce_db
   ```
   Replace `YOUR_PASSWORD_HERE` with your actual postgres user password

3. Generate a random secret for **AUTH_SECRET**:
   - You can use any random string or run this in PowerShell:
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

## Database Schema

### Tables Created:

#### **users**
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` ('customer' | 'admin')
- Timestamps

#### **categories**
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `description` (TEXT)
- `image_url` (VARCHAR)
- Timestamps

#### **products**
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `stock_quantity` (INTEGER)
- `category_id` (UUID, Foreign Key)
- `image_url` (VARCHAR)
- `is_active` (BOOLEAN)
- Timestamps

#### **orders**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `total_amount` (DECIMAL)
- `status` ('pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')
- `shipping_address` (TEXT)
- Timestamps

#### **order_items**
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `price` (DECIMAL)
- Timestamps

#### **cart_items**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- Timestamps

## Sample Data Included

### Default Users:
1. **Admin User**
   - Email: `admin@ecommerce.com`
   - Password: `admin123`
   - Role: admin

2. **John Doe**
   - Email: `john@example.com`
   - Password: `admin123`
   - Role: customer

3. **Jane Smith**
   - Email: `jane@example.com`
   - Password: `admin123`
   - Role: customer

### Categories:
- Electronics
- Clothing
- Books
- Home & Garden
- Sports

### Products:
- 10 sample products across different categories
- Prices ranging from $14.99 to $1,299.99
- Various stock quantities

## Running the Application

### Install Dependencies (if not already done):
```powershell
cd nextjs-dashboard
pnpm install
```

### Run the Development Server:
```powershell
pnpm dev
```

### Access the Application:
Open your browser to: `http://localhost:3000`

## Features Implemented

### Authentication
- User registration with bcrypt password hashing
- Login with NextAuth.js
- Role-based access (customer/admin)
- Protected dashboard routes

### Product Management
- Create, read, update, delete products
- Filter products by category
- Search products by name/description
- Pagination support
- Stock quantity tracking
- Active/inactive product status

### Category Management
- Create and manage product categories
- Associate products with categories
- Category-based product filtering

### Shopping Cart
- Add products to cart
- Update quantity
- Remove items
- View cart summary with total
- Persist cart per user

### Order Management
- Create orders from cart
- Automatic stock reduction
- Order status tracking (pending → processing → shipped → delivered)
- View order history
- Order details with line items

### Dashboard Stats
- Total products
- Total orders
- Total revenue
- Total customers
- Pending orders count
- Low stock product alerts

## API Functions Available

### User Functions (data.ts)
- `getUserByEmail(email: string)`
- `getUserById(id: string)`
- `getAllUsers()`

### Product Functions
- `getAllProducts()`
- `getProductById(id: string)`
- `fetchFilteredProducts(query, categoryId, page)`
- `getProductsByCategory(categoryId: string)`
- `getLowStockProducts(threshold: number)`

### Category Functions
- `getAllCategories()`
- `getCategoryById(id: string)`
- `getCategoryFields()`

### Order Functions
- `getAllOrders()`
- `getOrderById(id: string)`
- `getOrdersByUserId(userId: string)`
- `getRecentOrders(limit: number)`
- `fetchFilteredOrders(query, page)`

### Cart Functions
- `getCartByUserId(userId: string)`

### Dashboard Functions
- `fetchDashboardStats()`

## Server Actions Available

### Authentication (actions.ts)
- `authenticate(prevState, formData)` - Login
- `registerUser(prevState, formData)` - Register new user

### Product Actions
- `createProduct(prevState, formData)`
- `updateProduct(id, prevState, formData)`
- `deleteProduct(id)`
- `toggleProductStatus(id, isActive)`

### Category Actions
- `createCategory(prevState, formData)`
- `deleteCategory(id)`

### Order Actions
- `createOrder(userId, shippingAddress, cartItems)`
- `updateOrderStatus(id, status)`

### Cart Actions
- `addToCart(userId, productId, quantity)`
- `updateCartItemQuantity(cartItemId, quantity)`
- `removeFromCart(cartItemId)`
- `clearCart(userId)`

## Next Steps

### UI Development (To Do):
1. Update dashboard overview page to show e-commerce stats
2. Create product listing page
3. Create product detail page
4. Build shopping cart UI
5. Create checkout flow
6. Build order management interface
7. Update navigation links
8. Remove old invoice/customer pages

### Backend Enhancements (Optional):
1. Add product reviews and ratings
2. Implement product images upload
3. Add wishlist functionality
4. Implement discount codes/coupons
5. Add email notifications for orders
6. Payment gateway integration
7. Advanced search and filters

## Troubleshooting

### Connection Issues:
- Ensure PostgreSQL is running
- Verify the password in `.env.local` is correct
- Check that `ecommerce_db` exists in pgAdmin
- Ensure port 5432 is not blocked by firewall

### Schema Issues:
- If tables already exist, the schema.sql script will drop and recreate them
- Make sure you're connected to the `ecommerce_db` database when running the schema

### Authentication Issues:
- Make sure AUTH_SECRET is set in `.env.local`
- Clear browser cookies if having login issues
- Verify user exists in database with correct password hash

## Development Tips

1. **Use TypeScript**: All types are defined in `app/lib/definitions.ts`
2. **Server Actions**: All database mutations should use server actions from `actions.ts`
3. **Data Fetching**: Use functions from `data.ts` for reading data
4. **Validation**: Zod schemas are used for form validation
5. **Security**: Passwords are hashed with bcrypt, SQL injection is prevented by postgres library

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal running `pnpm dev` for server errors
3. Verify database connection in pgAdmin
4. Ensure all environment variables are set correctly
