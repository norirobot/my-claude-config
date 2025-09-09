import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 컴포넌트 마운트 시 localStorage에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('auth_user')
      }
    } else {
      // 개발/테스트를 위한 자동 로그인 (임시)
      const mockUser: User = {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=test@example.com'
      }
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      setUser(mockUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      
      // TODO: 실제 API 호출로 대체
      // 임시 로그인 로직
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
      }
      
      // localStorage에 사용자 정보 저장
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      setUser(mockUser)
      
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext