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
  getWorkspaceAccessState,
  hasPremiumAccess,
  hasPrivateResetProDemoReceipt,
  isResetProSamplePreview,
  requireLiveRuntime,
  setLiveApiKey,
} from '../runtime'

describe('shibuya runtime', () => {
  test('starts anonymous with no stored key', () => {
    expect(getStoredApiKey()).toBeNull()
    expect(getShibuyaRuntimeMode()).toBe('anonymous')
    expect(getWorkspaceAccessState()).toMatchObject({
      ok: false,
      mode: 'anonymous',
      reason: 'anonymous',
      redirectPath: '/activate',
    })
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
    expect(hasPrivateResetProDemoReceipt()).toBe(false)
    expect(getWorkspaceAccessState()).toMatchObject({
      ok: false,
      mode: 'sample',
      reason: 'sample_without_private_gate',
      redirectPath: '/private-demo?market=india',
    })
  })

  test('can enter a Reset Pro sample preview without pretending to be live', () => {
    enterSampleMode({
      market: 'global',
      preview: 'reset_pro',
      demoSource: 'free_report',
      demoReportId: 'free-report-123',
      demoArchetypeId: 'priya',
      demoAxisId: 'drawdown_pressure',
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Sample history packet',
      demoValidationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoVisitedSceneCount: 4,
      demoSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      demoLockedSectionId: 'highest-cost-state',
      demoLockedSectionTitle: 'Highest-cost state',
      demoPrivateGateChecksum: 'source=free_report; report=free-report-123; section=highest-cost-state | archetype=priya; axis=drawdown_pressure | story=guided; scene_count=4; pain_axes=drawdown_pressure; signals=mirror_selected,upload_intent | sample route, not live answer',
      demoEngagementReportViewCount: 2,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementCurrentSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
      demoEngagementBoundary: 'Report engagement is local route continuity only.',
      demoEntryMode: 'append_proof_shortcut',
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
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Sample history packet',
      demoValidationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoVisitedSceneCount: 4,
      demoSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      demoLockedSectionId: 'highest-cost-state',
      demoLockedSectionTitle: 'Highest-cost state',
      demoPrivateGateChecksum: 'source=free_report; report=free-report-123; section=highest-cost-state | archetype=priya; axis=drawdown_pressure | story=guided; scene_count=4; pain_axes=drawdown_pressure; signals=mirror_selected,upload_intent | sample route, not live answer',
      demoEngagementReportViewCount: 2,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementCurrentSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
      demoEngagementBoundary: 'Report engagement is local route continuity only.',
      demoEntryMode: 'append_proof_shortcut',
    })
    expect(getShibuyaRuntimeMode()).toBe('sample')
    expect(isResetProSamplePreview()).toBe(true)
    expect(hasPremiumAccess()).toBe(true)
    expect(hasPrivateResetProDemoReceipt()).toBe(false)
    expect(getWorkspaceAccessState()).toMatchObject({
      ok: false,
      mode: 'sample',
      market: 'global',
      reason: 'sample_without_private_gate',
      redirectPath: '/private-demo?market=global',
    })
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
    expect(getWorkspaceAccessState()).toMatchObject({
      ok: true,
      mode: 'live',
      reason: 'live_session',
    })
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
      demoReportSource: 'sample',
      demoEvidenceLabel: 'Sample history packet',
      demoValidationSummary: 'Demo packet accepted.',
      demoStorySource: 'guided',
      demoSelectedPainAxisIds: ['drawdown_pressure'],
      demoVisitedSceneCount: 4,
      demoSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      demoLockedSectionId: 'highest-cost-state',
      demoLockedSectionTitle: 'Highest-cost state',
      demoPrivateGateChecksum: 'source=free_report; report=free-report-123; section=highest-cost-state | archetype=priya; axis=drawdown_pressure | story=guided; scene_count=4; pain_axes=drawdown_pressure; signals=mirror_selected,upload_intent | sample route, not live answer',
      demoEngagementReportViewCount: 2,
      demoEngagementLockedSectionClickCount: 1,
      demoEngagementCurrentSectionClickCount: 1,
      demoEngagementPrivateDemoIntentCount: 1,
      demoEngagementBoundary: 'Report engagement is local route continuity only.',
      demoEntryMode: 'append_proof_shortcut',
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
    expect(getStoredSessionMeta()?.demoReportSource).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEvidenceLabel).toBeUndefined()
    expect(getStoredSessionMeta()?.demoValidationSummary).toBeUndefined()
    expect(getStoredSessionMeta()?.demoStorySource).toBeUndefined()
    expect(getStoredSessionMeta()?.demoSelectedPainAxisIds).toBeUndefined()
    expect(getStoredSessionMeta()?.demoVisitedSceneCount).toBeUndefined()
    expect(getStoredSessionMeta()?.demoSignalMarkerIds).toBeUndefined()
    expect(getStoredSessionMeta()?.demoLockedSectionId).toBeUndefined()
    expect(getStoredSessionMeta()?.demoLockedSectionTitle).toBeUndefined()
    expect(getStoredSessionMeta()?.demoPrivateGateChecksum).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEngagementReportViewCount).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEngagementLockedSectionClickCount).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEngagementCurrentSectionClickCount).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEngagementPrivateDemoIntentCount).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEngagementBoundary).toBeUndefined()
    expect(getStoredSessionMeta()?.demoEntryMode).toBeUndefined()
  })

  test('clears stale live account context when partial live metadata is supplied', () => {
    setLiveApiKey('live_old', {
      customerId: 'customer_old',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      orderId: 'order_old',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      traderMode: 'profitable_refiner',
      nextAction: 'upload_first_history',
      accessExpiresAt: '2026-07-01T00:00:00Z',
      dataSource: 'backend',
      activationSource: 'locked_insight',
      activationReportId: 'old-report',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'backend_teaser_generated',
      activationProductionArtifactProven: 'false',
      activationTeaserRequestId: 'TEASER-old',
      activationTeaserTradesAnalyzed: 10,
      activationTeaserWorstPattern: 'Revenge Trading',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected'],
      activationLockedSectionId: 'edge-decay-map',
      activationLockedSectionTitle: 'Edge decay map',
      activationBridgeHeadline: 'Old bridge',
      activationBridgeDecisionQuestion: 'Old question?',
      activationBridgeWhyNow: 'Old why now.',
      activationBridgeLiveProof: ['Old upload proof'],
      activationEngagementReportViewCount: 2,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementCurrentSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
      activationEngagementBoundary: 'Old route continuity only.',
    })

    setLiveApiKey('live_new', { tier: 'psych_audit' })

    const session = getStoredSessionMeta()
    expect(getStoredApiKey()).toBe('live_new')
    expect(session).toMatchObject({ tier: 'psych_audit' })
    expect(session?.customerId).toBeUndefined()
    expect(session?.planId).toBeUndefined()
    expect(session?.orderId).toBeUndefined()
    expect(session?.offerKind).toBeUndefined()
    expect(session?.caseStatus).toBeUndefined()
    expect(session?.activationSource).toBeUndefined()
    expect(session?.activationReportId).toBeUndefined()
    expect(session?.activationTeaserRequestId).toBeUndefined()
    expect(session?.activationBridgeDecisionQuestion).toBeUndefined()
    expect(session?.activationEngagementReportViewCount).toBeUndefined()
  })

  test('preserves live session context when only the api key is refreshed', () => {
    setLiveApiKey('live_old', {
      customerId: 'customer_old',
      tier: 'reset_pro',
      activationSource: 'locked_insight',
      activationReportId: 'old-report',
      activationBridgeDecisionQuestion: 'Is the trader defending a setup?',
    })

    setLiveApiKey('live_refreshed')

    expect(getStoredApiKey()).toBe('live_refreshed')
    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'customer_old',
      tier: 'reset_pro',
      activationSource: 'locked_insight',
      activationReportId: 'old-report',
      activationBridgeDecisionQuestion: 'Is the trader defending a setup?',
    })
  })

  test('allows private Reset Pro sample workspace only with a gate receipt', () => {
    enterSampleMode({
      market: 'global',
      preview: 'reset_pro',
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoPrivateGateChecksum: 'source=locked_insight; report=sample-behavioral-leak-report; sample route, not live answer',
      demoUnlockReceiptId: 'reset-pro-demo:global:locked-insight:sample-behavioral-leak-report:marco:edge-decay:edge-decay-map',
      demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only.',
    })

    expect(hasPrivateResetProDemoReceipt()).toBe(true)
    expect(getWorkspaceAccessState()).toMatchObject({
      ok: true,
      mode: 'sample',
      market: 'global',
      reason: 'private_demo_receipt',
    })
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
