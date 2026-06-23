import { render, screen } from '@testing-library/react'
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
  vi.doMock('../../../lib/api/auth', async () => {
    const actual = await vi.importActual<typeof import('../../../lib/api/auth')>('../../../lib/api/auth')
    return {
      ...actual,
      verifyActivation: (...args: unknown[]) => journeyMocks.verifyActivation(...args),
    }
  })
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
      activationMode: 'paid_order',
      tier: 'reset_pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      offerKind: 'reset_pro_live',
      caseStatus: 'awaiting_upload',
      passwordRequired: false,
      publicContextSource: 'locked_insight',
      publicContextReportId: 'sample-behavioral-leak-report',
      publicContextSectionId: 'highest-cost-state',
      publicContextArchetypeId: 'marco',
      publicContextAxisId: 'edge_decay',
      publicContextArtifactStatus: 'sample_demo_only',
      publicContextProductionArtifactProven: 'false',
      publicContextStorySource: 'guided',
      publicContextStorySceneCount: '6',
      publicContextPainAxes: 'edge_decay',
      publicContextSignalMarkers: 'mirror_selected,upload_intent',
      publicContextReportViews: '1',
      publicContextLockedClicks: '1',
      publicContextCurrentSectionClicks: '1',
      publicContextPrivateGateAttempts: '0',
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

  test('sample public story context reaches checkout boundary but cannot create paid handoff', async () => {
    const user = userEvent.setup()
    const {
      CheckoutPage,
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
    expect(screen.getAllByText(/Demo packet accepted/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('link', { name: /Unlock with Reset Pro/i }))
    expect(screen.getByText('Checkout intent')).toBeInTheDocument()
    expect(screen.getByText('Persisted backend teaser receipt required before payment.')).toBeInTheDocument()
    expect(screen.getByText(/Local sample packets, URL context, and presenter demo packets cannot create paid live context/i)).toBeInTheDocument()
    expect(screen.getByText('Locked private insight')).toBeInTheDocument()
    expect(screen.getByText('Module: highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText('Signals: mirror_selected, upload_intent')).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 6; axes 1/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout-grade receipt: missing')).toBeInTheDocument()
    expect(screen.getByText(/shown for continuity only/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue to Secure Checkout/i })).toBeDisabled()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    expect(journeyMocks.createCheckoutSession).not.toHaveBeenCalled()
    expect(journeyMocks.redirectBrowser).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('shibuya_order')).toBeNull()
    expect(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY)).toBeNull()
    expect(journeyMocks.verifyActivation).not.toHaveBeenCalled()
    expect(journeyMocks.logTraderLifecycleEvent).not.toHaveBeenCalled()

    firstRender.unmount()
  })
})
