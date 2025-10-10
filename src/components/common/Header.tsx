'use client';

import { Moon, Sun, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { toggleTheme, setLocale } from '@/store/slices/themeSlice';
import { cn } from '@/lib/utils';

export default function Header() {
  const dispatch = useAppDispatch();
  const { theme, locale } = useAppSelector(state => state.theme);
  const { user } = useAppSelector(state => state.guest);

  const toggleLanguage = () => {
    dispatch(setLocale(locale === 'en' ? 'ar' : 'en'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-saudi-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className={cn(
            "text-xl font-bold text-gray-900 dark:text-white",
            locale === 'ar' && "font-arabic"
          )}>
            {locale === 'en' ? 'Medical Archive' : 'الأرشيف الطبي'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {user.email}
            </span>
          )}
          
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle language"
          >
            <Globe size={20} />
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
