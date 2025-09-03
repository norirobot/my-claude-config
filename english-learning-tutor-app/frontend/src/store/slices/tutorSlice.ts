import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for tutor system
export interface Tutor {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  nativeLanguage: string;
  specializations: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  teachingExperience: number;
  isOnline: boolean;
  location: string; // Daegu focus for Phase 1
  certifications: any[];
}

export interface TutorAvailability {
  tutorId: string;
  date: string;
  timeSlots: {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
}

export interface TutorSession {
  id: string;
  tutorId: string;
  learnerId: string;
  sessionType: 'voice' | 'video' | 'chat';
  scheduledStartTime: string;
  scheduledDuration: number; // minutes
  actualStartTime?: string;
  actualEndTime?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  focusTopics: string[];
  sessionAgenda?: string;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  learnerRating?: number;
  learnerFeedback?: string;
  tutorRating?: number;
  tutorFeedback?: string;
  followUpTasks?: any[];
}

export interface TutorMatchingCriteria {
  preferredSpecializations: string[];
  preferredGender?: 'male' | 'female' | 'no_preference';
  maxHourlyRate?: number;
  minRating?: number;
  availableTimeSlots: string[];
  sessionType: 'voice' | 'video';
  focusAreas: string[];
}

export interface TutorState {
  // Available tutors (Daegu focus)
  availableTutors: Tutor[];
  
  // Current session
  currentSession: TutorSession | null;
  
  // Session history
  sessionHistory: TutorSession[];
  
  // Matching
  matchingCriteria: TutorMatchingCriteria | null;
  suggestedTutors: Tutor[];
  
  // Availability
  tutorAvailability: { [tutorId: string]: TutorAvailability };
  
  // Connection state
  isConnecting: boolean;
  connectionError: string | null;
  callQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  
  // AI readiness assessment
  isReadyForTutorSession: boolean;
  readinessScore: number; // 0-100
  readinessFactors: {
    pronunciationLevel: number;
    conversationConfidence: number;
    vocabularySize: number;
    completedSessions: number;
  } | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showSessionFeedback: boolean;
  pendingSessionId: string | null;
}

// Initial state
const initialState: TutorState = {
  availableTutors: [],
  currentSession: null,
  sessionHistory: [],
  matchingCriteria: null,
  suggestedTutors: [],
  tutorAvailability: {},
  isConnecting: false,
  connectionError: null,
  callQuality: null,
  isReadyForTutorSession: false,
  readinessScore: 0,
  readinessFactors: null,
  isLoading: false,
  error: null,
  showSessionFeedback: false,
  pendingSessionId: null,
};

// Tutor slice
const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    // Load available tutors
    loadTutorsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadTutorsSuccess: (state, action: PayloadAction<{
      tutors: Tutor[];
      availability: { [tutorId: string]: TutorAvailability };
    }>) => {
      state.availableTutors = action.payload.tutors;
      state.tutorAvailability = action.payload.availability;
      state.isLoading = false;
      state.error = null;
    },
    loadTutorsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Update tutor online status
    updateTutorOnlineStatus: (state, action: PayloadAction<{
      tutorId: string;
      isOnline: boolean;
    }>) => {
      const tutor = state.availableTutors.find(t => t.id === action.payload.tutorId);
      if (tutor) {
        tutor.isOnline = action.payload.isOnline;
      }
    },
    
    // AI Readiness Assessment
    updateReadinessAssessment: (state, action: PayloadAction<{
      isReady: boolean;
      score: number;
      factors: {
        pronunciationLevel: number;
        conversationConfidence: number;
        vocabularySize: number;
        completedSessions: number;
      };
    }>) => {
      const { isReady, score, factors } = action.payload;
      state.isReadyForTutorSession = isReady;
      state.readinessScore = score;
      state.readinessFactors = factors;
    },
    
    // Set matching criteria
    setMatchingCriteria: (state, action: PayloadAction<TutorMatchingCriteria>) => {
      state.matchingCriteria = action.payload;
    },
    
    // Update suggested tutors based on AI analysis
    updateSuggestedTutors: (state, action: PayloadAction<Tutor[]>) => {
      state.suggestedTutors = action.payload;
    },
    
