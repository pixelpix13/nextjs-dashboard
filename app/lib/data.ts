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

export async function getProductsWithFilters({
  search = '',
  categoryId = '',
  page = 1,
  itemsPerPage = 10,
}: {
  search?: string;
  categoryId?: string;
  page?: number;
  itemsPerPage?: number;
}) {
  try {
    const offset = (page - 1) * itemsPerPage;
    
    // Build the WHERE clause dynamically
    let whereClause = 'WHERE p.is_active = true';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (categoryId) {
      whereClause += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM products p
      ${whereClause}
    `;
    
    const countResult = await sql.unsafe(countQuery, params);
    const totalItems = Number(countResult[0].count);
    
    // Get products
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const products = await sql.unsafe(productsQuery, [...params, itemsPerPage, offset]);
    
    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        totalItems,
        itemsPerPage,
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products with filters.');
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
        u.email as user_email,
        STRING_AGG(DISTINCT p.name, ', ') as product_names,
        COUNT(DISTINCT oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name, u.email
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

export async function getOrdersPerDay(days: number = 7) {
  try {
    // Compute date bounds in Node.js (local timezone) to avoid UTC offset issues
    const today = new Date();
    const endDate = today.toLocaleDateString('en-CA');   // "2026-03-09"
    const startDay = new Date(today);
    startDay.setDate(startDay.getDate() - (days - 1));
    const startDate = startDay.toLocaleDateString('en-CA'); // e.g. "2026-03-03"

    // Build a local-timezone offset string (e.g. "+5 hours 30 minutes") so PostgreSQL
    // groups timestamps by the same local date the browser shows to users.
    const offsetMinutes = new Date().getTimezoneOffset(); // negative east of UTC
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const offsetHours = Math.floor(absMinutes / 60);
    const offsetMins  = absMinutes % 60;
    // Build a single offset string — used once in the subquery so postgres.js
    // only creates one parameter ($1), avoiding the "must appear in GROUP BY" error
    // that occurs when the same ${expression} is repeated (creating $1, $2, $3).
    const tzOffset = `${offsetSign}${offsetHours} hours ${offsetMins} minutes`;

    const rows = await sql`
      SELECT
        local_date::text AS date,
        COUNT(*) AS count,
        SUM(total_amount) AS revenue
      FROM (
        SELECT
          total_amount,
          (created_at + ${tzOffset}::interval)::date AS local_date
        FROM orders
      ) sub
      WHERE local_date BETWEEN ${startDate}::date AND ${endDate}::date
      GROUP BY local_date
      ORDER BY local_date ASC
    `;

    // Index rows by YYYY-MM-DD string.
    // NOTE: We cast local_date to text in SQL so postgres.js returns a plain string
    // instead of a Date object. Without the cast, postgres.js creates a Date at
    // midnight UTC — e.g. new Date('2026-03-09') — which toLocaleDateString()
    // converts to '2026-03-08' in UTC-5 (Houston), shifting every date back by one day.
    const rowsByDate = new Map<string, { count: number; revenue: number }>();
    for (const row of rows) {
      const dateKey = String(row.date).split('T')[0]; // always "YYYY-MM-DD"
      rowsByDate.set(dateKey, {
        count: Number(row.count),
        revenue: Number(row.revenue),
      });
    }

    // Build the full range, filling missing days with zeros
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const dateKey = d.toLocaleDateString('en-CA');
      const data = rowsByDate.get(dateKey) ?? { count: 0, revenue: 0 };
      result.push({ date: dateKey, count: data.count, revenue: data.revenue });
    }
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch orders per day.');
  }
}

export async function getMostBoughtProducts(limit: number = 5) {
  try {
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.price,
        SUM(oi.quantity) as total_sold,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('delivered', 'shipped', 'processing')
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT ${limit}
    `;
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch most bought products.');
  }
}
