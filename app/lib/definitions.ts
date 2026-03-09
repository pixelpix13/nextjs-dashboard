// E-commerce Type Definitions
// These types describe the shape of data for our e-commerce application

// User types
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  created_at: Date;
  updated_at: Date;
};

export type UserForm = {
  name: string;
  email: string;
  password: string;
};

export type SafeUser = Omit<User, 'password'>;

// Category types
export type Category = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
};

export type CategoryForm = {
  name: string;
  description: string;
  image_url: string;
};

// Product types
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ProductWithCategory = Product & {
  category_name: string;
};

export type ProductForm = {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  image_url: string;
};

export type ProductCard = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_name: string;
  stock_quantity: number;
};

// Order types
export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
};

export type OrderWithUser = Order & {
  user_name: string;
  user_email: string;
  product_names: string;
  item_count: string | number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: Date;
};

export type OrderItemWithProduct = OrderItem & {
  product_name: string;
  product_image_url: string;
};

export type OrderDetails = Order & {
  items: OrderItemWithProduct[];
  user_name: string;
  user_email: string;
};

export type OrderForm = {
  user_id: string;
  shipping_address: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
};

// Cart types
export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

export type CartItemWithProduct = CartItem & {
  product_name: string;
  product_price: number;
  product_image_url: string;
  product_stock: number;
};

export type CartSummary = {
  items: CartItemWithProduct[];
  total_items: number;
  total_amount: number;
};

// Dashboard stats types
export type DashboardStats = {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  pending_orders: number;
  low_stock_products: number;
};

export type RecentOrder = {
  id: string;
  user_name: string;
  total_amount: number;
  status: string;
  created_at: Date;
};

// Field types for forms
export type CategoryField = {
  id: string;
  name: string;
};

