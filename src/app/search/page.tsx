'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Download, SlidersHorizontal } from 'lucide-react';
import { useAppSelector } from '@/hooks';
import Header from '@/components/common/Header';
import SearchBar from '@/components/search/SearchBar';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { locale } = useAppSelector(state => state.theme);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const query = searchParams.get('q') || '';

  const translations = {
    en: {
      results: 'Search Results',
      filters: 'Filters',
      documentType: 'Document Type',
      dateRange: 'Date Range',
      export: 'Export Results',
      noResults: 'No documents found. Try adjusting your search or filters.',
      types: {
        report: 'Medical Report',
        scan: 'Scan/Imaging',
        prescription: 'Prescription',
        'lab-result': 'Lab Result',
        other: 'Other'
      }
    },
    ar: {
      results: 'نتائج البحث',
      filters: 'الفلاتر',
      documentType: 'نوع المستند',
      dateRange: 'نطاق التاريخ',
      export: 'تصدير النتائج',
      noResults: 'لم يتم العثور على مستندات. حاول تعديل البحث أو الفلاتر.',
      types: {
        report: 'تقرير طبي',
        scan: 'فحص/تصوير',
        prescription: 'وصفة طبية',
        'lab-result': 'نتيجة مختبر',
        other: 'أخرى'
      }
    }
  };

  const t = translations[locale];

  // Mock search results
  const mockResults = [
    {
      id: '1',
      title: 'Blood Test Results',
      type: 'lab-result' as const,
      uploadDate: '2025-01-08',
      fileUrl: '/docs/blood-test.pdf',
      tags: ['blood', 'lab', 'routine'],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SearchBar
            onSearch={() => {}}
            showFilters
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "lg:w-64 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg h-fit",
                locale === 'ar' && "font-arabic"
              )}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal size={20} />
                {t.filters}
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">{t.documentType}</h4>
                  <div className="space-y-2">
                    {Object.entries(t.types).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, key]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== key));
                            }
                          }}
                          className="w-4 h-4 text-saudi-green rounded focus:ring-saudi-green"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">{t.dateRange}</h4>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </motion.aside>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className={cn(
              "flex items-center justify-between mb-6",
              locale === 'ar' && "font-arabic"
            )}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.results} {query && `"${query}"`}
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download size={20} />
                {t.export}
              </button>
            </div>

            {mockResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockResults.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noResults}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
