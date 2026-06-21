import { isApiBaseConfiguredForLive } from '../constants'
import {
  EMPTY_ACTIVATION_ORIGIN_META,
  buildDashboardActivationOriginMeta,
  hasVerifiedDashboardActivationOrigin,
} from '../dashboardActivationOrigin'
import { getStoredSessionMeta, getShibuyaRuntimeContract, isSampleMode, updateSessionMeta } from '../runtime'
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
} from '../types'
import { http, withRetry } from './httpClient'

export interface TradeUploadResponse {
  status: string
  trades_uploaded: number
  message?: string
  request_id?: string
  report?: Record<string, unknown>
  report_snapshot_id?: string | null
  report_id?: string | null
  artifact_status?: 'generated' | 'missing' | string
  append_count?: number
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
      Object.assign(nextSessionMeta, EMPTY_ACTIVATION_ORIGIN_META)
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
