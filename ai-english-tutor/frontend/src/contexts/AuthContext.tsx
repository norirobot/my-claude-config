import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  isAuthenticated, 
  getUser, 
  saveUser, 
  saveTokens, 
  logout as authLogout,
  refreshAuthToken 
} from '../utils/auth'
import { apiCall, handleApiError } from '../utils/errorHandler'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  clearError: () => void
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

// 테스트용 기본 사용자 설정
const testUser: User = {
  id: '1',
  email: 'test@test.com',
  name: 'Test User'
}

const initialState: AuthState = {
  user: testUser,  // 테스트용 자동 로그인
  isAuthenticated: true,  // 자동으로 인증된 상태
  loading: false,
  error: null
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true, 
        loading: false, 
        error: null 
      }
    
    case 'AUTH_ERROR':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: action.payload 
      }
    
    case 'AUTH_LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: null 
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    case 'UPDATE_USER':
      if (!state.user) return state
      const updatedUser = { ...state.user, ...action.payload }
      saveUser(updatedUser)
      return { ...state, user: updatedUser }
    
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state on mount
  useEffect(() => {
    // 테스트 모드: 자동 로그인 유지
    // 실제 배포시 아래 주석을 해제하고 위의 테스트 코드를 제거하세요
    console.log('Auto-login enabled for testing')
    
    /* 실제 인증 로직 (배포시 사용)
    const initializeAuth = async () => {
      if (isAuthenticated()) {
        const user = getUser()
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user })
        } else {
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      } else {
        // Try to refresh token
        const refreshed = await refreshAuthToken()
        if (refreshed) {
          const user = getUser()
          if (user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: user })
          } else {
            dispatch({ type: 'AUTH_LOGOUT' })
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      }
    }

    initializeAuth()
    */
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' })

    try {
      // 임시로 Mock 데이터 사용 (실제 API 구현 전까지)
      if (credentials.email === 'test@test.com' && credentials.password === 'password') {
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          name: 'Test User',
          level: 5,
          points: 1250
        }
        
        const mockTokenData = {
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24시간
        }

        saveTokens(mockTokenData)
        saveUser(mockUser)
        dispatch({ type: 'AUTH_SUCCESS', payload: mockUser })
        return true
      } else {
        throw new Error('Invalid credentials')
      }

      /*
      // 실제 API 연동 코드 (추후 활성화)
      const response = await apiCall<{
        user: User
        token: string
        refreshToken: string
        expiresIn: number
      }>('http://localhost:3001/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      saveTokens({
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: Date.now() + (response.expiresIn * 1000)
      })
      
      saveUser(response.user)
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
      return true
      */
    } catch (error) {
      const apiError = handleApiError(error)
      dispatch({ type: 'AUTH_ERROR', payload: apiError.message })
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' })

    try {
      // Mock 회원가입 데이터
      const mockUser: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        level: 1,
        points: 0
      }
      
      const mockTokenData = {
        token: 'mock-jwt-token-register',
        refreshToken: 'mock-refresh-token-register',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }

      saveTokens(mockTokenData)
      saveUser(mockUser)
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser })
      return true

      /*
      // 실제 API 연동 코드 (추후 활성화)
      const response = await apiCall<{
        user: User
        token: string
        refreshToken: string
        expiresIn: number
      }>('http://localhost:3001/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      saveTokens({
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: Date.now() + (response.expiresIn * 1000)
      })
      
      saveUser(response.user)
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
      return true
      */
    } catch (error) {
      const apiError = handleApiError(error)
      dispatch({ type: 'AUTH_ERROR', payload: apiError.message })
      return false
    }
  }

  const logout = (): void => {
    authLogout()
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const refreshUser = async (): Promise<void> => {
    try {
      // Mock refresh user data
      const currentUser = getUser()
      if (currentUser) {
        dispatch({ type: 'AUTH_SUCCESS', payload: currentUser })
      }
      
      /*
      // 실제 API 연동 코드 (추후 활성화)
      const response = await apiCall<User>('http://localhost:3001/api/auth/me', {
        method: 'GET'
      })
      
      saveUser(response)
      dispatch({ type: 'AUTH_SUCCESS', payload: response })
      */
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider