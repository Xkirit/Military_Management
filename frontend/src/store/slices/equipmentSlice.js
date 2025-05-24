import { createSlice } from '@reduxjs/toolkit';

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
    setEquipment: (state, action) => {
      state.equipment = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedEquipment: (state, action) => {
      state.selectedEquipment = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
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
});

// Actions
export const {
  setEquipment,
  setSelectedEquipment,
  setLoading,
  setError,
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