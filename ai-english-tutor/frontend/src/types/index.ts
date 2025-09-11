export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  level?: number
  experiencePoints?: number
}

export interface UserStats {
  id: string
  userId: string
  level: number
  experiencePoints: number
  totalMinutes: number
  studyStreak: number
  accuracy: number
  speakingScore: number
  listeningScore: number
  readingScore: number
  writingScore: number
  grammarScore: number
  vocabularyScore: number
  recentActivities?: Activity[]
}

export interface Activity {
  id: string
  description: string
  time: string
  type: 'lesson' | 'practice' | 'test' | 'achievement'
  points?: number
}

export interface Tutor {
  id: string
  name: string
  avatar: string
  rating: number
  languages: string[]
  specialties: string[]
  price: number
  experience: number
  description: string
  availability: string[]
}

export interface Session {
  id: string
  tutorId: string
  studentId: string
  date: Date
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  rating?: number
  feedback?: string
}

export interface Message {
  id: string
  sender: 'user' | 'ai' | 'tutor'
  content: string
  timestamp: Date
  metadata?: {
    emotion?: string
    score?: number
    corrections?: string[]
  }
}