// API base URL - uses env var, fails explicitly in production.
const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE
  if (!url) {
    if (import.meta.env.PROD) {
      console.error('CRITICAL: VITE_API_BASE not configured in production!')
      return 'https://api-not-configured.invalid'
    }
    return 'http://127.0.0.1:8001'
  }
  return url
}

export const API_BASE_URL = getApiBaseUrl()
