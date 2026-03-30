export const SHIBUYA_API_KEY_STORAGE_KEY = 'shibuya_api_key'
export const SHIBUYA_SAMPLE_API_KEY = 'shibuya_demo_mode'

export type ShibuyaRuntimeMode = 'anonymous' | 'sample' | 'live'

export function getStoredApiKey(): string | null {
  return localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)
}

export function getShibuyaRuntimeMode(): ShibuyaRuntimeMode {
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    return 'anonymous'
  }
  return apiKey === SHIBUYA_SAMPLE_API_KEY ? 'sample' : 'live'
}

export function isSampleMode(): boolean {
  return getShibuyaRuntimeMode() === 'sample'
}

export function enterSampleMode(): void {
  localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY)
}

export function setLiveApiKey(apiKey: string): void {
  localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, apiKey)
}

export function clearShibuyaSession(): void {
  localStorage.removeItem(SHIBUYA_API_KEY_STORAGE_KEY)
}
