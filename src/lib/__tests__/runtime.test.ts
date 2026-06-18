import { describe, expect, test } from 'vitest'
import {
  SHIBUYA_API_KEY_STORAGE_KEY,
  SHIBUYA_SESSION_META_STORAGE_KEY,
  clearShibuyaSession,
  enterSampleMode,
  getShibuyaRuntimeContract,
  getShibuyaRuntimeMode,
  getStoredApiKey,
  getStoredSessionMeta,
  hasPremiumAccess,
  isResetProSamplePreview,
  requireLiveRuntime,
  setLiveApiKey,
} from '../runtime'

describe('shibuya runtime', () => {
  test('starts anonymous with no stored key', () => {
    expect(getStoredApiKey()).toBeNull()
    expect(getShibuyaRuntimeMode()).toBe('anonymous')
    expect(getShibuyaRuntimeContract()).toMatchObject({
      mode: 'anonymous',
      canUseSampleData: false,
      canPersistTrades: false,
      persistence: 'none',
      requiresBackend: false,
    })
  })

  test('enters sample workspace via canonical helper', () => {
    enterSampleMode()

    expect(localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe('shibuya_demo_mode')
    expect(JSON.parse(localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      tier: 'sample',
      market: 'india',
      offerKind: 'sample',
      caseStatus: 'sample_preview',
      samplePreview: 'core',
    })
    expect(getShibuyaRuntimeMode()).toBe('sample')
    expect(getShibuyaRuntimeContract()).toMatchObject({
      mode: 'sample',
      canUseSampleData: true,
      canPersistTrades: false,
      persistence: 'local_only',
      requiresBackend: false,
    })
    expect(hasPremiumAccess()).toBe(false)
    expect(isResetProSamplePreview()).toBe(false)
  })

  test('can enter a Reset Pro sample preview without pretending to be live', () => {
    enterSampleMode({
      market: 'global',
      preview: 'reset_pro',
      demoSource: 'free_report',
      demoReportId: 'free-report-123',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
    })

    expect(getStoredSessionMeta()).toMatchObject({
      tier: 'sample',
      market: 'global',
      offerKind: 'sample',
      caseStatus: 'sample_preview',
      samplePreview: 'reset_pro',
      demoSource: 'free_report',
      demoReportId: 'free-report-123',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
    })
    expect(getShibuyaRuntimeMode()).toBe('sample')
    expect(isResetProSamplePreview()).toBe(true)
    expect(hasPremiumAccess()).toBe(true)
    expect(getShibuyaRuntimeContract()).toMatchObject({
      mode: 'sample',
      canUseSampleData: true,
      canPersistTrades: false,
      persistence: 'local_only',
    })
  })

  test('switches to live when a real api key is stored', () => {
    enterSampleMode({ preview: 'reset_pro' })
    setLiveApiKey('live_123', { tier: 'psych_audit' })

    expect(getStoredApiKey()).toBe('live_123')
    expect(getStoredSessionMeta()).toMatchObject({ tier: 'psych_audit' })
    expect(getStoredSessionMeta()?.samplePreview).toBeUndefined()
    expect(getShibuyaRuntimeMode()).toBe('live')
    expect(hasPremiumAccess()).toBe(false)
    expect(getShibuyaRuntimeContract()).toMatchObject({
      mode: 'live',
      canUseSampleData: false,
      canPersistTrades: true,
      persistence: 'backend',
      requiresBackend: true,
    })
  })

  test('strips sample-only metadata when a live key is stored without fresh metadata', () => {
    enterSampleMode({
      market: 'global',
      preview: 'reset_pro',
      demoSource: 'free_report',
      demoReportId: 'free-report-123',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
    })
    setLiveApiKey('live_123')

    expect(getStoredApiKey()).toBe('live_123')
    expect(getShibuyaRuntimeMode()).toBe('live')
    expect(getStoredSessionMeta()).toMatchObject({ market: 'global' })
    expect(getStoredSessionMeta()?.samplePreview).toBeUndefined()
    expect(getStoredSessionMeta()?.tier).toBeUndefined()
    expect(getStoredSessionMeta()?.offerKind).toBeUndefined()
    expect(getStoredSessionMeta()?.caseStatus).toBeUndefined()
    expect(getStoredSessionMeta()?.demoSource).toBeUndefined()
    expect(getStoredSessionMeta()?.demoReportId).toBeUndefined()
    expect(getStoredSessionMeta()?.demoArchetypeId).toBeUndefined()
    expect(getStoredSessionMeta()?.demoAxisId).toBeUndefined()
  })

  test('clears session state', () => {
    setLiveApiKey('live_123')
    clearShibuyaSession()

    expect(getStoredApiKey()).toBeNull()
    expect(getShibuyaRuntimeMode()).toBe('anonymous')
  })

  test('live-only features reject anonymous and sample runtimes', () => {
    expect(() => requireLiveRuntime('Persistent upload')).toThrow(/requires a live trader account/)

    enterSampleMode()
    expect(() => requireLiveRuntime('Persistent upload')).toThrow(/Sample workspace/)

    setLiveApiKey('live_123')
    expect(() => requireLiveRuntime('Persistent upload')).not.toThrow()
  })
})
