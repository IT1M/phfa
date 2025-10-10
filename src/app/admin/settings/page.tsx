'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SettingsPanel from '@/components/admin/SettingsPanel';
import type { Setting } from '@/types/admin';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      // Transform backend data to frontend format
      const transformed = data.map((item: any) => ({
        key: item.key,
        value: item.value,
        label: formatLabel(item.key),
        type: getInputType(item.key),
        category: getCategory(item.key)
      }));
      
      setSettings(transformed);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInputType = (key: string) => {
    if (key.includes('password') || key.includes('secret') || key.includes('key')) {
      return 'password';
    }
    if (key.includes('port') || key.includes('limit') || key.includes('timeout')) {
      return 'number';
    }
    if (key.includes('enable') || key.includes('enabled')) {
      return 'boolean';
    }
    return 'text';
  };

  const getCategory = (key: string): 'api' | 'email' | 'security' => {
    if (key.includes('gemini') || key.includes('api')) {
      return 'api';
    }
    if (key.includes('smtp') || key.includes('email')) {
      return 'email';
    }
    return 'security';
  };

  const handleSave = async (key: string, value: string) => {
    try {
      await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      
      // Update local state
      setSettings(prev =>
        prev.map(s => s.key === key ? { ...s, value } : s)
      );
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure API keys, email, and security settings
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Warning:</strong> Changes to these settings will affect system behavior immediately. 
            Make sure you understand the impact before saving.
          </p>
        </div>

        <SettingsPanel settings={settings} onSave={handleSave} />

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left">
              <p className="font-medium">Test Email Configuration</p>
              <p className="text-sm opacity-90 mt-1">Send a test email to verify SMTP settings</p>
            </button>
            <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-left">
              <p className="font-medium">Test Gemini API</p>
              <p className="text-sm opacity-90 mt-1">Verify Gemini API key is working</p>
            </button>
            <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-left">
              <p className="font-medium">Clear Cache</p>
              <p className="text-sm opacity-90 mt-1">Clear system cache and temporary files</p>
            </button>
            <button className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-left">
              <p className="font-medium">Reset to Defaults</p>
              <p className="text-sm opacity-90 mt-1">Restore all settings to default values</p>
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Node Version</p>
              <p className="font-medium text-gray-900 dark:text-white">{process.version}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Environment</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {process.env.NODE_ENV || 'development'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Platform</p>
              <p className="font-medium text-gray-900 dark:text-white">{process.platform}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Uptime</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {Math.floor(process.uptime() / 3600)}h {Math.floor((process.uptime() % 3600) / 60)}m
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
