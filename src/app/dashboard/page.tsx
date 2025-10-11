'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Brain, Shield, FileText, Upload, TrendingUp } from 'lucide-react';
import { useAppSelector } from '@/hooks';
import Header from '@/components/common/Header';
import SearchBar from '@/components/search/SearchBar';
import UploadZone from '@/components/dashboard/UploadZone';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppSelector(state => state.guest);
  const { locale } = useAppSelector(state => state.theme);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const translations = {
    en: {
      welcome: 'Welcome to Your Dashboard',
      recentDocs: 'Recent Documents',
      noDocuments: 'No documents yet. Upload your first medical document to get started.',
      quickActions: 'Quick Actions',
      features: {
        search: {
          title: 'Document Search',
          description: 'Search through your medical documents',
        },
        intelligentSearch: {
          title: 'AI-Powered Search',
          description: 'Advanced search with AI assistance',
        },
        security: {
          title: 'Security Dashboard',
          description: 'Monitor security and privacy',
        },
        admin: {
          title: 'Admin Panel',
          description: 'Manage system and users',
        },
      },
      takeAction: 'Go',
    },
    ar: {
      welcome: 'مرحباً بك في لوحة التحكم',
      recentDocs: 'المستندات الأخيرة',
      noDocuments: 'لا توجد مستندات بعد. قم بتحميل أول مستند طبي للبدء.',
      quickActions: 'الإجراءات السريعة',
      features: {
        search: {
          title: 'البحث في المستندات',
          description: 'ابحث في مستنداتك الطبية',
        },
        intelligentSearch: {
          title: 'البحث الذكي',
          description: 'بحث متقدم بمساعدة الذكاء الاصطناعي',
        },
        security: {
          title: 'لوحة الأمان',
          description: 'راقب الأمان والخصوصية',
        },
        admin: {
          title: 'لوحة الإدارة',
          description: 'إدارة النظام والمستخدمين',
        },
      },
      takeAction: 'انتقل',
    }
  };

  const t = translations[locale];

  // Quick action cards
  const quickActions = [
    {
      icon: Search,
      title: t.features.search.title,
      description: t.features.search.description,
      color: 'blue',
      path: '/search',
    },
    {
      icon: Brain,
      title: t.features.intelligentSearch.title,
      description: t.features.intelligentSearch.description,
      color: 'purple',
      path: '/intelligent-search',
    },
    {
      icon: Shield,
      title: t.features.security.title,
      description: t.features.security.description,
      color: 'green',
      path: '/security',
    },
    {
      icon: TrendingUp,
      title: t.features.admin.title,
      description: t.features.admin.description,
      color: 'orange',
      path: '/admin',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };

  // Mock documents
  const mockDocuments = [
    {
      id: '1',
      title: 'Blood Test Results',
      type: 'lab-result' as const,
      uploadDate: '2025-01-08',
      fileUrl: '/docs/blood-test.pdf',
      tags: ['blood', 'lab', 'routine'],
    },
    {
      id: '2',
      title: 'X-Ray Scan',
      type: 'scan' as const,
      uploadDate: '2025-01-05',
      fileUrl: '/docs/xray.pdf',
      tags: ['x-ray', 'chest', 'imaging'],
    },
  ];

  if (!user) return null;

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
            {t.welcome}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchBar onSearch={(query) => router.push(`/search?q=${query}`)} />
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className={cn(
            "text-2xl font-bold text-gray-900 dark:text-white mb-6",
            locale === 'ar' && "font-arabic"
          )}>
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer group"
                onClick={() => router.push(action.path)}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  colorClasses[action.color as keyof typeof colorClasses]
                )}>
                  <action.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {action.description}
                </p>
                <button className={cn(
                  "w-full py-2 rounded-lg font-medium transition-colors",
                  "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white",
                  "group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                )}>
                  {t.takeAction} →
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <UploadZone />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={cn(
            "text-2xl font-bold text-gray-900 dark:text-white mb-6",
            locale === 'ar' && "font-arabic"
          )}>
            {t.recentDocs}
          </h2>
          
          {mockDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => router.push(`/document/${doc.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t.noDocuments}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
