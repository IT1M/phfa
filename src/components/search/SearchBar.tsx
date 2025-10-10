'use client';

import { useState } from 'react';
import { Search, Mic, MicOff, Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setQuery, toggleVoice, addToHistory } from '@/store/slices/searchSlice';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function SearchBar({ onSearch, showFilters, onToggleFilters }: SearchBarProps) {
  const dispatch = useAppDispatch();
  const { query, isVoiceActive } = useAppSelector(state => state.search);
  const { locale } = useAppSelector(state => state.theme);
  const [localQuery, setLocalQuery] = useState(query);

  const translations = {
    en: {
      placeholder: 'Search medical documents, conditions, or keywords...',
      searchButton: 'Search',
      voiceSearch: 'Voice search',
      filters: 'Filters'
    },
    ar: {
      placeholder: 'ابحث عن المستندات الطبية أو الحالات أو الكلمات الرئيسية...',
      searchButton: 'بحث',
      voiceSearch: 'البحث الصوتي',
      filters: 'الفلاتر'
    }
  };

  const t = translations[locale];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      dispatch(setQuery(localQuery));
      dispatch(addToHistory(localQuery));
      storage.addSearchQuery(localQuery);
      onSearch?.(localQuery);
    }
  };

  const handleVoiceToggle = () => {
    dispatch(toggleVoice());
    // Voice recognition would be implemented here
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t.placeholder}
            className={cn(
              "w-full ps-12 pe-12 py-4 rounded-xl border-2 border-gray-200",
              "focus:border-saudi-green focus:ring-2 focus:ring-saudi-green/20",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
              "transition-all",
              locale === 'ar' && "font-arabic"
            )}
          />
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={cn(
              "absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              isVoiceActive && "text-red-500"
            )}
            aria-label={t.voiceSearch}
          >
            {isVoiceActive ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>

        {showFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            className="p-4 rounded-xl border-2 border-gray-200 hover:border-saudi-green dark:border-gray-700 transition-colors"
            aria-label={t.filters}
          >
            <Filter size={20} />
          </button>
        )}

        <button
          type="submit"
          className={cn(
            "px-6 py-4 bg-saudi-green text-white rounded-xl font-semibold",
            "hover:bg-saudi-green-dark transition-colors",
            locale === 'ar' && "font-arabic"
          )}
        >
          {t.searchButton}
        </button>
      </div>
    </form>
  );
}
