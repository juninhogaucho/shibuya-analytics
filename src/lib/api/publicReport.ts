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
