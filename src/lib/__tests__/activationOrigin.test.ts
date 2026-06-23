import { describe, expect, test } from 'vitest'
import {
  buildActivationResponsePublicContextMeta,
  buildDashboardActivationOriginMeta,
  hasVerifiedActivationResponsePublicContext,
  hasVerifiedDashboardActivationOrigin,
} from '../activationOrigin'
import type { ActivationResponse, DashboardActivationOrigin } from '../types'

const VERIFIED_ACTIVATION_RESPONSE: ActivationResponse = {
  status: 'ready',
  message: 'Activation verified.',
  activationToken: 'live-token-verified',
  customerId: 'customer-verified',
  activationMode: 'paid_order',
  publicContextSource: 'locked_insight',
  publicContextReportId: 'public-teaser-verified',
  publicContextSectionId: 'edge-decay-map',
  publicContextArchetypeId: 'marco',
  publicContextAxisId: 'edge_decay',
  publicContextPacketSource: 'backend_teaser',
  publicContextArtifactStatus: 'backend_teaser_persisted',
  publicContextProductionArtifactProven: 'false',
  publicContextTeaserRequestId: 'TEASER-verified',
  publicContextTeaserTradesAnalyzed: '12',
  publicContextTeaserWorstPattern: 'Tilt Expansion',
  publicContextTeaserVerified: 'true',
  publicContextTeaserVerificationStatus: 'verified',
  publicContextTeaserReceiptHash: 'a'.repeat(64),
  publicContextTeaserVerifiedAt: '2026-06-21T00:00:00Z',
  publicContextStorySource: 'guided',
  publicContextStorySceneCount: '6',
  publicContextPainAxes: 'edge_decay,revenge_reentry',
  publicContextSignalMarkers: 'mirror_selected,upload_intent',
  publicContextReportViews: '2',
  publicContextLockedClicks: '1',
  publicContextCurrentSectionClicks: '1',
  publicContextPrivateGateAttempts: '1',
}

const VERIFIED_DASHBOARD_ORIGIN: DashboardActivationOrigin = {
  source: 'locked_insight',
  report_id: 'public-teaser-verified',
  section_id: 'edge-decay-map',
  archetype_id: 'marco',
  axis_id: 'edge_decay',
  packet_source: 'backend_teaser',
  artifact_status: 'backend_teaser_persisted',
  production_artifact_proven: 'false',
  teaser_request_id: 'TEASER-verified',
  teaser_trades_analyzed: '12',
  teaser_worst_pattern: 'Tilt Expansion',
  teaser_verified: 'true',
  teaser_verification_status: 'verified',
  teaser_receipt_hash: 'b'.repeat(64),
  teaser_verified_at: '2026-06-21T00:00:00Z',
  story_source: 'guided',
  story_scene_count: '6',
  pain_axes: 'edge_decay,revenge_reentry',
  signal_markers: 'mirror_selected,upload_intent',
  report_views: '2',
  locked_clicks: '1',
  current_section_clicks: '1',
  private_gate_attempts: '1',
}

describe('activation origin proof boundary', () => {
  test('accepts verified backend activation context only with canonical story identity', () => {
    expect(hasVerifiedActivationResponsePublicContext(VERIFIED_ACTIVATION_RESPONSE)).toBe(true)
    expect(buildActivationResponsePublicContextMeta(VERIFIED_ACTIVATION_RESPONSE)).toMatchObject({
      activationReportId: 'public-teaser-verified',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationSelectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationOriginSyncStatus: 'activation_order_verified',
    })

    const staleAxisResponse = {
      ...VERIFIED_ACTIVATION_RESPONSE,
      publicContextAxisId: 'revenge',
      publicContextPainAxes: 'edge_decay,revenge',
    }

    expect(hasVerifiedActivationResponsePublicContext(staleAxisResponse)).toBe(false)
    expect(buildActivationResponsePublicContextMeta(staleAxisResponse)).toEqual({})
  })

  test('rejects dashboard activation origins with unknown public story markers', () => {
    expect(hasVerifiedDashboardActivationOrigin(VERIFIED_DASHBOARD_ORIGIN)).toBe(true)
    expect(buildDashboardActivationOriginMeta(VERIFIED_DASHBOARD_ORIGIN)).toMatchObject({
      activationReportId: 'public-teaser-verified',
      activationArchetypeId: 'marco',
      activationAxisId: 'edge_decay',
      activationSignalMarkerIds: ['mirror_selected', 'upload_intent'],
      activationOriginSyncStatus: 'dashboard_origin_verified',
    })

    const unknownMarkerOrigin = {
      ...VERIFIED_DASHBOARD_ORIGIN,
      signal_markers: 'mirror_selected,fake_marker',
    }

    expect(hasVerifiedDashboardActivationOrigin(unknownMarkerOrigin)).toBe(false)
    expect(buildDashboardActivationOriginMeta(unknownMarkerOrigin)).toEqual({})
  })
})
