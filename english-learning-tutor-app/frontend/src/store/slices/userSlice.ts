import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UserPoints {
  total: number;
  level: number;
  streak: number;
}

export interface UserProfile {
  learningGoals: string[];
  targetFluencyLevel: 'conversational' | 'business' | 'native_like';
  profileImageUrl?: string;
  district?: string;
}

export interface UserStats {
  totalSessionsCompleted: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategories: string[];
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface UserState {
  profile: UserProfile | null;
  points: UserPoints | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

// Initial state
const initialState: UserState = {
  profile: null,
  points: null,
  stats: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Load user data
    loadUserDataStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadUserDataSuccess: (state, action: PayloadAction<{
      profile: UserProfile;
      points: UserPoints;
      stats: UserStats;
    }>) => {
      state.profile = action.payload.profile;
      state.points = action.payload.points;
      state.stats = action.payload.stats;
      state.isLoading = false;
      state.error = null;
      state.lastSyncTime = new Date().toISOString();
    },
    loadUserDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Update profile
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    
    // Update points
    updatePoints: (state, action: PayloadAction<UserPoints>) => {
      state.points = action.payload;
    },
    
    // Add points (for immediate UI feedback)
    addPoints: (state, action: PayloadAction<number>) => {
      if (state.points) {
        state.points.total += action.payload;
      }
    },
    
    // Update streak
    updateStreak: (state, action: PayloadAction<number>) => {
      if (state.points) {
        state.points.streak = action.payload;
      }
      if (state.stats) {
        state.stats.currentStreak = action.payload;
        if (action.payload > state.stats.longestStreak) {
          state.stats.longestStreak = action.payload;
        }
      }
    },
    
    // Update level
    updateLevel: (state, action: PayloadAction<number>) => {
      if (state.points) {
        state.points.level = action.payload;
      }
    },
    
    // Update stats
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    
    // Increment session count (for immediate UI feedback)
    incrementSessionCount: (state) => {
      if (state.stats) {
        state.stats.totalSessionsCompleted += 1;
      }
    },
    
    // Update average score
    updateAverageScore: (state, action: PayloadAction<number>) => {
      if (state.stats) {
        // Simple rolling average calculation
        const currentTotal = state.stats.averageScore * (state.stats.totalSessionsCompleted - 1);
        const newAverage = (currentTotal + action.payload) / state.stats.totalSessionsCompleted;
        state.stats.averageScore = Math.round(newAverage * 100) / 100; // Round to 2 decimal places
      }
    },
    
    // Update progress (weekly/monthly)
    updateProgress: (state, action: PayloadAction<{ weekly: number; monthly: number }>) => {
      if (state.stats) {
        state.stats.weeklyProgress = action.payload.weekly;
        state.stats.monthlyProgress = action.payload.monthly;
      }
    },
    
    // Clear user data (on logout)
    clearUserData: (state) => {
      state.profile = null;
      state.points = null;
      state.stats = null;
      state.isLoading = false;
      state.error = null;
      state.lastSyncTime = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// Export actions
export const {
  loadUserDataStart,
  loadUserDataSuccess,
  loadUserDataFailure,
  updateProfile,
  updatePoints,
  addPoints,
  updateStreak,
  updateLevel,
  updateStats,
  incrementSessionCount,
  updateAverageScore,
  updateProgress,
  clearUserData,
  clearError,
  setLoading,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;

// Selectors
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectUserPoints = (state: { user: UserState }) => state.user.points;
export const selectUserStats = (state: { user: UserState }) => state.user.stats;
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectLastSyncTime = (state: { user: UserState }) => state.user.lastSyncTime;