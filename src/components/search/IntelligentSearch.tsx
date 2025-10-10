'use client';

import { useState } from 'react';
import { Search, Loader2, Filter, TrendingUp, Users, FileText } from 'lucide-react';

interface SearchResult {
  documentId: string;
  patientName?: string;
  patientId?: string;
  relevanceScore: number;
  matchedConditions: string[];
  matchedMedications: string[];
  snippet: string;
  highlights: string[];
  metadata: any;
  createdAt: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  executionTime: number;
  query: string;
  filters: any;
}

export default function IntelligentSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const performSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/intelligent-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          page,
          pageSize: 20,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/intelligent-search/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights || highlights.length === 0) return text;
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">البحث الذكي - Intelligent Medical Search</h1>
        <p className="text-gray-600">
          ابحث عن المرضى باستخدام اللغة الطبيعية بالعربية أو الإنجليزية
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true);
              if (suggestions.length === 0) loadSuggestions();
            }}
            placeholder='مثال: "مرضى السكري فوق 50 سنة في الرياض" أو "Cardiac patients with diabetes"'
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="auto"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 mb-1">عمليات بحث سابقة</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-right px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  dir="auto"
                >
                  <TrendingUp className="w-4 h-4 inline ml-2" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Example Queries */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-semibold mb-2">أمثلة على الاستعلامات:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'مرضى السكري فوق 50 سنة في الرياض',
            'Cardiac patients with diabetes in Jeddah',
            'Women under 40 with breast cancer history',
            'Patients allergic to penicillin',
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(example);
                performSearch(example);
              }}
              className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm hover:bg-blue-100"
              dir="auto"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {results && (
        <div>
          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">
                {results.total} نتيجة في {results.executionTime}ms
              </p>
              {results.filters && Object.keys(results.filters).length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-2">
                    {results.filters.conditions?.map((condition: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {condition}
                      </span>
                    ))}
                    {results.filters.medications?.map((med: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {med}
                      </span>
                    ))}
                    {results.filters.locations?.map((loc: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.results.map((result) => (
              <div
                key={result.documentId}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {result.patientName || 'مريض غير معروف'}
                      </h3>
                      {result.patientId && (
                        <span className="text-sm text-gray-500">#{result.patientId}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{result.metadata.fileName}</p>
                  </div>
                  <div className="text-right">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {(result.relevanceScore * 10).toFixed(1)}% تطابق
                    </div>
                  </div>
                </div>

                {/* Matched Conditions & Medications */}
                {(result.matchedConditions.length > 0 || result.matchedMedications.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.matchedConditions.map((condition, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        🏥 {condition}
                      </span>
                    ))}
                    {result.matchedMedications.map((med, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        💊 {med}
                      </span>
                    ))}
                  </div>
                )}

                {/* Snippet */}
                <p
                  className="text-sm text-gray-700 mb-2"
                  dir="auto"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(result.snippet, result.highlights),
                  }}
                />

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(result.createdAt).toLocaleDateString('ar-SA')}</span>
                  {result.metadata.gender && <span>الجنس: {result.metadata.gender}</span>}
                  {result.metadata.dateOfBirth && (
                    <span>
                      العمر: {new Date().getFullYear() - new Date(result.metadata.dateOfBirth).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => performSearch(query, currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                السابق
              </button>
              <span className="px-4 py-2">
                صفحة {currentPage} من {results.totalPages}
              </span>
              <button
                onClick={() => performSearch(query, currentPage + 1)}
                disabled={currentPage === results.totalPages}
                className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {results && results.results.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">لم يتم العثور على نتائج</p>
          <p className="text-gray-500 mt-2">جرب استخدام كلمات مفتاحية مختلفة</p>
        </div>
      )}
    </div>
  );
}
