'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    },
    ar: {
      welcome: 'مرحباً بك في لوحة التحكم',
      recentDocs: 'المستندات الأخيرة',
      noDocuments: 'لا توجد مستندات بعد. قم بتحميل أول مستند طبي للبدء.',
    }
  };

  const t = translations[locale];

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
    <div className="min-h-screen">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <UploadZone />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
