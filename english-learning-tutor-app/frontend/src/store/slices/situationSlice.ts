import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Situation {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  estimatedDuration: number;
  isLocationSpecific: boolean;
  targetLocation: string;
}

export interface SituationVariation {
  id: string;
  situationId: string;
  name: string;
  context: string;
  aiCharacterRole: string;
  localContext?: any;
  idealResponses: string[];
  hints: string[];
}

export interface LearningSession {
  id: string;
  situationId: string;
  variationId: string;
  startTime: string;
  endTime?: string;
  userResponses: string[];
  aiInteractions: any[];
  overallScore?: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  appropriatenessScore?: number;
  feedback?: any;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface SituationState {
  // Available situations
  situations: Situation[];
  variations: { [situationId: string]: SituationVariation[] };
  
  // Current session
  currentSession: LearningSession | null;
  currentSituation: Situation | null;
  currentVariation: SituationVariation | null;
  
  // Session history
  recentSessions: LearningSession[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Practice settings
  selectedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  selectedCategories: string[];
  daeguFocusEnabled: boolean;
}

// Initial state
const initialState: SituationState = {
  situations: [],
  variations: {},
  currentSession: null,
  currentSituation: null,
  currentVariation: null,
  recentSessions: [],
  isLoading: false,
  error: null,
  selectedDifficulty: 'mixed',
  selectedCategories: [],
  daeguFocusEnabled: true, // Default to Daegu focus for Phase 1
};

// Situation slice
const situationSlice = createSlice({
  name: 'situation',
  initialState,
  reducers: {
    // Load situations
    loadSituationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadSituationsSuccess: (state, action: PayloadAction<{
      situations: Situation[];
      variations: { [situationId: string]: SituationVariation[] };
    }>) => {
      state.situations = action.payload.situations;
      state.variations = action.payload.variations;
      state.isLoading = false;
      state.error = null;
    },
    loadSituationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Start new session
    startSession: (state, action: PayloadAction<{
      session: LearningSession;
      situation: Situation;
      variation: SituationVariation;
    }>) => {
      state.currentSession = action.payload.session;
      state.currentSituation = action.payload.situation;
      state.currentVariation = action.payload.variation;
    },
    
    // Update current session
    updateSession: (state, action: PayloadAction<Partial<LearningSession>>) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },
    
    // Add user response
    addUserResponse: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.userResponses.push(action.payload);
      }
    },
    
    // Add AI interaction
    addAiInteraction: (state, action: PayloadAction<any>) => {
      if (state.currentSession) {
        state.currentSession.aiInteractions.push(action.payload);
      }
    },
    
    // Complete session
    completeSession: (state, action: PayloadAction<{
      scores: {
        overall: number;
        pronunciation: number;
        fluency: number;
        appropriateness: number;
      };
      feedback: any;
    }>) => {
      if (state.currentSession) {
        const completedSession = {
          ...state.currentSession,
          endTime: new Date().toISOString(),
          overallScore: action.payload.scores.overall,
          pronunciationScore: action.payload.scores.pronunciation,
          fluencyScore: action.payload.scores.fluency,
          appropriatenessScore: action.payload.scores.appropriateness,
          feedback: action.payload.feedback,
          status: 'completed' as const,
        };
        
        // Add to recent sessions (keep only last 10)
        state.recentSessions = [completedSession, ...state.recentSessions.slice(0, 9)];
        
        // Clear current session
        state.currentSession = null;
        state.currentSituation = null;
        state.currentVariation = null;
      }
    },
    
    // Abandon session
    abandonSession: (state) => {
      if (state.currentSession) {
        const abandonedSession = {
          ...state.currentSession,
          endTime: new Date().toISOString(),
          status: 'abandoned' as const,
        };
        
        state.recentSessions = [abandonedSession, ...state.recentSessions.slice(0, 9)];
        
        // Clear current session
        state.currentSession = null;
        state.currentSituation = null;
        state.currentVariation = null;
      }
    },
    
    // Update practice settings
    updateDifficultySetting: (state, action: PayloadAction<'beginner' | 'intermediate' | 'advanced' | 'mixed'>) => {
      state.selectedDifficulty = action.payload;
    },
    
    updateCategorySetting: (state, action: PayloadAction<string[]>) => {
      state.selectedCategories = action.payload;
    },
    
    toggleDaeguFocus: (state, action: PayloadAction<boolean>) => {
      state.daeguFocusEnabled = action.payload;
    },
    
    // Load recent sessions
    loadRecentSessions: (state, action: PayloadAction<LearningSession[]>) => {
      state.recentSessions = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetSituationState: (state) => {
      state.currentSession = null;
      state.currentSituation = null;
      state.currentVariation = null;
      state.error = null;
    },
    
    // Record user response (for backward compatibility)
    recordResponse: (state, action: PayloadAction<{
      response: string;
      timestamp: number;
      confidence: number;
    }>) => {
      if (state.currentSession) {
        state.currentSession.userResponses.push(action.payload.response);
      }
    },
    
    // Next situation (for practice flow)
    nextSituation: (state) => {
      // This would normally cycle to next situation
      // For now, we'll just clear current state to trigger new selection
      state.currentSituation = null;
      state.currentVariation = null;
    },
  },
});

// Export actions
export const {
  loadSituationsStart,
  loadSituationsSuccess,
  loadSituationsFailure,
  startSession,
  updateSession,
  addUserResponse,
  addAiInteraction,
  completeSession,
  abandonSession,
  updateDifficultySetting,
  updateCategorySetting,
  toggleDaeguFocus,
  loadRecentSessions,
  clearError,
  resetSituationState,
  recordResponse,
  nextSituation,
} = situationSlice.actions;

// Export reducer
export default situationSlice.reducer;

// Selectors
export const selectSituations = (state: { situation: SituationState }) => state.situation.situations;
export const selectVariations = (state: { situation: SituationState }) => state.situation.variations;
export const selectCurrentSession = (state: { situation: SituationState }) => state.situation.currentSession;
export const selectCurrentSituation = (state: { situation: SituationState }) => state.situation.currentSituation;
export const selectCurrentVariation = (state: { situation: SituationState }) => state.situation.currentVariation;
export const selectRecentSessions = (state: { situation: SituationState }) => state.situation.recentSessions;
export const selectSituationLoading = (state: { situation: SituationState }) => state.situation.isLoading;
export const selectSituationError = (state: { situation: SituationState }) => state.situation.error;
export const selectPracticeSettings = (state: { situation: SituationState }) => ({
  difficulty: state.situation.selectedDifficulty,
  categories: state.situation.selectedCategories,
  daeguFocus: state.situation.daeguFocusEnabled,
});