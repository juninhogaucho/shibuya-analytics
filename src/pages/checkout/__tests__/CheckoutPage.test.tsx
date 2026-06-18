import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { buildDemoLauncherSampleReportSession, buildPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import CheckoutPage from '../CheckoutPage'

const checkoutMocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
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

describe('CheckoutPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    checkoutMocks.createCheckoutSession.mockReset()
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

  test('preserves locked insight context in checkout URLs and stored order state', async () => {
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
    }))

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
    expect(screen.getByText('Locked private insight')).toBeInTheDocument()
    expect(screen.getByText('Module: highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText('Archetype: marco')).toBeInTheDocument()
    expect(screen.getByText('Axis: edge_decay')).toBeInTheDocument()
    expect(screen.getByText('Story: guided')).toBeInTheDocument()
    expect(screen.getByText('Scenes: 5')).toBeInTheDocument()
    expect(screen.getByText('Pain axes: edge_decay')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 5; axes 1/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    await waitFor(() => {
      expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledTimes(1)
    })

    expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_id: 'shibuya_reset_pro_monthly',
        email: 'founder@shibuya.test',
        name: 'Luis Shibuya',
        success_url:
          'http://localhost:3000/checkout/success?plan=shibuya_reset_pro_monthly&source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=5&pain_axes=edge_decay&market=global',
        cancel_url:
          'http://localhost:3000/checkout/reset-pro-live?source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=5&pain_axes=edge_decay&market=global',
        public_context_source: 'locked_insight',
        public_context_report_id: 'sample-free-report',
        public_context_section_id: 'highest-cost-state',
        public_context_archetype_id: 'marco',
        public_context_axis_id: 'edge_decay',
        public_context_packet_source: 'sample',
        public_context_story_source: 'guided',
        public_context_story_scene_count: '5',
        public_context_pain_axes: 'edge_decay',
      }),
    )
    expect(checkoutMocks.redirectBrowser).toHaveBeenCalledWith('https://checkout.stripe.test/session_123')

    expect(JSON.parse(window.localStorage.getItem('shibuya_order') ?? '{}')).toMatchObject({
      name: 'Luis Shibuya',
      email: 'founder@shibuya.test',
      plan: 'Reset Pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      tier: 'reset_pro',
      orderId: 'order_123',
      sessionId: 'cs_test_123',
      checkoutIntent: {
        source: 'locked_insight',
        reportId: 'sample-free-report',
        lockedSectionId: 'highest-cost-state',
        archetypeId: 'marco',
        axisId: 'edge_decay',
        storySource: 'guided',
        visitedSceneCount: 5,
        selectedPainAxisIds: ['edge_decay'],
      },
    })
  })

  test('labels checkout intent as URL-only when no local report packet exists', () => {
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
    expect(screen.getByText('URL context only')).toBeInTheDocument()
    expect(screen.getByText(/not upload-step evidence/i)).toBeInTheDocument()
    expect(screen.getByText('Story: guided')).toBeInTheDocument()
    expect(screen.getByText('Scenes: 6')).toBeInTheDocument()
    expect(screen.getByText('Pain axes: edge_decay')).toBeInTheDocument()

    return user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
      .then(() => user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test'))
      .then(() => user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i })))
      .then(() => waitFor(() => {
        expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledWith(
          expect.objectContaining({
            public_context_source: 'locked_insight',
            public_context_report_id: 'missing-report',
            public_context_section_id: 'highest-cost-state',
            public_context_archetype_id: 'marco',
            public_context_axis_id: 'edge_decay',
            public_context_packet_source: undefined,
            public_context_story_source: 'guided',
            public_context_story_scene_count: '6',
            public_context_pain_axes: 'edge_decay',
          }),
        )
      }))
  })

  test('preserves explicit demo launcher sample flag in checkout return URLs', async () => {
    const user = userEvent.setup()
    persistPublicReportSession(buildDemoLauncherSampleReportSession({
      reportId: 'sample-behavioral-leak-report',
      market: 'global',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      storySource: 'guided',
      selectedPainAxisIds: ['edge_decay'],
      visitedSceneCount: 6,
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

    await user.type(screen.getByLabelText(/Full Name/i), 'Luis Shibuya')
    await user.type(screen.getByLabelText(/Email Address/i), 'founder@shibuya.test')
    await user.click(screen.getByRole('button', { name: /Continue to Secure Checkout/i }))

    await waitFor(() => {
      expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledTimes(1)
    })

    expect(checkoutMocks.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          'http://localhost:3000/checkout/success?plan=shibuya_reset_pro_monthly&source=locked_insight&report=sample-behavioral-leak-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&demo_packet=launcher_sample&market=global',
        cancel_url:
          'http://localhost:3000/checkout/reset-pro-live?source=locked_insight&report=sample-behavioral-leak-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&demo_packet=launcher_sample&market=global',
      }),
    )
  })
})
