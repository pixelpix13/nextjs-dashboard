import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// POST update order status
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current order status before updating
    const currentOrderRows = await sql`
      SELECT status FROM orders WHERE id = ${orderId} LIMIT 1
    `;
    if (currentOrderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const previousStatus = currentOrderRows[0].status as string;

    // Inventory management:
    // Deduct stock when transitioning INTO processing (order is being fulfilled)
    // Restore stock when transitioning OUT OF processing back to any other status
    const goingToProcessing   = previousStatus !== 'processing' && status === 'processing';
    const leavingProcessing   = previousStatus === 'processing' && status !== 'processing';

    if (goingToProcessing || leavingProcessing) {
      // Fetch all items in this order (product_id + quantity)
      const orderItems = await sql`
        SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId}
      `;

      for (const item of orderItems) {
        if (goingToProcessing) {
          // Deduct stock — clamp at 0 so stock never goes negative
          await sql`
            UPDATE products
            SET stock_quantity = GREATEST(stock_quantity - ${item.quantity}, 0),
                updated_at = NOW()
            WHERE id = ${item.product_id}
          `;
        } else {
          // Restore stock
          await sql`
            UPDATE products
            SET stock_quantity = stock_quantity + ${item.quantity},
                updated_at = NOW()
            WHERE id = ${item.product_id}
          `;
        }
      }
    }

    // Update order status
    await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${orderId}
    `;

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
