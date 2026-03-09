import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { getRecentOrders } from '@/app/lib/data';
import Link from 'next/link';

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function LatestOrders() {
  const recentOrders = await getRecentOrders(5);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Orders
        </h2>
        <ArrowPathIcon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {recentOrders.map((order) => {
          return (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                  <span className="text-sm font-semibold text-blue-600">
                    {order.user_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {order.user_name}
                  </p>
                  <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[order.status as keyof typeof statusStyles]
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(order.total_amount)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
