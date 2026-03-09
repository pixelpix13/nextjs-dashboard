import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// GET cart items for current user
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      // Return empty for guest users - they use localStorage
      return NextResponse.json({ items: [], isGuest: true });
    }

    // Get user
    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ items: [], isGuest: true });
    }

    const userId = users[0].id;

    // Get cart items with product details
    const cartItems = await sql`
      SELECT 
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name as product_name,
        p.price as product_price,
        p.stock_quantity,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ${userId}
      ORDER BY ci.created_at DESC
    `;

    return NextResponse.json({ items: cartItems, isGuest: false });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ items: [], isGuest: true });
  }
}

// POST add item to cart
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    // Get user
    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    // Check if item already in cart
    const existing = await sql`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;

    if (existing.length > 0) {
      // Update quantity
      await sql`
        UPDATE cart_items 
        SET quantity = quantity + ${quantity}
        WHERE id = ${existing[0].id}
      `;
    } else {
      // Add new item
      await sql`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (${userId}, ${productId}, ${quantity})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// DELETE remove item from cart
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('id');

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 });
    }

    await sql`
      DELETE FROM cart_items WHERE id = ${cartItemId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}

// PATCH update cart item quantity
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { cartItemId, quantity } = await request.json();

    await sql`
      UPDATE cart_items 
      SET quantity = ${quantity}
      WHERE id = ${cartItemId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
