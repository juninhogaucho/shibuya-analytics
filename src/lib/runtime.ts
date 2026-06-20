import type { Market } from './market'
import type { TraderMode } from './types'

export const SHIBUYA_API_KEY_STORAGE_KEY = 'shibuya_api_key'
export const SHIBUYA_SESSION_META_STORAGE_KEY = 'shibuya_session_meta'
export const SHIBUYA_SAMPLE_API_KEY = 'shibuya_demo_mode'

export type ShibuyaRuntimeMode = 'anonymous' | 'sample' | 'live'
export type ShibuyaRuntimePersistence = 'none' | 'local_only' | 'backend'
export type ShibuyaSamplePreview = 'core' | 'reset_pro'
export type ShibuyaDemoEntryMode = 'mission_hq' | 'append_proof_shortcut'
export type ShibuyaWorkspaceAccessReason = 'anonymous' | 'live_session' | 'private_demo_receipt' | 'sample_without_private_gate'

export interface ShibuyaRuntimeContract {
  mode: ShibuyaRuntimeMode
  label: string
  canUseSampleData: boolean
  canPersistTrades: boolean
  persistence: ShibuyaRuntimePersistence
  requiresBackend: boolean
  proofBoundary: string
}

export interface ShibuyaSessionMeta {
  customerId?: string
  tier?: string
  planId?: string
  market?: Market
  orderId?: string
  offerKind?: string
  caseStatus?: string
  traderMode?: TraderMode
  nextAction?: string
  accessExpiresAt?: string | null
  dataSource?: string | null
  affiliateSlug?: string
  refCode?: string
  samplePreview?: ShibuyaSamplePreview
  demoSource?: string
  demoReportId?: string
  demoArchetypeId?: string
  demoAxisId?: string
  demoReportSource?: string
  demoEvidenceLabel?: string
  demoValidationSummary?: string
  demoStorySource?: string
  demoSelectedPainAxisIds?: string[]
  demoVisitedSceneCount?: number
  demoSignalMarkerIds?: string[]
  demoLockedSectionId?: string
  demoLockedSectionTitle?: string
  demoBridgeHeadline?: string
  demoBridgeDecisionQuestion?: string
  demoBridgeWhyNow?: string
  demoBridgeLiveProof?: string[]
  demoBridgePreviewShows?: string[]
  demoPrivateGateChecksum?: string
  demoEngagementReportViewCount?: number
  demoEngagementLockedSectionClickCount?: number
  demoEngagementCurrentSectionClickCount?: number
  demoEngagementPrivateDemoIntentCount?: number
  demoEngagementBoundary?: string
  demoUnlockReceiptId?: string
  demoUnlockBoundary?: string
  demoEntryMode?: ShibuyaDemoEntryMode
  activationSource?: string
  activationReportId?: string
  activationArchetypeId?: string
  activationAxisId?: string
  activationReportArtifactStatus?: string
  activationProductionArtifactProven?: string
  activationStorySource?: string
  activationSelectedPainAxisIds?: string[]
  activationVisitedSceneCount?: number
  activationSignalMarkerIds?: string[]
  activationLockedSectionId?: string
  activationLockedSectionTitle?: string
  activationBridgeHeadline?: string
  activationBridgeDecisionQuestion?: string
  activationBridgeWhyNow?: string
  activationBridgeLiveProof?: string[]
  activationEngagementReportViewCount?: number
  activationEngagementLockedSectionClickCount?: number
  activationEngagementCurrentSectionClickCount?: number
  activationEngagementPrivateDemoIntentCount?: number
  activationEngagementBoundary?: string
}

export interface ShibuyaWorkspaceAccessState {
  ok: boolean
  mode: ShibuyaRuntimeMode
  market: Market
  reason: ShibuyaWorkspaceAccessReason
  redirectPath?: string
}

export interface EnterSampleModeOptions {
  market?: Market
  preview?: ShibuyaSamplePreview
  demoSource?: string
  demoReportId?: string
  demoArchetypeId?: string
  demoAxisId?: string
  demoReportSource?: string
  demoEvidenceLabel?: string
  demoValidationSummary?: string
  demoStorySource?: string
  demoSelectedPainAxisIds?: string[]
  demoVisitedSceneCount?: number
  demoSignalMarkerIds?: string[]
  demoLockedSectionId?: string
  demoLockedSectionTitle?: string
  demoBridgeHeadline?: string
  demoBridgeDecisionQuestion?: string
  demoBridgeWhyNow?: string
  demoBridgeLiveProof?: string[]
  demoBridgePreviewShows?: string[]
  demoPrivateGateChecksum?: string
  demoEngagementReportViewCount?: number
  demoEngagementLockedSectionClickCount?: number
  demoEngagementCurrentSectionClickCount?: number
  demoEngagementPrivateDemoIntentCount?: number
  demoEngagementBoundary?: string
  demoUnlockReceiptId?: string
  demoUnlockBoundary?: string
  demoEntryMode?: ShibuyaDemoEntryMode
}

