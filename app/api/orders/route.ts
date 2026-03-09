import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// POST create order from cart
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { shippingInfo, paymentInfo } = await request.json();

    // Get user
    const users = await sql`
      SELECT id, name FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    // Get cart items
    const cartItems = await sql`
      SELECT 
        ci.id as cart_item_id,
        ci.product_id,
        ci.quantity,
        p.price,
        p.name as product_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${userId}
    `;

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.quantity));
    }, 0);

    const shippingCost = 10;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shippingCost + tax;

    // Create order
    const orders = await sql`
      INSERT INTO orders (user_id, total_amount, status, shipping_address)
      VALUES (
        ${userId}, 
        ${totalAmount}, 
        'pending',
        ${JSON.stringify(shippingInfo)}
      )
      RETURNING id
    `;

    const orderId = orders[0].id;

    // Create order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (
          ${orderId},
          ${item.product_id},
          ${item.quantity},
          ${item.price}
        )
      `;
    }

    // Clear cart
    await sql`
      DELETE FROM cart_items WHERE user_id = ${userId}
    `;

    return NextResponse.json({ 
      success: true, 
      orderId,
      totalAmount 
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
