import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme, Locale } from '@/types';

interface ThemeState {
  theme: Theme;
  locale: Locale;
  isRTL: boolean;
}

const initialState: ThemeState = {
  theme: 'light',
  locale: 'en',
  isRTL: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', action.payload === 'dark');
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark');
      }
    },
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
      state.isRTL = action.payload === 'ar';
      if (typeof window !== 'undefined') {
        document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = action.payload;
      }
    },
  },
});

export const { setTheme, toggleTheme, setLocale } = themeSlice.actions;
export default themeSlice.reducer;
