# E-Commerce Platform Documentation

## Project Overview

This is a full-stack e-commerce platform built with **Next.js 16** (App Router), **PostgreSQL**, **NextAuth v5**, and **TailwindCSS**. The platform features both a customer-facing storefront and an admin dashboard for managing products, orders, and inventory.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Key Features](#key-features)
4. [Database Schema](#database-schema)
5. [Next.js Concepts Used](#nextjs-concepts-used)
6. [Project Structure](#project-structure)
7. [Authentication Flow](#authentication-flow)
8. [Shopping Flow](#shopping-flow)
9. [Admin Features](#admin-features)
10. [API Routes](#api-routes)
11. [Setup Instructions](#setup-instructions)

---

## Architecture Overview

The application follows a modern **serverless architecture** with:
- **Frontend**: Next.js 16 with React Server Components (RSC)
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL 17 with postgres.js client
- **Authentication**: NextAuth v5 (credential-based)
- **Styling**: TailwindCSS 3.4 with custom Amazon-inspired design

---

## Tech Stack

### Core Technologies
- **Next.js 16.0.10** - React framework with App Router and Turbopack
- **React 19** - UI library with Server Components
- **TypeScript** - Type-safe development
- **PostgreSQL 17** - Relational database
- **NextAuth v5.0.0-beta.30** - Authentication library
- **TailwindCSS 3.4.17** - Utility-first CSS framework

### Key Libraries
- **postgres.js 3.4.6** - Fast PostgreSQL client
- **bcrypt** - Password hashing
- **Heroicons** - Icon library
- **Zod** - Schema validation

---

## Key Features

### Customer Features
✅ Browse products with Amazon-style grid layout
✅ **Animated UI**: Smooth hover effects, transitions, and loading states
✅ **Product search**: Real-time search by name or description
✅ **Category filtering**: Filter products by category with one click
✅ **Pagination**: 10 products per page with elegant navigation
✅ Product detail pages with ratings and stock status
✅ Add to cart (works for guest and authenticated users)
✅ Guest cart with localStorage persistence
✅ Automatic cart merge after login
✅ Full checkout flow with shipping and payment forms
✅ Order history and tracking
✅ **Working sign out**: Properly logs out users from profile menu

### Admin Features
✅ Comprehensive dashboard with real-time stats
✅ Total revenue, orders, customers, products tracking
✅ **Enhanced chart**: Orders per day histogram with proper X/Y axes
✅ Top 5 selling products display
✅ Recent orders list
✅ Full order management with status updates
✅ Product CRUD operations (Create, Read, Update, Delete)
✅ Category management
✅ Stock quantity tracking
✅ Order detail view with customer information
✅ **Working sign out**: Server action properly logs out admin users

### UI/UX Enhancements
✅ **Skeleton loading screens**: Animated placeholders during load
✅ **Product card animations**: Hover effects, scaling, color transitions
✅ **Hero banner**: Animated background with feature badges
✅ **Smooth transitions**: All interactions have polished animations
✅ **Responsive design**: Full-width layout with proper mobile support
✅ **Interactive buttons**: Gradient effects and scale animations
✅ **Category navigation**: Animated underlines on hover/active

---

## Database Schema

### Tables

#### 1. **users**
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- password (TEXT, hashed with bcrypt)
- role (TEXT: 'customer' or 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. **categories**
```sql
- id (UUID, Primary Key)
- name (TEXT)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. **products**
```sql
- id (UUID, Primary Key)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- stock_quantity (INTEGER)
- category_id (UUID, Foreign Key → categories)
- image_url (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. **orders**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- total_amount (DECIMAL)
- status (TEXT: pending/processing/shipped/delivered/cancelled)
- shipping_address (JSON)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 5. **order_items**
```sql
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key → orders)
- product_id (UUID, Foreign Key → products)
- quantity (INTEGER)
- price (DECIMAL, snapshot at time of order)
- created_at (TIMESTAMP)
```

#### 6. **cart_items**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- product_id (UUID, Foreign Key → products)
- quantity (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## Next.js Concepts Used

### 1. **App Router (Next.js 13+)**
- File-based routing with `app/` directory
- Route groups: `app/(overview)/` for cleaner URLs
- Dynamic routes: `app/products/[id]/page.tsx`
- API routes: `app/api/*/route.ts`

### 2. **React Server Components (RSC)**
- Default server-side rendering for all components
- Direct database queries in components
- Reduced client-side JavaScript bundle
- Example: Dashboard cards fetch data on server

```tsx
// Server Component - runs on server
export default async function CardWrapper() {
  const stats = await fetchDashboardStats(); // Direct DB query
  return <Card value={stats.total_revenue} />;
}
```

### 3. **Server Actions**
- Form submissions without API routes
- Used in `app/lib/actions.ts` for authentication
- Type-safe server-side functions

### 4. **Streaming and Suspense**
- Progressive rendering with `<Suspense>`
- Loading states for async components
- Skeleton loaders during data fetch

```tsx
<Suspense fallback={<CardsSkeleton />}>
  <CardWrapper />
</Suspense>
```

### 5. **Parallel Data Fetching**
- Multiple async operations with `Promise.all()`
- Reduces waterfall requests
- Example: Fetching categories and products simultaneously

### 6. **Route Handlers (API Routes)**
- RESTful API endpoints in `app/api/`
- POST, GET, PATCH, DELETE operations
- Middleware pattern with NextAuth `auth()` function

### 7. **Middleware**
- Route protection with `auth.config.ts`
- Automatic redirects for protected routes
- Session management

### 8. **TypeScript Integration**
- Strict type checking with `definitions.ts`
- Type-safe database queries
- Autocomplete for props and state

### 9. **Client Components ('use client')**
- Interactive components with state
- Event handlers and browser APIs
- Examples: AddToCartButton, CartIcon, UpdateOrderStatus

### 10. **Metadata API**
- SEO optimization with metadata exports
- Dynamic page titles and descriptions

### 11. **Error Handling**
- `error.tsx` for route-level error boundaries
- `not-found.tsx` for 404 pages
- Try-catch blocks in server components

### 12. **Environment Variables**
- `.env.local` for secrets
- `process.env` access in server components
- Database connection strings, auth secrets

---

## Project Structure

```
nextjs-dashboard/
├── app/
│   ├── api/                      # API Routes
│   │   ├── cart/
│   │   │   ├── route.ts          # Cart CRUD operations
│   │   │   └── merge/route.ts    # Merge guest cart after login
│   │   ├── orders/
│   │   │   ├── route.ts          # Create orders
│   │   │   └── update-status/route.ts  # Update order status
│   │   ├── products/
│   │   │   ├── route.ts          # Get products by IDs
│   │   │   ├── create/route.ts   # Create new product
│   │   │   └── update/route.ts   # Update existing product
│   │   └── user/route.ts         # Get user profile
│   │
│   ├── dashboard/                # Admin Dashboard
│   │   ├── (overview)/page.tsx   # Dashboard home with stats
│   │   ├── orders/
│   │   │   ├── page.tsx          # Orders list with product names
│   │   │   └── [id]/page.tsx     # Order detail with status update
│   │   ├── products/
│   │   │   ├── page.tsx          # Products list
│   │   │   ├── create/page.tsx   # Add new product
│   │   │   └── [id]/edit/page.tsx # Edit product
│   │   ├── customers/page.tsx
│   │   ├── categories/page.tsx
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   │
│   ├── cart/page.tsx             # Shopping cart page
│   ├── checkout/page.tsx         # Checkout (requires auth)
│   ├── login/page.tsx            # Login page
│   ├── orders/
│   │   ├── page.tsx              # User order history
│   │   └── [id]/page.tsx         # User order detail
│   ├── products/[id]/page.tsx    # Product detail page
│   ├── page.tsx                  # Homepage (storefront)
│   └── layout.tsx                # Root layout
│
├── app/lib/
│   ├── actions.ts                # Server actions (auth)
│   ├── cart-utils.ts             # Guest cart localStorage utilities
│   ├── data.ts                   # Database query functions
│   ├── definitions.ts            # TypeScript type definitions
│   ├── placeholder-data.ts       # Seed data
│   └── utils.ts                  # Helper functions
│
├── app/ui/
│   ├── cart/
│   │   └── cart-items-list.tsx   # Cart with guest/user support
│   ├── checkout/
│   │   └── checkout-form.tsx     # Checkout form with validation
│   ├── dashboard/
│   │   ├── cards.tsx             # Stats cards
│   │   ├── latest-invoices.tsx   # Recent orders list
│   │   ├── orders-chart.tsx      # Orders per day chart
│   │   ├── top-products.tsx      # Most sold products
│   │   ├── product-form.tsx      # Add/Edit product form
│   │   ├── update-order-status.tsx # Status update dropdown
│   │   ├── nav-links.tsx         # Dashboard navigation
│   │   └── sidenav.tsx           # Dashboard sidebar
│   ├── products/
│   │   └── add-to-cart-button.tsx # Add to cart functionality
│   ├── cart-icon.tsx             # Cart counter badge
│   ├── cart-merger.tsx           # Auto-merge guest cart after login
│   ├── user-menu.tsx             # User profile dropdown
│   ├── button.tsx                # Reusable button component
│   ├── fonts.ts                  # Custom fonts
│   └── global.css                # Global styles
│
├── database/
│   └── schema.sql                # Database schema and seed data
│
├── auth.config.ts                # NextAuth configuration
├── auth.ts                       # NextAuth setup
├── middleware.ts                 # Route protection middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Authentication Flow

### 1. **Registration** (Not implemented in UI, but schema supports it)
- User provides name, email, password
- Password hashed with bcrypt (10 rounds)
- Stored in `users` table with role='customer'

### 2. **Login**
- User enters email and password
- NextAuth validates credentials via `auth.ts`
- Password compared with bcrypt
- Session created with JWT strategy
- Cookie stored in browser

### 3. **Session Management**
- `auth()` function checks session server-side
- Middleware protects routes in `auth.config.ts`
- Dashboard routes require authentication
- Checkout requires authentication (redirects to login with ?redirect parameter)

### 4. **Authorization**
- Middleware checks if user is logged in
- Protected routes: `/dashboard/*`, `/checkout`, `/orders`
- Public routes: `/`, `/products/*`, `/cart`, `/login`

### 5. **Sign Out**
- User clicks sign out in profile menu
- NextAuth destroys session
- Redirects to homepage

---

## Shopping Flow

### Guest User Journey

1. **Browse Products**
   - Homepage displays product grid
   - No authentication required
   - Products fetched with `getAllProducts()`

2. **View Product Details**
   - Click product card → `/products/[id]`
   - See price, description, stock, ratings
   - Server Component with dynamic params

3. **Add to Cart (Guest)**
   - Click "Add to Cart" button
   - Item saved to localStorage via `cart-utils.ts`
   - Cart counter updates in real-time
   - Custom event: `window.dispatchEvent('cartUpdated')`

4. **View Cart**
   - Navigate to `/cart`
   - CartItemsList component checks if user is guest
   - If guest: Fetches product details from `/api/products?ids=...`
   - Displays items with update/remove functionality

5. **Proceed to Checkout**
   - Click "Proceed to Checkout"
   - `/checkout` page checks authentication
   - Guest redirected to `/login?redirect=/checkout`

6. **Login During Checkout**
   - User logs in with credentials
   - `CartMerger` component auto-runs on homepage
   - Calls `/api/cart/merge` with guest cart items
   - Merges guest cart (localStorage) with user cart (database)
   - localStorage cleared after successful merge
   - Redirected back to `/checkout`

7. **Complete Checkout**
   - Fill shipping and payment forms
   - Click "Place Your Order"
   - POST to `/api/orders` creates order and order_items
   - Cart cleared from database
   - Redirected to `/order-confirmation`

8. **View Orders**
   - Navigate to `/orders` (requires auth)
   - See order history with status badges
   - Click order → `/orders/[id]` for details

### Authenticated User Journey

1-3. Same as guest (browse, view, add to cart)

4. **Add to Cart (Authenticated)**
   - Click "Add to Cart" button
   - POST to `/api/cart` with productId and quantity
   - Saved to `cart_items` table in database
   - Cart counter updates

5. **View Cart**
   - Navigate to `/cart`
   - Data fetched from database via `/api/cart`
   - Update/remove operations hit API endpoints

6. **Checkout**
   - No login required (already authenticated)
   - Fill forms and place order

7. **Order Confirmation**
   - View order summary
   - Click "View My Orders" → `/orders`

---

## Admin Features

### 1. **Dashboard Overview** (`/dashboard`)

#### Stats Cards
- **Total Revenue**: Sum of all delivered/shipped/processing orders
- **Total Orders**: Count of all orders
- **Products**: Count of active products
- **Customers**: Count of users with role='customer'

Powered by `fetchDashboardStats()` function with parallel queries using `Promise.all()`.

#### Orders Per Day Chart
- Bar chart showing order count and revenue
- Last 7 days of data
- Fetched with `getOrdersPerDay(7)`
- Client component for interactivity
- SQL query groups by DATE(created_at)

#### Top Selling Products
- Top 5 products by units sold
- Shows product name, price, quantity sold, order count
- Fetched with `getMostBoughtProducts(5)`
- Only counts orders with status: delivered/shipped/processing

#### Recent Orders
- Last 5 orders with customer name, status, total
- Live updates on page refresh
- Links to order detail pages

### 2. **Order Management** (`/dashboard/orders`)

#### Orders List
- Table view with:
  - Order ID (first 8 chars)
  - Customer name
  - **Product names** (comma-separated, implemented with STRING_AGG in SQL)
  - Date ordered
  - Total amount
  - Status badge (color-coded)
  - View button → order detail

SQL Query:
```sql
SELECT 
  o.*,
  u.name as user_name,
  u.email as user_email,
  STRING_AGG(DISTINCT p.name, ', ') as product_names,
  COUNT(DISTINCT oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id, u.name, u.email
ORDER BY o.created_at DESC
```

#### Order Detail (`/dashboard/orders/[id]`)
- Full order information:
  - Order items with product details
  - Order summary (subtotal, shipping, tax, total)
  - Customer details (name, email, order date)
  - Shipping address (parsed from JSON)
  - **Status Update Dropdown**

#### Status Update Feature
- Dropdown with options: pending, processing, shipped, delivered, cancelled
- Client component with state management
- POST to `/api/orders/update-status`
- Updates `orders.status` and `orders.updated_at`
- Success/error messages
- Auto-refreshes page after update

### 3. **Product Management** (`/dashboard/products`)

#### Products List
- Table view with:
  - Product name
  - Category
  - Price (formatted as $XX.XX)
  - Stock quantity (color-coded: red if <10, green otherwise)
  - Active status
  - Edit button → edit page

#### Add New Product (`/dashboard/products/create`)
- Form fields:
  - Product Name (required)
  - Description (textarea)
  - Price (number, required)
  - Stock Quantity (integer, required)
  - Category (dropdown, required)
  - Image URL (optional)
  - Active checkbox
- Validation on submit
- POST to `/api/products/create`
- Inserts into `products` table
- Redirects to products list on success

#### Edit Product (`/dashboard/products/[id]/edit`)
- Pre-filled form with existing product data
- Same fields as create
- POST to `/api/products/update`
- Updates product with `updated_at` timestamp
- Redirects to products list on success

**Real-time Sync**: When a product is added or edited, it immediately appears on the customer-facing storefront after page refresh (React Server Components refetch data).

---

## API Routes

### Cart API (`/api/cart`)

#### GET
- Returns cart items for authenticated user
- Returns `{ items: [], isGuest: true }` for guest users
- Joins with products table for product details

#### POST
- Adds item to cart (or updates quantity if exists)
- Body: `{ productId, quantity }`
- Authenticated users: inserts into `cart_items` table
- Guest users: handled client-side with localStorage

#### PATCH
- Updates cart item quantity
- Body: `{ cartItemId, quantity }`
- Updates `cart_items.quantity`

#### DELETE
- Removes item from cart
- Query param: `?id=cartItemId`
- Deletes from `cart_items` table

### Cart Merge API (`/api/cart/merge`)

#### POST
- Merges guest cart with user cart after login
- Body: `{ guestCart: [{ productId, quantity }, ...] }`
- For each item:
  - If product exists in user cart: adds quantities
  - Else: inserts new row
- Called automatically by `CartMerger` component

### Orders API (`/api/orders`)

#### POST
- Creates new order from cart items
- Body: `{ shippingInfo, paymentInfo }`
- Steps:
  1. Get user ID from session
  2. Fetch cart items
  3. Calculate subtotal, tax, shipping
  4. Insert into `orders` table
  5. Insert into `order_items` table
  6. Clear cart (`DELETE FROM cart_items`)
- Returns order ID

### Order Status API (`/api/orders/update-status`)

#### POST
- Updates order status (admin only)
- Body: `{ orderId, status }`
- Validates status (pending/processing/shipped/delivered/cancelled)
- Updates `orders.status` and `updated_at`

### Products API (`/api/products`)

#### GET
- Fetch products by IDs (for guest cart)
- Query param: `?ids=1,2,3`
- Returns product details with categories

### Product Create API (`/api/products/create`)

#### POST
- Creates new product (admin only)
- Body: `{ name, description, price, stockQuantity, categoryId, imageUrl, isActive }`
- Validates required fields
- Inserts into `products` table

### Product Update API (`/api/products/update`)

#### POST
- Updates existing product (admin only)
- Body: `{ id, name, description, price, stockQuantity, categoryId, imageUrl, isActive }`
- Updates `products` table with new data

### User API (`/api/user`)

#### GET
- Returns current user profile
- Data: `{ id, name, email }`
- Used by UserMenu component to display name

---

## Setup Instructions

### Prerequisites
- Node.js 18+ (with pnpm)
- PostgreSQL 17
- Git

### 1. Clone Repository
```bash
git clone <repo-url>
cd nextjs-dashboard
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Database

#### Create Database
```bash
psql -U postgres
CREATE DATABASE ecommerce_db;
\q
```

#### Run Schema
```bash
psql -U postgres -d ecommerce_db -f database/schema.sql
```

This creates all tables and seeds initial data:
- 1 admin user (admin@ecommerce.com / admin123)
- 10 categories
- 50 sample products

### 4. Configure Environment Variables

Create `.env.local`:
```env
# Database
POSTGRES_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ecommerce_db

# NextAuth
AUTH_SECRET=2f8d5a7c6b9e4f3a1d8e7c5b4a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Update Database Password

Replace `YOUR_PASSWORD` in `.env.local` with your PostgreSQL password.

### 6. Run Development Server
```bash
pnpm run dev
```

Server starts at `http://localhost:3000`

### 7. Login

#### Customer Account
- Create by registering (or use existing user from seed data)
- Shop, add to cart, checkout, view orders

#### Admin Account
- Email: `admin@ecommerce.com`
- Password: `admin123`
- Access dashboard at `/dashboard`

---

## Key Implementation Details

### 1. **Guest Cart with localStorage**

**Problem**: Guest users need persistent cart across page refreshes without authentication.

**Solution**:
- Store cart in `localStorage` as JSON array
- `cart-utils.ts` provides CRUD functions:
  - `getGuestCart()`: Retrieves cart from localStorage
  - `addToGuestCart(productId, quantity)`: Adds item
  - `updateGuestCartItem(productId, quantity)`: Updates quantity
  - `removeFromGuestCart(productId)`: Removes item
  - `clearGuestCart()`: Empties cart
  - `mergeGuestCart()`: Merges with database after login

**Flow**:
1. Guest adds item → saved to localStorage
2. CartIcon reads localStorage for count
3. Cart page fetches product details from API using IDs
4. On login → CartMerger component calls `/api/cart/merge`
5. Guest cart merged with user cart in database
6. localStorage cleared

### 2. **Real-time Cart Updates**

**Problem**: Cart count needs to update without page refresh when adding items.

**Solution**:
- Custom events with browser API
- After adding to cart: `window.dispatchEvent(new Event('cartUpdated'))`
- CartIcon listens: `window.addEventListener('cartUpdated', handleCartUpdate)`
- Fetches new count from API/localStorage on event

### 3. **Price Formatting Consistency**

**Problem**: Database returns prices as strings (DECIMAL type), causing toFixed() errors.

**Solution**:
- Helper function: `formatPrice(amount: number | string) => string`
- Converts to Number before formatting: `Number(amount).toFixed(2)`
- Used consistently across all components
- Homepage uses different format (Amazon-style with cents): `$299.99`

### 4. **Server Components vs Client Components**

**Server Components** (default):
- Dashboard cards, product lists, order tables
- Direct database queries
- No useState, useEffect, event handlers
- Faster initial load, less JavaScript

**Client Components** ('use client'):
- AddToCartButton, CartIcon, UserMenu
- Interactive with state management
- Event handlers, browser APIs
- Needed for cart/checkout functionality

### 5. **Parallel Data Fetching**

Instead of:
```tsx
const categories = await getAllCategories();
const product = await getProductById(id);
```

Use:
```tsx
const [categories, product] = await Promise.all([
  getAllCategories(),
  getProductById(id),
]);
```

Reduces total fetch time from T1 + T2 to max(T1, T2).

### 6. **Dynamic Params as Promises (Next.js 15+)**

Old:
```tsx
function Page({ params }: { params: { id: string } }) {
  const { id } = params;
}
```

New:
```tsx
function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

Required for Next.js 15+ with dynamic routes.

### 7. **Middleware Route Protection**

```ts
// auth.config.ts
export const authConfig = {
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      
      return true; // Allow all other routes
    },
  },
};
```

Automatically redirects unauthenticated users from `/dashboard` to `/login`.

### 8. **Order Status Update with Optimistic UI**

```tsx
const handleUpdate = async () => {
  setIsUpdating(true);
  
  const response = await fetch('/api/orders/update-status', {
    method: 'POST',
    body: JSON.stringify({ orderId, status }),
  });
  
  if (response.ok) {
    router.refresh(); // Reload server components
  }
  
  setIsUpdating(false);
};
```

`router.refresh()` refetches data from server without full page reload.

---

## Common Issues & Solutions

### Issue: "amount.toFixed is not a function"

**Cause**: Database returns DECIMAL as string, not number.

**Solution**: Convert before formatting:
```tsx
Number(amount).toFixed(2)
```

### Issue: Prices don't match between pages

**Cause**: Inconsistent formatting (some use formatCurrency which divides by 100).

**Solution**: Use `formatPrice()` consistently across all pages.

### Issue: Guest cart not merging after login

**Cause**: CartMerger component not included in homepage.

**Solution**: Add `<CartMerger />` in homepage layout:
```tsx
<div className="min-h-screen bg-gray-50">
  <CartMerger />
  {/* rest of page */}
</div>
```

### Issue: Orders page 404 for admin

**Cause**: Clicking "View Order" links to wrong route.

**Solution**: Ensure order detail page exists at `/dashboard/orders/[id]/page.tsx`.

### Issue: Product edits don't show on storefront

**Cause**: React Server Components cache data.

**Solution**: Already handled - RSC refetch on navigation. Force refresh: `router.refresh()`.

---

## Performance Optimizations

1. **Parallel Data Fetching**: Reduces waterfall requests
2. **React Server Components**: Less JavaScript sent to client
3. **Streaming with Suspense**: Progressive rendering
4. **Database Connection Pooling**: postgres.js handles efficiently
5. **Indexed Queries**: Primary keys and foreign keys automatically indexed
6. **SELECT Only Needed Columns**: Avoid `SELECT *` where possible

---

## Security Measures

1. **Password Hashing**: bcrypt with 10 rounds
2. **SQL Injection Prevention**: Parameterized queries with postgres.js
3. **Authentication Middleware**: Protected routes
4. **Session Management**: Secure HTTP-only cookies
5. **Environment Variables**: Secrets in .env.local (not committed)
6. **Input Validation**: Required fields in forms
7. **Role-Based Access**: Admin-only routes

---

## Recent Updates & Enhancements

### UI/UX Enhancements (March 9, 2026)

#### Interactive Product Cards
- **Hover animations**: Cards lift up with shadow and border color transitions
- **Scale effects**: Product images zoom smoothly on hover
- **Gradient backgrounds**: Beautiful gradient placeholders for product images
- **Rating animations**: Star ratings scale up on hover
- **Price highlights**: Prices scale and change color on hover with smooth transitions
- **Stock indicators**: Animated pulse effect on "In Stock" badges

#### Loading States
- **Skeleton screens**: Replaced spinners with animated skeleton placeholders
- **Grid layout**: Loading skeletons match product card layout
- **Shimmer effect**: Smooth gradient animation on loading cards

#### Page Animations
- **Fade-in effects**: Products appear smoothly with staggered delays (50ms per card)
- **Empty state**: Animated bounce effect with emoji when no products found
- **Smooth transitions**: All UI elements have transition animations

#### Enhanced Header & Navigation
- **Logo animation**: Rotates and scales on hover with gradient text effect
- **Category filters**: Animated underline that slides in on hover/active state
- **Search bar**: Glassmorphism effect with backdrop blur and smooth focus transitions
- **Search button**: Icon rotation and scale effects on interaction

#### Hero Banner
- **Animated background**: Pulsing gradient orbs create depth
- **Feature badges**: "Free Shipping", "Best Prices", "Great Deals" with backdrop blur
- **Gradient text**: Animated gradient on main heading

#### Pagination Controls
- **Gradient buttons**: Current page has animated gradient background
- **Hover effects**: Scale and shadow effects on all pagination buttons
- **Active state**: Pulsing gradient on current page number
- **Navigation**: Previous/Next buttons with gradient hover effects

#### Filter Controls
- **Clear filters button**: Eye-catching red-pink gradient with icon
- **Product count**: Highlighted numbers with color accents
- **Mobile search**: Enhanced with better styling and transitions

#### Custom CSS Animations
Created custom animation library in `global.css`:
- `fade-in`: Smooth appearance with vertical translation
- `slide-in-right`: Horizontal slide from right
- `slide-in-left`: Horizontal slide from left
- `scale-in`: Zoom-in effect
- `shimmer`: Loading animation
- `scrollbar-hide`: Clean scrolling without visible scrollbars

### Search & Filter Functionality (March 9, 2026)

#### Product Search
- **Real-time search**: Search products by name or description
- **API endpoint**: `/api/products/search` handles filtered queries
- **Database**: Uses PostgreSQL `ILIKE` for case-insensitive search
- **URL sync**: Search terms reflected in URL parameters

#### Category Filtering
- **Click to filter**: Category links filter products instantly
- **Active indicators**: Current category highlighted with orange text
- **Combined filters**: Search and category work together
- **Clear filters**: One-click button to reset all filters

#### Pagination
- **10 products per page**: Manageable product grid
- **Dynamic pagination**: Shows relevant page numbers (first, last, current ± 1)
- **Smooth scrolling**: Auto-scroll to top on page change
- **State management**: Current page tracked in URL

#### Data Fetching Function
New `getProductsWithFilters()` in `data.ts`:
```typescript
{
  search?: string;
  categoryId?: string;
  page?: number;
  itemsPerPage?: number;
}
```

Returns:
```typescript
{
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

### Enhanced Dashboard Chart (March 9, 2026)

Replaced simple bar chart with proper histogram:

#### Chart Features
- **Y-axis labels**: 5-step scale showing order counts
- **X-axis labels**: Formatted dates (e.g., "Mar 8")
- **Grid lines**: Horizontal lines for easier reading
- **Bars**: Gradient-filled with hover tooltips
- **Tooltips**: Show order count and revenue on hover
- **Responsive**: Scales properly on all screen sizes
- **Always shows 7 days**: Uses `generate_series` so days with zero orders still appear

#### Chart Structure
```
[Y-axis] [Grid + Bars] [X-axis dates]
   20    |████████|    Mar 8
   15    |███     |    Mar 9
   10    |██      |    Mar 10
    5    |█       |    ...
    0    |________|
```

### Chart Empty Bug Fix — Full History (March 9, 2026)

This bug went through multiple iterations. Here is the complete history so you understand why the final solution looks the way it does.

#### Iteration 1 — Wrong approach: generate_series in SQL

**Problem**: Chart appeared empty; only days with orders showed bars.

**Attempted fix**: PostgreSQL `generate_series` LEFT JOIN.

**Why it failed**: `generate_series(date, date, interval)` returns `timestamp`, not `date`. Passing parameterized date strings broke the type cast inside the function, causing the LEFT JOIN to match nothing — all counts stayed 0.

---

#### Iteration 2 — Wrong approach: repeated `${}` in GROUP BY

**Problem**: Still all zero. Switched to `generate_series` in JS, but needed timezone adjustment so PostgreSQL groups timestamps by the same local date the browser displays.

**Attempted fix**:
```sql
SELECT   DATE(created_at + (${offsetSign + tzInterval})::interval) AS date,
  ...GROUP BY DATE(created_at + (${tzInterval})::interval)
```

**Why it failed**: `postgres.js` converts each `${}` into a distinct numbered parameter (`$1`, `$2`, `$3`). Even though the values were identical, PostgreSQL saw `GROUP BY DATE(created_at + $3::interval)` as a different expression from `SELECT DATE(created_at + $1::interval)`, throwing:
```
column "orders.created_at" must appear in the GROUP BY clause or be used in an aggregate function
```

---

#### Iteration 3 — CSS bug: bars invisible despite correct data

**Problem**: Console log confirmed correct data (`count: 6` for Mar 8), but chart still showed flat lines.

**Root cause**: Bar column wrappers had no fixed height (`flex flex-1 flex-col items-center`). `height: 85%` resolves as 85% of the parent's height — which was 0 because no height was set. Every bar collapsed to the 3px stub.

**Fix**: Added `h-full` to column wrappers so `height: X%` resolves against the 256px (`h-64`) chart container.

---

#### Final Solution — Subquery approach

**Files changed**: `app/lib/data.ts`, `app/ui/dashboard/orders-chart.tsx`

**SQL**: Compute the timezone-adjusted date once inside a subquery, then `GROUP BY` the alias in the outer query. `postgres.js` only creates **one parameter** (`$1`), so PostgreSQL can match `GROUP BY local_date` to `SELECT local_date` without ambiguity:

```sql
SELECT
  local_date AS date,
  COUNT(*) AS count,
  SUM(total_amount) AS revenue
FROM (
  SELECT
    total_amount,
    (created_at + $1::interval)::date AS local_date  -- tzOffset: '+5 hours 30 minutes'
  FROM orders
) sub
WHERE local_date BETWEEN $2::date AND $3::date
GROUP BY local_date
ORDER BY local_date ASC
```

**JS**: Missing days are filled with `{count: 0, revenue: 0}` by iterating the range in Node.js and looking up a `Map` keyed by `YYYY-MM-DD` strings.

**Bar height CSS**: Each bar column wrapper gets `h-full` so percentage heights resolve correctly inside the `h-64` chart area.

---

### Sign Out Fix (March 9, 2026)

#### Problem
- User portal sign out: Called non-existent `/api/auth/signout`
- Admin portal sign out: Form had no action, did nothing

#### Solution
Created server action in `app/lib/actions.ts`:
```typescript
export async function handleSignOut() {
  await signOut();
}
```

Updated components:
1. **User Menu** (`app/ui/user-menu.tsx`):
   - Import `handleSignOut` from actions
   - Call server action on button click
   
2. **Admin Sidenav** (`app/ui/dashboard/sidenav.tsx`):
   - Add `action={handleSignOut}` to form
   - Uses Next.js form action pattern

#### How It Works
1. User clicks "Sign Out" button
2. Triggers NextAuth's `signOut()` function via server action
3. Clears session cookies
4. Redirects to homepage
5. User is logged out

### Hydration Error Fix (March 9, 2026)

#### Problem
`Math.random()` used for ratings caused different values on server vs client.

#### Solution
Created deterministic `getRatingCount()` function:
```typescript
const getRatingCount = (productId: string) => {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 900) + 100;
};
```
- Generates consistent rating count based on product ID
- Same product always shows same rating count
- No hydration mismatch

---

## How the App Works — Step by Step Learning Guide

This section walks through every layer of the app, from browser request to database, so you can understand exactly what each file does and why.

---

### Step 1 — Request Enters the App: `next.config.ts` & `middleware.ts`

Every request first hits **Next.js middleware** before any page loads.

**`next.config.ts`** — Minimal config file. Currently empty; it's where you'd add image domains, redirects, or environment variable exposure.

**`auth.config.ts`** — Defines _which routes need authentication_:
```ts
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;        // Is there a session?
    const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
    if (isOnDashboard) {
      return isLoggedIn;  // Block unauthenticated users
    }
    return true; // Public routes: anyone can access
  },
}
```
Result: Any `/dashboard/*` URL without a session → automatically redirected to `/login`.

---

### Step 2 — Root Layout: `app/layout.tsx`

Every page on the site shares this wrapper. It:
- Applies the **Inter** font globally
- Sets `<html lang="en">`
- Includes global CSS (`global.css`)
- Exports SEO `metadata` (page titles, descriptions)

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}  {/* Every page renders here */}
      </body>
    </html>
  );
}
```

---

### Step 3 — Homepage (Storefront): `app/page.tsx`

This is the **customer-facing product store**. It is an `async` Server Component — it runs on the server, queries the database directly, and returns HTML.

**What it does:**
1. Reads `searchParams` from the URL (e.g. `?search=laptop&categoryId=xyz&page=2`)
2. Calls `getProductsWithFilters()` from `data.ts`
3. Passes the resulting product list + pagination info to `<ProductsList />`

**Key concept**: Because this is a Server Component, there is no API call — the database query runs directly inside the component function.

---

### Step 4 — Type Definitions: `app/lib/definitions.ts`

This file is the **blueprint for all data shapes** in the app. Every table in the database has a corresponding TypeScript type here.

| Type | Purpose |
|---|---|
| `User` | Full user row (includes hashed password) |
| `SafeUser` | User without password (safe to expose) |
| `Product` | Single product row |
| `ProductWithCategory` | Product + its category name joined |
| `Order` | Order row (status, amount, shipping) |
| `OrderWithUser` | Order + customer name, email, product names |
| `CartItemWithProduct` | Cart item + product details |

**Why this matters**: TypeScript uses these types to catch bugs at compile time — e.g., if you try to access `order.user_name` but the function returns a plain `Order`, TypeScript will warn you.

---

### Step 5 — Database Queries: `app/lib/data.ts`

This is the **data access layer** — all SQL queries live here. It connects to PostgreSQL using `postgres.js`:

```ts
const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30   // Recycle connections every 30 min
});
```

**Key functions and what they do:**

| Function | SQL Operation | Used By |
|---|---|---|
| `getUserByEmail(email)` | `SELECT * FROM users WHERE email=...` | `auth.ts` on login |
| `getAllProducts()` | `SELECT ... FROM products JOIN categories` | Homepage |
| `getProductsWithFilters()` | Products + ILIKE search + pagination | Homepage search/filter |
| `getProductById(id)` | Single product with category | Product detail page |
| `fetchDashboardStats()` | 4 queries in parallel (revenue, orders, products, customers) | Dashboard cards |
| `getOrdersPerDay(7)` | `generate_series` LEFT JOIN orders | Dashboard chart |
| `getMostBoughtProducts(5)` | `SUM(quantity)` grouped by product | Dashboard top products |
| `getAllOrders()` | Orders + user names + product names via `STRING_AGG` | Admin orders list |

**Tagged Template Literals**: `sql\`SELECT ...\`` automatically escapes all values — this prevents SQL injection.

---

### Step 6 — Server Actions: `app/lib/actions.ts`

Server Actions are **functions that run on the server, triggered by a form submit or button click in the browser**. No API endpoint needed.

**`authenticate()`** — Handles login form:
```ts
export async function authenticate(prevState, formData) {
  await signIn('credentials', formData);  // NextAuth checks password
}
```

**`handleSignOut()`** — Handles sign out button:
```ts
export async function handleSignOut() {
  await signOut();  // NextAuth destroys session
}
```

**`registerUser()`** — Creates new user:
1. Validates form data with Zod schema
2. Hashes password with bcrypt
3. Inserts into `users` table
4. Returns errors or success

---

### Step 7 — Authentication: `auth.ts` & `auth.config.ts`

**`auth.ts`** is the core of login. It uses **NextAuth with the Credentials provider**:

```ts
Credentials({
  async authorize(credentials) {
    const user = await getUser(credentials.email); // Fetch from DB
    if (!user) return null;                         // Email not found
    const match = await bcrypt.compare(credentials.password, user.password);
    if (!match) return null;                        // Wrong password
    return user;                                    // Login success!
  }
})
```

Exports:
- `auth` — Call from server components to get current session
- `signIn` — Call to log a user in
- `signOut` — Call to destroy the session

---

### Step 8 — Dashboard Layout: `app/dashboard/layout.tsx`

All admin pages (`/dashboard/*`) share this layout:
```tsx
<div className="flex h-screen">
  <div className="w-64">          {/* Fixed sidebar */}
    <SideNav />
  </div>
  <div className="flex-1 overflow-y-auto">  {/* Scrollable content */}
    <div className="p-8">{children}</div>   {/* Each page renders here */}
  </div>
</div>
```

This is why the sidebar always stays visible while the right side scrolls.

---

### Step 9 — Dashboard Page: `app/dashboard/(overview)/page.tsx`

This is the admin home screen. It fetches all its data on the server:

```ts
const ordersData = await getOrdersPerDay(7);   // Chart data
// CardWrapper and TopProducts fetch their own data internally
```

Uses `<Suspense>` to stream the page progressively:
- Stats cards load with a skeleton → then real numbers appear
- Top products stream in after the chart
- Recent orders appear last

This means the page starts showing content immediately, even before all queries finish.

---

### Step 10 — Dashboard Chart: `app/ui/dashboard/orders-chart.tsx`

A **Client Component** (`'use client'`) that receives `data` from the server page.

**Why client?** It uses `useEffect` and `useState` to calculate the max Y-axis value after the data arrives.

**Rendering logic:**
1. `useEffect` calculates `maxValue` from the highest order count
2. Y-axis: 6 labels from 0 to maxValue
3. For each data point: bar height = `(count / maxValue) * 100%`
4. X-axis: formatted dates below bars
5. Hover tooltip shows exact order count + revenue

---

### Step 11 — API Routes: `app/api/*/route.ts`

These are **REST endpoints** for operations that need to be called from client-side code.

**Pattern every API route follows:**
```ts
export async function POST(request: Request) {
  const session = await auth();              // Check who's calling
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();         // Parse request body
  // ... do database work ...
  return Response.json({ success: true });    // Return result
}
```

**Why API routes instead of Server Actions for cart/orders?**  
Cart operations are triggered by button clicks in Client Components. Server Actions work too, but API routes give easier control over HTTP status codes and JSON responses.

---

### Step 12 — Putting It Together: A Full User Journey

```
Browser → middleware (auth check) → layout.tsx → page.tsx
                                                      ↓
                                              Server Component
                                                      ↓
                                               data.ts (SQL)
                                                      ↓
                                              PostgreSQL DB
                                                      ↓
                                           Returns typed data
                                                      ↓
                                         Renders HTML + ships
                                           to browser
                                                      ↓
                                      Client Components hydrate
                                     (AddToCartButton, CartIcon)
                                                      ↓
                                         User clicks "Add to Cart"
                                                      ↓
                                        fetch('/api/cart') POST
                                                      ↓
                                      API route validates session
                                                      ↓
                                         Inserts into cart_items
                                                      ↓
                                     CartIcon re-fetches and
                                       updates badge count
```

---

### File Quick Reference

| File | What it does |
|---|---|
| `auth.config.ts` | Defines which routes need login |
| `auth.ts` | NextAuth setup with bcrypt password check |
| `middleware.ts` | Runs auth check on every request |
| `app/layout.tsx` | HTML shell, global font & CSS |
| `app/page.tsx` | Customer storefront homepage |
| `app/dashboard/(overview)/page.tsx` | Admin dashboard home |
| `app/dashboard/layout.tsx` | Sidebar + content layout for admin |
| `app/lib/definitions.ts` | TypeScript types for all DB tables |
| `app/lib/data.ts` | All SQL queries |
| `app/lib/actions.ts` | Server actions (login, register, sign out) |
| `app/lib/utils.ts` | Helper functions (formatCurrency, etc.) |
| `app/api/cart/route.ts` | REST API for cart CRUD |
| `app/api/orders/route.ts` | REST API to create an order |
| `app/ui/dashboard/orders-chart.tsx` | Bar chart (Client Component) |
| `app/ui/dashboard/cards.tsx` | Stats cards (Server Component) |
| `app/ui/user-menu.tsx` | Profile dropdown with sign out |
| `app/ui/dashboard/sidenav.tsx` | Admin sidebar with sign out |
| `app/ui/global.css` | Global styles + custom animations |

---

## Future Enhancements

- [ ] Product image uploads (use cloud storage like AWS S3)
- [ ] Advanced search with filters
- [ ] Product reviews and ratings (user-generated)
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Inventory alerts for low stock
- [ ] Sales analytics and reports
- [ ] Discount codes and promotions
- [ ] Multi-image product galleries
- [ ] Real-time order tracking with map
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Export orders to CSV
- [ ] Bulk product import
- [ ] Advanced role permissions

---

## Credits

**Built by**: AI Assistant (GitHub Copilot)
**Framework**: Next.js Team
**Database**: PostgreSQL Community
**Authentication**: NextAuth.js Team

---

## License

MIT License - Free to use and modify for personal and commercial projects.

---

**Last Updated**: March 9, 2026 — Added chart empty-bar fix (generate_series) and step-by-step learning guide
