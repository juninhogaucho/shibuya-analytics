import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import CheckoutSuccessPage from '../CheckoutSuccessPage'

vi.mock('../../../lib/api/checkout', () => ({
  getCheckoutSession: vi.fn(),
}))

describe('CheckoutSuccessPage', () => {
  test('keeps locked insight context attached to activation after checkout', () => {
    window.localStorage.setItem(
      'shibuya_order',
      JSON.stringify({
        name: 'Luis',
        email: 'founder@shibuya.test',
        plan: 'Reset Pro',
        planId: 'shibuya_reset_pro_monthly',
        market: 'global',
        orderId: 'order_123',
        sessionId: 'cs_test_123',
        checkoutIntent: {
          source: 'locked_insight',
          reportId: 'sample-free-report',
          lockedSectionId: 'highest-cost-state',
          archetypeId: 'marco',
          axisId: 'edge_decay',
        },
        timestamp: new Date().toISOString(),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/checkout/success?market=global']}>
        <CheckoutSuccessPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carried into activation')).toBeInTheDocument()
    expect(screen.getByText('Locked private insight')).toBeInTheDocument()
    expect(screen.getByText('Module: highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText('Report: sample-free-report')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&market=global',
    )
  })
})
