import { getMostBoughtProducts } from '@/app/lib/data';
import { TrophyIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

export default async function TopProducts() {
  const products = await getMostBoughtProducts(5);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-yellow-100 p-2">
          <TrophyIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
          <p className="text-sm text-gray-600">Best performers this month</p>
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-gray-500">
          No sales data available
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                  <span className="text-xl font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.total_sold} units sold • {product.order_count} orders
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                <p className="text-sm text-gray-600">each</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
