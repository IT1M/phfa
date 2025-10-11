'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setGuestUser } from '@/store/slices/guestSlice';
import { validateEmail, generateSessionId, getSessionExpiry } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface GuestModalProps {
  onClose: () => void;
}

export default function GuestModal({ onClose }: GuestModalProps) {
  const dispatch = useAppDispatch();
  const { locale } = useAppSelector(state => state.theme);
  
  const [email, setEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: 'Access Medical Archive',
      subtitle: 'Enter your email to continue as a guest',
      emailPlaceholder: 'your.email@example.com',
      privacyText: 'I accept the privacy policy and terms of service',
      continueButton: 'Continue as Guest',
      invalidEmail: 'Please enter a valid email address',
      privacyRequired: 'You must accept the privacy policy',
    },
    ar: {
      title: 'الوصول إلى الأرشيف الطبي',
      subtitle: 'أدخل بريدك الإلكتروني للمتابعة كضيف',
      emailPlaceholder: 'your.email@example.com',
      privacyText: 'أوافق على سياسة الخصوصية وشروط الخدمة',
      continueButton: 'المتابعة كضيف',
      invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح',
      privacyRequired: 'يجب عليك قبول سياسة الخصوصية',
    }
  };

  const t = translations[locale];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    if (!privacyAccepted) {
      setError(t.privacyRequired);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const guestUser = {
        email,
        sessionId: generateSessionId(),
        createdAt: new Date().toISOString(),
        expiresAt: getSessionExpiry(30),
        privacyAccepted: true,
      };

      dispatch(setGuestUser(guestUser));
      onClose();
      setIsSubmitting(false);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cn(
          "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative",
          locale === 'ar' && "font-arabic"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X size={24} />
        </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-saudi-green" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={cn(
                      "w-full ps-11 pe-4 py-3 border rounded-lg",
                      "focus:ring-2 focus:ring-saudi-green focus:border-transparent",
                      "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                      error && "border-red-500"
                    )}
                    dir="ltr"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-saudi-green rounded focus:ring-saudi-green"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.privacyText}
                </span>
              </label>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 bg-saudi-green text-white rounded-lg font-semibold",
                  "hover:bg-saudi-green-dark transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? '...' : t.continueButton}
              </button>
            </form>
          </motion.div>
        </motion.div>
  );
}
