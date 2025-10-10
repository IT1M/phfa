import { GuestUser } from '@/types';
import { isSessionValid } from './utils';

const GUEST_SESSION_KEY = 'medical_archive_guest_session';
const SEARCH_HISTORY_KEY = 'medical_archive_search_history';

export const storage = {
  getGuestSession(): GuestUser | null {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem(GUEST_SESSION_KEY);
    if (!data) return null;
    
    const session: GuestUser = JSON.parse(data);
    if (!isSessionValid(session.expiresAt)) {
      this.clearGuestSession();
      return null;
    }
    
    return session;
  },

  setGuestSession(session: GuestUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  },

  clearGuestSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_SESSION_KEY);
  },

  getSearchHistory(): string[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  addSearchQuery(query: string): void {
    if (typeof window === 'undefined') return;
    const history = this.getSearchHistory();
    const updated = [query, ...history.filter(q => q !== query)].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  },

  clearSearchHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }
};
