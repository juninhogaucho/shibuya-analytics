import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { buildPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
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
    }))

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
    expect(screen.getByText(/Reset Pro bridge: Is the trader defending a setup that no longer deserves the same risk/i)).toBeInTheDocument()

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
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationLockedSectionId: 'highest-cost-state',
      activationLockedSectionTitle: 'Highest-cost state',
      activationBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
      activationBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
    })
    expect(apiMocks.logTraderLifecycleEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          activationSource: 'locked_insight',
          activationReportId: 'sample-free-report',
          activationStorySource: 'guided',
          activationVisitedSceneCount: 6,
          activationLockedSectionId: 'highest-cost-state',
          activationBridgeQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
        }),
      }),
    )
  })

  test('uses URL-carried story context when no local report packet exists', async () => {
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
          '/activate?source=locked_insight&report=missing-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&market=global',
        ]}
      >
        <Routes>
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Public packet: URL context only \| Story: guided \| Scenes: 6 \| Pain axes: Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro bridge: Is the trader defending a setup that no longer deserves the same risk/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/EMAIL_ADDRESS/i), 'founder@shibuya.test')
    await user.type(screen.getByLabelText(/ORDER_CODE/i), 'order_123')
    await user.click(screen.getByRole('button', { name: /UNLOCK LIVE WORKSPACE/i }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/dashboard?market=global')
    })

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      activationSource: 'locked_insight',
      activationReportId: 'missing-report',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationStorySource: 'guided',
      activationSelectedPainAxisIds: ['edge_decay'],
      activationVisitedSceneCount: 6,
      activationLockedSectionId: 'highest-cost-state',
      activationLockedSectionTitle: 'Highest-cost state',
      activationBridgeHeadline: 'Reset Pro should separate real edge decay from normal variance.',
      activationBridgeDecisionQuestion: 'Is the trader defending a setup that no longer deserves the same risk?',
    })
  })
})