function parseSessionMeta(raw: string | null): ShibuyaSessionMeta | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as ShibuyaSessionMeta
  } catch {
    return null
  }
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)
}

export function getStoredSessionMeta(): ShibuyaSessionMeta | null {
  return parseSessionMeta(localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY))
}

export function getStoredSessionTier(): string | null {
  return getStoredSessionMeta()?.tier ?? null
}

export function getStoredSessionOfferKind(): string | null {
  return getStoredSessionMeta()?.offerKind ?? null
}

export function hasPremiumAccess(): boolean {
  const meta = getStoredSessionMeta()
  return meta?.tier === 'reset_pro' || (getShibuyaRuntimeMode() === 'sample' && meta?.samplePreview === 'reset_pro')
}

export function hasPrivateResetProDemoReceipt(meta: ShibuyaSessionMeta | null = getStoredSessionMeta()): boolean {
  return Boolean(
    meta?.samplePreview === 'reset_pro'
    && meta.demoSource
    && meta.demoReportId
    && meta.demoPrivateGateChecksum
    && meta.demoUnlockReceiptId
    && meta.demoUnlockBoundary,
  )
}

export function getWorkspaceAccessState(): ShibuyaWorkspaceAccessState {
  const mode = getShibuyaRuntimeMode()
  const meta = getStoredSessionMeta()
  const market = meta?.market ?? 'india'

  if (mode === 'live') {
    return { ok: true, mode, market, reason: 'live_session' }
  }

  if (mode === 'sample' && hasPrivateResetProDemoReceipt(meta)) {
    return { ok: true, mode, market, reason: 'private_demo_receipt' }
  }

  if (mode === 'sample') {
    return {
      ok: false,
      mode,
      market,
      reason: 'sample_without_private_gate',
      redirectPath: `/private-demo?market=${market}`,
    }
  }

  return {
    ok: false,
    mode,
    market,
    reason: 'anonymous',
    redirectPath: '/activate',
  }
}

export function isOneTimeOffer(offerKind?: string | null): boolean {
  return Boolean(offerKind && !offerKind.endsWith('_live') && offerKind !== 'sample')
}

