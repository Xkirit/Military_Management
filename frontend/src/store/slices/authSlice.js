import { createSlice } from '@reduxjs/toolkit';
import { api } from '../api';

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    return {
      token,
      user,
      isAuthenticated: !!(token && user),
    };
  } catch {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

const initialState = {
  ...loadPersistedState(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addMatcher(
        api.endpoints.login.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        api.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = payload.user;
          state.token = payload.token;
          localStorage.setItem('token', payload.token);
          localStorage.setItem('user', JSON.stringify(payload.user));
        }
      )
      .addMatcher(
        api.endpoints.login.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      )
      // Register
      .addMatcher(
        api.endpoints.register.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        api.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = payload.user;
          state.token = payload.token;
          localStorage.setItem('token', payload.token);
          localStorage.setItem('user', JSON.stringify(payload.user));
        }
      )
      .addMatcher(
        api.endpoints.register.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message;
        }
      );
  },
});

// Actions
export const { clearError, logout, updateUserProfile } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserBase = (state) => state.auth.user?.assignedBase;

export default authSlice.reducer; 