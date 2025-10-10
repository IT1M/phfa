import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MedicalDocument } from '@/types';

interface DocumentsState {
  documents: MedicalDocument[];
  selectedDocument: MedicalDocument | null;
  isLoading: boolean;
}

const initialState: DocumentsState = {
  documents: [],
  selectedDocument: null,
  isLoading: false,
};

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<MedicalDocument[]>) => {
      state.documents = action.payload;
    },
    addDocument: (state, action: PayloadAction<MedicalDocument>) => {
      state.documents.unshift(action.payload);
    },
    selectDocument: (state, action: PayloadAction<MedicalDocument>) => {
      state.selectedDocument = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setDocuments, addDocument, selectDocument, setLoading } = documentsSlice.actions;
export default documentsSlice.reducer;
