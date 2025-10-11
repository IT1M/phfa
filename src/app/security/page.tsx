'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import Header from '@/components/common/Header';
import { useAppSelector } from '@/hooks';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const { locale } = useAppSelector(state => state.theme);
  const [securityScore, setSecurityScore] = useState(85);

  const translations = {
    en: {
      title: 'Security Dashboard',
      subtitle: 'Monitor your account security and privacy',
      securityScore: 'Security Score',
      recentActivity: 'Recent Activity',
      privacySettings: 'Privacy Settings',
      twoFactor: 'Two-Factor Authentication',
      encryption: 'End-to-End Encryption',
      auditLog: 'Audit Log',
      enabled: 'Enabled',
      disabled: 'Disabled',
      configure: 'Configure',
    },
    ar: {
      title: 'لوحة الأمان',
      subtitle: 'راقب أمان حسابك والخصوصية',
      securityScore: 'درجة الأمان',
      recentActivity: 'النشاط الأخير',
      privacySettings: 'إعدادات الخصوصية',
      twoFactor: 'المصادقة الثنائية',
      encryption: 'التشفير الشامل',
      auditLog: 'سجل التدقيق',
      enabled: 'مفعّل',
      disabled: 'معطّل',
      configure: 'تكوين',
    }
  };

  const t = translations[locale];

  const securityFeatures = [
    {
      icon: Lock,
      title: t.twoFactor,
      status: 'enabled',
      color: 'green',
    },
    {
      icon: Shield,
      title: t.encryption,
      status: 'enabled',
      color: 'green',
    },
    {
      icon: Eye,
      title: t.privacySettings,
      status: 'enabled',
      color: 'green',
    },
  ];

  const recentActivities = [
    { action: 'Document uploaded', time: '2 hours ago', status: 'success' },
    { action: 'Login from new device', time: '1 day ago', status: 'warning' },
    { action: 'Password changed', time: '3 days ago', status: 'success' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-8", locale === 'ar' && "font-arabic")}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t.securityScore}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your account is well protected
              </p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - securityScore / 100)}`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {securityScore}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <feature.icon className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  {t.enabled}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                {t.configure} →
              </button>
            </div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity size={24} />
            {t.recentActivity}
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {activity.status === 'success' ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <AlertTriangle className="text-yellow-500" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
