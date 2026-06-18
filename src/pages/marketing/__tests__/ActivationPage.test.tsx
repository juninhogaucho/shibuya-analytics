import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
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
      activationLockedSectionId: 'highest-cost-state',
      activationLockedSectionTitle: 'Highest-cost state',
    })
    expect(apiMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          activationSource: 'locked_insight',
          activationReportId: 'sample-free-report',
          activationLockedSectionId: 'highest-cost-state',
        }),
      }),
    )
  })
})
