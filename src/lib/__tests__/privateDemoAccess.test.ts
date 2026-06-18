import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  PRIVATE_DEMO_MIN_CODE_LENGTH,
  hasPrivateDemoGateConfigured,
  isConfiguredPrivateDemoCodeUsable,
  verifyPrivateDemoCode,
} from '../privateDemoAccess'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('private demo access gate', () => {
  test('requires a non-placeholder code with a minimum length', () => {
    expect(isConfiguredPrivateDemoCodeUsable('')).toBe(false)
    expect(isConfiguredPrivateDemoCodeUsable('demo')).toBe(false)
    expect(isConfiguredPrivateDemoCodeUsable('replace-with-private-demo-code')).toBe(false)
    expect(isConfiguredPrivateDemoCodeUsable('x'.repeat(PRIVATE_DEMO_MIN_CODE_LENGTH - 1))).toBe(false)
    expect(isConfiguredPrivateDemoCodeUsable('founder-only')).toBe(true)
  })

  test('treats missing, short, and placeholder env values as not configured', () => {
    expect(hasPrivateDemoGateConfigured()).toBe(false)

    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'demo')
    expect(hasPrivateDemoGateConfigured()).toBe(false)
    expect(verifyPrivateDemoCode('demo')).toEqual({ ok: false, reason: 'not_configured' })

    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')
    expect(hasPrivateDemoGateConfigured()).toBe(true)
  })

  test('unlocks only when the configured usable code matches exactly after trimming input', () => {
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only')

    expect(verifyPrivateDemoCode(' founder-only ')).toEqual({ ok: true })
    expect(verifyPrivateDemoCode('wrong-code')).toEqual({ ok: false, reason: 'invalid_code' })
  })
})
