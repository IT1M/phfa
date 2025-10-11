'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, Search, Smartphone, Globe } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import type { TrendAnalysis, UsagePattern, DeviceAnalytics, LanguageDistribution } from '@/types/admin';

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
  const [devices, setDevices] = useState<DeviceAnalytics[]>([]);
  const [languages, setLanguages] = useState<LanguageDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      const [trendsRes, patternsRes, devicesRes, languagesRes] = await Promise.all([
        fetch(`/api/admin/analytics/trends?days=${days}`),
        fetch(`/api/admin/analytics/usage-patterns?days=${days}`),
        fetch('/api/admin/analytics/devices'),
        fetch('/api/admin/analytics/languages')
      ]);

      setTrends(await trendsRes.json());
      setUsagePatterns(await patternsRes.json());
      setDevices(await devicesRes.json());
      setLanguages(await languagesRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Usage patterns, trends, and predictions
            </p>
          </div>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnalyticsChart
            title="Visitor Trends"
            data={trends?.visitors || []}
            color="#3b82f6"
          />
          <AnalyticsChart
            title="Document Uploads"
            data={trends?.documents || []}
            color="#10b981"
          />
          <AnalyticsChart
            title="Search Activity"
            data={trends?.searches || []}
            color="#f59e0b"
          />
        </div>

        {/* Usage Patterns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hourly Usage Patterns
            </h3>
          </div>
          
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, i) => {
              const hourData = usagePatterns.find(p => p.hour === i);
              const count = hourData?.activity_count || 0;
              const maxCount = Math.max(...usagePatterns.map(p => p.activity_count || 0));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-full h-32 flex items-end">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`${i}:00 - ${count} activities`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {i}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device & Language Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Device Distribution
              </h3>
            </div>

            <div className="space-y-4">
              {devices.map((device, index) => {
                const total = devices.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? ((device.count / total) * 100).toFixed(1) : '0';

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {device.device || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {device.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Avg activity: {device.avg_activity?.toFixed(1) || '0'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Language Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Language Distribution
              </h3>
            </div>

            <div className="space-y-4">
              {languages.map((lang, index) => {
                const total = languages.reduce((sum, l) => sum + l.count, 0);
                const percentage = total > 0 ? ((lang.count / total) * 100).toFixed(1) : '0';

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                        {lang.language || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lang.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Predictions & Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI-Powered Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Peak Usage Time
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {usagePatterns.length > 0
                  ? `${usagePatterns.reduce((max, p) => p.activity_count > max.activity_count ? p : max).hour}:00`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Growth Rate
              </p>
              <p className="text-2xl font-bold text-green-600">
                {trends?.visitors && trends.visitors.length > 1
                  ? `+${(((trends.visitors[trends.visitors.length - 1]?.count || 0) / (trends.visitors[0]?.count || 1) - 1) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
