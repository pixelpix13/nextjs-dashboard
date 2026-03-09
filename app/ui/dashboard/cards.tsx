import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchDashboardStats } from '@/app/lib/data';

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

const iconMap = {
  revenue: BanknotesIcon,
  customers: UserGroupIcon,
  orders: ShoppingBagIcon,
  products: CubeIcon,
  pending: ClockIcon,
  lowStock: ExclamationTriangleIcon,
};

export default async function CardWrapper() {
  const stats = await fetchDashboardStats();
  
  return (
    <>
      <Card 
        title="Total Revenue" 
        value={formatPrice(stats.total_revenue)} 
        type="revenue" 
      />
      <Card 
        title="Total Orders" 
        value={stats.total_orders} 
        type="orders" 
      />
      <Card 
        title="Products" 
        value={stats.total_products} 
        type="products" 
      />
      <Card
        title="Customers"
        value={stats.total_customers}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'revenue' | 'orders' | 'products' | 'customers' | 'pending' | 'lowStock';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-3 ${
            type === 'revenue' ? 'bg-blue-100' :
            type === 'orders' ? 'bg-purple-100' :
            type === 'products' ? 'bg-green-100' :
            type === 'customers' ? 'bg-orange-100' :
            type === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {Icon ? <Icon className={`h-6 w-6 ${
              type === 'revenue' ? 'text-blue-600' :
              type === 'orders' ? 'text-purple-600' :
              type === 'products' ? 'text-green-600' :
              type === 'customers' ? 'text-orange-600' :
              type === 'pending' ? 'text-yellow-600' : 'text-red-600'
            }`} /> : null}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
