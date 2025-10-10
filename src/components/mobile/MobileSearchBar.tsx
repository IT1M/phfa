'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import VoiceSearchButton from './VoiceSearchButton';

interface MobileSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function MobileSearchBar({
  onSearch,
  placeholder = 'Search documents...',
}: MobileSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
      <VoiceSearchButton onTranscript={handleVoiceTranscript} />
    </form>
  );
}
