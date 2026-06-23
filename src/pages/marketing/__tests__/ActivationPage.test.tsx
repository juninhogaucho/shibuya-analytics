import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { recordLockedSectionIntent, recordPrivateDemoIntent, recordPublicReportView } from '../../../lib/publicReportEngagement'
import { buildPublicReportSession, getPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import { rememberRecentOrderAccess } from '../../../lib/recentAccess'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import { ActivationPage } from '../ActivationPage'

const apiMocks = vi.hoisted(() => ({
  verifyActivation: vi.fn(),
  logTraderLifecycleEvent: vi.fn(),
}))

vi.mock('../../../lib/api/auth', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/api/auth')>('../../../lib/api/auth')
  return {
    ...actual,
    verifyActivation: (...args: unknown[]) => apiMocks.verifyActivation(...args),
  }
})

vi.mock('../../../lib/api/trader', () => ({
  logTraderLifecycleEvent: (...args: unknown[]) => apiMocks.logTraderLifecycleEvent(...args),
}))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

describe('ActivationPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    apiMocks.verifyActivation.mockReset()
    apiMocks.logTraderLifecycleEvent.mockReset()
    apiMocks.logTraderLifecycleEvent.mockResolvedValue(undefined)
  })

  test('shows local locked insight context but does not write it without backend order metadata', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-123',
      customerId: 'customer-123',
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
    })
    persistPublicReportSession(buildPublicReportSession({
      reportId: 'sample-free-report',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      source: 'sample',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      // Deliberately supplied to prove sample sessions cannot smuggle backend teaser proof into activation.
      backendTeaser: {
        status: 'success',
        report_type: 'teaser',
        request_id: 'TEASER-route-123',
        trades_analyzed: 10,
        headline: {
          discipline_tax: 420,
          worst_pattern: 'Revenge Trading',
        },
      },
    }))
    recordPublicReportView('sample-free-report')
    recordLockedSectionIntent('sample-free-report', 'highest-cost-state')
    recordPrivateDemoIntent('sample-free-report')

    render(
      <MemoryRouter
        initialEntries={[
          '/activate?source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&market=global',
        ]}
      >
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText('LOCKED PRIVATE INSIGHT CONTEXT REQUEST ATTACHED')).toBeInTheDocument()
    expect(screen.getByText(/Activation will request "Highest-cost state"/i)).toBeInTheDocument()
    expect(screen.getByText(/stored after submit only if the backend order verifies a persisted teaser receipt/i)).toBeInTheDocument()
    expect(screen.getByText(/Report: sample-free-report \| Archetype: Marco \| Axis: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Public packet: Sample history packet \| Story: guided \| Scenes: 6 \| Pain axes: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Public signal markers: Mirror selected, Evidence intent/i)).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro bridge: Is the trader defending a setup that no longer deserves the same risk/i)).toBeInTheDocument()
    expect(screen.getByText('ACTIVATION ENGAGEMENT RECEIPT')).toBeInTheDocument()
    expect(screen.getByText(/Views 1; locked clicks 1; this module 1; private gate attempts 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Report engagement is local route continuity only/i)).toBeInTheDocument()
    expect(screen.getByText('LIVE ACTIVATION PROOF LADDER')).toBeInTheDocument()
    expect(screen.getByText('LIVE PROOF READINESS')).toBeInTheDocument()
    expect(screen.getByText('Before activation can become live proof.')).toBeInTheDocument()
    expect(screen.getByText('Backend target')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload')).toBeInTheDocument()
    expect(screen.getByText(/requested payment context, backend-verified activation context, first upload evidence, and append history/i)).toBeInTheDocument()
    expect(screen.getByText('Payment context requested')).toBeInTheDocument()
    expect(screen.getByText('Activation pending')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload required')).toBeInTheDocument()
    expect(screen.getByText('Append proof close required')).toBeInTheDocument()
    expect(screen.getByText('Private conclusion still locked')).toBeInTheDocument()
    expect(screen.getByText(/APPEND PROOF CLOSE:/i)).toBeInTheDocument()
    expect(screen.getByText(/repeated account history must confirm or reject/i)).toBeInTheDocument()
    expect(screen.getByText(/Email plus order code must verify/i)).toBeInTheDocument()
    expect(screen.getByText(/uploaded history is normalized into generated artifacts/i)).toBeInTheDocument()
    expect(screen.getByText(/paid activation still needs append history/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_123')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      customerId: 'customer-123',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      orderId: 'order_123',
      activationMode: 'paid_order',
    })
    const storedSessionMeta = JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')
    expect(storedSessionMeta).not.toHaveProperty('activationSource')
    expect(storedSessionMeta).not.toHaveProperty('activationReportId')
    expect(storedSessionMeta).not.toHaveProperty('activationReportArtifactStatus')
    expect(storedSessionMeta).not.toHaveProperty('activationStorySource')
    expect(storedSessionMeta).not.toHaveProperty('activationSelectedPainAxisIds')
    expect(storedSessionMeta).not.toHaveProperty('activationLockedSectionId')
    expect(storedSessionMeta).not.toHaveProperty('activationBridgeDecisionQuestion')
    expect(storedSessionMeta).not.toHaveProperty('activationEngagementReportViewCount')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserRequestId')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserTradesAnalyzed')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserWorstPattern')
    expect(apiMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          orderCode: 'order_123',
          activationMode: 'paid_order',
          passwordRequired: false,
        }),
      }),
    )
    const lifecycleMetadata = apiMocks.logTraderLifecycleEvent.mock.calls[0][0].metadata
    expect(lifecycleMetadata.activationSource).toBeUndefined()
    expect(lifecycleMetadata.activationReportId).toBeUndefined()
    expect(lifecycleMetadata.activationReportArtifactStatus).toBeUndefined()
    expect(lifecycleMetadata.activationStorySource).toBeUndefined()
    expect(lifecycleMetadata.activationLockedSectionId).toBeUndefined()
    expect(lifecycleMetadata.activationBridgeQuestion).toBeUndefined()
    expect(lifecycleMetadata.activationEngagementReportViewCount).toBeUndefined()
    expect(lifecycleMetadata.activationTeaserRequestId).toBeUndefined()
    expect(lifecycleMetadata.activationTeaserTradesAnalyzed).toBeUndefined()
    expect(lifecycleMetadata.activationTeaserWorstPattern).toBeUndefined()
  })

  test('does not carry URL-only story context into live activation metadata', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-123',
      customerId: 'customer-123',
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/activate?source=locked_insight&report=missing-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent&market=global',
        ]}
      >
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText('ACTIVATION CONTEXT NOT CARRIED')).toBeInTheDocument()
    expect(screen.getByText(/URL-only activation context is visible on this link/i)).toBeInTheDocument()
    expect(screen.getByText(/will not be written into the live workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/Activation can still verify the email and order code/i)).toBeInTheDocument()
    expect(screen.queryByText(/Public packet: URL context only/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Reset Pro bridge:/i)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_123')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })

    const storedSessionMeta = JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')
    expect(storedSessionMeta).toMatchObject({
      customerId: 'customer-123',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      orderId: 'order_123',
      activationMode: 'paid_order',
    })
    expect(storedSessionMeta).not.toHaveProperty('activationSource')
    expect(storedSessionMeta).not.toHaveProperty('activationReportId')
    expect(storedSessionMeta).not.toHaveProperty('activationStorySource')
    expect(storedSessionMeta).not.toHaveProperty('activationLockedSectionId')
    expect(storedSessionMeta).not.toHaveProperty('activationBridgeDecisionQuestion')
  })

  test('previews checkout-success handoff without using it as live activation proof', async () => {
    const user = userEvent.setup()
    rememberRecentOrderAccess({
      email: 'founder@shibuya.test',
      orderCode: 'order_verified_checkout',
      market: 'global',
      planId: 'shibuya_reset_pro_monthly',
      planName: 'shibuya_reset_pro_monthly',
      activationHandoff: {
        source: 'checkout_success',
        verifiedAt: '2026-06-23T00:00:00.000Z',
        checkoutIntent: {
          source: 'locked_insight',
          reportId: 'public-teaser-success-123',
          lockedSectionId: 'edge-decay-map',
          archetypeId: 'marco',
          axisId: 'edge_decay',
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
        engagementSummary: {
          reportViewCount: 2,
          lockedSectionClickCount: 1,
          currentSectionClickCount: 1,
          privateDemoIntentCount: 1,
          boundary: 'Checkout engagement came from verified backend order metadata. It still does not prove live upload, generated artifacts, or account-specific improvement.',
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Backend teaser persisted',
          productionArtifactProven: false,
          validationSummary: 'Medallion verified teaser TEASER-verified before checkout success carried context forward. 12 trades analyzed. Worst pattern: Tilt Spiral. This proves public teaser continuity only; live private conclusions still require activation and upload.',
          storySource: 'guided',
          visitedSceneCount: 6,
        },
      },
    })
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-verified-checkout-preview',
      customerId: 'customer-preview',
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/activate?source=locked_insight&report=public-teaser-success-123&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay,revenge_reentry&signals=mirror_selected,upload_intent&market=global',
        ]}
      >
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText('LOCKED PRIVATE INSIGHT CONTEXT REQUEST ATTACHED')).toBeInTheDocument()
    expect(screen.getByText(/Checkout success verified this public teaser handoff at 2026-06-23T00:00:00.000Z/i)).toBeInTheDocument()
    expect(screen.getByText(/Public packet: Backend verified public teaser receipt \| Story: guided \| Scenes: 6 \| Pain axes: Edge Decay, Revenge Re-entry/i)).toBeInTheDocument()
    expect(screen.getByText(/Checkout context receipt: Medallion verified teaser TEASER-verified/i)).toBeInTheDocument()
    expect(screen.getByText(/Views 2; locked clicks 1; this module 1; private gate attempts 1/i)).toBeInTheDocument()
    expect(screen.getByText(/verified checkout-success handoff; activation backend must reverify/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })

    const storedSessionMeta = JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')
    expect(storedSessionMeta).toMatchObject({
      customerId: 'customer-preview',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      orderId: 'order_verified_checkout',
      activationMode: 'paid_order',
    })
    expect(storedSessionMeta).not.toHaveProperty('activationSource')
    expect(storedSessionMeta).not.toHaveProperty('activationReportId')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserRequestId')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserReceiptHash')
    expect(apiMocks.logTraderLifecycleEvent.mock.calls[0][0].metadata.activationReportId).toBeUndefined()
  })

  test('blocks ready activation responses that lack backend customer identity', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-without-customer',
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
    })

    render(
      <MemoryRouter initialEntries={['/activate?market=global']}>
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_missing_customer')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    expect(await screen.findByText(/backend customer identity/i)).toBeInTheDocument()
    expect(screen.getByText(/No live workspace session was created/i)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/activate?market=global')
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY)).toBeNull()
    expect(apiMocks.logTraderLifecycleEvent).not.toHaveBeenCalled()
  })

  test('drops unverified backend public checkout context when local report receipt is absent', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-456',
      customerId: 'customer-456',
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
      publicContextSource: 'locked_insight',
      publicContextReportId: 'report_public_123',
      publicContextSectionId: 'edge-decay-map',
      publicContextArchetypeId: 'marco',
      publicContextAxisId: 'edge_decay',
      publicContextArtifactStatus: 'local_preview_only',
      publicContextProductionArtifactProven: 'false',
      publicContextStorySource: 'guided',
      publicContextStorySceneCount: '6',
      publicContextPainAxes: 'edge_decay,revenge',
      publicContextSignalMarkers: 'mirror_selected,upload_intent',
      publicContextReportViews: '2',
      publicContextLockedClicks: '1',
      publicContextCurrentSectionClicks: '1',
      publicContextPrivateGateAttempts: '1',
      publicContextTeaserRequestId: 'TEASER-backend-456',
      publicContextTeaserTradesAnalyzed: '12',
      publicContextTeaserWorstPattern: 'Tilt Expansion',
      publicContextTeaserVerified: 'true',
      publicContextTeaserVerificationStatus: 'verified',
      publicContextTeaserReceiptHash: 'receipt-hash-456',
      publicContextTeaserVerifiedAt: '2026-06-20T00:00:00Z',
    })

    render(
      <MemoryRouter initialEntries={['/activate?market=global']}>
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_456')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      customerId: 'customer-456',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      orderId: 'order_456',
      activationMode: 'paid_order',
    })
    const storedSessionMeta = JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')
    expect(storedSessionMeta).not.toHaveProperty('activationSource')
    expect(storedSessionMeta).not.toHaveProperty('activationReportId')
    expect(storedSessionMeta).not.toHaveProperty('activationReportArtifactStatus')
    expect(storedSessionMeta).not.toHaveProperty('activationStorySource')
    expect(storedSessionMeta).not.toHaveProperty('activationLockedSectionId')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserRequestId')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserVerificationStatus')
    expect(storedSessionMeta).not.toHaveProperty('activationTeaserReceiptHash')
    expect(apiMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          orderCode: 'order_456',
          activationSource: undefined,
          activationReportId: undefined,
          activationReportArtifactStatus: undefined,
          activationStorySource: undefined,
          activationLockedSectionId: undefined,
          activationTeaserRequestId: undefined,
          activationTeaserVerificationStatus: undefined,
          activationTeaserReceiptHash: undefined,
        }),
      }),
    )
  })

  test('prefers backend activation context over stale browser report context', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-authoritative',
      customerId: 'customer-authoritative',
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
      publicContextSource: 'locked_insight',
      publicContextReportId: 'backend-report-authoritative',
      publicContextSectionId: 'edge-decay-map',
      publicContextArchetypeId: 'marco',
      publicContextAxisId: 'edge_decay',
      publicContextPacketSource: 'backend_teaser',
      publicContextArtifactStatus: 'backend_teaser_persisted',
      publicContextProductionArtifactProven: 'false',
      publicContextStorySource: 'guided',
      publicContextStorySceneCount: '3',
      publicContextPainAxes: 'edge_decay',
      publicContextSignalMarkers: 'mirror_selected',
      publicContextReportViews: '4',
      publicContextLockedClicks: '2',
      publicContextCurrentSectionClicks: '1',
      publicContextPrivateGateAttempts: '0',
      publicContextTeaserRequestId: 'TEASER-authoritative',
      publicContextTeaserTradesAnalyzed: '18',
      publicContextTeaserWorstPattern: 'Edge Decay',
      publicContextTeaserVerified: 'true',
      publicContextTeaserVerificationStatus: 'verified',
      publicContextTeaserReceiptHash: 'd'.repeat(64),
      publicContextTeaserVerifiedAt: '2026-06-21T00:00:00Z',
    })
    persistPublicReportSession(buildPublicReportSession({
      reportId: 'stale-local-report',
      market: 'global',
      archetypeId: 'priya',
      axisId: 'drawdown_pressure',
      source: 'sample',
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    }))
    recordPublicReportView('stale-local-report')
    recordLockedSectionIntent('stale-local-report', 'highest-cost-state')

    render(
      <MemoryRouter
        initialEntries={[
          '/activate?source=locked_insight&report=stale-local-report&section=highest-cost-state&archetype=priya&axis=drawdown_pressure&story=guided&scene_count=6&pain_axes=drawdown_pressure&signals=mirror_selected,upload_intent&market=global',
        ]}
      >
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Report: stale-local-report \| Archetype: Priya \| Axis: Drawdown Pressure/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_authoritative')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })

    const storedSessionMeta = JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')
    expect(storedSessionMeta).toMatchObject({
      customerId: 'customer-authoritative',
      orderId: 'order_authoritative',
      activationMode: 'paid_order',
      activationSource: 'locked_insight',
      activationReportId: 'backend-report-authoritative',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'backend_teaser_persisted',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 3,
      activationSignalMarkerIds: ['mirror_selected'],
      activationLockedSectionId: 'edge-decay-map',
      activationTeaserRequestId: 'TEASER-authoritative',
      activationTeaserTradesAnalyzed: 18,
      activationTeaserWorstPattern: 'Edge Decay',
      activationTeaserVerified: 'true',
      activationTeaserVerificationStatus: 'verified',
      activationTeaserReceiptHash: 'd'.repeat(64),
    })
    expect(storedSessionMeta.activationReportId).not.toBe('stale-local-report')
    expect(storedSessionMeta.activationAxisId).not.toBe('drawdown_pressure')
    expect(storedSessionMeta.activationLockedSectionId).not.toBe('highest-cost-state')
  })

  test('uses explicit demo launcher sample packet on direct activation links', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/activate?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent&market=global',
        ]}
      >
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/Public packet: Demo launcher sample packet \| Story: guided \| Scenes: 6 \| Pain axes: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Public signal markers: Mirror selected, Evidence intent/i)).toBeInTheDocument()
    expect(screen.getByText('LIVE ACTIVATION PROOF LADDER')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload required')).toBeInTheDocument()
    expect(screen.getByText('Append proof close required')).toBeInTheDocument()

    await waitFor(() => {
      expect(getPublicReportSession('sample-behavioral-leak-report')?.evidenceLabel).toBe('Demo launcher sample packet')
    })
  })
})
