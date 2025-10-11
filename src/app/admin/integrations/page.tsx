'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface IntegrationStatus {
  name: string;
  enabled: boolean;
  connected: boolean;
  lastSync?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    { name: 'MOH', enabled: false, connected: false },
    { name: 'HIS', enabled: false, connected: false },
    { name: 'LIS', enabled: false, connected: false },
    { name: 'Pharmacy', enabled: false, connected: false },
  ]);
  const [loading, setLoading] = useState(false);

  const testConnection = async (name: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(int =>
          int.name === name
            ? { ...int, connected: true, lastSync: new Date().toISOString() }
            : int
        )
      );
      setLoading(false);
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            External Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage connections to external healthcare systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {integration.name}
                </h3>
                {integration.connected ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <XCircle className="text-gray-400" size={24} />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      integration.connected
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {integration.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {integration.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Sync
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(integration.lastSync).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => testConnection(integration.name)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Test Connection
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
