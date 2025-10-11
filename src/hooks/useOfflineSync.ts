import { useState, useEffect } from 'react';
import { offlineStorage } from '@/lib/offline-storage';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncPendingData();
    }
  }, [isOnline]);

  const syncPendingData = async () => {
    try {
      await offlineStorage.init();
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - Background Sync API
        await registration.sync.register('sync-documents');
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return {
    isOnline,
    pendingCount,
    syncPendingData,
  };
}
