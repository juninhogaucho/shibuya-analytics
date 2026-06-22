import { describe, expect, test } from 'vitest'
import { validatePublicTeaserReportReadiness, type PublicTeaserReportReadinessResponse } from '../publicReport'

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
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, min_trade_rows: 1 })).toContain('minimum trade-row')
    expect(validatePublicTeaserReportReadiness({ ...READY_READINESS, retrieval_identity: ['report_id'] })).toContain('request-id')
  })
})
