import type { Market } from './market'
import { enterSampleMode } from './runtime'

export const PRIVATE_DEMO_CODE_ENV_KEY = 'VITE_PRIVATE_DEMO_ACCESS_CODE'
export const PRIVATE_DEMO_MIN_CODE_LENGTH = 8

const DISALLOWED_PRIVATE_DEMO_CODES = new Set([
  'changeme',
  'change-me',
  'demo',
  'demo-code',
  'password',
  'private-demo-code',
  'replace-with-private-demo-code',
  'secret',
  'test',
])

export interface PrivateDemoAccessResult {
  ok: boolean
  reason?: 'not_configured' | 'invalid_code'
}

export interface PrivateResetProDemoHandoff {
  reportId?: string
  archetypeId?: string
  axisId?: string
  reportSource?: string
  evidenceLabel?: string
  validationSummary?: string
}

export function getConfiguredPrivateDemoCode(): string {
  return (import.meta.env.VITE_PRIVATE_DEMO_ACCESS_CODE ?? '').trim()
}

export function isConfiguredPrivateDemoCodeUsable(code = getConfiguredPrivateDemoCode()): boolean {
  const normalized = code.trim().toLowerCase()

  return normalized.length >= PRIVATE_DEMO_MIN_CODE_LENGTH && !DISALLOWED_PRIVATE_DEMO_CODES.has(normalized)
}

export function hasPrivateDemoGateConfigured(): boolean {
  return isConfiguredPrivateDemoCodeUsable()
}

export function verifyPrivateDemoCode(input: string): PrivateDemoAccessResult {
  const expected = getConfiguredPrivateDemoCode()

  if (!isConfiguredPrivateDemoCodeUsable(expected)) {
    return { ok: false, reason: 'not_configured' }
  }

  if (input.trim() !== expected) {
    return { ok: false, reason: 'invalid_code' }
  }

  return { ok: true }
}

export function enterPrivateResetProDemo(market: Market, handoff: PrivateResetProDemoHandoff = {}): void {
  enterSampleMode({
    market,
    preview: 'reset_pro',
    demoSource: handoff.reportId ? 'free_report' : undefined,
    demoReportId: handoff.reportId,
    demoArchetypeId: handoff.archetypeId,
    demoAxisId: handoff.axisId,
    demoReportSource: handoff.reportSource,
    demoEvidenceLabel: handoff.evidenceLabel,
    demoValidationSummary: handoff.validationSummary,
  })
}
