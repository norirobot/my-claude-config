interface TokenData {
  token: string
  refreshToken?: string
  expiresAt: number
}

export interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  level?: number
  points?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  confirmPassword: string
}

// Local Storage Keys
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

// Token Management
export const saveTokens = (tokenData: TokenData): void => {
  localStorage.setItem(TOKEN_KEY, tokenData.token)
  if (tokenData.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken)
  }
  localStorage.setItem('token_expires_at', tokenData.expiresAt.toString())
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem('token_expires_at')
}

export const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('token_expires_at')
  if (!expiresAt) return true
  
  return Date.now() > parseInt(expiresAt)
}

// User Data Management
export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY)
  if (!userData) return null
  
  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY)
}

// Auth State Check
export const isAuthenticated = (): boolean => {
  const token = getToken()
  const user = getUser()
  
  return !!(token && user && !isTokenExpired())
}

// Logout Helper
export const logout = (): void => {
  removeTokens()
  removeUser()
}

// API Headers Helper
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Auto-refresh token logic
export const refreshAuthToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch('http://localhost:3001/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      saveTokens({
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000)
      })
      return true
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
  }

  logout()
  return false
}