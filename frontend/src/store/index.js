import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import baseReducer from './slices/baseSlice';
import equipmentReducer from './slices/equipmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    base: baseReducer,
    equipment: equipmentReducer,
  },
});

export default store; 