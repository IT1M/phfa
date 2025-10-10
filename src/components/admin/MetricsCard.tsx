'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export default function MetricsCard({ title, value, change, icon: Icon, color = 'blue' }: MetricsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <p className={cn(
              'text-sm mt-2',
              change >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={cn('p-4 rounded-lg', colorClasses[color])}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
