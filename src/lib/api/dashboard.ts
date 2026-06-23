import { isApiBaseConfiguredForLive } from '../constants'
import {
  buildDashboardActivationOriginFailureMeta,
  buildDashboardActivationOriginMeta,
  hasVerifiedDashboardActivationOrigin,
} from '../activationOrigin'
import {
  getStoredSessionMeta,
  getShibuyaRuntimeContract,
  hasBackendVerifiedLiveSession,
  isSampleMode,
  updateSessionMeta,
} from '../runtime'
import { SAMPLE_WORKSPACE_DATA, getSampleWorkspaceOverview } from '../sampleWorkspace'
import type {
  AlertsResponse,
  DashboardOverview,
  EdgePortfolioResponse,
  ShadowBoxingResponse,
  SlumpPrescription,
  TradeHistoryResponse,
  TradePasteMemoryResponse,
  TradePastePreview,
  TradingReportResponse,
  TradingReportComparisonResponse,
  TradingReportsResponse,
  UploadProofReceipt,
} from '../types'
import { http, withRetry } from './httpClient'

export interface TradeUploadResponse {
  status: string
  customer_id?: string
  trades_uploaded: number
  message?: string
  request_id?: string
  completed_at?: string
  report?: Record<string, unknown>
  report_snapshot_id?: string | null
  report_id?: string | null
  artifact_status?: 'generated' | 'missing' | string
  append_count?: number
  activation_source?: string
  activation_report_id?: string
  activation_archetype_id?: string
  activation_axis_id?: string
  activation_story_source?: string
  activation_visited_scene_count?: number
  activation_signal_marker_ids?: string[]
  activation_locked_section_id?: string
  activation_teaser_request_id?: string
  activation_teaser_trades_analyzed?: number | string
  activation_teaser_worst_pattern?: string
  activation_teaser_verified?: string
  activation_teaser_verification_status?: string
  activation_teaser_receipt_hash?: string
  activation_teaser_verified_at?: string
}

