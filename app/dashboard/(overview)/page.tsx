import CardWrapper from '@/app/ui/dashboard/cards';
import LatestOrders from '@/app/ui/dashboard/latest-invoices';
import OrdersChart from '@/app/ui/dashboard/orders-chart';
import TopProducts from '@/app/ui/dashboard/top-products';
import { Suspense } from 'react';
import { LatestInvoicesSkeleton, CardsSkeleton } from '@/app/ui/skeletons';
import { getOrdersPerDay } from '@/app/lib/data';

const VALID_RANGES = [7, 14, 30, 90];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = VALID_RANGES.includes(Number(params?.range))
    ? Number(params.range)
    : 7;

  const ordersData = await getOrdersPerDay(range);

  // Transform data to match expected format
  const chartData = ordersData.map((item: any) => ({
    date: item.date,
    count: item.count,
    revenue: item.revenue,
  }));

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>

      {/* Charts and Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Orders Chart */}
        <OrdersChart data={chartData} currentRange={range} />

        {/* Top Products */}
        <Suspense>
          <TopProducts />
        </Suspense>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestOrders />
        </Suspense>
      </div>
    </main>
  );
}