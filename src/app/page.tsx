'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Shield, Brain, TrendingUp, Upload, Search } from 'lucide-react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import OnlineStatusBanner from '@/components/mobile/OnlineStatusBanner';
import GuestModal from '@/components/guest/GuestModal';
import { registerServiceWorker } from '@/lib/pwa';
import { useAppSelector } from '@/hooks';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAppSelector(state => state.guest);
  const { locale } = useAppSelector(state => state.theme);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    
    // Redirect to dashboard if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const translations = {
    en: {
      title: 'Medical Archive System',
      subtitle: 'Secure, intelligent medical document management',
      getStarted: 'Get Started',
      features: {
        secure: 'Secure Storage',
        secureDesc: 'End-to-end encryption for your medical documents',
        ai: 'AI-Powered Search',
        aiDesc: 'Find documents instantly with intelligent search',
        offline: 'Offline Access',
        offlineDesc: 'Access your documents anytime, anywhere',
        compliant: 'HIPAA Compliant',
        compliantDesc: 'Meets healthcare data security standards',
      }
    },
    ar: {
      title: 'نظام الأرشيف الطبي',
      subtitle: 'إدارة آمنة وذكية للمستندات الطبية',
      getStarted: 'ابدأ الآن',
      features: {
        secure: 'تخزين آمن',
        secureDesc: 'تشفير شامل لمستنداتك الطبية',
        ai: 'بحث ذكي',
        aiDesc: 'ابحث عن المستندات فوراً بالبحث الذكي',
        offline: 'وصول بدون إنترنت',
        offlineDesc: 'الوصول لمستنداتك في أي وقت ومكان',
        compliant: 'متوافق مع HIPAA',
        compliantDesc: 'يلبي معايير أمان البيانات الصحية',
      }
    }
  };

  const t = translations[locale];

  const features = [
    { icon: Shield, title: t.features.secure, description: t.features.secureDesc, color: 'blue' },
    { icon: Brain, title: t.features.ai, description: t.features.aiDesc, color: 'purple' },
    { icon: FileText, title: t.features.offline, description: t.features.offlineDesc, color: 'green' },
    { icon: TrendingUp, title: t.features.compliant, description: t.features.compliantDesc, color: 'orange' },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };

  return (
    <>
      <OnlineStatusBanner />
      <MobileNavigation />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-center mb-16", locale === 'ar' && "font-arabic")}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            <button
              onClick={() => setShowGuestModal(true)}
              className="px-8 py-4 bg-saudi-green hover:bg-saudi-green/90 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              {t.getStarted} →
            </button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  colorClasses[feature.color as keyof typeof colorClasses]
                )}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {showGuestModal && <GuestModal onClose={() => setShowGuestModal(false)} />}
    </>
  );
}
