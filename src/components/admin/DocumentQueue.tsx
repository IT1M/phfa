'use client';

import { FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueItem {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  upload_date: string;
  uploader_email?: string;
  wait_time?: number;
}

interface DocumentQueueProps {
  items: QueueItem[];
}

export default function DocumentQueue({ items }: DocumentQueueProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatWaitTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Queue</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {items.length} documents in queue
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No documents in queue
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.filename}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {item.uploader_email || 'Unknown'} • {new Date(item.upload_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Wait Time</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatWaitTime(item.wait_time)}
                    </p>
                  </div>
                  <span className={cn('px-3 py-1 text-xs rounded-full font-medium', getStatusColor(item.status))}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
