import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface PointTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  source: 'daily_practice' | 'perfect_score' | 'streak_bonus' | 'tutor_session' | 'challenge_complete' | 'referral' | 'premium_purchase' | 'admin_adjustment';
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface Achievement {
  id: string;
  name: string;
  category: string;
  title: string;
  description: string;
  pointsReward: number;
  iconUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isCompleted: boolean;
  completedAt?: string;
  progress?: any;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  expiresAt: string;
  isCompleted: boolean;
}

export interface PointsState {
  // Current points status
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  
  // Transactions
  recentTransactions: PointTransaction[];
  
  // Achievements
  achievements: Achievement[];
  recentAchievements: Achievement[];
  
  // Daily challenges
  dailyChallenges: DailyChallenge[];
  
  // Leaderboard (Daegu focus for Phase 1)
  daeguRank: number | null;
  daeguTotalUsers: number | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showPointAnimation: boolean;
  pendingPointsToAdd: number;
}

// Initial state
const initialState: PointsState = {
  totalPoints: 0,
  availablePoints: 0,
  usedPoints: 0,
  currentLevel: 1,
  pointsToNextLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  recentTransactions: [],
  achievements: [],
  recentAchievements: [],
  dailyChallenges: [],
  daeguRank: null,
  daeguTotalUsers: null,
  isLoading: false,
  error: null,
  showPointAnimation: false,
  pendingPointsToAdd: 0,
};

