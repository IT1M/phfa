'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import DocumentQueue from '@/components/admin/DocumentQueue';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import type { QueueItem, ProcessingStats, FailedDocument } from '@/types/admin';

export default function DocumentsPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<ProcessingStats[]>([]);
  const [failed, setFailed] = useState<FailedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [queueRes, statsRes, failedRes] = await Promise.all([
        fetch('/api/admin/documents/queue'),
        fetch('/api/admin/documents/stats?days=7'),
        fetch('/api/admin/documents/failed?limit=20')
      ]);

      setQueue(await queueRes.json());
      setStats(await statsRes.json());
      setFailed(await failedRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const totalProcessed = stats.reduce((sum, s) => sum + (s.successful || 0), 0);
  const totalFailed = stats.reduce((sum, s) => sum + (s.failed || 0), 0);
  const successRate = totalProcessed + totalFailed > 0
    ? ((totalProcessed / (totalProcessed + totalFailed)) * 100).toFixed(1)
    : '0';

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor document processing pipeline
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Rate</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{successRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {totalProcessed} successful / {totalProcessed + totalFailed} total
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">In Queue</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600">{queue.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Documents waiting to be processed
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed</h3>
            </div>
            <p className="text-4xl font-bold text-red-600">{totalFailed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Last 7 days
            </p>
          </div>
        </div>

        {/* Processing Stats Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart
            title="Successful Processing (7 Days)"
            data={stats.map(s => ({ date: s.date, count: s.successful || 0 }))}
            color="#10b981"
          />
          <AnalyticsChart
            title="Failed Processing (7 Days)"
            data={stats.map(s => ({ date: s.date, count: s.failed || 0 }))}
            color="#ef4444"
          />
        </div>

        {/* Processing Queue */}
        <DocumentQueue items={queue} />

        {/* Failed Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed Documents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Recent processing failures
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {failed.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No failed documents
              </div>
            ) : (
              failed.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.filename}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.uploader_email} • {new Date(item.upload_date).toLocaleString()}
                      </p>
                      {item.error_message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {item.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
