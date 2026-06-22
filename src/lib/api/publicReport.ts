import { http } from './httpClient'

export interface PublicTeaserReportResponse {
  status: string
  report_type: 'teaser' | string
  report_id?: string
  request_id: string
  artifact_status?: 'backend_teaser_persisted' | string
  production_artifact_proven?: boolean
  receipt_hash?: string
  trades_analyzed: number
  headline?: {
    total_pnl?: number
    discipline_tax?: number
    win_rate?: number
    worst_pattern?: string
    hook?: string
  }
  metrics?: Record<string, unknown>
  patterns_detected?: Array<Record<string, unknown>>
  unlock_message?: string
  cta_url?: string
  processing_time_seconds?: number
  created_at?: string
}

export interface PublicTeaserReportReadinessResponse {
  status: 'ready' | 'blocked' | string
  service?: string
  accepts_csv_upload?: boolean
  persists_teaser_receipts?: boolean
  retrieves_teaser_receipts?: boolean
  report_type?: 'teaser' | string
  artifact_status_required?: 'backend_teaser_persisted' | string
  production_artifact_proven?: boolean
  raw_trade_rows_stored?: boolean
  live_private_artifact_proven?: boolean
  min_trade_rows?: number
  max_file_size_mb?: number
  retrieval_identity?: string[]
  blockers?: string[]
}

export function validatePublicTeaserReportReadiness(
  readiness: PublicTeaserReportReadinessResponse,
): string | null {
  if (readiness.status !== 'ready') {
    return 'Medallion public report service is not ready to persist teaser receipts.'
  }

  if (readiness.accepts_csv_upload !== true) {
    return 'Medallion public report service is not accepting CSV uploads.'
  }

  if (readiness.persists_teaser_receipts !== true || readiness.retrieves_teaser_receipts !== true) {
    return 'Medallion public report service cannot persist and retrieve teaser receipts.'
  }

  if (readiness.report_type !== 'teaser') {
    return 'Medallion public report service returned the wrong report type contract.'
  }

  if (readiness.artifact_status_required !== 'backend_teaser_persisted') {
    return 'Medallion public report service did not require persisted teaser artifacts.'
  }

  if (readiness.production_artifact_proven !== false || readiness.live_private_artifact_proven !== false) {
    return 'Public teaser readiness cannot claim private production artifact proof.'
  }

  if (readiness.raw_trade_rows_stored !== false) {
    return 'Public teaser readiness must confirm raw trade rows are not stored in browser/report handoff state.'
  }

  if (!Number.isFinite(readiness.min_trade_rows) || Number(readiness.min_trade_rows) < 10) {
    return 'Medallion public report service did not publish a checkout-grade minimum trade-row requirement.'
  }

  const retrievalIdentity = new Set(readiness.retrieval_identity ?? [])
  if (!retrievalIdentity.has('report_id') || !retrievalIdentity.has('request_id')) {
    return 'Medallion public report service did not publish report-id and request-id retrieval identity.'
  }

  return null
}

export async function getPublicTeaserReportReadiness(): Promise<PublicTeaserReportReadinessResponse> {
  const { data } = await http.get<PublicTeaserReportReadinessResponse>('/v1/shibuya/teaser-report/readiness', {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 503,
  })
  return data
}

export async function generatePublicTeaserReport(file: File): Promise<PublicTeaserReportResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await http.post<PublicTeaserReportResponse>('/v1/shibuya/teaser-report', formData)
  return data
}

export async function getPublicTeaserReport(reportIdOrRequestId: string): Promise<PublicTeaserReportResponse> {
  const { data } = await http.get<PublicTeaserReportResponse>(
    `/v1/shibuya/teaser-report/${encodeURIComponent(reportIdOrRequestId)}`,
  )
  return data
}
