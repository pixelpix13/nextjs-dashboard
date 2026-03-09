import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// POST update existing product
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id, name, description, price, stockQuantity, categoryId, imageUrl, isActive } = await request.json();

    if (!id || !name || !price || !stockQuantity || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update product
    const product = await sql`
      UPDATE products
      SET 
        name = ${name},
        description = ${description || ''},
        price = ${price},
        stock_quantity = ${stockQuantity},
        category_id = ${categoryId},
        image_url = ${imageUrl || ''},
        is_active = ${isActive},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: product[0] });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
