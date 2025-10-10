'use client';

import { useEffect, useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import VisitorTable from '@/components/admin/VisitorTable';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import type { Visitor, TimelineData, GeographicData, EngagementScore } from '@/types/admin';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [geographic, setGeographic] = useState<GeographicData[]>([]);
  const [engagement, setEngagement] = useState<EngagementScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchVisitors();
    fetchAnalytics();
  }, [page, dateRange]);

  const fetchVisitors = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      });

      const res = await fetch(`/api/admin/visitors?${params}`);
      const data = await res.json();
      
      setVisitors(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [timelineRes, geoRes, engagementRes] = await Promise.all([
        fetch('/api/admin/visitors/timeline?days=30'),
        fetch('/api/admin/visitors/geographic'),
        fetch('/api/admin/visitors/engagement')
      ]);

      setTimeline(await timelineRes.json());
      setGeographic(await geoRes.json());
      setEngagement(await engagementRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleExport = async (ids: string[]) => {
    try {
      const res = await fetch('/api/visitors/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitors-export-${new Date().toISOString()}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleBulkEmail = async (ids: string[]) => {
    const subject = prompt('Email subject:');
    const body = prompt('Email body:');
    
    if (!subject || !body) return;

    try {
      await fetch('/api/admin/visitors/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorIds: ids, subject, body })
      });
      
      alert('Emails sent successfully!');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visitor Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and analyze visitor data
            </p>
          </div>
          
          <button
            onClick={() => handleExport([])}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Timeline Chart */}
        <AnalyticsChart
          title="Registration Timeline (30 Days)"
          data={timeline}
          color="#3b82f6"
        />

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Geographic Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {geographic.slice(0, 12).map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.city || item.region || 'Unknown'}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Scores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Engaged Visitors
          </h3>
          <div className="space-y-2">
            {engagement.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.email}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Last active: {item.days_since_activity} days ago
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    item.engagement_level === 'high'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : item.engagement_level === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {item.engagement_level}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.activity_count} activities
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Table */}
        <VisitorTable
          visitors={visitors}
          onExport={handleExport}
          onBulkEmail={handleBulkEmail}
        />

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-900 dark:text-white">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
