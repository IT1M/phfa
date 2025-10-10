'use client';

interface DataPoint {
  date: string;
  count: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

export default function AnalyticsChart({ data, title, color = '#3b82f6' }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count));
  const chartHeight = 200;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="relative" style={{ height: chartHeight }}>
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((point, index) => {
            const height = maxValue > 0 ? (point.count / maxValue) * chartHeight : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${height}px`,
                      backgroundColor: color,
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {point.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
        <span>{new Date(data[0]?.date).toLocaleDateString()}</span>
        <span>{new Date(data[data.length - 1]?.date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
