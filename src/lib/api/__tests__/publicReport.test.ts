import { describe, expect, test } from 'vitest'
import {
  validatePublicTeaserReportReadiness,
  validatePublicTeaserStoryContextAgainstReadiness,
  type PublicTeaserReportReadinessResponse,
} from '../publicReport'

const STORY_IDENTITY_ALLOWED_VALUES = {
  markets: ['global', 'india'],
  story_sources: ['direct', 'guided'],
  archetype_ids: ['john', 'marco', 'priya'],
  axis_ids: [
    'discipline_tax',
    'drawdown_pressure',
    'early_exit_bias',
    'edge_decay',
    'revenge_reentry',
    'session_fatigue',
    'size_escalation',
    'tilt_susceptibility',
  ],
  pain_axis_ids: [
    'discipline_tax',
    'drawdown_pressure',
    'early_exit_bias',
    'edge_decay',
    'revenge_reentry',
    'session_fatigue',
    'size_escalation',
    'tilt_susceptibility',
  ],
  signal_marker_ids: [
    'mirror_selected',
    'pain_axis_selected',
    'pricing_curiosity',
    'scene_depth_deep',
    'scene_depth_light',
    'upload_intent',
  ],
}

const READY_READINESS: PublicTeaserReportReadinessResponse = {
  status: 'ready',
  service: 'shibuya-public-teaser-report',
  accepts_csv_upload: true,
  persists_teaser_receipts: true,
  retrieves_teaser_receipts: true,
  report_type: 'teaser',
  artifact_status_required: 'backend_teaser_persisted',
  production_artifact_proven: false,
  raw_trade_rows_stored: false,
  live_private_artifact_proven: false,
  persists_story_identity: true,
  story_identity_fields: ['market', 'story_source', 'archetype_id', 'axis_id', 'pain_axes', 'story_scene_count', 'signal_markers'],
  story_identity_allowed_values: STORY_IDENTITY_ALLOWED_VALUES,
  min_trade_rows: 10,
  max_file_size_mb: 5,
  retrieval_identity: ['report_id', 'request_id'],
  blockers: [],
}

describe('public report API contract', () => {
  test('accepts readiness only when Medallion can persist checkout-grade teaser receipts', () => {
    expect(validatePublicTeaserReportReadiness(READY_READINESS)).toBeNull()
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, status: 'blocked' })).toContain('not ready')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, persists_teaser_receipts: false })).toContain('persist and retrieve')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, artifact_status_required: 'backend_teaser_generated' })).toContain('persisted teaser')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, production_artifact_proven: true })).toContain('private production artifact proof')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, raw_trade_rows_stored: true })).toContain('raw trade rows')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, persists_story_identity: false })).toContain('public story identity')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, story_identity_fields: ['archetype_id'] })).toContain('archetype and axis')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, story_identity_allowed_values: undefined })).toContain('allowed values')
    expect(validatePublicTeaserReportReadiness({
      ...READY_READINESS,
      story_identity_allowed_values: { ...STORY_IDENTITY_ALLOWED_VALUES, axis_ids: [] },
    })).toContain('axis_ids')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, min_trade_rows: 1 })).toContain('minimum trade-row')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, retrieval_identity: ['report_id'] })).toContain('request-id')
  })

  test('validates the current story identity against Medallion readiness allowlists', () => {
    expect(validatePublicTeaserStoryContextAgainstReadiness(READY_READINESS, {
      market: 'global',
      storySource: 'guided',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      selectedPainAxisIds: ['edge_decay', 'revenge_reentry'],
      visitedSceneCount: 6,
      signalMarkerIds: ['mirror_selected', 'upload_intent'],
    })).toBeNull()

    expect(validatePublicTeaserStoryContextAgainstReadiness(READY_READINESS, {
      market: 'global',
      storySource: 'guided',
      archetypeId: 'marco',
      axisId: 'unknown_axis',
    })).toContain('axis_id "unknown_axis"')

    expect(validatePublicTeaserStoryContextAgainstReadiness(READY_READINESS, {
      market: 'global',
      storySource: 'guided',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      visitedSceneCount: -1,
    })).toContain('canonical non-negative')

    expect(validatePublicTeaserStoryContextAgainstReadiness(READY_READINESS, {
      market: 'global',
      storySource: 'guided',
      archetypeId: 'marco',
      axisId: 'edge_decay',
      signalMarkerIds: ['fake_marker'],
    })).toContain('signal marker "fake_marker"')
  })
})
