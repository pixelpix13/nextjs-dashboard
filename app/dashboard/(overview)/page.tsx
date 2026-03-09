import CardWrapper from '@/app/ui/dashboard/cards';
import LatestOrders from '@/app/ui/dashboard/latest-invoices';
import { Suspense } from 'react';
import { LatestInvoicesSkeleton, CardsSkeleton } from '@/app/ui/skeletons';

export default async function Page() {
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

      {/* Recent Orders */}
      <div className="mt-8">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestOrders />
        </Suspense>
      </div>
    </main>
  );
}