import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchFilters } from '@/types';

interface SearchState {
  query: string;
  filters: SearchFilters;
  history: string[];
  isVoiceActive: boolean;
}

const initialState: SearchState = {
  query: '',
  filters: {},
  history: [],
  isVoiceActive: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      state.history = [action.payload, ...state.history.filter(q => q !== action.payload)].slice(0, 10);
    },
    clearHistory: (state) => {
      state.history = [];
    },
    toggleVoice: (state) => {
      state.isVoiceActive = !state.isVoiceActive;
    },
  },
});

export const { setQuery, setFilters, addToHistory, clearHistory, toggleVoice } = searchSlice.actions;
export default searchSlice.reducer;
