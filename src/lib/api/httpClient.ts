import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '../constants'
import { clearShibuyaSession, getStoredApiKey } from '../runtime'

export class ApiError extends Error {
  status: number
  requestId?: string

  constructor(message: string, status: number, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.requestId = requestId
  }
}

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your data and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You don\'t have permission to access this resource.',
  404: 'The requested resource was not found.',
  413: 'File too large. Maximum size is 10MB.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again in a few moments.',
  503: 'Service temporarily unavailable. We\'re working on it.',
}

function getErrorMessage(error: AxiosError): string {
  const status = error.response?.status || 0
  const data = error.response?.data as Record<string, unknown> | undefined

  if (data?.detail && typeof data.detail === 'string') {
    return data.detail
  }
  if (data?.error && typeof data.error === 'string') {
    return data.error
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Unable to connect to server. Please check your internet connection.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }

  return ERROR_MESSAGES[status] || 'Something went wrong. Please try again.'
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'X-Brand': 'shibuya',
  },
})

http.interceptors.request.use((config) => {
  const token = getStoredApiKey()
  if (token) {
    config.headers['X-API-Key'] = token
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const requestId = (error.response?.headers?.['x-request-id'] as string) || undefined

    if (status === 401) {
      clearShibuyaSession()
      window.location.href = '/login?session=expired'
    }

    throw new ApiError(getErrorMessage(error), status || 0, requestId)
  },
)

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }

  throw lastError
}

