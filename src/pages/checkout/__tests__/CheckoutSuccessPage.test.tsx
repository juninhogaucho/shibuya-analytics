import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { CheckoutSessionStatus } from '../../../lib/api/checkout'
import CheckoutSuccessPage from '../CheckoutSuccessPage'

const checkoutMocks = vi.hoisted(() => ({
  getCheckoutSession: vi.fn(),
}))

vi.mock('../../../lib/api/checkout', () => ({
  getCheckoutSession: checkoutMocks.getCheckoutSession,
}))

function renderSuccessRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CheckoutSuccessPage />
    </MemoryRouter>,
  )
}

function storeCheckoutHint(overrides: Record<string, unknown> = {}) {
  window.localStorage.setItem(
    'shibuya_order',
    JSON.stringify({
      name: 'Luis',
      email: 'founder@shibuya.test',
      plan: 'Reset Pro',
      planId: 'shibuya_reset_pro_monthly',
      market: 'global',
      orderId: 'ord_success_123',
      sessionId: 'cs_test_123',
      timestamp: new Date().toISOString(),
      ...overrides,
    }),
  )
}

function verifiedBackendSession(overrides: Partial<CheckoutSessionStatus> = {}): CheckoutSessionStatus {
  return {
    session_id: 'cs_test_123',
    status: 'complete',
    payment_status: 'paid',
    customer_email: 'founder@shibuya.test',
    customer_name: 'Luis',
    order_id: 'ord_success_123',
    plan_id: 'shibuya_reset_pro_monthly',
    public_context_source: 'locked_insight',
    public_context_report_id: 'public-teaser-success-123',
    public_context_section_id: 'edge-decay-map',
    public_context_archetype_id: 'marco',
    public_context_axis_id: 'edge_decay',
    public_context_packet_source: 'backend_teaser',
    public_context_artifact_status: 'backend_teaser_persisted',
    public_context_production_artifact_proven: 'false',
    public_context_teaser_request_id: 'TEASER-verified',
    public_context_teaser_trades_analyzed: '12',
    public_context_teaser_worst_pattern: 'Tilt Spiral',
    public_context_teaser_verified: 'true',
    public_context_teaser_verification_status: 'verified',
    public_context_teaser_receipt_hash: 'f'.repeat(64),
    public_context_teaser_verified_at: '2026-06-21T10:00:00.000Z',
    public_context_story_source: 'guided',
    public_context_story_scene_count: '6',
    public_context_pain_axes: 'edge_decay,revenge_reentry',
    public_context_signal_markers: 'mirror_selected,upload_intent',
    public_context_report_views: '2',
    public_context_locked_clicks: '1',
    public_context_current_section_clicks: '1',
    public_context_private_gate_attempts: '1',
    ...overrides,
  }
}

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    checkoutMocks.getCheckoutSession.mockReset()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  test('blocks direct success route without a verified session', () => {
    renderSuccessRoute('/checkout/success?market=global')

    expect(screen.getByText('Checkout success route integrity')).toBeInTheDocument()
    expect(screen.getByText('Checkout record missing')).toBeInTheDocument()
    expect(screen.getByText(/cannot claim checkout completion without a verified session id/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Generate Free Report First/i })).toHaveAttribute('href', '/upload?market=global')
    expect(screen.getByRole('link', { name: /Return To Pricing/i })).toHaveAttribute('href', '/pricing?market=global')
    expect(screen.getByText(/the backend session must verify payment before this page can behave like a checkout receipt/i)).toBeInTheDocument()
    expect(screen.queryByText('Checkout Complete')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Activate Live Account/i })).not.toBeInTheDocument()
    expect(checkoutMocks.getCheckoutSession).not.toHaveBeenCalled()
  })

  test('carries activation context only from verified backend session metadata', async () => {
    storeCheckoutHint({
      checkoutIntent: {
        source: 'locked_insight',
        reportId: 'sample-free-report',
        lockedSectionId: 'highest-cost-state',
        archetypeId: 'marco',
        axisId: 'edge_decay',
        storySource: 'guided',
        visitedSceneCount: 5,
        selectedPainAxisIds: ['edge_decay'],
        signalMarkerIds: ['mirror_selected'],
      },
    })
    checkoutMocks.getCheckoutSession.mockResolvedValue(verifiedBackendSession())

    renderSuccessRoute('/checkout/success?market=global&session_id=cs_test_123')

    expect(await screen.findByText('Checkout Complete')).toBeInTheDocument()
    expect(checkoutMocks.getCheckoutSession).toHaveBeenCalledWith('cs_test_123')
    expect(screen.getByText('Carried into activation')).toBeInTheDocument()
    expect(screen.getByText('Locked private insight')).toBeInTheDocument()
    expect(screen.getByText('Module: edge-decay-map')).toBeInTheDocument()
    expect(screen.getByText('Report: public-teaser-success-123')).toBeInTheDocument()
    expect(screen.getByText('Signals: mirror_selected, upload_intent')).toBeInTheDocument()
    expect(screen.getByText('Backend verified public teaser receipt')).toBeInTheDocument()
    expect(screen.getByText(/Medallion verified teaser TEASER-verified before checkout success carried context forward/i)).toBeInTheDocument()
    expect(screen.getByText(/12 trades analyzed/i)).toBeInTheDocument()
    expect(screen.getByText(/Worst pattern: Tilt Spiral/i)).toBeInTheDocument()
    expect(screen.getByText(/Story handoff: guided; scenes 6; pain axes Edge Decay, Revenge Re-entry/i)).toBeInTheDocument()
    expect(screen.getByText(/Views 2; locked clicks 1; this module 1; private gate attempts 1/i)).toBeInTheDocument()
    expect(screen.queryByText('Report: sample-free-report')).not.toBeInTheDocument()
    const recentOrderAccess = JSON.parse(window.localStorage.getItem('shibuya_recent_order_access') ?? '{}')
    expect(recentOrderAccess).toMatchObject({
      email: 'founder@shibuya.test',
      orderCode: 'ord_success_123',
      market: 'global',
      planId: 'shibuya_reset_pro_monthly',
      activationHandoff: {
        source: 'checkout_success',
        checkoutIntent: {
          source: 'locked_insight',
          reportId: 'public-teaser-success-123',
          lockedSectionId: 'edge-decay-map',
          archetypeId: 'marco',
          axisId: 'edge_decay',
          storySource: 'guided',
          visitedSceneCount: 6,
          selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
          signalMarkerIds: ['mirror_selected', 'upload_intent'],
        },
        engagementSummary: {
          reportViewCount: 2,
          lockedSectionClickCount: 1,
          currentSectionClickCount: 1,
          privateDemoIntentCount: 1,
        },
        contextReceipt: {
          evidenceLabel: 'Backend verified public teaser receipt',
          artifactStatusLabel: 'Backend teaser persisted',
          productionArtifactProven: false,
          storySource: 'guided',
          visitedSceneCount: 6,
        },
      },
    })
    expect(recentOrderAccess.activationHandoff.verifiedAt).toEqual(expect.any(String))
    expect(recentOrderAccess.activationHandoff.contextReceipt.validationSummary).toContain('Medallion verified teaser TEASER-verified')
    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?source=locked_insight&report=public-teaser-success-123&section=edge-decay-map&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay%2Crevenge_reentry&signals=mirror_selected%2Cupload_intent&market=global',
    )
  })

  test('does not show checkout success or activation when backend session is unpaid', async () => {
    storeCheckoutHint()
    checkoutMocks.getCheckoutSession.mockResolvedValue({
      session_id: 'cs_test_123',
      status: 'open',
      payment_status: 'unpaid',
    } satisfies CheckoutSessionStatus)

    renderSuccessRoute('/checkout/success?market=global')

    expect(await screen.findByText('Payment Pending')).toBeInTheDocument()
    expect(screen.getByText(/Payment has not completed yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Return To Pricing/i })).toHaveAttribute('href', '/pricing?market=global')
    expect(screen.queryByText('Checkout Complete')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Activate Live Account/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_recent_order_access')).toBeNull()
  })

  test('does not show checkout success when checkout is complete but payment is unpaid', async () => {
    storeCheckoutHint()
    checkoutMocks.getCheckoutSession.mockResolvedValue(verifiedBackendSession({
      status: 'complete',
      payment_status: 'unpaid',
    }))

    renderSuccessRoute('/checkout/success?market=global&session_id=cs_test_123')

    expect(await screen.findByText('Payment Pending')).toBeInTheDocument()
    expect(screen.getByText(/Payment has not completed yet/i)).toBeInTheDocument()
    expect(screen.queryByText('Checkout Complete')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Activate Live Account/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_recent_order_access')).toBeNull()
  })

  test('does not show checkout success when payment is paid but checkout session is still open', async () => {
    storeCheckoutHint()
    checkoutMocks.getCheckoutSession.mockResolvedValue(verifiedBackendSession({
      status: 'open',
      payment_status: 'paid',
    }))

    renderSuccessRoute('/checkout/success?market=global&session_id=cs_test_123')

    expect(await screen.findByText('Payment Pending')).toBeInTheDocument()
    expect(screen.getByText(/Payment has not completed yet/i)).toBeInTheDocument()
    expect(screen.queryByText('Checkout Complete')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Activate Live Account/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_recent_order_access')).toBeNull()
  })

  test('does not use local checkout hints as activation access when paid session lacks backend identifiers', async () => {
    storeCheckoutHint({
      email: 'local-only@shibuya.test',
      orderId: 'ord_local_only',
      planId: 'shibuya_reset_pro_monthly',
    })
    checkoutMocks.getCheckoutSession.mockResolvedValue(verifiedBackendSession({
      customer_email: undefined,
      order_id: undefined,
      plan_id: undefined,
    }))

    renderSuccessRoute('/checkout/success?market=global')

    expect(await screen.findByText('Payment Pending')).toBeInTheDocument()
    expect(screen.getByText(/did not return the order, customer, and plan identifiers required for activation/i)).toBeInTheDocument()
    expect(screen.queryByText('Checkout Complete')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Activate Live Account/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('shibuya_recent_order_access')).toBeNull()
  })

  test('does not carry URL-only context when paid session lacks verified teaser metadata', async () => {
    checkoutMocks.getCheckoutSession.mockResolvedValue(verifiedBackendSession({
      public_context_source: null,
      public_context_report_id: null,
      public_context_section_id: null,
      public_context_packet_source: null,
      public_context_artifact_status: null,
      public_context_teaser_verified: null,
      public_context_teaser_verification_status: null,
      public_context_teaser_receipt_hash: null,
    }))

    renderSuccessRoute('/checkout/success?market=global&session_id=cs_test_123&source=locked_insight&report=url-report&section=url-section&demo_packet=launcher_sample')

    expect(await screen.findByText('Checkout Complete')).toBeInTheDocument()
    expect(screen.getByText('Activation context not carried')).toBeInTheDocument()
    expect(screen.getByText('URL-only checkout context is visible, but not trusted.')).toBeInTheDocument()
    expect(screen.getByText(/will not carry route text into activation/i)).toBeInTheDocument()
    expect(screen.getByText(/Blocked route context: report url-report; section url-section; source locked_insight/i)).toBeInTheDocument()
    expect(screen.queryByText('Carried into activation')).not.toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('shibuya_recent_order_access') ?? '{}')).not.toHaveProperty('activationHandoff')
    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?market=global',
    )
  })

  test('does not carry backend teaser context when proof counts are malformed', async () => {
    checkoutMocks.getCheckoutSession.mockResolvedValue(verifiedBackendSession({
      public_context_teaser_trades_analyzed: '12abc',
    }))

    renderSuccessRoute('/checkout/success?market=global&session_id=cs_test_123&source=locked_insight&report=url-report&section=url-section')

    expect(await screen.findByText('Checkout Complete')).toBeInTheDocument()
    expect(screen.getByText('Activation context not carried')).toBeInTheDocument()
    expect(screen.getByText('URL-only checkout context is visible, but not trusted.')).toBeInTheDocument()
    expect(screen.queryByText('Carried into activation')).not.toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('shibuya_recent_order_access') ?? '{}')).not.toHaveProperty('activationHandoff')
    expect(screen.getByRole('link', { name: /Activate Live Account/i })).toHaveAttribute(
      'href',
      '/activate?market=global',
    )
  })
})
