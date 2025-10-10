'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { MedicalDocument } from '@/types';
import { useAppSelector } from '@/hooks';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface DocumentCardProps {
  document: MedicalDocument;
  onClick?: () => void;
}

export default function DocumentCard({ document, onClick }: DocumentCardProps) {
  const { locale } = useAppSelector(state => state.theme);

  const typeColors = {
    report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    scan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    prescription: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'lab-result': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl",
        "border border-gray-200 dark:border-gray-700 transition-all cursor-pointer",
        locale === 'ar' && "font-arabic"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-saudi-green/10 rounded-lg flex items-center justify-center">
            <FileText className="text-saudi-green" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {document.title}
            </h3>
            <span className={cn("text-xs px-2 py-1 rounded-full", typeColors[document.type])}>
              {document.type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Calendar size={16} />
        <span>{formatDate(document.uploadDate, locale)}</span>
      </div>

      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-saudi-green hover:bg-saudi-green/10 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // View action
          }}
        >
          <Eye size={16} />
          {locale === 'en' ? 'View' : 'عرض'}
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Download action
          }}
        >
          <Download size={16} />
          {locale === 'en' ? 'Download' : 'تحميل'}
        </button>
      </div>
    </motion.div>
  );
}
