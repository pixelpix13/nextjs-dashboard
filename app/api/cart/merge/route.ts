import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// POST merge guest cart with user cart
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { guestCart } = await request.json();

    if (!guestCart || !Array.isArray(guestCart) || guestCart.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to merge' });
    }

    // Get user
    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    // Merge cart items
    for (const item of guestCart) {
      const { productId, quantity } = item;

      // Check if item already in cart
      const existing = await sql`
        SELECT id, quantity FROM cart_items 
        WHERE user_id = ${userId} AND product_id = ${productId}
      `;

      if (existing.length > 0) {
        // Update quantity (add to existing)
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Merge cart error:', error);
    return NextResponse.json({ error: 'Failed to merge cart' }, { status: 500 });
  }
}
