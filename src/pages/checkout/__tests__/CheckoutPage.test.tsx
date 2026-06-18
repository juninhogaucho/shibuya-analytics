import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { buildPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
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
          'http://localhost:3000/checkout/success?plan=shibuya_reset_pro_monthly&source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&market=global',
        cancel_url:
          'http://localhost:3000/checkout/reset-pro-live?source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&market=global',
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
      },
    })
  })

  test('labels checkout intent as URL-only when no local report packet exists', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/checkout/reset-pro-live?source=locked_insight&section=highest-cost-state&report=missing-report&archetype=marco&axis=edge_decay&market=global',
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
  })
})
