'use client';

import { useState } from 'react';
import { Save, Key, Mail, Shield } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean';
  category: 'api' | 'email' | 'security';
}

interface SettingsPanelProps {
  settings: Setting[];
  onSave: (key: string, value: string) => Promise<void>;
}

export default function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await onSave(key, editedSettings[key] || settings.find(s => s.key === key)?.value || '');
      setEditedSettings(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } finally {
      setSaving(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api':
        return <Key className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const categories = Array.from(new Set(settings.map(s => s.category)));

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            {getCategoryIcon(category)}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {category} Settings
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {settings.filter(s => s.category === category).map(setting => {
              const currentValue = editedSettings[setting.key] ?? setting.value;
              const hasChanges = editedSettings[setting.key] !== undefined;

              return (
                <div key={setting.key} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {setting.label}
                    </label>
                    {setting.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={currentValue === 'true'}
                        onChange={(e) => handleChange(setting.key, e.target.checked ? 'true' : 'false')}
                        className="rounded"
                      />
                    ) : (
                      <input
                        type={setting.type}
                        value={currentValue}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                  
                  {hasChanges && (
                    <button
                      onClick={() => handleSave(setting.key)}
                      disabled={saving === setting.key}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving === setting.key ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
