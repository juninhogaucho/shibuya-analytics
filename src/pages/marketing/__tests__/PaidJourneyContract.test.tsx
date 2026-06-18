import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SHIBUYA_SESSION_META_STORAGE_KEY } from '../../../lib/runtime'

const journeyMocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
  getCheckoutSession: vi.fn(),
  redirectBrowser: vi.fn(),
  trackAffiliateClick: vi.fn(),
  validatePromoCode: vi.fn(),
  verifyActivation: vi.fn(),
  logTraderLifecycleEvent: vi.fn(),
}))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

async function importJourneyPages() {
  vi.resetModules()
  vi.doMock('../../../lib/api/checkout', () => ({
    createCheckoutSession: (...args: unknown[]) => journeyMocks.createCheckoutSession(...args),
    getCheckoutSession: (...args: unknown[]) => journeyMocks.getCheckoutSession(...args),
    trackAffiliateClick: (...args: unknown[]) => journeyMocks.trackAffiliateClick(...args),
    validatePromoCode: (...args: unknown[]) => journeyMocks.validatePromoCode(...args),
  }))
  vi.doMock('../../../lib/browserNavigation', () => ({
    redirectBrowser: (...args: unknown[]) => journeyMocks.redirectBrowser(...args),
  }))
  vi.doMock('../../../lib/api/auth', () => ({
    verifyActivation: (...args: unknown[]) => journeyMocks.verifyActivation(...args),
  }))
  vi.doMock('../../../lib/api/trader', () => ({
    logTraderLifecycleEvent: (...args: unknown[]) => journeyMocks.logTraderLifecycleEvent(...args),
  }))

  const [
    { default: CheckoutPage },
    { default: CheckoutSuccessPage },
    { ActivationPage },
    { default: FreeReportPage },
    { default: LockedInsightPage },
    { default: PublicUploadPage },
  ] = await Promise.all([
    import('../../checkout/CheckoutPage'),
    import('../../checkout/CheckoutSuccessPage'),
    import('../ActivationPage'),
    import('../FreeReportPage'),
    import('../LockedInsightPage'),
    import('../PublicUploadPage'),
  ])

  return {
    CheckoutPage,
    CheckoutSuccessPage,
    ActivationPage,
    FreeReportPage,
    LockedInsightPage,
    PublicUploadPage,
  }
}

