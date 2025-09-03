import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for learning progress and analytics
export interface DailyProgress {
  date: string;
  sessionsCompleted: number;
  totalMinutes: number;
  averageScore: number;
  pointsEarned: number;
  streakDay: boolean;
}

export interface WeeklyStats {
  weekStartDate: string;
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  improvementRate: number;
  strongCategories: string[];
  weakCategories: string[];
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'sessions' | 'minutes' | 'points' | 'score';
  deadline: string;
  isCompleted: boolean;
}

export interface LearningState {
  // Daily progress
  todayProgress: DailyProgress | null;
  dailyGoal: number; // minutes per day
  dailyGoalProgress: number; // percentage
  
  // Weekly stats
  weeklyStats: WeeklyStats | null;
  
  // Learning goals
  activeGoals: LearningGoal[];
  
  // Performance analytics
  performanceHistory: {
    dates: string[];
    overallScores: number[];
    pronunciationScores: number[];
    fluencyScores: number[];
  };
  
  // Category performance
  categoryPerformance: {
    [category: string]: {
      averageScore: number;
      sessionsCompleted: number;
      lastPracticed: string;
      improvement: number; // percentage change
    };
  };
  
  // Learning recommendations
  recommendations: {
    suggestedCategories: string[];
    suggestedDifficulty: 'beginner' | 'intermediate' | 'advanced';
    studyTimeRecommendation: number; // minutes
    nextMilestone: string;
  } | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showProgressCelebration: boolean;
  celebrationData: any;
}

// Initial state
const initialState: LearningState = {
  todayProgress: null,
  dailyGoal: 30, // 30 minutes default
  dailyGoalProgress: 0,
  weeklyStats: null,
  activeGoals: [],
  performanceHistory: {
    dates: [],
    overallScores: [],
    pronunciationScores: [],
    fluencyScores: [],
  },
  categoryPerformance: {},
  recommendations: null,
  isLoading: false,
  error: null,
  showProgressCelebration: false,
  celebrationData: null,
};

