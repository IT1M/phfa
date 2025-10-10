import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-6">
          Some features may be limited while offline.
          <br />
          Your changes will sync when you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[44px]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
