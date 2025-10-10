'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, Wifi } from 'lucide-react';

export default function OnlineStatusBanner() {
  const { isOnline, pendingCount } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-sm font-medium ${
        isOnline ? 'bg-green-600' : 'bg-orange-600'
      } text-white`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online - Syncing {pendingCount} items...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline mode - Changes will sync when online</span>
          </>
        )}
      </div>
    </div>
  );
}