// Points slice
const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    // Load points data
    loadPointsDataStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadPointsDataSuccess: (state, action: PayloadAction<{
      totalPoints: number;
      availablePoints: number;
      usedPoints: number;
      currentLevel: number;
      pointsToNextLevel: number;
      currentStreak: number;
      longestStreak: number;
      recentTransactions: PointTransaction[];
      achievements: Achievement[];
      dailyChallenges: DailyChallenge[];
      daeguRank?: number;
      daeguTotalUsers?: number;
    }>) => {
      const data = action.payload;
      state.totalPoints = data.totalPoints;
      state.availablePoints = data.availablePoints;
      state.usedPoints = data.usedPoints;
      state.currentLevel = data.currentLevel;
      state.pointsToNextLevel = data.pointsToNextLevel;
      state.currentStreak = data.currentStreak;
      state.longestStreak = data.longestStreak;
      state.recentTransactions = data.recentTransactions;
      state.achievements = data.achievements;
      state.dailyChallenges = data.dailyChallenges;
      
      if (data.daeguRank !== undefined) {
        state.daeguRank = data.daeguRank;
      }
      if (data.daeguTotalUsers !== undefined) {
        state.daeguTotalUsers = data.daeguTotalUsers;
      }
      
      state.isLoading = false;
      state.error = null;
    },
    loadPointsDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Add points with animation
    addPointsWithAnimation: (state, action: PayloadAction<{
      amount: number;
      source: PointTransaction['source'];
      description: string;
    }>) => {
      const { amount, source, description } = action.payload;
      
      // Show animation
      state.showPointAnimation = true;
      state.pendingPointsToAdd = amount;
      
      // Add transaction
      const transaction: PointTransaction = {
        id: Date.now().toString(),
        type: 'earned',
        amount,
        source,
        description,
        timestamp: new Date().toISOString(),
        balanceAfter: state.totalPoints + amount,
      };
      
      state.recentTransactions = [transaction, ...state.recentTransactions.slice(0, 19)];
      
      // Update points
      state.totalPoints += amount;
      state.availablePoints += amount;
      
      // Check for level up
      if (state.pointsToNextLevel <= amount) {
        const remainingPoints = amount - state.pointsToNextLevel;
        state.currentLevel += 1;
        state.pointsToNextLevel = 100 + (state.currentLevel - 1) * 50 - remainingPoints; // Progressive difficulty
      } else {
        state.pointsToNextLevel -= amount;
      }
    },
    
    // Spend points
    spendPoints: (state, action: PayloadAction<{
      amount: number;
      description: string;
    }>) => {
      const { amount, description } = action.payload;
      
      if (state.availablePoints >= amount) {
        const transaction: PointTransaction = {
          id: Date.now().toString(),
          type: 'spent',
          amount: -amount,
          source: 'premium_purchase',
          description,
          timestamp: new Date().toISOString(),
          balanceAfter: state.totalPoints - amount,
        };
        
        state.recentTransactions = [transaction, ...state.recentTransactions.slice(0, 19)];
        state.availablePoints -= amount;
        state.usedPoints += amount;
      }
    },
    
    // Update streak
    updateStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload;
      if (action.payload > state.longestStreak) {
        state.longestStreak = action.payload;
      }
    },
    
    // Complete achievement
    completeAchievement: (state, action: PayloadAction<Achievement>) => {
      const achievement = action.payload;
      
      // Update achievement in list
      const index = state.achievements.findIndex(a => a.id === achievement.id);
      if (index !== -1) {
        state.achievements[index] = achievement;
      }
      
      // Add to recent achievements
      state.recentAchievements = [achievement, ...state.recentAchievements.slice(0, 4)];
      
      // Add points if reward exists
      if (achievement.pointsReward > 0) {
        state.totalPoints += achievement.pointsReward;
        state.availablePoints += achievement.pointsReward;
        
        // Add transaction
        const transaction: PointTransaction = {
          id: Date.now().toString(),
          type: 'bonus',
          amount: achievement.pointsReward,
          source: 'challenge_complete',
          description: `Achievement: ${achievement.title}`,
          timestamp: new Date().toISOString(),
          balanceAfter: state.totalPoints,
        };
        
        state.recentTransactions = [transaction, ...state.recentTransactions.slice(0, 19)];
      }
    },
    
    // Update daily challenge progress
    updateDailyChallengeProgress: (state, action: PayloadAction<{
      challengeId: string;
      current: number;
      isCompleted?: boolean;
    }>) => {
      const { challengeId, current, isCompleted } = action.payload;
      const challenge = state.dailyChallenges.find(c => c.id === challengeId);
      
      if (challenge) {
        challenge.current = current;
        if (isCompleted !== undefined) {
          challenge.isCompleted = isCompleted;
          
          // Add reward points if completed
          if (isCompleted && challenge.current >= challenge.target) {
            state.totalPoints += challenge.reward;
            state.availablePoints += challenge.reward;
          }
        }
      }
    },
    
    // Update leaderboard rank
    updateDaeguRank: (state, action: PayloadAction<{ rank: number; totalUsers: number }>) => {
      state.daeguRank = action.payload.rank;
      state.daeguTotalUsers = action.payload.totalUsers;
    },
    
    // Hide point animation
    hidePointAnimation: (state) => {
      state.showPointAnimation = false;
      state.pendingPointsToAdd = 0;
    },
    
    // Clear recent achievements (after viewing)
    clearRecentAchievements: (state) => {
      state.recentAchievements = [];
    },
    
    // Reset daily challenges (new day)
    resetDailyChallenges: (state, action: PayloadAction<DailyChallenge[]>) => {
      state.dailyChallenges = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear points data (on logout)
    clearPointsData: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  loadPointsDataStart,
  loadPointsDataSuccess,
  loadPointsDataFailure,
  addPointsWithAnimation,
  spendPoints,
  updateStreak,
  completeAchievement,
  updateDailyChallengeProgress,
  updateDaeguRank,
  hidePointAnimation,
  clearRecentAchievements,
  resetDailyChallenges,
  clearError,
  clearPointsData,
} = pointsSlice.actions;

// Export reducer
export default pointsSlice.reducer;

// Selectors
export const selectPointsData = (state: { points: PointsState }) => ({
  totalPoints: state.points.totalPoints,
  availablePoints: state.points.availablePoints,
  usedPoints: state.points.usedPoints,
  currentLevel: state.points.currentLevel,
  pointsToNextLevel: state.points.pointsToNextLevel,
  currentStreak: state.points.currentStreak,
  longestStreak: state.points.longestStreak,
});

export const selectRecentTransactions = (state: { points: PointsState }) => state.points.recentTransactions;
export const selectAchievements = (state: { points: PointsState }) => state.points.achievements;
export const selectRecentAchievements = (state: { points: PointsState }) => state.points.recentAchievements;
export const selectDailyChallenges = (state: { points: PointsState }) => state.points.dailyChallenges;
export const selectDaeguRank = (state: { points: PointsState }) => ({
  rank: state.points.daeguRank,
  totalUsers: state.points.daeguTotalUsers,
});
export const selectPointAnimation = (state: { points: PointsState }) => ({
  show: state.points.showPointAnimation,
  amount: state.points.pendingPointsToAdd,
});
export const selectPointsLoading = (state: { points: PointsState }) => state.points.isLoading;
export const selectPointsError = (state: { points: PointsState }) => state.points.error;