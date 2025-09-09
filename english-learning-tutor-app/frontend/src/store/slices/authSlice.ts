import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  city: string;
  userType: 'learner' | 'native_tutor' | 'admin';
  subscriptionTier: 'free' | 'premium' | 'pro';
  languageLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Register actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
      state.isLoading = false;
      state.error = null;
    },
    
    // Token refresh
    refreshTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
    },
    
    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshTokens,
  updateUser,
  clearError,
  setLoading,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthTokens = (state: { auth: AuthState }) => state.auth.tokens;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;