import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import postgres from 'postgres';
import UpdateOrderStatus from '@/app/ui/dashboard/update-order-status';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.email) {
    redirect('/login?redirect=/dashboard/orders/' + id);
  }

  // Get order with user details
  const orders = await sql`
    SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.created_at,
      o.shipping_address,
      u.name as user_name,
      u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ${id}
  `;

  if (orders.length === 0) {
    notFound();
  }

  const order = orders[0];

  // Get order items with product details
  const orderItems = await sql`
    SELECT 
      oi.id,
      oi.quantity,
      oi.price,
      p.name as product_name,
      p.id as product_id,
      c.name as category_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE oi.order_id = ${id}
  `;

  let shippingInfo;
  try {
    shippingInfo = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address;
  } catch (error) {
    console.error('Failed to parse shipping address:', error);
    shippingInfo = { 
      fullName: 'N/A', 
      address: 'Invalid address data',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };
  }

  const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = 10;
  const tax = subtotal * 0.1;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/orders"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="mt-1 text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[order.status as keyof typeof statusColors]
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Items</h2>
            <div className="divide-y divide-gray-200">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <span className="text-3xl">📦</span>
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {item.product_name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">{item.category_name}</p>
                    <p className="mt-1 text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(Number(item.price))} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({orderItems.length} items):</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold text-red-700">
                <span>Total:</span>
                <span>{formatPrice(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{order.user_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{order.user_email}</p>
              </div>
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Address</h2>
            {shippingInfo && (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{shippingInfo.fullName}</p>
                <p>{shippingInfo.address}</p>
                <p>
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                </p>
                <p>{shippingInfo.country}</p>
                {shippingInfo.phone && <p>Phone: {shippingInfo.phone}</p>}
              </div>
            )}
          </div>

          {/* Update Status */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Update Status</h2>
            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
