'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type OrderData = {
  date: string | Date;
  count: string | number;
  revenue: string | number;
};

const RANGES = [
  { label: '7D',  days: 7  },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function OrdersChart({
  data,
  currentRange = 7,
}: {
  data: OrderData[];
  currentRange?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRangeChange = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', days.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  // Compute max value synchronously — avoids NaN bars caused by useState(0) on first render
  const rawMax = data.length > 0 ? Math.max(...data.map(d => Number(d.count))) : 0;
  const maxValue = rawMax > 0 ? Math.ceil(rawMax * 1.1) : 5;

  const formatDate = (dateString: string | Date) => {
    // postgres.js may return a Date object or an ISO string — handle both
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
    const [year, month, day] = String(dateString).split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show fewer X-axis labels when range is large so they don't overlap
  const labelEvery = currentRange <= 14 ? 1 : currentRange <= 30 ? 3 : 7;

  // Calculate Y-axis labels (5 steps)
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
    Math.round((maxValue / yAxisSteps) * (yAxisSteps - i))
  );

  const hasOrders = data.some(d => Number(d.count) > 0);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders Per Day</h2>
          <p className="text-sm text-gray-600">Last {currentRange} days{!hasOrders && ' — no orders yet'}</p>
        </div>
        {/* Range selector */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {RANGES.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => handleRangeChange(days)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                currentRange === days
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-gray-500">
          No order data available
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between py-2 text-xs text-gray-500">
            {yAxisLabels.map((label, i) => (
              <div key={i} className="h-8 leading-8">
                {label}
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="flex-1">
            {/* Grid and Bars */}
            <div className="relative h-64">
              {/* Horizontal grid lines */}
              {yAxisLabels.map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${(i / yAxisSteps) * 100}%` }}
                />
              ))}

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-around gap-2 pb-2">
                {data.map((item, index) => {
                  const count = Number(item.count);
                  const heightPercentage = (count / maxValue) * 100;
                  return (
                    <div key={index} className="group relative flex h-full flex-1 items-end">
                      {/* Bar — h-full on the wrapper ensures height% resolves correctly */}
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 hover:from-indigo-600 hover:to-indigo-400"
                        style={count > 0 ? { height: `${heightPercentage}%` } : { height: '3px' }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                          <div className="font-semibold">{item.count} orders</div>
                          <div className="text-gray-300">${Number(item.revenue).toFixed(2)}</div>
                          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="mt-2 flex justify-around">
              {data.map((item, index) => (
                <div key={index} className="flex-1 text-center text-xs text-gray-600">
                  {index % labelEvery === 0 ? formatDate(item.date) : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
