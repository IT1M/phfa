import { configureStore } from '@reduxjs/toolkit';
import guestReducer from './slices/guestSlice';
import themeReducer from './slices/themeSlice';
import searchReducer from './slices/searchSlice';
import documentsReducer from './slices/documentsSlice';
import integrationReducer from './slices/integrationSlice';

export const store = configureStore({
  reducer: {
    guest: guestReducer,
    theme: themeReducer,
    search: searchReducer,
    documents: documentsReducer,
    integration: integrationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
