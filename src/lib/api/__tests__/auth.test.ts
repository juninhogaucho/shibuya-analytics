import { afterEach, describe, expect, test, vi } from 'vitest'
import { getStoredSessionMeta, SHIBUYA_API_KEY_STORAGE_KEY } from '../../runtime'

const httpPostMock = vi.fn()

vi.mock('../httpClient', () => ({
  http: {
    post: (...args: unknown[]) => httpPostMock(...args),
  },
}))

afterEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('activation API boundary', () => {
  test('verifyActivation is transport-only and does not create browser live state', async () => {
    const { verifyActivation } = await import('../auth')

    httpPostMock.mockResolvedValueOnce({
      data: {
        status: 'ready',
        message: 'Activation verified.',
        activationToken: 'live-token-weak',
        customerId: 'customer-weak',
        tier: 'reset_pro',
        planId: 'shibuya_reset_pro_monthly',
        market: 'global',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
        publicContextSource: 'locked_insight',
        publicContextReportId: 'local-report-123',
        publicContextSectionId: 'edge-decay-map',
        publicContextArchetypeId: 'marco',
        publicContextAxisId: 'edge_decay',
        publicContextPacketSource: 'guided_public_report',
        publicContextArtifactStatus: 'local_preview_only',
        publicContextProductionArtifactProven: 'false',
        publicContextTeaserRequestId: 'TEASER-weak',
        publicContextTeaserTradesAnalyzed: '12',
        publicContextTeaserWorstPattern: 'Tilt Expansion',
        publicContextTeaserVerified: 'true',
        publicContextTeaserVerificationStatus: 'verified',
        publicContextTeaserReceiptHash: 'not-a-hash',
        publicContextTeaserVerifiedAt: '2026-06-21T00:00:00Z',
      },
    })

    await expect(verifyActivation({ email: 'founder@shibuya.test', orderCode: 'order_weak' })).resolves.toMatchObject({
      status: 'ready',
      activationToken: 'live-token-weak',
    })

    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(getStoredSessionMeta()).toBeNull()
  })

  test('refuses to persist a ready activation without backend customer identity', async () => {
    const { getActivationSessionProofError, persistVerifiedActivationSession } = await import('../auth')

    const response = {
      status: 'ready' as const,
      message: 'Activation verified.',
      activationToken: 'live-token-without-customer',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global' as const,
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
    }

    expect(getActivationSessionProofError(response)).toContain('backend customer identity')
    expect(() => persistVerifiedActivationSession(response, {
      email: 'founder@shibuya.test',
      orderCode: 'order_missing_customer',
    })).toThrow(/backend customer identity/i)
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(getStoredSessionMeta()).toBeNull()
  })

  test('persists verified activation base state but drops weak public context', async () => {
    const { persistVerifiedActivationSession, verifyActivation } = await import('../auth')

    httpPostMock.mockResolvedValueOnce({
      data: {
        status: 'ready',
        message: 'Activation verified.',
        activationToken: 'live-token-weak',
        customerId: 'customer-weak',
        tier: 'reset_pro',
        planId: 'shibuya_reset_pro_monthly',
        market: 'global',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
        publicContextSource: 'locked_insight',
        publicContextReportId: 'local-report-123',
        publicContextSectionId: 'edge-decay-map',
        publicContextArchetypeId: 'marco',
        publicContextAxisId: 'edge_decay',
        publicContextPacketSource: 'guided_public_report',
        publicContextArtifactStatus: 'local_preview_only',
        publicContextProductionArtifactProven: 'false',
        publicContextTeaserRequestId: 'TEASER-weak',
        publicContextTeaserTradesAnalyzed: '12',
        publicContextTeaserWorstPattern: 'Tilt Expansion',
        publicContextTeaserVerified: 'true',
        publicContextTeaserVerificationStatus: 'verified',
        publicContextTeaserReceiptHash: 'not-a-hash',
        publicContextTeaserVerifiedAt: '2026-06-21T00:00:00Z',
      },
    })

    const payload = { email: 'founder@shibuya.test', orderCode: 'order_weak' }
    const response = await verifyActivation(payload)
    expect(persistVerifiedActivationSession(response, payload)).toBe(true)

    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe('live-token-weak')
    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'customer-weak',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      orderId: 'order_weak',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
    })
    expect(getStoredSessionMeta()?.activationReportId).toBeUndefined()
    expect(getStoredSessionMeta()?.activationTeaserRequestId).toBeUndefined()
    expect(getStoredSessionMeta()?.activationTeaserReceiptHash).toBeUndefined()
  })

  test('persists verified backend teaser activation context', async () => {
    const { persistVerifiedActivationSession, verifyActivation } = await import('../auth')

    httpPostMock.mockResolvedValueOnce({
      data: {
        status: 'ready',
        message: 'Activation verified.',
        activationToken: 'live-token-verified',
        customerId: 'customer-verified',
        tier: 'reset_pro',
        planId: 'shibuya_reset_pro_monthly',
        market: 'global',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
        publicContextSource: 'locked_insight',
        publicContextReportId: 'public-teaser-verified',
        publicContextSectionId: 'edge-decay-map',
        publicContextArchetypeId: 'marco',
        publicContextAxisId: 'edge_decay',
        publicContextPacketSource: 'backend_teaser',
        publicContextArtifactStatus: 'backend_teaser_persisted',
        publicContextProductionArtifactProven: 'false',
        publicContextStorySource: 'guided',
        publicContextStorySceneCount: '6',
        publicContextPainAxes: 'edge_decay,revenge_reentry',
        publicContextSignalMarkers: 'mirror_selected,upload_intent',
        publicContextReportViews: '2',
        publicContextLockedClicks: '1',
        publicContextCurrentSectionClicks: '1',
        publicContextPrivateGateAttempts: '1',
        publicContextTeaserRequestId: 'TEASER-verified',
        publicContextTeaserTradesAnalyzed: '12',
        publicContextTeaserWorstPattern: 'Tilt Expansion',
        publicContextTeaserVerified: 'true',
        publicContextTeaserVerificationStatus: 'verified',
        publicContextTeaserReceiptHash: 'a'.repeat(64),
        publicContextTeaserVerifiedAt: '2026-06-21T00:00:00Z',
      },
    })

    const payload = { email: 'founder@shibuya.test', orderCode: 'order_verified' }
    const response = await verifyActivation(payload)
    expect(persistVerifiedActivationSession(response, payload)).toBe(true)

    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'customer-verified',
      orderId: 'order_verified',
      activationSource: 'locked_insight',
      activationReportId: 'public-teaser-verified',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'backend_teaser_persisted',
      activationProductionArtifactProven: 'false',
      activationSelectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationLockedSectionId: 'edge-decay-map',
      activationEngagementReportViewCount: 2,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementCurrentSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
      activationEngagementBoundary: 'Activation context came from verified backend order metadata.',
      activationOriginSyncStatus: 'activation_order_verified',
      activationOriginSyncBoundary: 'Activation context came from verified backend order metadata.',
      activationTeaserRequestId: 'TEASER-verified',
      activationTeaserTradesAnalyzed: 12,
      activationTeaserWorstPattern: 'Tilt Expansion',
      activationTeaserVerified: 'true',
      activationTeaserVerificationStatus: 'verified',
      activationTeaserReceiptHash: 'a'.repeat(64),
      activationTeaserVerifiedAt: '2026-06-21T00:00:00Z',
    })
  })
})
