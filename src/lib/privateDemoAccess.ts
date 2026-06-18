import type { Market } from './market'
import { enterSampleMode } from './runtime'

export const PRIVATE_DEMO_CODE_ENV_KEY = 'VITE_PRIVATE_DEMO_ACCESS_CODE'
export const PRIVATE_DEMO_MIN_CODE_LENGTH = 8
export const PRIVATE_DEMO_UNLOCK_BOUNDARY =
  'Founder code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.'

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
  source?: string
  reportId?: string
  archetypeId?: string
  axisId?: string
  reportSource?: string
  evidenceLabel?: string
  validationSummary?: string
  storySource?: string
  selectedPainAxisIds?: string[]
  visitedSceneCount?: number
  signalMarkerIds?: string[]
  lockedSectionId?: string
  lockedSectionTitle?: string
  bridgeHeadline?: string
  bridgeDecisionQuestion?: string
  bridgeWhyNow?: string
  bridgeLiveProof?: string[]
  bridgePreviewShows?: string[]
}

function normalizeReceiptPart(value?: string): string {
  return (value?.trim().toLowerCase() || 'none').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'none'
}

export function buildPrivateDemoUnlockReceiptId(market: Market, handoff: PrivateResetProDemoHandoff = {}): string {
  return [
    'reset-pro-demo',
    market,
    handoff.source ?? (handoff.reportId ? 'free_report' : 'direct'),
    handoff.reportId ?? 'no-report',
    handoff.archetypeId ?? 'no-archetype',
    handoff.axisId ?? 'no-axis',
    handoff.lockedSectionId ?? 'no-locked-module',
  ].map(normalizeReceiptPart).join(':')
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
  const demoUnlockReceiptId = buildPrivateDemoUnlockReceiptId(market, handoff)

  enterSampleMode({
    market,
    preview: 'reset_pro',
    demoSource: handoff.source ?? (handoff.reportId ? 'free_report' : undefined),
    demoReportId: handoff.reportId,
    demoArchetypeId: handoff.archetypeId,
    demoAxisId: handoff.axisId,
    demoReportSource: handoff.reportSource,
    demoEvidenceLabel: handoff.evidenceLabel,
    demoValidationSummary: handoff.validationSummary,
    demoStorySource: handoff.storySource,
    demoSelectedPainAxisIds: handoff.selectedPainAxisIds,
    demoVisitedSceneCount: handoff.visitedSceneCount,
    demoSignalMarkerIds: handoff.signalMarkerIds,
    demoLockedSectionId: handoff.lockedSectionId,
    demoLockedSectionTitle: handoff.lockedSectionTitle,
    demoBridgeHeadline: handoff.bridgeHeadline,
    demoBridgeDecisionQuestion: handoff.bridgeDecisionQuestion,
    demoBridgeWhyNow: handoff.bridgeWhyNow,
    demoBridgeLiveProof: handoff.bridgeLiveProof,
    demoBridgePreviewShows: handoff.bridgePreviewShows,
    demoUnlockReceiptId,
    demoUnlockBoundary: PRIVATE_DEMO_UNLOCK_BOUNDARY,
  })
}
