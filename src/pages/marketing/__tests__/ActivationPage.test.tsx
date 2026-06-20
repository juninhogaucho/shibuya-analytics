import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { recordLockedSectionIntent, recordPrivateDemoIntent, recordPublicReportView } from '../../../lib/publicReportEngagement'
import { buildPublicReportSession, getPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import { SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'
import { ActivationPage } from '../ActivationPage'

const apiMocks = vi.hoisted(() => ({
  verifyActivation: vi.fn(),
  logTraderLifecycleEvent: vi.fn(),
}))

vi.mock('../../../lib/api/auth', () => ({
  verifyActivation: (...args: unknown[]) => apiMocks.verifyActivation(...args),
}))

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

  test('preserves locked insight checkout intent into the live session metadata', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-123',
      customerId: 'customer-123',
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

    expect(screen.getByText('LOCKED PRIVATE INSIGHT CONTEXT DETECTED')).toBeInTheDocument()
    expect(screen.getByText(/Activation will carry "Highest-cost state"/i)).toBeInTheDocument()
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
    expect(screen.getByText(/what payment can carry, what first upload can evidence, and what append history must still prove/i)).toBeInTheDocument()
    expect(screen.getByText('Payment context carried')).toBeInTheDocument()
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
      activationSource: 'locked_insight',
      activationReportId: 'sample-free-report',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'sample_demo_only',
      activationProductionArtifactProven: 'false',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationLockedSectionId: 'highest-cost-state',
      activationLockedSectionTitle: 'Highest-cost state',
      activationBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
      activationBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
      activationEngagementReportViewCount: 1,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementCurrentSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
    })
    expect(apiMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          activationSource: 'locked_insight',
          activationReportId: 'sample-free-report',
          activationReportArtifactStatus: 'sample_demo_only',
          activationProductionArtifactProven: 'false',
          activationStorySource: 'guided',
          activationVisitedSceneCount: 6,
          activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
          activationLockedSectionId: 'highest-cost-state',
          activationBridgeQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
          activationEngagementReportViewCount: 1,
          activationEngagementLockedSectionClickCount: 1,
          activationEngagementCurrentSectionClickCount: 1,
          activationEngagementPrivateDemoIntentCount: 1,
        }),
      }),
    )
  })

  test('does not carry URL-only story context into live activation metadata', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-123',
      customerId: 'customer-123',
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
    })
    expect(storedSessionMeta).not.toHaveProperty('activationSource')
    expect(storedSessionMeta).not.toHaveProperty('activationReportId')
    expect(storedSessionMeta).not.toHaveProperty('activationStorySource')
    expect(storedSessionMeta).not.toHaveProperty('activationLockedSectionId')
    expect(storedSessionMeta).not.toHaveProperty('activationBridgeDecisionQuestion')
  })

  test('uses backend public checkout context when local report receipt is absent', async () => {
    const user = userEvent.setup()
    apiMocks.verifyActivation.mockResolvedValue({
      status: 'ready',
      activationToken: 'live-token-456',
      customerId: 'customer-456',
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
      activationSource: 'locked_insight',
      activationReportId: 'report_public_123',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationReportArtifactStatus: 'local_preview_only',
      activationProductionArtifactProven: 'false',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay', 'revenge'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationLockedSectionId: 'edge-decay-map',
      activationEngagementReportViewCount: 2,
      activationEngagementLockedSectionClickCount: 1,
      activationEngagementCurrentSectionClickCount: 1,
      activationEngagementPrivateDemoIntentCount: 1,
    })
    expect(apiMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          activationSource: 'locked_insight',
          activationReportId: 'report_public_123',
          activationReportArtifactStatus: 'local_preview_only',
          activationProductionArtifactProven: 'false',
          activationStorySource: 'guided',
          activationVisitedSceneCount: 6,
          activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
          activationLockedSectionId: 'edge-decay-map',
          activationEngagementReportViewCount: 2,
          activationEngagementLockedSectionClickCount: 1,
          activationEngagementCurrentSectionClickCount: 1,
          activationEngagementPrivateDemoIntentCount: 1,
        }),
      }),
    )
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
