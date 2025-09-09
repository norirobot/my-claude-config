import { useState, useCallback } from 'react'
import { ApiError, handleApiError, apiCall } from '../utils/errorHandler'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseApiStateReturn<T> {
  state: ApiState<T>
  execute: (apiFunction: () => Promise<T>) => Promise<T | null>
  reset: () => void
  setData: (data: T) => void
}

export const useApiState = <T = any>(initialData?: T): UseApiStateReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData || null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (apiFunction: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiFunction()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const apiError = handleApiError(error)
      setState(prev => ({ ...prev, loading: false, error: apiError }))
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return { state, execute, reset, setData }
}

// 특정 API 엔드포인트용 훅들
export const useApiGet = <T>(url: string) => {
  const { state, execute, reset } = useApiState<T>()

  const fetch = useCallback(() => {
    return execute(() => apiCall<T>(url))
  }, [url, execute])

  return { ...state, fetch, reset }
}

export const useApiPost = <T, D = any>(url: string) => {
  const { state, execute, reset } = useApiState<T>()

  const post = useCallback((data: D) => {
    return execute(() => apiCall<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    }))
  }, [url, execute])

  return { ...state, post, reset }
}

export const useApiPut = <T, D = any>(url: string) => {
  const { state, execute, reset } = useApiState<T>()

  const put = useCallback((data: D) => {
    return execute(() => apiCall<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    }))
  }, [url, execute])

  return { ...state, put, reset }
}

export const useApiDelete = <T>(url: string) => {
  const { state, execute, reset } = useApiState<T>()

  const deleteRequest = useCallback(() => {
    return execute(() => apiCall<T>(url, {
      method: 'DELETE'
    }))
  }, [url, execute])

  return { ...state, delete: deleteRequest, reset }
}