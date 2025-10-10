import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GuestUser } from '@/types';
import { storage } from '@/lib/storage';

interface GuestState {
  user: GuestUser | null;
  isModalOpen: boolean;
}

const initialState: GuestState = {
  user: null,
  isModalOpen: false,
};

const guestSlice = createSlice({
  name: 'guest',
  initialState,
  reducers: {
    setGuestUser: (state, action: PayloadAction<GuestUser>) => {
      state.user = action.payload;
      storage.setGuestSession(action.payload);
    },
    clearGuestUser: (state) => {
      state.user = null;
      storage.clearGuestSession();
    },
    openGuestModal: (state) => {
      state.isModalOpen = true;
    },
    closeGuestModal: (state) => {
      state.isModalOpen = false;
    },
    loadGuestSession: (state) => {
      const session = storage.getGuestSession();
      if (session) {
        state.user = session;
      }
    },
  },
});

export const { setGuestUser, clearGuestUser, openGuestModal, closeGuestModal, loadGuestSession } = guestSlice.actions;
export default guestSlice.reducer;
