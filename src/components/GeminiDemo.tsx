'use client';

import { useState } from 'react';
import { geminiClient, MedicalEntities, SearchQuery, DocumentSummary } from '@/lib/gemini-client';

export default function GeminiDemo() {
  const [activeTab, setActiveTab] = useState<'extract' | 'search' | 'summarize' | 'translate'>('extract');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtractEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const entities = await geminiClient.extractEntities(inputText);
      setResult(entities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract entities');
    } finally {
      setLoading(false);
    }
  };

  const handleParseQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = await geminiClient.parseQuery(inputText);
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse query');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await geminiClient.summarize(inputText);
      setResult(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (targetLang: 'ar' | 'en') => {
    setLoading(true);
    setError(null);
    try {
      const translation = await geminiClient.translate(inputText, targetLang);
      setResult(translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to translate');
    } finally {
      setLoading(false);
    }
  };

  const exampleTexts = {
    extract: 'المريض أحمد محمد، 45 سنة، ذكر. التشخيص: السكري من النوع الثاني. الأدوية: ميتفورمين 500mg مرتين يومياً',
    search: 'مرضى السكري في الرياض بين 40-60 سنة خلال الشهر الماضي',
    summarize: 'Patient presents with chest pain and shortness of breath. ECG shows ST elevation. Troponin elevated. Diagnosed with acute MI. Started on aspirin, clopidogrel, and heparin.',
    translate: 'Patient has type 2 diabetes and hypertension'
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gemini AI Medical Processing Demo</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('extract')}
          className={`px-4 py-2 ${activeTab === 'extract' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
        >
          Extract Entities
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 ${activeTab === 'search' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
        >
          Parse Search
        </button>
        <button
          onClick={() => setActiveTab('summarize')}
          className={`px-4 py-2 ${activeTab === 'summarize' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
        >
          Summarize
        </button>
        <button
          onClick={() => setActiveTab('translate')}
          className={`px-4 py-2 ${activeTab === 'translate' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
        >
          Translate
        </button>
      </div>

      {/* Input Area */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block font-semibold">Input Text</label>
          <button
            onClick={() => setInputText(exampleTexts[activeTab])}
            className="text-sm text-blue-600 hover:underline"
          >
            Load Example
          </button>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg"
          placeholder="Enter medical text here..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {activeTab === 'extract' && (
          <button
            onClick={handleExtractEntities}
            disabled={loading || !inputText}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Extract Entities'}
          </button>
        )}
        {activeTab === 'search' && (
          <button
            onClick={handleParseQuery}
            disabled={loading || !inputText}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Parse Query'}
          </button>
        )}
        {activeTab === 'summarize' && (
          <button
            onClick={handleSummarize}
            disabled={loading || !inputText}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Summarize'}
          </button>
        )}
        {activeTab === 'translate' && (
          <>
            <button
              onClick={() => handleTranslate('ar')}
              disabled={loading || !inputText}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Translate to Arabic'}
            </button>
            <button
              onClick={() => handleTranslate('en')}
              disabled={loading || !inputText}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Translate to English'}
            </button>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <pre className="bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
