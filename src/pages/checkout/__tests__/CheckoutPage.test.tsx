import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { recordLockedSectionIntent, recordPrivateDemoIntent, recordPublicReportView } from '../../../lib/publicReportEngagement'
import { buildDemoLauncherSampleReportSession, buildPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import CheckoutPage from '../CheckoutPage'

const checkoutMocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
  getPublicTeaserReport: vi.fn(),
  redirectBrowser: vi.fn(),
  trackAffiliateClick: vi.fn(),
  validatePromoCode: vi.fn(),
}))

vi.mock('../../../lib/api/checkout', () => ({
  createCheckoutSession: (...args: unknown[]) => checkoutMocks.createCheckoutSession(...args),
  trackAffiliateClick: (...args: unknown[]) => checkoutMocks.trackAffiliateClick(...args),
  validatePromoCode: (...args: unknown[]) => checkoutMocks.validatePromoCode(...args),
}))

vi.mock('../../../lib/browserNavigation', () => ({
  redirectBrowser: (...args: unknown[]) => checkoutMocks.redirectBrowser(...args),
}))

vi.mock('../../../lib/api/publicReport', () => ({
  getPublicTeaserReport: (...args: unknown[]) => checkoutMocks.getPublicTeaserReport(...args),
}))

describe('CheckoutPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    checkoutMocks.createCheckoutSession.mockReset()
    checkoutMocks.getPublicTeaserReport.mockReset()
    checkoutMocks.redirectBrowser.mockReset()
    checkoutMocks.trackAffiliateClick.mockReset()
    checkoutMocks.validatePromoCode.mockReset()
    checkoutMocks.trackAffiliateClick.mockResolvedValue(undefined)
    checkoutMocks.createCheckoutSession.mockResolvedValue({
      checkout_url: 'https://checkout.stripe.test/session_123',
      session_id: 'cs_test_123',
      order_id: 'order_123',
    })
  })

  test('blocks cold checkout without locked insight route context', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/checkout/reset-pro-live?market=global']}>
        <Routes>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Checkout route integrity')).toBeInTheDocument()
    expect(screen.getByText('Persisted backend teaser receipt required before payment.')).toBeInTheDocument()
    expect(screen.getByText(/URL context, and presenter demo packets cannot create paid live context/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Generate Free Report First/i })).toHaveAttribute('href', '/upload?market=global')
    expect(screen.getByRole('link', { name: /Return To Pricing/i })).toHaveAttribute('href', '/pricing?market=global')
    expect(screen.getByRole('link', { name: /Back to Pricing/i })).toHaveAttribute('href', '/pricing?market=global')
    expect(screen.getByRole('button', { name: /Continue to Secure Checkout/i })).toBeDisabled()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    expect(checkoutMocks.createCheckoutSession).not.toHaveBeenCalled()
    expect(checkoutMocks.redirectBrowser).not.toHaveBeenCalled()
  })

  test('blocks sample locked insight context from paid checkout', async () => {
    const user = userEvent.setup()
    persistPublicReportSession(buildPublicReportSession({
      reportId: 'sample-free-report',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      source: 'sample',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 5,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      // Deliberately supplied to prove sample sessions cannot smuggle backend teaser proof into checkout.
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
          '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=sample-free-report&archetype=marco&axis=edge_decay&market=global',
        ]}
      >
        <Routes>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Checkout intent')).toBeInTheDocument()
    expect(screen.getByText('Checkout route integrity')).toBeInTheDocument()
    expect(screen.getByText('Persisted backend teaser receipt required before payment.')).toBeInTheDocument()
    expect(screen.getByText(/Local sample packets, URL context, and presenter demo packets cannot create paid live context/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to Pricing/i })).toHaveAttribute(
      'href',
      '/pricing?source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=5&pain_axes=edge_decay&signals=mirror_selected%2Cupload_intent&market=global',
    )
    expect(screen.getByText('Locked private insight')).toBeInTheDocument()
    expect(screen.getByText('Module: highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText('Archetype: marco')).toBeInTheDocument()
    expect(screen.getByText('Axis: edge_decay')).toBeInTheDocument()
    expect(screen.getByText('Story: guided')).toBeInTheDocument()
    expect(screen.getByText('Scenes: 5')).toBeInTheDocument()
    expect(screen.getByText('Pain axes: edge_decay')).toBeInTheDocument()
    expect(screen.getByText('Signals: mirror_selected, upload_intent')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Artifact status: Sample demo only \/ Live\/private artifact: not proven/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout-grade receipt: missing')).toBeInTheDocument()
    expect(screen.getByText(/shown for continuity only/i)).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 5; axes 1/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout engagement receipt')).toBeInTheDocument()
    expect(screen.getByText(/Views 1; locked clicks 1; this module 1; private gate attempts 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Report engagement is local route continuity only/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout handoff contract')).toBeInTheDocument()
    expect(screen.getByText('Payment can carry')).toBeInTheDocument()
    expect(screen.getByText('Payment cannot prove')).toBeInTheDocument()
    expect(screen.getByText(/Live activation, normalized trade history, generated backend artifacts/i)).toBeInTheDocument()
    expect(screen.getByText('Next live proof step')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    expect(screen.getByRole('button', { name: /Continue to Secure Checkout/i })).toBeDisabled()
    expect(checkoutMocks.createCheckoutSession).not.toHaveBeenCalled()
    expect(checkoutMocks.redirectBrowser).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('shibuya_order')).toBeNull()
  })

  test('sends persisted backend teaser context into checkout verification payload', async () => {
    const user = userEvent.setup()
    persistPublicReportSession(buildPublicReportSession({
      reportId: 'public-teaser-checkout-123',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      source: 'backend_teaser',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
      backendTeaser: {
        status: 'success',
        report_type: 'teaser',
        report_id: 'public-teaser-checkout-123',
        request_id: 'TEASER-checkout-123',
        artifact_status: 'backend_teaser_persisted',
        production_artifact_proven: false,
        receipt_hash: 'b'.repeat(64),
        trades_analyzed: 14,
        headline: {
          discipline_tax: 510,
          worst_pattern: 'Tilt Spiral',
        },
      },
    }))
    recordPublicReportView('public-teaser-checkout-123')
    recordLockedSectionIntent('public-teaser-checkout-123', 'edge-decay-map')

    render(
      <MemoryRouter
        initialEntries={[
          '/checkout/reset-pro-live?source=locked_insight&section=edge-decay-map&report=public-teaser-checkout-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay,revenge_reentry&signals=mirror_selected,upload_intent&market=global',
        ]}
      >
        <Routes>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Persisted public report receipt verified.')).toBeInTheDocument()
    expect(screen.getByText('Persisted backend teaser receipt')).toBeInTheDocument()
    expect(screen.getByText(/Artifact status: Backend teaser persisted \/ Live\/private artifact: not proven/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout-grade receipt: verified persisted backend teaser')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    await waitFor(() => {
      expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledTimes(1)
    })

    const checkoutPayload = checkoutMocks.createCheckoutSession.mock.calls[0][0]
    expect(checkoutPayload).toMatchObject({
      plan_id: 'shibuya_reset_pro_monthly',
      email: 'founder@shibuya.test',
      name: 'Luis Shibuya',
      public_context_source: 'locked_insight',
      public_context_report_id: 'public-teaser-checkout-123',
      public_context_section_id: 'edge-decay-map',
      public_context_archetype_id: 'marco',
      public_context_axis_id: 'edge_decay',
      public_context_packet_source: 'backend_teaser',
      public_context_artifact_status: 'backend_teaser_persisted',
      public_context_production_artifact_proven: 'false',
      public_context_teaser_request_id: 'TEASER-checkout-123',
      public_context_teaser_trades_analyzed: '14',
      public_context_teaser_worst_pattern: 'Tilt Spiral',
      public_context_story_source: 'guided',
      public_context_story_scene_count: '6',
      public_context_pain_axes: 'edge_decay,revenge_reentry',
      public_context_signal_markers: 'mirror_selected,upload_intent',
      public_context_report_views: '1',
      public_context_locked_clicks: '1',
      public_context_current_section_clicks: '1',
      public_context_private_gate_attempts: '0',
    })
    expect(checkoutPayload).not.toHaveProperty('public_context_teaser_receipt_hash')
    expect(window.localStorage.getItem('shibuya_recent_order_access')).toBeNull()
    expect(checkoutMocks.redirectBrowser).toHaveBeenCalledWith('https://checkout.stripe.test/session_123')
  })

  test('recovers a persisted backend teaser receipt before checkout when local report storage is missing', async () => {
    const user = userEvent.setup()
    checkoutMocks.getPublicTeaserReport.mockResolvedValue({
      status: 'success',
      report_type: 'teaser',
      report_id: 'public-teaser-cross-device-123',
      request_id: 'TEASER-cross-device-123',
      artifact_status: 'backend_teaser_persisted',
      production_artifact_proven: false,
      receipt_hash: 'c'.repeat(64),
      trades_analyzed: 16,
      headline: {
        discipline_tax: 630,
        worst_pattern: 'Edge Decay',
      },
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/checkout/reset-pro-live?source=locked_insight&section=edge-decay-map&report=public-teaser-cross-device-123&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay,revenge_reentry&signals=mirror_selected,upload_intent&market=global',
        ]}
      >
        <Routes>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Persisted backend teaser receipt required before payment.')).toBeInTheDocument()
    expect(screen.getByText(/No local public report packet was found in this browser/i)).toBeInTheDocument()

    expect(await screen.findByText('Persisted public report receipt verified.')).toBeInTheDocument()
    expect(screen.getByText(/Recovered persisted backend teaser receipt from Medallion/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout-grade receipt: verified persisted backend teaser')).toBeInTheDocument()
    expect(checkoutMocks.getPublicTeaserReport).toHaveBeenCalledWith('public-teaser-cross-device-123')

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    await waitFor(() => {
      expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledTimes(1)
    })

    const checkoutPayload = checkoutMocks.createCheckoutSession.mock.calls[0][0]
    expect(checkoutPayload).toMatchObject({
      plan_id: 'shibuya_reset_pro_monthly',
      email: 'founder@shibuya.test',
      name: 'Luis Shibuya',
      public_context_source: 'locked_insight',
      public_context_report_id: 'public-teaser-cross-device-123',
      public_context_section_id: 'edge-decay-map',
      public_context_archetype_id: 'marco',
      public_context_axis_id: 'edge_decay',
      public_context_packet_source: 'backend_teaser',
      public_context_artifact_status: 'backend_teaser_persisted',
      public_context_production_artifact_proven: 'false',
      public_context_teaser_request_id: 'TEASER-cross-device-123',
      public_context_teaser_trades_analyzed: '16',
      public_context_teaser_worst_pattern: 'Edge Decay',
      public_context_story_source: 'guided',
      public_context_story_scene_count: '6',
      public_context_pain_axes: 'edge_decay,revenge_reentry',
      public_context_signal_markers: 'mirror_selected,upload_intent',
      public_context_report_views: '0',
      public_context_locked_clicks: '0',
      public_context_current_section_clicks: '0',
      public_context_private_gate_attempts: '0',
    })
    expect(checkoutPayload).not.toHaveProperty('public_context_teaser_receipt_hash')
    expect(window.localStorage.getItem('shibuya_recent_order_access')).toBeNull()
    expect(checkoutMocks.redirectBrowser).toHaveBeenCalledWith('https://checkout.stripe.test/session_123')
  })

  test('blocks URL-only locked insight checkout without a persisted teaser receipt', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter
        initialEntries={[
          '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=missing-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
        ]}
      >
        <Routes>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Checkout intent')).toBeInTheDocument()
    expect(screen.getByText('Persisted backend teaser receipt required before payment.')).toBeInTheDocument()
    expect(screen.getByText(/URL context, and presenter demo packets cannot create paid live context/i)).toBeInTheDocument()
    expect(screen.getByText('URL context only')).toBeInTheDocument()
    expect(screen.getByText(/not upload-step evidence/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout-grade receipt: missing')).toBeInTheDocument()
    expect(screen.getByText('Story: guided')).toBeInTheDocument()
    expect(screen.getByText('Scenes: 6')).toBeInTheDocument()
    expect(screen.getByText('Pain axes: edge_decay')).toBeInTheDocument()
    expect(screen.getByText('Checkout handoff contract')).toBeInTheDocument()
    expect(screen.getByText(/Payment cannot prove/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue to Secure Checkout/i })).toBeDisabled()
    expect(checkoutMocks.getPublicTeaserReport).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    expect(checkoutMocks.createCheckoutSession).not.toHaveBeenCalled()
    expect(checkoutMocks.redirectBrowser).not.toHaveBeenCalled()
  })

  test('blocks explicit demo launcher sample packet from paid checkout', async () => {
    const user = userEvent.setup()
    persistPublicReportSession(buildDemoLauncherSampleReportSession({
      reportId: 'sample-behavioral-leak-report',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    }))

    render(
      <MemoryRouter
        initialEntries={[
          '/checkout/reset-pro-live?demo_packet=launcher_sample&source=locked_insight&section=edge-decay-map&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
        ]}
      >
        <Routes>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Persisted backend teaser receipt required before payment.')).toBeInTheDocument()
    expect(screen.getByText(/presenter demo packets cannot create paid live context/i)).toBeInTheDocument()
    expect(screen.getByText('Checkout-grade receipt: missing')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    expect(screen.getByRole('button', { name: /Continue to Secure Checkout/i })).toBeDisabled()
    expect(checkoutMocks.createCheckoutSession).not.toHaveBeenCalled()
    expect(checkoutMocks.redirectBrowser).not.toHaveBeenCalled()
    expect(checkoutMocks.getPublicTeaserReport).not.toHaveBeenCalled()
  })
})
