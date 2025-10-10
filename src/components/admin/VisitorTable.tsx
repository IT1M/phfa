'use client';

import { useState } from 'react';
import { Download, Mail, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Visitor {
  id: string;
  email: string;
  registration_date: string;
  last_activity: string;
  activity_count: number;
  is_active: boolean;
  metadata: any;
}

interface VisitorTableProps {
  visitors: Visitor[];
  onExport: (ids: string[]) => void;
  onBulkEmail: (ids: string[]) => void;
}

export default function VisitorTable({ visitors, onExport, onBulkEmail }: VisitorTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'email' | 'registration_date' | 'activity_count'>('registration_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === visitors.length ? [] : visitors.map(v => v.id));
  };

  const filteredVisitors = visitors.filter(v =>
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => onExport(selectedIds)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Export ({selectedIds.length})
              </button>
              <button
                onClick={() => onBulkEmail(selectedIds)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Mail className="w-4 h-4" />
                Email ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === visitors.length}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Registration
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Activity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Activity Count
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredVisitors.map((visitor) => (
              <tr key={visitor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(visitor.id)}
                    onChange={() => toggleSelection(visitor.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {visitor.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(visitor.registration_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(visitor.last_activity).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {visitor.activity_count}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    visitor.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {visitor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
