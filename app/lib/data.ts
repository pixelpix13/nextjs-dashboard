import postgres from 'postgres';
import {
  User,
  SafeUser,
  Category,
  Product,
  ProductWithCategory,
  ProductCard,
  Order,
  OrderWithUser,
  OrderDetails,
  OrderItemWithProduct,
  CartItemWithProduct,
  CartSummary,
  DashboardStats,
  RecentOrder,
  CategoryField,
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!, { 
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// ============= USER FUNCTIONS =============

export async function getUserByEmail(email: string) {
  try {
    const users = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return users[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function getUserById(id: string) {
  try {
    const users = await sql<SafeUser[]>`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users WHERE id = ${id} LIMIT 1
    `;
    return users[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function getAllUsers() {
  try {
    const users = await sql<SafeUser[]>`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    return users;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

// ============= CATEGORY FUNCTIONS =============

export async function getAllCategories() {
  try {
    const categories = await sql<Category[]>`
      SELECT * FROM categories ORDER BY name ASC
    `;
    return categories;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

export async function getCategoryById(id: string) {
  try {
    const categories = await sql<Category[]>`
      SELECT * FROM categories WHERE id = ${id}
    `;
    return categories[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category.');
  }
}

export async function getCategoryFields() {
  try {
    const categories = await sql<CategoryField[]>`
      SELECT id, name FROM categories ORDER BY name ASC
    `;
    return categories;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category fields.');
  }
}

// ============= PRODUCT FUNCTIONS =============

export async function getAllProducts() {
  try {
    const products = await sql<ProductWithCategory[]>`
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `;
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function getProductById(id: string) {
  try {
    const products = await sql<ProductWithCategory[]>`
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `;
    return products[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product.');
  }
}

const ITEMS_PER_PAGE = 12;

export async function fetchFilteredProducts(
  query: string,
  categoryId: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const products = await sql<ProductCard[]>`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 
        p.is_active = true
        AND (p.name ILIKE ${`%${query}%`} OR p.description ILIKE ${`%${query}%`})
        AND (${categoryId === '' ? sql`true` : sql`p.category_id = ${categoryId}`})
      ORDER BY p.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function fetchProductsPages(query: string, categoryId: string) {
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM products p
      WHERE 
        p.is_active = true
        AND (p.name ILIKE ${`%${query}%`} OR p.description ILIKE ${`%${query}%`})
        AND (${categoryId === '' ? sql`true` : sql`p.category_id = ${categoryId}`})
    `;
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of products.');
  }
}

export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await sql<ProductCard[]>`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ${categoryId} AND p.is_active = true
      ORDER BY p.name ASC
    `;
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products by category.');
  }
}

export async function getLowStockProducts(threshold: number = 10) {
  try {
    const products = await sql<ProductWithCategory[]>`
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity < ${threshold} AND p.is_active = true
      ORDER BY p.stock_quantity ASC
    `;
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch low stock products.');
  }
}

// ============= ORDER FUNCTIONS =============

export async function getAllOrders() {
  try {
    const orders = await sql<OrderWithUser[]>`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders.');
  }
}

export async function getOrderById(id: string) {
  try {
    const orders = await sql<Order[]>`
      SELECT * FROM orders WHERE id = ${id}
    `;
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    
    // Fetch order items
    const items = await sql<OrderItemWithProduct[]>`
      SELECT 
        oi.*,
        p.name as product_name,
        p.image_url as product_image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${id}
    `;
    
    // Fetch user info
    const users = await sql<SafeUser[]>`
      SELECT id, name, email, role, created_at, updated_at
      FROM users WHERE id = ${order.user_id}
    `;
    
    const orderDetails: OrderDetails = {
      ...order,
      items,
      user_name: users[0]?.name || '',
      user_email: users[0]?.email || '',
    };
    
    return orderDetails;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch order details.');
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const orders = await sql<Order[]>`
      SELECT * FROM orders 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user orders.');
  }
}

export async function getRecentOrders(limit: number = 5) {
  try {
    const orders = await sql<RecentOrder[]>`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ${limit}
    `;
    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recent orders.');
  }
}

export async function fetchFilteredOrders(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const orders = await sql<OrderWithUser[]>`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE
        u.name ILIKE ${`%${query}%`} OR
        u.email ILIKE ${`%${query}%`} OR
        o.status ILIKE ${`%${query}%`} OR
        o.id::text ILIKE ${`%${query}%`}
      ORDER BY o.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return orders;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders.');
  }
}

export async function fetchOrdersPages(query: string) {
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE
        u.name ILIKE ${`%${query}%`} OR
        u.email ILIKE ${`%${query}%`} OR
        o.status ILIKE ${`%${query}%`} OR
        o.id::text ILIKE ${`%${query}%`}
    `;
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of orders.');
  }
}

// ============= CART FUNCTIONS =============

export async function getCartByUserId(userId: string) {
  try {
    const items = await sql<CartItemWithProduct[]>`
      SELECT 
        ci.*,
        p.name as product_name,
        p.price as product_price,
        p.image_url as product_image_url,
        p.stock_quantity as product_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${userId}
      ORDER BY ci.created_at DESC
    `;
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
    
    const cartSummary: CartSummary = {
      items,
      total_items: totalItems,
      total_amount: totalAmount,
    };
    
    return cartSummary;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch cart.');
  }
}

// ============= DASHBOARD STATS =============

export async function fetchDashboardStats() {
  try {
    const productCountPromise = sql`SELECT COUNT(*) FROM products WHERE is_active = true`;
    const orderCountPromise = sql`SELECT COUNT(*) FROM orders`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM users WHERE role = 'customer'`;
    const revenuePromise = sql`
      SELECT SUM(total_amount) as total 
      FROM orders 
      WHERE status IN ('delivered', 'shipped', 'processing')
    `;
    const pendingOrdersPromise = sql`SELECT COUNT(*) FROM orders WHERE status = 'pending'`;
    const lowStockPromise = sql`SELECT COUNT(*) FROM products WHERE stock_quantity < 10 AND is_active = true`;

    const data = await Promise.all([
      productCountPromise,
      orderCountPromise,
      customerCountPromise,
      revenuePromise,
      pendingOrdersPromise,
      lowStockPromise,
    ]);

    const stats: DashboardStats = {
      total_products: Number(data[0][0].count ?? 0),
      total_orders: Number(data[1][0].count ?? 0),
      total_customers: Number(data[2][0].count ?? 0),
      total_revenue: Number(data[3][0].total ?? 0),
      pending_orders: Number(data[4][0].count ?? 0),
      low_stock_products: Number(data[5][0].count ?? 0),
    };

    return stats;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch dashboard stats.');
  }
}
