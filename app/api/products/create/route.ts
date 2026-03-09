import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// POST create new product
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, description, price, stockQuantity, categoryId, imageUrl, isActive } = await request.json();

    if (!name || !price || !stockQuantity || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create product
    const product = await sql`
      INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, is_active)
      VALUES (${name}, ${description || ''}, ${price}, ${stockQuantity}, ${categoryId}, ${imageUrl || ''}, ${isActive})
      RETURNING *
    `;

    return NextResponse.json({ success: true, product: product[0] });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
