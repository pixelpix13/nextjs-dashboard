import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import CartIcon from '@/app/ui/cart-icon';

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login?redirect=/orders');
  }

  // Get user
  const users = await sql`
    SELECT id FROM users WHERE email = ${session.user.email}
  `;

  if (users.length === 0) {
    redirect('/login');
  }

  const userId = users[0].id;

  // Get user's orders
  const orders = await sql`
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.created_at,
      o.shipping_address,
      COUNT(DISTINCT oi.id) as item_count,
      STRING_AGG(DISTINCT p.name, ', ') as product_names
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ${userId}
    GROUP BY o.id, o.total_amount, o.status, o.created_at, o.shipping_address
    ORDER BY o.created_at DESC
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <span className="text-2xl font-bold text-blue-900">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShopMart</span>
            </Link>
            <CartIcon />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Shopping
        </Link>

        {/* Page Title */}
        <h1 className="mb-6 text-3xl font-bold text-gray-900">My Orders</h1>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <div className="mx-auto mb-4 text-6xl">📦</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">No orders yet</h2>
            <p className="mb-6 text-gray-600">When you place orders, they will appear here.</p>
            <Link
              href="/"
              className="inline-block rounded-full bg-yellow-400 px-6 py-2 font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              let shippingInfo;
              try {
                if (typeof order.shipping_address === 'string') {
                  // Trim and validate the string before parsing
                  const trimmed = order.shipping_address.trim();
                  if (trimmed && trimmed.startsWith('{')) {
                    shippingInfo = JSON.parse(trimmed);
                  } else {
                    throw new Error('Invalid JSON format');
                  }
                } else if (order.shipping_address && typeof order.shipping_address === 'object') {
                  shippingInfo = order.shipping_address;
                } else {
                  throw new Error('No shipping address data');
                }
              } catch (error) {
                // Silently handle malformed data with fallback
                shippingInfo = { 
                  fullName: 'N/A', 
                  address: 'Invalid address data',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: ''
                };
              }
              
              const statusColors: Record<string, string> = {
                pending: 'bg-yellow-100 text-yellow-800',
                processing: 'bg-blue-100 text-blue-800',
                shipped: 'bg-purple-100 text-purple-800',
                delivered: 'bg-green-100 text-green-800',
                cancelled: 'bg-red-100 text-red-800',
              };

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[order.status as keyof typeof statusColors]
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="font-medium text-gray-700">{order.item_count} items</p>
                        {order.product_names && (
                          <p className="line-clamp-2 text-gray-600" title={order.product_names}>
                            Products: {order.product_names}
                          </p>
                        )}
                        {shippingInfo?.fullName && (
                          <p>Deliver to: {shippingInfo.fullName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(Number(order.total_amount))}
                      </p>
                      <p className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                        View Details →
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
