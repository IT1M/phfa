'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, Activity, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MetricsCard from '@/components/admin/MetricsCard';
import DocumentQueue from '@/components/admin/DocumentQueue';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import type { DashboardMetrics, RealtimeStats, QueueItem, TrendAnalysis } from '@/types/admin';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh realtime stats every 30 seconds
    const interval = setInterval(fetchRealtimeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, queueRes, trendsRes] = await Promise.all([
        fetch('/api/admin/dashboard/metrics'),
        fetch('/api/admin/documents/queue'),
        fetch('/api/admin/analytics/trends?days=30')
      ]);

      const metricsData = await metricsRes.json();
      const queueData = await queueRes.json();
      const trendsData = await trendsRes.json();

      setMetrics(metricsData);
      setQueue(queueData);
      setTrends(trendsData);
      
      await fetchRealtimeStats();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/realtime');
      const data = await res.json();
      setRealtimeStats(data);
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time system monitoring and analytics
          </p>
        </div>

        {/* Realtime Stats */}
        {realtimeStats && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Live Stats</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Active Users: </span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">{realtimeStats.active_users}</span>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Processing: </span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">{realtimeStats.processing_docs}</span>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Avg Time: </span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    {realtimeStats.avg_processing_time ? `${Math.round(realtimeStats.avg_processing_time)}s` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Visitors"
            value={metrics?.visitors?.total || 0}
            icon={Users}
            color="blue"
          />
          <MetricsCard
            title="Active Today"
            value={metrics?.visitors?.active_today || 0}
            icon={TrendingUp}
            color="green"
          />
          <MetricsCard
            title="Documents Processed"
            value={metrics?.documents?.processed || 0}
            icon={FileText}
            color="blue"
          />
          <MetricsCard
            title="Processing Errors"
            value={metrics?.errors?.errors_today || 0}
            icon={AlertCircle}
            color="red"
          />
        </div>

        {/* Charts and Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart
            title="Visitor Registrations (30 Days)"
            data={trends?.visitors || []}
            color="#3b82f6"
          />
          <AnalyticsChart
            title="Document Uploads (30 Days)"
            data={trends?.documents || []}
            color="#10b981"
          />
        </div>

        {/* Processing Queue */}
        <DocumentQueue items={queue} />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {metrics?.processing?.in_progress || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Queued</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {metrics?.processing?.queued || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Time</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {metrics?.processing?.avg_processing_time 
                    ? `${Math.round(metrics.processing.avg_processing_time)}s`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visitor Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active This Week</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {metrics?.visitors?.active_week || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">New Today</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {metrics?.visitors?.new_today || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Uploaded Today</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {metrics?.documents?.uploaded_today || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Failed</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {metrics?.documents?.failed || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
