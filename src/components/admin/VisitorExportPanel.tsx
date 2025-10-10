import React, { useState, useEffect } from 'react';

interface ExportFile {
  filename: string;
  size: number;
  date: string;
}

interface Analytics {
  total_visitors: number;
  active_last_week: number;
  active_last_month: number;
  avg_activity_count: number;
  arabic_users: number;
  english_users: number;
}

export const VisitorExportPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [exports, setExports] = useState<ExportFile[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchAnalytics();
    fetchExportsList();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/visitors/analytics`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchExportsList = async () => {
    try {
      const response = await fetch(`${API_BASE}/visitors/exports/list`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setExports(data.exports || []);
    } catch (error) {
      console.error('Failed to fetch exports list:', error);
    }
  };

  const handleQuickExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/visitors/export`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitors-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('تم تصدير البيانات بنجاح - Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('فشل التصدير - Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeExport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('الرجاء تحديد نطاق التاريخ - Please select date range');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/visitors/export/date-range`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dateRange)
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitors-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('تم تصدير البيانات بنجاح - Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('فشل التصدير - Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExport = async (filename: string) => {
    try {
      const response = await fetch(`${API_BASE}/visitors/exports/${filename}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('فشل التنزيل - Download failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          تصدير بيانات الزوار - Visitor Data Export
        </h1>
        <p className="text-gray-600">
          تصدير شامل لبيانات الزوار مع التحليلات والإحصائيات
        </p>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              إجمالي الزوار - Total Visitors
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.total_visitors.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              نشط هذا الشهر - Active This Month
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.active_last_month.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              متوسط النشاط - Avg Activity
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(analytics.avg_activity_count)}
            </p>
          </div>
        </div>
      )}

      {/* Quick Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          تصدير سريع - Quick Export
        </h2>
        <p className="text-gray-600 mb-4">
          تصدير جميع بيانات الزوار مع التحليلات الكاملة في ملف Excel واحد
        </p>
        <button
          onClick={handleQuickExport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              جاري التصدير... Exporting...
            </span>
          ) : (
            '📊 تصدير الآن - Export Now'
          )}
        </button>
      </div>

      {/* Date Range Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          تصدير حسب التاريخ - Date Range Export
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              من تاريخ - Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              إلى تاريخ - End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateRangeExport}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📅 تصدير النطاق - Export Range
            </button>
          </div>
        </div>
      </div>

      {/* Previous Exports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          التصديرات السابقة - Previous Exports
        </h2>
        {exports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            لا توجد تصديرات سابقة - No previous exports
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الملف - Filename
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحجم - Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ - Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراء - Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exports.map((exportFile) => (
                  <tr key={exportFile.filename} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exportFile.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(exportFile.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(exportFile.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDownloadExport(exportFile.filename)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ⬇️ تنزيل - Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Info */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ℹ️ معلومات التصدير - Export Information
        </h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>يتم التصدير التلقائي يومياً في الساعة 2 صباحاً (توقيت السعودية)</li>
          <li>Automatic export runs daily at 2 AM (Saudi Arabia time)</li>
          <li>يحتوي الملف على 3 أوراق: الزوار، التحليلات، الجدول الزمني</li>
          <li>File contains 3 sheets: Visitors, Analytics, Timeline</li>
          <li>التنسيق متوافق مع المعايير السعودية (التاريخ، اللغة)</li>
          <li>Formatting complies with Saudi standards (dates, language)</li>
        </ul>
      </div>
    </div>
  );
};

export default VisitorExportPanel;