describe('paid Shibuya journey contract', () => {
  beforeEach(() => {
    window.localStorage.clear()
    journeyMocks.createCheckoutSession.mockReset()
    journeyMocks.getCheckoutSession.mockReset()
    journeyMocks.redirectBrowser.mockReset()
    journeyMocks.trackAffiliateClick.mockReset()
    journeyMocks.validatePromoCode.mockReset()
    journeyMocks.verifyActivation.mockReset()
    journeyMocks.logTraderLifecycleEvent.mockReset()

    journeyMocks.trackAffiliateClick.mockResolvedValue(undefined)
    journeyMocks.createCheckoutSession.mockResolvedValue({
      checkout_url: 'https://checkout.stripe.test/session_123',
      session_id: 'cs_test_123',
      order_id: 'order_123',
    })
    journeyMocks.verifyActivation.mockResolvedValue({
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
    journeyMocks.logTraderLifecycleEvent.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.doUnmock('../../../lib/api/checkout')
    vi.doUnmock('../../../lib/browserNavigation')
    vi.doUnmock('../../../lib/api/auth')
    vi.doUnmock('../../../lib/api/trader')
    vi.resetModules()
  })

  test('public story context survives paid checkout success and live activation', async () => {
    const user = userEvent.setup()
    const {
      CheckoutPage,
      CheckoutSuccessPage,
      ActivationPage,
      FreeReportPage,
      LockedInsightPage,
      PublicUploadPage,
    } = await importJourneyPages()
    const firstRender = render(
      <MemoryRouter
        initialEntries={[
          '/upload?market=global&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected,upload_intent',
        ]}
      >
        <Routes>
          <Route path="/upload" element={<PublicUploadPage />} />
          <Route path="/report/:id" element={<FreeReportPage />} />
          <Route path="/insight/:section" element={<LockedInsightPage />} />
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText('Story handoff packet')).toBeInTheDocument()
    expect(screen.getByText('Guided StoryExperience route')).toBeInTheDocument()
    expect(screen.getByText('Scenes before upload')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Marco / Edge Decay')).toBeInTheDocument()
    expect(screen.getByText('Why this hypothesis followed you here')).toBeInTheDocument()
    expect(screen.getByText('Mirror selected')).toBeInTheDocument()
    expect(screen.getByText('Evidence intent')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Use Sample History/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/report/sample-behavioral-leak-report')
    expect(screen.getByText('Public story handoff: guided StoryExperience route.')).toBeInTheDocument()
    expect(screen.getByText('Selected public pain axes: Edge Decay.')).toBeInTheDocument()
    expect(screen.getByText('Website-level signal markers: Mirror selected, Evidence intent.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Unlock Highest-cost state/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/insight/highest-cost-state')
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Demo packet accepted/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Unlock with Reset Pro/i }))
    expect(screen.getByText('Checkout intent')).toBeInTheDocument()
    expect(screen.getByText('Locked private insight')).toBeInTheDocument()
    expect(screen.getByText('Module: highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText('Signals: mirror_selected, upload_intent')).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 6; axes 1/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    await waitFor(() => {
      expect(journeyMocks.createCheckoutSession).toHaveBeenCalledTimes(1)
    })
    expect(journeyMocks.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_id: 'shibuya_reset_pro_monthly',
        email: 'founder@shibuya.test',
        name: 'Luis Shibuya',
        public_context_source: 'locked_insight',
        public_context_report_id: 'sample-behavioral-leak-report',
        public_context_section_id: 'highest-cost-state',
        public_context_archetype_id: 'marco',
        public_context_axis_id: 'edge_decay',
        public_context_packet_source: 'sample',
        public_context_story_source: 'guided',
        public_context_story_scene_count: '6',
        public_context_pain_axes: 'edge_decay',
        public_context_signal_markers: 'mirror_selected,upload_intent',
      }),
    )
    expect(journeyMocks.redirectBrowser).toHaveBeenCalledWith('https://checkout.stripe.test/session_123')
    expect(JSON.parse(window.localStorage.getItem('shibuya_order') ?? '{}')).toMatchObject({
      email: 'founder@shibuya.test',
      orderId: 'order_123',
      sessionId: 'cs_test_123',
      checkoutIntent: {
        source: 'locked_insight',
        reportId: 'sample-behavioral-leak-report',
        lockedSectionId: 'highest-cost-state',
        archetypeId: 'marco',
        axisId: 'edge_decay',
        storySource: 'guided',
        visitedSceneCount: 6,
        selectedPainAxisIds: ['edge_decay'],
        signalMarkerIds: ['mirror_selected', 'upload_intent'],
      },
    })

    firstRender.unmount()

    render(
      <MemoryRouter initialEntries={['/checkout/success?market=global']}>
        <Routes>
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Live dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carried into activation')).toBeInTheDocument()
    expect(screen.getByText('Report: sample-behavioral-leak-report')).toBeInTheDocument()
    expect(screen.getByText('Signals: mirror_selected, upload_intent')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 6; pain axes Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Activation boundary: payment can carry this context forward/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Activate Live Account/i }))
    expect(screen.getByText('LOCKED PRIVATE INSIGHT CONTEXT DETECTED')).toBeInTheDocument()
    expect(screen.getByText(/Activation will carry "Highest-cost state"/i)).toBeInTheDocument()
    expect(screen.getByText(/Report: sample-behavioral-leak-report \| Archetype: Marco \| Axis: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Public packet: Sample history packet \| Story: guided \| Scenes: 6 \| Pain axes: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Public signal markers: Mirror selected, Evidence intent/i)).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/EMAIL_ADDRESS/i))
    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.clear(screen.getByLabelText(/ORDER_CODE/i))
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_123')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })
    expect(screen.getByText('Live dashboard route')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      customerId: 'customer-123',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      orderId: 'order_123',
      activationSource: 'locked_insight',
      activationReportId: 'sample-behavioral-leak-report',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationLockedSectionId: 'highest-cost-state',
      activationLockedSectionTitle: 'Highest-cost state',
    })
    expect(journeyMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'workspace_activated',
        metadata: expect.objectContaining({
          activationSource: 'locked_insight',
          activationReportId: 'sample-behavioral-leak-report',
          activationStorySource: 'guided',
          activationVisitedSceneCount: 6,
          activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
          activationLockedSectionId: 'highest-cost-state',
        }),
      }),
    )
  })
})
