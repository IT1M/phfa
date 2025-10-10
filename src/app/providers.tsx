'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { loadGuestSession } from '@/store/slices/guestSlice';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(loadGuestSession());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
