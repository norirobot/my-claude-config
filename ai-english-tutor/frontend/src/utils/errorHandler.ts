export interface ApiError {
  message: string
  status?: number
  code?: string
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message
    }
  }

  if (typeof error === 'string') {
    return {
      message: error
    }
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.'
  }
}

export const getErrorMessage = (error: ApiError): string => {
  switch (error.status) {
    case 400:
      return '잘못된 요청입니다. 입력 내용을 확인해주세요.'
    case 401:
      return '로그인이 필요합니다.'
    case 403:
      return '접근 권한이 없습니다.'
    case 404:
      return '요청한 데이터를 찾을 수 없습니다.'
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    case 503:
      return '서비스를 일시적으로 이용할 수 없습니다.'
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.'
  }
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError && error.message.includes('fetch')
}

export const createApiError = (response: Response): NetworkError => {
  return new NetworkError(
    `HTTP ${response.status}: ${response.statusText}`,
    response.status,
    response.status.toString()
  )
}

// API 호출 래퍼
export const apiCall = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      throw createApiError(response)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (isNetworkError(error)) {
      throw new NetworkError('네트워크 연결을 확인해주세요.')
    }
    throw error
  }
}