export interface LiveUploadAppendReadinessResponse {
  status: 'ready' | 'blocked' | string
  service?: string
  customer_id?: string
  accepts_csv_upload?: boolean
  accepts_trade_paste_submit?: boolean
  persists_upload_receipts?: boolean
  generates_account_artifacts?: boolean
  artifact_status_required?: 'generated' | string
  append_count_required?: number
  request_id_required?: boolean
  report_snapshot_required?: boolean
  read_only?: boolean
  upload_count?: number
  upload_limit?: number | null
  uploads_remaining?: number | null
  last_report_snapshot_id?: string | null
  first_upload_receipt?: UploadProofReceipt | null
  latest_upload_receipt?: UploadProofReceipt | null
  blockers?: string[]
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function assertDashboardBackendReady(featureName: string): void {
  if (isSampleMode()) {
    return
  }

  const contract = getShibuyaRuntimeContract()

  if (contract.requiresBackend && !isApiBaseConfiguredForLive()) {
    throw new Error(
      `${featureName} requires a configured Shibuya backend. VITE_API_BASE is missing, so live account data cannot be loaded truthfully.`,
    )
  }

  if (contract.mode === 'live' && !hasBackendVerifiedLiveSession()) {
    throw new Error(
      `${featureName} requires backend-verified live session identity. Re-activate or sign in before using account persistence.`,
    )
  }
}

export function validateLiveUploadAppendReadiness(
  readiness: LiveUploadAppendReadinessResponse,
  expectedCustomerId?: string | null,
): string | null {
  if (readiness.status !== 'ready') {
    return 'Medallion live append service is not ready to persist upload receipts.'
  }

  const expectedCustomer = getExpectedLiveCustomerId(expectedCustomerId)
  if (expectedCustomer) {
    const readinessCustomer = normalizeCustomerId(readiness.customer_id)
    if (!readinessCustomer) {
      return 'Medallion live append service did not return the verified customer id.'
    }
    if (readinessCustomer !== expectedCustomer) {
      return 'Medallion live append service returned a different customer id than the verified session.'
    }
  }

  if (readiness.accepts_csv_upload !== true || readiness.accepts_trade_paste_submit !== true) {
    return 'This live account is not currently allowed to submit CSV or pasted trade history.'
  }

  if (readiness.persists_upload_receipts !== true || readiness.generates_account_artifacts !== true) {
    return 'Medallion live append service cannot persist upload receipts and generate account artifacts.'
  }

  if (readiness.artifact_status_required !== 'generated') {
    return 'Medallion live append service did not require generated account artifacts.'
  }

  if (readiness.request_id_required !== true || readiness.report_snapshot_required !== true) {
    return 'Medallion live append service did not require request and report snapshot receipts.'
  }

  if (!Number.isFinite(readiness.append_count_required) || Number(readiness.append_count_required) < 1) {
    return 'Medallion live append service did not publish a durable append-count requirement.'
  }

  if (readiness.read_only === true) {
    return 'This reset window is read only. Start a new package or live tier to upload fresh trades.'
  }

  if (typeof readiness.uploads_remaining === 'number' && readiness.uploads_remaining < 1) {
    return 'This package has no remaining live uploads.'
  }

  return null
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeCustomerId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getExpectedLiveCustomerId(explicitCustomerId?: string | null): string {
  return normalizeCustomerId(explicitCustomerId) || normalizeCustomerId(getStoredSessionMeta()?.customerId)
}

export function validateGeneratedLiveUploadArtifactProof(
  result: TradeUploadResponse,
  expectedCustomerId?: string | null,
): string | null {
  if (result.status !== 'success') {
    return 'Live upload proof requires a successful Medallion upload response.'
  }

  if (!Number.isFinite(result.trades_uploaded) || result.trades_uploaded < 1) {
    return 'Live upload proof requires at least one uploaded trade.'
  }

  const expectedCustomer = getExpectedLiveCustomerId(expectedCustomerId)
  if (expectedCustomer) {
    const receiptCustomer = normalizeCustomerId(result.customer_id)
    if (!receiptCustomer) {
      return 'Live upload proof requires a backend customer id.'
    }
    if (receiptCustomer !== expectedCustomer) {
      return 'Live upload proof customer id does not match the verified session.'
    }
  }

  if (result.artifact_status !== 'generated') {
    return 'Live upload proof requires a generated account artifact.'
  }

  if (!hasText(result.report_snapshot_id)) {
    return 'Live upload proof requires a generated report snapshot id.'
  }

  if (!hasText(result.request_id)) {
    return 'Live upload proof requires a backend request id.'
  }

  if (!Number.isFinite(result.append_count) || Number(result.append_count) < 1) {
    return 'Live upload proof requires a durable append count.'
  }

  return null
}

export function hasGeneratedUploadArtifactProof(result: TradeUploadResponse, expectedCustomerId?: string | null): boolean {
  return validateGeneratedLiveUploadArtifactProof(result, expectedCustomerId) === null
}

export async function getLiveUploadAppendReadiness(): Promise<LiveUploadAppendReadinessResponse> {
  if (isSampleMode()) {
    return {
      status: 'blocked',
      service: 'shibuya-live-upload-append',
      accepts_csv_upload: false,
      accepts_trade_paste_submit: false,
      persists_upload_receipts: false,
      generates_account_artifacts: false,
      artifact_status_required: 'generated',
      append_count_required: 1,
      request_id_required: true,
      report_snapshot_required: true,
      read_only: false,
      upload_count: 0,
      upload_limit: null,
      uploads_remaining: null,
      blockers: ['sample_mode_no_live_persistence'],
    }
  }

  assertDashboardBackendReady('Live append readiness')
  const { data } = await http.get<LiveUploadAppendReadinessResponse>('/v1/dashboard/upload/readiness', {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 503,
  })
  return data
}

function buildSampleTradePastePreview(body: string): TradePastePreview {
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const symbols = Array.from(new Set(lines.map((line) => {
    const parts = line.split(/[\s,;|]+/).filter(Boolean)
    const symbol = parts.find((part) => /[A-Z]{2,}[A-Z0-9._-]*/.test(part) && !/^(BUY|SELL|LONG|SHORT)$/i.test(part))
    return symbol?.toUpperCase() ?? 'UNKNOWN'
  })))

  return {
    rowsParsed: lines.length,
    symbols,
    issues: [
      'Sample parser preview only. No backend normalization, persistence, or account-specific analytics were produced.',
    ],
  }
}

export async function parseTradePaste(payload: { body: string }) {
  if (isSampleMode()) {
    await wait(200)
    return buildSampleTradePastePreview(payload.body)
  }

  assertDashboardBackendReady('Trade paste preview')
  const { data } = await http.post<TradePastePreview>('/v1/trader/trades/preview', payload)
  return data
}

export async function getTradePasteMemory(): Promise<TradePasteMemoryResponse> {
  if (isSampleMode()) {
    await wait(200)
    return { has_previous: false, deltas: [], message: 'Sample workspace does not retain paste memory.' } as TradePasteMemoryResponse
  }

  assertDashboardBackendReady('Trade paste memory')
  return withRetry(async () => {
    const { data } = await http.get<TradePasteMemoryResponse>('/v1/dashboard/trade-paste-memory')
    return data
  })
}

export async function getTradeHistory(): Promise<TradeHistoryResponse> {
  if (isSampleMode()) {
    await wait(300)
    return SAMPLE_WORKSPACE_DATA.tradeHistory
  }

  assertDashboardBackendReady('Trade history')
  return withRetry(async () => {
    const { data } = await http.get<TradeHistoryResponse>('/v1/dashboard/trade-history')
    return data
  })
}

export async function getTradingReports(limit = 20): Promise<TradingReportsResponse> {
  if (isSampleMode()) {
    await wait(250)
    return SAMPLE_WORKSPACE_DATA.reports
  }

  assertDashboardBackendReady('Trading reports')
  return withRetry(async () => {
    const { data } = await http.get<TradingReportsResponse>('/v1/trading-reports', {
      params: { limit },
    })
    return data
  })
}

export async function getTradingReport(reportId: string): Promise<TradingReportResponse> {
  if (isSampleMode()) {
    await wait(150)
    const report = SAMPLE_WORKSPACE_DATA.reports.reports.find((item) => item.id === reportId)
    if (!report) {
      throw new Error('Sample report artifact not found.')
    }
    return { status: 'success', report }
  }

  assertDashboardBackendReady('Trading report artifact')
  return withRetry(async () => {
    const { data } = await http.get<TradingReportResponse>(`/v1/trading-reports/${encodeURIComponent(reportId)}`)
    return data
  })
}

export async function getTradingReportComparison(): Promise<TradingReportComparisonResponse> {
  if (isSampleMode()) {
    await wait(250)
    return SAMPLE_WORKSPACE_DATA.comparison
  }

  assertDashboardBackendReady('Trading report comparison')
  return withRetry(async () => {
    const { data } = await http.get<TradingReportComparisonResponse>('/v1/trading-reports/comparison')
    return data
  })
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (isSampleMode()) {
    await wait(400)
    return getSampleWorkspaceOverview(getStoredSessionMeta()?.samplePreview ?? 'core')
  }

  assertDashboardBackendReady('Dashboard overview')
  return withRetry(async () => {
    const { data } = await http.get<DashboardOverview>('/v1/dashboard/overview')
    const nextSessionMeta = {
      customerId: data.customer_id,
      tier: data.access_tier,
      offerKind: data.offer_kind,
      caseStatus: data.case_status,
      traderMode: data.trader_mode,
      nextAction: data.next_action,
      accessExpiresAt: data.access_expires_at ?? null,
      dataSource: data.data_source ?? null,
      lastReportSnapshotId: data.last_report_snapshot_id ?? null,
      firstUploadReceipt: data.first_upload_receipt ?? null,
      latestUploadReceipt: data.latest_upload_receipt ?? null,
      uploadReceiptHistory: Array.isArray(data.upload_receipt_history) ? data.upload_receipt_history : [],
    }

    if (hasVerifiedDashboardActivationOrigin(data.activation_origin)) {
      Object.assign(nextSessionMeta, buildDashboardActivationOriginMeta(data.activation_origin))
    } else {
      Object.assign(nextSessionMeta, buildDashboardActivationOriginFailureMeta(data.activation_origin))
    }

    updateSessionMeta(nextSessionMeta)
    return data
  })
}

export async function getDashboardAlerts(): Promise<AlertsResponse> {
  if (isSampleMode()) {
    await wait(300)
    return SAMPLE_WORKSPACE_DATA.alerts
  }

  assertDashboardBackendReady('Dashboard alerts')
  return withRetry(async () => {
    const { data } = await http.get<AlertsResponse>('/v1/dashboard/alerts')
    return data
  })
}

export async function getEdgePortfolio(): Promise<EdgePortfolioResponse> {
  if (isSampleMode()) {
    await wait(350)
    return SAMPLE_WORKSPACE_DATA.edgePortfolio
  }

  assertDashboardBackendReady('Edge portfolio')
  return withRetry(async () => {
    const { data } = await http.get<EdgePortfolioResponse>('/v1/dashboard/edge-portfolio')
    return data
  })
}

export async function getSlumpPrescription(): Promise<SlumpPrescription> {
  if (isSampleMode()) {
    await wait(250)
    return SAMPLE_WORKSPACE_DATA.slump
  }

  assertDashboardBackendReady('Slump prescription')
  return withRetry(async () => {
    const { data } = await http.get<SlumpPrescription>('/v1/dashboard/slump-prescription')
    return data
  })
}

export async function getShadowBoxing(): Promise<ShadowBoxingResponse> {
  if (isSampleMode()) {
    await wait(400)
    return SAMPLE_WORKSPACE_DATA.shadowBoxing
  }

  assertDashboardBackendReady('Shadow boxing')
  return withRetry(async () => {
    const { data } = await http.get<ShadowBoxingResponse>('/v1/dashboard/shadow-boxing')
    return data
  })
}

export async function uploadTradesCSV(file: File): Promise<TradeUploadResponse> {
  if (isSampleMode()) {
    await wait(1000)
    return { status: 'sample', trades_uploaded: 0, report: { message: 'Upload disabled in sample workspace' } }
  }

  assertDashboardBackendReady('Persistent trade upload')
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post('/v1/dashboard/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function submitParsedTrades(payload: { trades: unknown[]; rawText: string }): Promise<TradeUploadResponse> {
  if (isSampleMode()) {
    await wait(800)
    const lineCount = payload.rawText.trim().split('\n').filter((line) => line.trim()).length
    return { status: 'sample', trades_uploaded: lineCount }
  }

  assertDashboardBackendReady('Persistent trade submission')
  const { data } = await http.post('/v1/dashboard/trades/submit', payload)
  return data
}
