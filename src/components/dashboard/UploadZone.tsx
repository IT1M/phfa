'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/hooks';
import { cn } from '@/lib/utils';

export default function UploadZone() {
  const { locale } = useAppSelector(state => state.theme);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const translations = {
    en: {
      title: 'Upload Medical Documents',
      subtitle: 'Drag and drop files here or click to browse',
      supported: 'Supported: PDF, JPG, PNG (Max 10MB)',
      uploading: 'Uploading...',
      remove: 'Remove'
    },
    ar: {
      title: 'تحميل المستندات الطبية',
      subtitle: 'اسحب وأفلت الملفات هنا أو انقر للتصفح',
      supported: 'المدعوم: PDF, JPG, PNG (حد أقصى 10 ميجابايت)',
      uploading: 'جاري التحميل...',
      remove: 'إزالة'
    }
  };

  const t = translations[locale];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-4", locale === 'ar' && "font-arabic")}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all",
          isDragging
            ? "border-saudi-green bg-saudi-green/5"
            : "border-gray-300 dark:border-gray-700 hover:border-saudi-green"
        )}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          {t.subtitle}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {t.supported}
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-saudi-green" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={t.remove}
                >
                  <X size={20} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
