import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { 
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export async function GET() {
  try {
    // Test connection by counting tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Get sample data counts
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    const productCount = await sql`SELECT COUNT(*) FROM products`;
    const categoryCount = await sql`SELECT COUNT(*) FROM categories`;
    const orderCount = await sql`SELECT COUNT(*) FROM orders`;

    // Get one sample user (without password)
    const sampleUser = await sql`
      SELECT id, name, email, role 
      FROM users 
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      message: '✅ Database connection successful!',
      database: 'ecommerce_db',
      tables: tables.map(t => t.table_name),
      counts: {
        users: Number(userCount[0].count),
        products: Number(productCount[0].count),
        categories: Number(categoryCount[0].count),
        orders: Number(orderCount[0].count)
      },
      sampleUser: sampleUser[0]
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '❌ Database connection failed',
      error: error.message,
      hint: 'Check your POSTGRES_URL in .env.local'
    }, { status: 500 });
  }
}