// Learning slice
const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    // Load learning data
    loadLearningDataStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadLearningDataSuccess: (state, action: PayloadAction<{
      todayProgress: DailyProgress;
      weeklyStats: WeeklyStats;
      activeGoals: LearningGoal[];
      performanceHistory: any;
      categoryPerformance: any;
      recommendations: any;
    }>) => {
      const data = action.payload;
      state.todayProgress = data.todayProgress;
      state.weeklyStats = data.weeklyStats;
      state.activeGoals = data.activeGoals;
      state.performanceHistory = data.performanceHistory;
      state.categoryPerformance = data.categoryPerformance;
      state.recommendations = data.recommendations;
      
      // Calculate daily goal progress
      if (data.todayProgress) {
        state.dailyGoalProgress = Math.min(100, (data.todayProgress.totalMinutes / state.dailyGoal) * 100);
      }
      
      state.isLoading = false;
      state.error = null;
    },
    loadLearningDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Update today's progress (real-time)
    updateTodayProgress: (state, action: PayloadAction<{
      sessionsCompleted?: number;
      totalMinutes?: number;
      averageScore?: number;
      pointsEarned?: number;
    }>) => {
      if (!state.todayProgress) {
        state.todayProgress = {
          date: new Date().toISOString().split('T')[0],
          sessionsCompleted: 0,
          totalMinutes: 0,
          averageScore: 0,
          pointsEarned: 0,
          streakDay: false,
        };
      }
      
      const updates = action.payload;
      if (updates.sessionsCompleted !== undefined) {
        state.todayProgress.sessionsCompleted = updates.sessionsCompleted;
      }
      if (updates.totalMinutes !== undefined) {
        state.todayProgress.totalMinutes = updates.totalMinutes;
        // Update daily goal progress
        state.dailyGoalProgress = Math.min(100, (updates.totalMinutes / state.dailyGoal) * 100);
      }
      if (updates.averageScore !== undefined) {
        state.todayProgress.averageScore = updates.averageScore;
      }
      if (updates.pointsEarned !== undefined) {
        state.todayProgress.pointsEarned = updates.pointsEarned;
      }
    },
    
    // Add session to today's progress
    addSessionToProgress: (state, action: PayloadAction<{
      durationMinutes: number;
      score: number;
      pointsEarned: number;
      category: string;
    }>) => {
      if (!state.todayProgress) {
        state.todayProgress = {
          date: new Date().toISOString().split('T')[0],
          sessionsCompleted: 0,
          totalMinutes: 0,
          averageScore: 0,
          pointsEarned: 0,
          streakDay: false,
        };
      }
      
      const { durationMinutes, score, pointsEarned, category } = action.payload;
      
      // Update today's progress
      state.todayProgress.sessionsCompleted += 1;
      state.todayProgress.totalMinutes += durationMinutes;
      state.todayProgress.pointsEarned += pointsEarned;
      
      // Update average score
      const currentTotal = state.todayProgress.averageScore * (state.todayProgress.sessionsCompleted - 1);
      state.todayProgress.averageScore = Math.round(((currentTotal + score) / state.todayProgress.sessionsCompleted) * 100) / 100;
      
      // Update daily goal progress
      state.dailyGoalProgress = Math.min(100, (state.todayProgress.totalMinutes / state.dailyGoal) * 100);
      
      // Update category performance
      if (!state.categoryPerformance[category]) {
        state.categoryPerformance[category] = {
          averageScore: score,
          sessionsCompleted: 1,
          lastPracticed: new Date().toISOString(),
          improvement: 0,
        };
      } else {
        const categoryData = state.categoryPerformance[category];
        const oldAverage = categoryData.averageScore;
        const newAverage = ((oldAverage * categoryData.sessionsCompleted) + score) / (categoryData.sessionsCompleted + 1);
        
        categoryData.averageScore = Math.round(newAverage * 100) / 100;
        categoryData.sessionsCompleted += 1;
        categoryData.lastPracticed = new Date().toISOString();
        categoryData.improvement = Math.round(((newAverage - oldAverage) / oldAverage) * 10000) / 100; // percentage with 2 decimals
      }
      
      // Check for celebrations (daily goal completion, etc.)
      if (state.dailyGoalProgress >= 100 && !state.showProgressCelebration) {
        state.showProgressCelebration = true;
        state.celebrationData = {
          type: 'daily_goal',
          message: '🎉 Daily goal completed!',
          details: `You practiced for ${Math.round(state.todayProgress.totalMinutes)} minutes today!`,
        };
      }
    },
    
    // Update daily goal
    updateDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = action.payload;
      
      // Recalculate progress
      if (state.todayProgress) {
        state.dailyGoalProgress = Math.min(100, (state.todayProgress.totalMinutes / action.payload) * 100);
      }
    },
    
    // Update learning goals
    updateLearningGoal: (state, action: PayloadAction<{
      goalId: string;
      currentValue: number;
      isCompleted?: boolean;
    }>) => {
      const { goalId, currentValue, isCompleted } = action.payload;
      const goal = state.activeGoals.find(g => g.id === goalId);
      
      if (goal) {
        goal.currentValue = currentValue;
        if (isCompleted !== undefined) {
          goal.isCompleted = isCompleted;
        }
        
        // Check for goal completion celebration
        if (goal.currentValue >= goal.targetValue && !goal.isCompleted) {
          goal.isCompleted = true;
          state.showProgressCelebration = true;
          state.celebrationData = {
            type: 'goal_completed',
            message: '🏆 Goal Achieved!',
            details: goal.title,
          };
        }
      }
    },
    
    // Add new learning goal
    addLearningGoal: (state, action: PayloadAction<LearningGoal>) => {
      state.activeGoals.push(action.payload);
    },
    
    // Remove learning goal
    removeLearningGoal: (state, action: PayloadAction<string>) => {
      state.activeGoals = state.activeGoals.filter(goal => goal.id !== action.payload);
    },
    
    // Update performance history
    updatePerformanceHistory: (state, action: PayloadAction<{
      date: string;
      overallScore: number;
      pronunciationScore: number;
      fluencyScore: number;
    }>) => {
      const { date, overallScore, pronunciationScore, fluencyScore } = action.payload;
      
      // Add to history (keep last 30 days)
      state.performanceHistory.dates.push(date);
      state.performanceHistory.overallScores.push(overallScore);
      state.performanceHistory.pronunciationScores.push(pronunciationScore);
      state.performanceHistory.fluencyScores.push(fluencyScore);
      
      // Keep only last 30 entries
      if (state.performanceHistory.dates.length > 30) {
        state.performanceHistory.dates.shift();
        state.performanceHistory.overallScores.shift();
        state.performanceHistory.pronunciationScores.shift();
        state.performanceHistory.fluencyScores.shift();
      }
    },
    
    // Update recommendations
    updateRecommendations: (state, action: PayloadAction<any>) => {
      state.recommendations = action.payload;
    },
    
    // Hide progress celebration
    hideProgressCelebration: (state) => {
      state.showProgressCelebration = false;
      state.celebrationData = null;
    },
    
    // Reset daily progress (new day)
    resetDailyProgress: (state) => {
      state.todayProgress = {
        date: new Date().toISOString().split('T')[0],
        sessionsCompleted: 0,
        totalMinutes: 0,
        averageScore: 0,
        pointsEarned: 0,
        streakDay: false,
      };
      state.dailyGoalProgress = 0;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear learning data (on logout)
    clearLearningData: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  loadLearningDataStart,
  loadLearningDataSuccess,
  loadLearningDataFailure,
  updateTodayProgress,
  addSessionToProgress,
  updateDailyGoal,
  updateLearningGoal,
  addLearningGoal,
  removeLearningGoal,
  updatePerformanceHistory,
  updateRecommendations,
  hideProgressCelebration,
  resetDailyProgress,
  clearError,
  clearLearningData,
} = learningSlice.actions;

// Export reducer
export default learningSlice.reducer;

// Selectors
export const selectTodayProgress = (state: { learning: LearningState }) => state.learning.todayProgress;
export const selectDailyGoal = (state: { learning: LearningState }) => ({
  goal: state.learning.dailyGoal,
  progress: state.learning.dailyGoalProgress,
});
export const selectWeeklyStats = (state: { learning: LearningState }) => state.learning.weeklyStats;
export const selectActiveGoals = (state: { learning: LearningState }) => state.learning.activeGoals;
export const selectPerformanceHistory = (state: { learning: LearningState }) => state.learning.performanceHistory;
export const selectCategoryPerformance = (state: { learning: LearningState }) => state.learning.categoryPerformance;
export const selectRecommendations = (state: { learning: LearningState }) => state.learning.recommendations;
export const selectProgressCelebration = (state: { learning: LearningState }) => ({
  show: state.learning.showProgressCelebration,
  data: state.learning.celebrationData,
});
export const selectLearningLoading = (state: { learning: LearningState }) => state.learning.isLoading;
export const selectLearningError = (state: { learning: LearningState }) => state.learning.error;