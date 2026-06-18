import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import { buildDemoLauncherSampleReportSession, buildPublicReportSession, persistPublicReportSession } from '../../../lib/publicReportSession'
import CheckoutSuccessPage from '../CheckoutSuccessPage'

vi.mock('../../../lib/api/checkout', () => ({
  getCheckoutSession: vi.fn(),
}))

describe('CheckoutSuccessPage', () => {
  test('keeps locked insight context attached to activation after checkout', () => {
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
    }))
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
          storySource: 'guided',
          visitedSceneCount: 5,
          selectedPainAxisIds: ['edge_decay'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
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
    expect(screen.getByText('Signals: mirror_selected, upload_intent')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 5; pain axes Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByText(/Activation boundary: payment can carry this context forward/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=sample-free-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=5&pain_axes=edge_decay&signals=mirror_selected%2Cupload_intent&market=global',
    )
  })

  test('shows URL-only boundary while preserving URL-carried story context', () => {
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
          reportId: 'missing-report',
          lockedSectionId: 'highest-cost-state',
          archetypeId: 'marco',
          axisId: 'edge_decay',
          storySource: 'guided',
          visitedSceneCount: 5,
          selectedPainAxisIds: ['edge_decay'],
          signalMarkerIds: ['mirror_selected'],
        },
        timestamp: new Date().toISOString(),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/checkout/success?market=global']}>
        <CheckoutSuccessPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('URL context only')).toBeInTheDocument()
    expect(screen.getByText(/not upload-step evidence/i)).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 5; pain axes Edge Decay/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=missing-report&section=highest-cost-state&archetype=marco&axis=edge_decay&story=guided&scene_count=5&pain_axes=edge_decay&signals=mirror_selected&market=global',
    )
  })

  test('preserves demo launcher sample flag into activation', () => {
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
          reportId: 'sample-behavioral-leak-report',
          lockedSectionId: 'edge-decay-map',
          archetypeId: 'marco',
          axisId: 'edge_decay',
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
        timestamp: new Date().toISOString(),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/checkout/success?market=global&demo_packet=launcher_sample']}>
        <CheckoutSuccessPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=sample-behavioral-leak-report&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cupload_intent&demo_packet=launcher_sample&market=global',
    )
  })
})
