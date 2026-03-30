import { describe, expect, test } from 'vitest'
import {
  SHIBUYA_API_KEY_STORAGE_KEY,
  clearShibuyaSession,
  enterSampleMode,
  getShibuyaRuntimeMode,
  getStoredApiKey,
  setLiveApiKey,
} from '../runtime'

describe('shibuya runtime', () => {
  test('starts anonymous with no stored key', () => {
    expect(getStoredApiKey()).toBeNull()
    expect(getShibuyaRuntimeMode()).toBe('anonymous')
  })

  test('enters sample workspace via canonical helper', () => {
    enterSampleMode()

    expect(localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe('shibuya_demo_mode')
    expect(getShibuyaRuntimeMode()).toBe('sample')
  })

  test('switches to live when a real api key is stored', () => {
    setLiveApiKey('live_123')

    expect(getStoredApiKey()).toBe('live_123')
    expect(getShibuyaRuntimeMode()).toBe('live')
  })

  test('clears session state', () => {
    setLiveApiKey('live_123')
    clearShibuyaSession()

    expect(getStoredApiKey()).toBeNull()
    expect(getShibuyaRuntimeMode()).toBe('anonymous')
  })
})
