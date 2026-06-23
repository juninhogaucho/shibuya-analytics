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
        activationMode: 'paid_order',
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
      activationMode: 'paid_order',
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

  test('refuses to persist dev demo activation as paid live proof', async () => {
    const { getActivationSessionProofError, persistVerifiedActivationSession } = await import('../auth')

    const response = {
      status: 'ready' as const,
      message: 'Demo activation successful.',
      activationToken: 'shibuya_demo_mode',
      customerId: 'shibuya_demo_001',
      activationMode: 'dev_demo',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global' as const,
      offerKind: 'dev_demo',
      caseStatus: 'dev_demo_only',
      dataSource: 'demo_activation',
    }

    expect(getActivationSessionProofError(response)).toContain('dev/demo activation')
    expect(() => persistVerifiedActivationSession(response, {
      email: 'demo@shibuya.trading',
      orderCode: 'shibuya_demo_mode',
    })).toThrow(/dev\/demo activation/i)
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
        activationMode: 'paid_order',
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
      activationMode: 'paid_order',
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
        activationMode: 'paid_order',
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
      activationMode: 'paid_order',
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

describe('login API boundary', () => {
  test('persists password login only with backend customer identity', async () => {
    const { login } = await import('../auth')

    httpPostMock.mockResolvedValueOnce({
      data: {
        success: true,
        api_key: 'live-password-token',
        customer_id: 'customer-password-123',
        authMode: 'password',
        tier: 'reset_pro',
      },
    })

    await expect(login({ email: 'founder@shibuya.test', password: 'StrongPassword123!' })).resolves.toMatchObject({
      success: true,
      api_key: 'live-password-token',
    })

    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe('live-password-token')
    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'customer-password-123',
      authMode: 'password',
      tier: 'reset_pro',
    })
  })

  test('persists self-register only with backend customer identity', async () => {
    const { register } = await import('../auth')

    httpPostMock.mockResolvedValueOnce({
      data: {
        success: true,
        api_key: 'live-register-token',
        customer_id: 'customer-register-123',
        authMode: 'self_register',
        tier: 'trial',
      },
    })

    await expect(register({
      email: 'new@shibuya.test',
      password: 'StrongPassword123!',
      name: 'New Trader',
    })).resolves.toMatchObject({
      success: true,
      api_key: 'live-register-token',
    })

    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe('live-register-token')
    expect(getStoredSessionMeta()).toMatchObject({
      customerId: 'customer-register-123',
      authMode: 'self_register',
      tier: 'trial',
    })
  })

  test('refuses successful login payload without backend customer identity', async () => {
    const { getLoginSessionProofError, login } = await import('../auth')

    const response = {
      success: true,
      api_key: 'live-login-without-customer',
      authMode: 'password',
      tier: 'reset_pro',
    }

    expect(getLoginSessionProofError(response)).toContain('backend customer identity')
    httpPostMock.mockResolvedValueOnce({ data: response })

    await expect(login({ email: 'founder@shibuya.test', password: 'StrongPassword123!' })).rejects.toThrow(
      /backend customer identity/i,
    )
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(getStoredSessionMeta()).toBeNull()
  })

  test('refuses successful login payload without a backend-verified login mode', async () => {
    const { getLoginSessionProofError, login } = await import('../auth')

    const response = {
      success: true,
      api_key: 'live-login-unknown-mode',
      customer_id: 'customer-login-unknown-mode',
      authMode: 'legacy_token',
      tier: 'reset_pro',
    }

    expect(getLoginSessionProofError(response)).toContain('backend-verified login mode')
    httpPostMock.mockResolvedValueOnce({ data: response })

    await expect(login({ email: 'founder@shibuya.test', password: 'StrongPassword123!' })).rejects.toThrow(
      /backend-verified login mode/i,
    )
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(getStoredSessionMeta()).toBeNull()
  })

  test('refuses dev demo login as live account proof', async () => {
    const { getLoginSessionProofError, login } = await import('../auth')

    const response = {
      success: true,
      api_key: 'shibuya_demo_mode',
      customer_id: 'shibuya_demo_001',
      authMode: 'dev_demo',
      tier: 'reset_pro',
    }

    expect(getLoginSessionProofError(response)).toContain('dev/demo login')
    httpPostMock.mockResolvedValueOnce({ data: response })

    await expect(login({ email: 'demo@shibuya.trading', password: 'anything' })).rejects.toThrow(/dev\/demo login/i)
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(getStoredSessionMeta()).toBeNull()
  })
})
