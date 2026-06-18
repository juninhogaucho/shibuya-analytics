import type { Market } from './market'
import { enterSampleMode } from './runtime'

export const PRIVATE_DEMO_CODE_ENV_KEY = 'VITE_PRIVATE_DEMO_ACCESS_CODE'

export interface PrivateDemoAccessResult {
  ok: boolean
  reason?: 'not_configured' | 'invalid_code'
}

export interface PrivateResetProDemoHandoff {
  reportId?: string
  archetypeId?: string
  axisId?: string
}

export function getConfiguredPrivateDemoCode(): string {
  return (import.meta.env.VITE_PRIVATE_DEMO_ACCESS_CODE ?? '').trim()
}

export function hasPrivateDemoGateConfigured(): boolean {
  return getConfiguredPrivateDemoCode().length > 0
}

export function verifyPrivateDemoCode(input: string): PrivateDemoAccessResult {
  const expected = getConfiguredPrivateDemoCode()

  if (!expected) {
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
  })
}