    // Schedule session
    scheduleSessionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    scheduleSessionSuccess: (state, action: PayloadAction<TutorSession>) => {
      state.currentSession = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    scheduleSessionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Start session (connection)
    startSessionConnection: (state, action: PayloadAction<string>) => {
      state.isConnecting = true;
      state.connectionError = null;
      state.pendingSessionId = action.payload;
    },
    sessionConnectionSuccess: (state) => {
      state.isConnecting = false;
      state.connectionError = null;
      if (state.currentSession) {
        state.currentSession.status = 'in_progress';
        state.currentSession.actualStartTime = new Date().toISOString();
      }
    },
    sessionConnectionFailure: (state, action: PayloadAction<string>) => {
      state.isConnecting = false;
      state.connectionError = action.payload;
      state.pendingSessionId = null;
    },
    
    // Update call quality
    updateCallQuality: (state, action: PayloadAction<'excellent' | 'good' | 'fair' | 'poor'>) => {
      state.callQuality = action.payload;
      if (state.currentSession) {
        state.currentSession.connectionQuality = action.payload;
      }
    },
    
    // End session
    endSession: (state, action: PayloadAction<{
      actualEndTime: string;
      learnerRating?: number;
      learnerFeedback?: string;
      followUpTasks?: any[];
    }>) => {
      if (state.currentSession) {
        const { actualEndTime, learnerRating, learnerFeedback, followUpTasks } = action.payload;
        
        state.currentSession.status = 'completed';
        state.currentSession.actualEndTime = actualEndTime;
        
        if (learnerRating !== undefined) {
          state.currentSession.learnerRating = learnerRating;
        }
        if (learnerFeedback) {
          state.currentSession.learnerFeedback = learnerFeedback;
        }
        if (followUpTasks) {
          state.currentSession.followUpTasks = followUpTasks;
        }
        
        // Move to session history
        state.sessionHistory = [state.currentSession, ...state.sessionHistory.slice(0, 19)];
        state.currentSession = null;
        state.callQuality = null;
        
        // Show feedback prompt
        state.showSessionFeedback = true;
      }
    },
    
    // Cancel session
    cancelSession: (state, action: PayloadAction<string>) => {
      if (state.currentSession && state.currentSession.id === action.payload) {
        state.currentSession.status = 'cancelled';
        state.sessionHistory = [state.currentSession, ...state.sessionHistory.slice(0, 19)];
        state.currentSession = null;
        state.callQuality = null;
        state.isConnecting = false;
        state.connectionError = null;
      }
    },
    
    // Load session history
    loadSessionHistory: (state, action: PayloadAction<TutorSession[]>) => {
      state.sessionHistory = action.payload;
    },
    
    // Update session feedback
    updateSessionFeedback: (state, action: PayloadAction<{
      sessionId: string;
      tutorRating?: number;
      tutorFeedback?: string;
    }>) => {
      const { sessionId, tutorRating, tutorFeedback } = action.payload;
      const session = state.sessionHistory.find(s => s.id === sessionId);
      
      if (session) {
        if (tutorRating !== undefined) {
          session.tutorRating = tutorRating;
        }
        if (tutorFeedback) {
          session.tutorFeedback = tutorFeedback;
        }
      }
    },
    
    // Hide session feedback
    hideSessionFeedback: (state) => {
      state.showSessionFeedback = false;
    },
    
    // Update tutor availability
    updateTutorAvailability: (state, action: PayloadAction<TutorAvailability>) => {
      const availability = action.payload;
      state.tutorAvailability[availability.tutorId] = availability;
    },
    
    // Clear connection state
    clearConnectionState: (state) => {
      state.isConnecting = false;
      state.connectionError = null;
      state.callQuality = null;
      state.pendingSessionId = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.connectionError = null;
    },
    
    // Clear tutor data (on logout)
    clearTutorData: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  loadTutorsStart,
  loadTutorsSuccess,
  loadTutorsFailure,
  updateTutorOnlineStatus,
  updateReadinessAssessment,
  setMatchingCriteria,
  updateSuggestedTutors,
  scheduleSessionStart,
  scheduleSessionSuccess,
  scheduleSessionFailure,
  startSessionConnection,
  sessionConnectionSuccess,
  sessionConnectionFailure,
  updateCallQuality,
  endSession,
  cancelSession,
  loadSessionHistory,
  updateSessionFeedback,
  hideSessionFeedback,
  updateTutorAvailability,
  clearConnectionState,
  clearError,
  clearTutorData,
} = tutorSlice.actions;

// Export reducer
export default tutorSlice.reducer;

// Selectors
export const selectAvailableTutors = (state: { tutor: TutorState }) => state.tutor.availableTutors;
export const selectSuggestedTutors = (state: { tutor: TutorState }) => state.tutor.suggestedTutors;
export const selectCurrentSession = (state: { tutor: TutorState }) => state.tutor.currentSession;
export const selectSessionHistory = (state: { tutor: TutorState }) => state.tutor.sessionHistory;
export const selectReadinessAssessment = (state: { tutor: TutorState }) => ({
  isReady: state.tutor.isReadyForTutorSession,
  score: state.tutor.readinessScore,
  factors: state.tutor.readinessFactors,
});
export const selectConnectionState = (state: { tutor: TutorState }) => ({
  isConnecting: state.tutor.isConnecting,
  error: state.tutor.connectionError,
  quality: state.tutor.callQuality,
  pendingSessionId: state.tutor.pendingSessionId,
});
export const selectTutorAvailability = (state: { tutor: TutorState }) => state.tutor.tutorAvailability;
export const selectMatchingCriteria = (state: { tutor: TutorState }) => state.tutor.matchingCriteria;
export const selectShowSessionFeedback = (state: { tutor: TutorState }) => state.tutor.showSessionFeedback;
export const selectTutorLoading = (state: { tutor: TutorState }) => state.tutor.isLoading;
export const selectTutorError = (state: { tutor: TutorState }) => state.tutor.error;