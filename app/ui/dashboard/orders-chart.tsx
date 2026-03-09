'use client';

import { useEffect, useState } from 'react';

type OrderData = {
  date: string;
  count: string | number;
  revenue: string | number;
};

export default function OrdersChart({ data }: { data: OrderData[] }) {
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    const max = Math.max(...data.map(d => Number(d.count)));
    setMaxValue(max > 0 ? Math.ceil(max * 1.1) : 10);
  }, [data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate Y-axis labels (5 steps)
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => 
    Math.round((maxValue / yAxisSteps) * (yAxisSteps - i))
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Orders Per Day</h2>
        <p className="text-sm text-gray-600">Last 7 days</p>
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
                  const heightPercentage = maxValue > 0 ? (Number(item.count) / maxValue) * 100 : 0;
                  return (
                    <div key={index} className="group relative flex flex-1 flex-col items-center">
                      {/* Bar */}
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 hover:from-indigo-600 hover:to-indigo-400"
                        style={{ height: `${Math.max(heightPercentage, 2)}%` }}
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
                  {formatDate(item.date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
