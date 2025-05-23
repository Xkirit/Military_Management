import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bases: [],
  currentBase: null,
  loading: false,
  error: null
};

const baseSlice = createSlice({
  name: 'base',
  initialState,
  reducers: {
    setCurrentBase: (state, action) => {
      state.currentBase = action.payload;
    },
    setBases: (state, action) => {
      state.bases = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearBaseState: (state) => {
      state.bases = [];
      state.currentBase = null;
      state.loading = false;
      state.error = null;
    }
  }
});

// Actions
export const { 
  setCurrentBase, 
  setBases, 
  setLoading, 
  setError, 
  clearBaseState 
} = baseSlice.actions;

// Selectors
export const selectBases = (state) => state.base.bases;
export const selectCurrentBase = (state) => state.base.currentBase;
export const selectBaseLoading = (state) => state.base.loading;
export const selectBaseError = (state) => state.base.error;

export default baseSlice.reducer; 