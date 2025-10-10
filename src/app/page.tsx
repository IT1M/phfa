'use client';

import { useEffect } from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import OnlineStatusBanner from '@/components/mobile/OnlineStatusBanner';
import { registerServiceWorker } from '@/lib/pwa';

export default function HomePage() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <>
      <OnlineStatusBanner />
      <MobileNavigation />
      <main className="min-h-screen bg-gray-50 p-4 md:ml-64">
        <div className="max-w-7xl mx-auto pt-16 md:pt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Medical Archive System
          </h1>
          <p className="text-gray-600">
            Mobile-responsive medical document management with offline capabilities.
          </p>
        </div>
      </main>
    </>
  );
}
