import { createSlice } from '@reduxjs/toolkit';
import { api } from '../api';

const initialState = {
  equipment: [],
  selectedEquipment: null,
  filters: {
    baseId: null,
    category: null,
    status: null,
  },
  loading: false,
  error: null,
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setSelectedEquipment: (state, action) => {
      state.selectedEquipment = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearEquipmentState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get equipment
      .addMatcher(
        api.endpoints.getEquipment.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        api.endpoints.getEquipment.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.equipment = payload;
        }
      )
      .addMatcher(
        api.endpoints.getEquipment.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
        }
      )
      // Get equipment by ID
      .addMatcher(
        api.endpoints.getEquipmentById.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        api.endpoints.getEquipmentById.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.selectedEquipment = payload;
        }
      )
      .addMatcher(
        api.endpoints.getEquipmentById.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
        }
      );
  },
});

// Actions
export const {
  setSelectedEquipment,
  updateFilters,
  clearFilters,
  clearEquipmentState,
} = equipmentSlice.actions;

// Selectors
export const selectEquipment = (state) => state.equipment.equipment;
export const selectSelectedEquipment = (state) => state.equipment.selectedEquipment;
export const selectEquipmentFilters = (state) => state.equipment.filters;
export const selectEquipmentLoading = (state) => state.equipment.loading;
export const selectEquipmentError = (state) => state.equipment.error;

// Filtered equipment selector
export const selectFilteredEquipment = (state) => {
  const { equipment } = state.equipment;
  const { baseId, category, status } = state.equipment.filters;

  return equipment.filter((item) => {
    if (baseId && item.baseId !== baseId) return false;
    if (category && item.category !== category) return false;
    if (status && item.status !== status) return false;
    return true;
  });
};

export default equipmentSlice.reducer; 