export function getSessionDaysRemaining(meta?: ShibuyaSessionMeta | null): number | null {
  const session = meta ?? getStoredSessionMeta()
  if (!session?.accessExpiresAt) {
    return null
  }

  const expiry = new Date(session.accessExpiresAt)
  if (Number.isNaN(expiry.getTime())) {
    return null
  }

  const diff = expiry.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

export function isReadOnlySession(meta?: ShibuyaSessionMeta | null): boolean {
  const session = meta ?? getStoredSessionMeta()
  if (!session || !isOneTimeOffer(session.offerKind) || !session.accessExpiresAt) {
    return false
  }

  const expiry = new Date(session.accessExpiresAt)
  if (Number.isNaN(expiry.getTime())) {
    return false
  }

  return expiry.getTime() < Date.now()
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

export function getShibuyaRuntimeContract(): ShibuyaRuntimeContract {
  const mode = getShibuyaRuntimeMode()

  if (mode === 'live') {
    return {
      mode,
      label: 'Live trader account',
      canUseSampleData: false,
      canPersistTrades: true,
      persistence: 'backend',
      requiresBackend: true,
      proofBoundary: 'Live account data must come from the Medallion API and durable account records.',
    }
  }

  if (mode === 'sample') {
    return {
      mode,
      label: 'Sample workspace',
      canUseSampleData: true,
      canPersistTrades: false,
      persistence: 'local_only',
      requiresBackend: false,
      proofBoundary: 'Sample mode may demonstrate workflow only. It must not imply live persistence, live billing, or account-specific analytics.',
    }
  }

  return {
    mode,
    label: 'Public visitor',
    canUseSampleData: false,
    canPersistTrades: false,
    persistence: 'none',
    requiresBackend: false,
    proofBoundary: 'Anonymous visitors can inspect the public product story but cannot access account analytics.',
  }
}

export function requireLiveRuntime(featureName: string): void {
  const contract = getShibuyaRuntimeContract()

  if (contract.mode !== 'live') {
    throw new Error(`${featureName} requires a live trader account. Current runtime: ${contract.label}.`)
  }
}

export function isResetProSamplePreview(meta?: ShibuyaSessionMeta | null): boolean {
  return (meta ?? getStoredSessionMeta())?.samplePreview === 'reset_pro'
}

export function enterSampleMode(options: EnterSampleModeOptions = {}): void {
  const market = options.market ?? 'india'
  const preview = options.preview ?? 'core'

  localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY)
  localStorage.setItem(
    SHIBUYA_SESSION_META_STORAGE_KEY,
    JSON.stringify({
      tier: 'sample',
      market,
      offerKind: 'sample',
      caseStatus: 'sample_preview',
      samplePreview: preview,
      demoSource: options.demoSource,
      demoReportId: options.demoReportId,
      demoArchetypeId: options.demoArchetypeId,
      demoAxisId: options.demoAxisId,
      demoReportSource: options.demoReportSource,
      demoEvidenceLabel: options.demoEvidenceLabel,
      demoValidationSummary: options.demoValidationSummary,
      demoStorySource: options.demoStorySource,
      demoSelectedPainAxisIds: options.demoSelectedPainAxisIds,
      demoVisitedSceneCount: options.demoVisitedSceneCount,
      demoSignalMarkerIds: options.demoSignalMarkerIds,
      demoLockedSectionId: options.demoLockedSectionId,
      demoLockedSectionTitle: options.demoLockedSectionTitle,
      demoBridgeHeadline: options.demoBridgeHeadline,
      demoBridgeDecisionQuestion: options.demoBridgeDecisionQuestion,
      demoBridgeWhyNow: options.demoBridgeWhyNow,
      demoBridgeLiveProof: options.demoBridgeLiveProof,
      demoBridgePreviewShows: options.demoBridgePreviewShows,
      demoPrivateGateChecksum: options.demoPrivateGateChecksum,
      demoEngagementReportViewCount: options.demoEngagementReportViewCount,
      demoEngagementLockedSectionClickCount: options.demoEngagementLockedSectionClickCount,
      demoEngagementCurrentSectionClickCount: options.demoEngagementCurrentSectionClickCount,
      demoEngagementPrivateDemoIntentCount: options.demoEngagementPrivateDemoIntentCount,
      demoEngagementBoundary: options.demoEngagementBoundary,
      demoUnlockReceiptId: options.demoUnlockReceiptId,
      demoUnlockBoundary: options.demoUnlockBoundary,
      demoEntryMode: options.demoEntryMode,
    }),
  )
}

export function setLiveApiKey(apiKey: string, meta?: ShibuyaSessionMeta): void {
  localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, apiKey)

  const previous = getStoredSessionMeta() ?? {}
  const nextMeta = { ...previous, ...(meta ?? {}) }
  delete nextMeta.samplePreview

  if (nextMeta.tier === 'sample') {
    delete nextMeta.tier
  }
  if (nextMeta.offerKind === 'sample') {
    delete nextMeta.offerKind
  }
  if (nextMeta.caseStatus === 'sample_preview') {
    delete nextMeta.caseStatus
  }
  if (nextMeta.dataSource === 'sample_dataset') {
    delete nextMeta.dataSource
  }
  delete nextMeta.demoSource
  delete nextMeta.demoReportId
  delete nextMeta.demoArchetypeId
  delete nextMeta.demoAxisId
  delete nextMeta.demoReportSource
  delete nextMeta.demoEvidenceLabel
  delete nextMeta.demoValidationSummary
  delete nextMeta.demoStorySource
  delete nextMeta.demoSelectedPainAxisIds
  delete nextMeta.demoVisitedSceneCount
  delete nextMeta.demoSignalMarkerIds
  delete nextMeta.demoLockedSectionId
  delete nextMeta.demoLockedSectionTitle
  delete nextMeta.demoBridgeHeadline
  delete nextMeta.demoBridgeDecisionQuestion
  delete nextMeta.demoBridgeWhyNow
  delete nextMeta.demoBridgeLiveProof
  delete nextMeta.demoBridgePreviewShows
  delete nextMeta.demoPrivateGateChecksum
  delete nextMeta.demoEngagementReportViewCount
  delete nextMeta.demoEngagementLockedSectionClickCount
  delete nextMeta.demoEngagementCurrentSectionClickCount
  delete nextMeta.demoEngagementPrivateDemoIntentCount
  delete nextMeta.demoEngagementBoundary
  delete nextMeta.demoUnlockReceiptId
  delete nextMeta.demoUnlockBoundary
  delete nextMeta.demoEntryMode

  if (Object.keys(nextMeta).length > 0) {
    localStorage.setItem(SHIBUYA_SESSION_META_STORAGE_KEY, JSON.stringify(nextMeta))
  } else {
    localStorage.removeItem(SHIBUYA_SESSION_META_STORAGE_KEY)
  }
}

export function updateSessionMeta(meta: Partial<ShibuyaSessionMeta>): void {
  const previous = getStoredSessionMeta() ?? {}
  localStorage.setItem(SHIBUYA_SESSION_META_STORAGE_KEY, JSON.stringify({ ...previous, ...meta }))
}

export function clearShibuyaSession(): void {
  localStorage.removeItem(SHIBUYA_API_KEY_STORAGE_KEY)
  localStorage.removeItem(SHIBUYA_SESSION_META_STORAGE_KEY)
}
