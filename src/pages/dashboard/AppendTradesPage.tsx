import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getTraderProfileContext,
  logTraderLifecycleEvent,
} from '../../lib/api/trader'
import {
  getDashboardOverview,
  getLiveUploadAppendReadiness,
  getTradePasteMemory,
  getTradingReportComparison,
  parseTradePaste,
  submitParsedTrades,
  validateLiveUploadAppendReadiness,
  uploadTradesCSV,
} from '../../lib/api/dashboard'
import type { LiveUploadAppendReadinessResponse, TradeUploadResponse } from '../../lib/api/dashboard'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { ImportConciergeCard } from '../../components/dashboard/ImportConciergeCard'
import { LiveProofReadinessCard } from '../../components/dashboard/LiveProofReadinessCard'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { getShibuyaRuntimeContract, getStoredSessionMeta, isReadOnlySession, updateSessionMeta } from '../../lib/runtime'
import { buildJourneyState } from '../../lib/journeyState'
import { EMPTY_ACTIVATION_ORIGIN_META, buildDashboardActivationOriginMeta, hasVerifiedDashboardActivationOrigin } from '../../lib/activationOrigin'
import { addMarketToPath, type Market } from '../../lib/market'
import { buildUploadPlaybook } from '../../lib/uploadPlaybook'
import { rescueCsvForUpload } from '../../lib/csvRescue'
import { humanizeTraderMode } from '../../lib/traderMode'
import { buildFreeReportPreview, findLockedReportSectionBySlug, getFingerprintAxis, getPublicStorySignalMarkers, getTraderArchetype } from '../../lib/storyExperience'
import type { ShibuyaRuntimeContract, ShibuyaSessionMeta } from '../../lib/runtime'
import type { DashboardOverview, TradePasteMemoryResponse, TraderProfileContext, TradingReportComparisonResponse, UploadProofReceipt } from '../../lib/types'
import { InfoTooltip } from '../../components/ui/Tooltip'

interface ParsedTrade {
  timestamp: string
  symbol: string
  side: string
  size: number
  entry_price?: number
  exit_price?: number
  pnl?: number
}

interface ParsePreview {
  rowsParsed: number
  symbols: string[]
  issues?: string[]
  trades?: ParsedTrade[]
}

interface LiveUploadReadinessState {
  status: 'checking' | 'ready' | 'blocked'
  headline: string
  detail: string
  uploadCount?: number
  uploadLimit?: number | null
  uploadsRemaining?: number | null
  lastReportSnapshotId?: string | null
  blockers: string[]
}

const SAMPLE_PLACEHOLDER = `2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20
2024-01-15 11:45 BANKNIFTY24JAN48200PE SELL 1 210.00 184.35`

const CSV_TEMPLATE = `timestamp,exit_time,Symbol,size,pnl
2024-01-15 09:32:00,2024-01-15 09:58:00,NIFTY24JAN22500CE,2,4520
2024-01-15 11:45:00,2024-01-15 12:30:00,BANKNIFTY24JAN48200PE,1,-1850
2024-01-16 10:05:00,2024-01-16 10:42:00,RELIANCE,15,2760`

const INDIA_EXPORT_PRESETS = [
  {
    label: 'Zerodha tradebook CSV',
    body: 'Export closed trades or P&L from Console, keep one row per closed trade, then map the timestamps and PnL into the template if needed.',
  },
  {
    label: 'Dhan / Angel / Upstox / FYERS',
    body: 'Use the trade history or ledger export. If the raw file is messy, paste a clean subset first and let the parser show what it understands.',
  },
  {
    label: 'Prop portal or MT5 export',
    body: 'Closed-trade CSV is enough for V1. EA and direct connectors stay future lanes; the point now is getting the leak on screen fast.',
  },
]

const ANONYMOUS_RUNTIME_CONTRACT: ShibuyaRuntimeContract = {
  mode: 'anonymous',
  label: 'Public visitor',
  canUseSampleData: false,
  canPersistTrades: false,
  persistence: 'none',
  requiresBackend: false,
  proofBoundary: 'Anonymous visitors can inspect the public product story but cannot access account analytics.',
}

const CHECKING_LIVE_UPLOAD_READINESS: LiveUploadReadinessState = {
  status: 'checking',
  headline: 'Checking live append readiness.',
  detail: 'Shibuya is asking Medallion whether this account can write uploads, persist receipts, and generate account artifacts before append.',
  blockers: [],
}

function readRuntimeContract(): ShibuyaRuntimeContract {
  const runtimeContract: ShibuyaRuntimeContract | undefined = getShibuyaRuntimeContract()
  return runtimeContract ?? ANONYMOUS_RUNTIME_CONTRACT
}

function summarizeLiveUploadReadiness(readiness: LiveUploadAppendReadinessResponse): LiveUploadReadinessState {
  const readinessError = validateLiveUploadAppendReadiness(readiness)

  if (readinessError) {
    return {
      status: 'blocked',
      headline: 'Live append boundary is blocked.',
      detail: readinessError,
      uploadCount: readiness.upload_count,
      uploadLimit: readiness.upload_limit,
      uploadsRemaining: readiness.uploads_remaining,
      lastReportSnapshotId: readiness.last_report_snapshot_id,
      blockers: readiness.blockers ?? [],
    }
  }

  return {
    status: 'ready',
    headline: 'Medallion can accept a live append.',
    detail: 'A live upload can be submitted, but Shibuya will only call it proof after Medallion returns request id, generated artifact snapshot, and durable append count.',
    uploadCount: readiness.upload_count,
    uploadLimit: readiness.upload_limit,
    uploadsRemaining: readiness.uploads_remaining,
    lastReportSnapshotId: readiness.last_report_snapshot_id,
    blockers: [],
  }
}

function summarizeLiveUploadReadinessFailure(error: unknown): LiveUploadReadinessState {
  const message = error instanceof Error ? error.message : 'Live append readiness check failed.'

  return {
    status: 'blocked',
    headline: 'Live append readiness could not be verified.',
    detail: `${message} No live upload should be submitted until Medallion readiness is proven.`,
    blockers: ['live_append_readiness_check_failed'],
  }
}

function formatMemoryDelta(memory: TradePasteMemoryResponse): string[] {
  if (!memory.has_previous || memory.deltas.length === 0) {
    return [
      memory.message,
      'Upload another session to compare win rate, discipline tax, stress score, and Sharpe.',
    ]
  }

  return [
    memory.message,
    ...memory.deltas.map((delta) => `${delta.metric}: ${delta.previous} -> ${delta.current} (${delta.delta})`),
  ]
}

function formatAppendProofNotes(comparison: TradingReportComparisonResponse | null): string[] {
  const proof = comparison?.append_proof
  if (!proof) {
    return ['Append-proof comparison was not returned by the backend yet.']
  }

  if (proof.status !== 'comparison_ready') {
    return [
      proof.proof_boundary,
      `Durable upload snapshots on record: ${proof.upload_count}.`,
    ]
  }

  return [
    'Append proof comparison is ready.',
    proof.proof_boundary,
    `Baseline snapshot ${proof.baseline_snapshot_id ?? 'missing'} -> latest snapshot ${proof.latest_snapshot_id ?? 'missing'}.`,
    proof.latest_report_id ? `Latest report artifact: ${proof.latest_report_id}.` : 'Latest report artifact was not returned.',
    proof.latest_request_id ? `Latest append request receipt: ${proof.latest_request_id}.` : 'Latest append request receipt was not returned.',
    proof.activation_teaser_request_id
      ? `Activation teaser receipt: ${proof.activation_teaser_request_id}; ${proof.activation_teaser_trades_analyzed ?? 'unknown'} trades; ${proof.activation_teaser_worst_pattern ?? 'pattern not returned'}; verification ${proof.activation_teaser_verification_status ?? 'not provided'}.`
      : 'Activation teaser receipt was not returned in append proof.',
  ]
}

function buildSampleNotes(tradesUploaded: number): string[] {
  return [
    `${tradesUploaded} trades ran through the sample workspace.`,
    'Sample mode shows parsing and workflow only. It does not persist uploads or update your account history.',
    'Use a live trader account to store sessions, compare deltas, and generate live prescriptions.',
  ]
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasGeneratedUploadArtifactProof(result: TradeUploadResponse): boolean {
  return Boolean(
    result.status !== 'sample'
    && result.artifact_status === 'generated'
    && hasText(result.report_snapshot_id)
    && hasText(result.request_id)
    && typeof result.append_count === 'number'
    && result.append_count >= 1,
  )
}

function formatLiveUploadProofNotes(result: TradeUploadResponse): string[] {
  const notes = [
    `${result.trades_uploaded} trades generated a backend account artifact.`,
    result.report_snapshot_id
      ? `Generated artifact snapshot: ${result.report_snapshot_id}.`
      : 'Generated artifact snapshot was not returned by the backend.',
  ]

  if (result.report_id) {
    notes.push(`Report artifact: ${result.report_id}.`)
  }

  if (typeof result.append_count === 'number') {
    notes.push(`Durable upload count for this account: ${result.append_count}.`)
  }

  if (result.request_id) {
    notes.push(`Backend request receipt: ${result.request_id}.`)
  }

  if (result.completed_at) {
    notes.push(`Upload completed at: ${result.completed_at}.`)
  }
  if (result.activation_teaser_request_id) {
    notes.push(
      `Upload response carried activation teaser: ${result.activation_teaser_request_id}; ${result.activation_teaser_trades_analyzed ?? 'unknown'} trades; ${result.activation_teaser_worst_pattern ?? 'pattern not returned'}; verification ${result.activation_teaser_verification_status ?? 'not provided'}.`,
    )
  }

  return notes
}

function formatIncompleteUploadProofNotes(result: TradeUploadResponse): string[] {
  const notes = [
    `${result.trades_uploaded} trades were received by the live upload endpoint.`,
    'Shibuya did not receive generated artifact proof from the backend, so this upload is not baseline proof yet.',
    result.report_snapshot_id
      ? `Snapshot candidate returned: ${result.report_snapshot_id}.`
      : 'Generated artifact snapshot was not returned by the backend.',
  ]

  if (result.report_id) {
    notes.push(`Report candidate returned: ${result.report_id}.`)
  }

  if (result.artifact_status) {
    notes.push(`Artifact status: ${result.artifact_status}.`)
  }

  if (typeof result.append_count === 'number') {
    notes.push(`Durable upload count returned: ${result.append_count}.`)
  }

  if (result.request_id) {
    notes.push(`Backend request receipt: ${result.request_id}.`)
  } else {
    notes.push('Backend request receipt was not returned.')
  }

  notes.push('The workspace stays in processing until Medallion returns a generated artifact snapshot.')

  return notes
}

type LiveUploadTransport = 'paste' | 'csv'

function buildLiveUploadReceipt(result: TradeUploadResponse, uploadTransport: LiveUploadTransport): UploadProofReceipt {
  const receipt: UploadProofReceipt = {
    upload_transport: uploadTransport,
    trades_uploaded: result.trades_uploaded,
  }

  if (result.completed_at) {
    receipt.completed_at = result.completed_at
  }
  if (result.report_snapshot_id) {
    receipt.report_snapshot_id = result.report_snapshot_id
  }
  if (result.report_id) {
    receipt.report_id = result.report_id
  }
  if (result.artifact_status) {
    receipt.artifact_status = result.artifact_status
  }
  if (typeof result.append_count === 'number') {
    receipt.append_count = result.append_count
  }
  if (result.request_id) {
    receipt.request_id = result.request_id
  }
  if (result.activation_source) {
    receipt.activation_source = result.activation_source
  }
  if (result.activation_report_id) {
    receipt.activation_report_id = result.activation_report_id
  }
  if (result.activation_archetype_id) {
    receipt.activation_archetype_id = result.activation_archetype_id
  }
  if (result.activation_axis_id) {
    receipt.activation_axis_id = result.activation_axis_id
  }
  if (result.activation_story_source) {
    receipt.activation_story_source = result.activation_story_source
  }
  if (typeof result.activation_visited_scene_count === 'number') {
    receipt.activation_visited_scene_count = result.activation_visited_scene_count
  }
  if (Array.isArray(result.activation_signal_marker_ids) && result.activation_signal_marker_ids.length > 0) {
    receipt.activation_signal_marker_ids = result.activation_signal_marker_ids
  }
  if (result.activation_locked_section_id) {
    receipt.activation_locked_section_id = result.activation_locked_section_id
  }
  if (result.activation_teaser_request_id) {
    receipt.activation_teaser_request_id = result.activation_teaser_request_id
  }
  if (result.activation_teaser_trades_analyzed !== undefined) {
    receipt.activation_teaser_trades_analyzed = result.activation_teaser_trades_analyzed
  }
  if (result.activation_teaser_worst_pattern) {
    receipt.activation_teaser_worst_pattern = result.activation_teaser_worst_pattern
  }
  if (result.activation_teaser_verified) {
    receipt.activation_teaser_verified = result.activation_teaser_verified
  }
  if (result.activation_teaser_verification_status) {
    receipt.activation_teaser_verification_status = result.activation_teaser_verification_status
  }
  if (result.activation_teaser_receipt_hash) {
    receipt.activation_teaser_receipt_hash = result.activation_teaser_receipt_hash
  }
  if (result.activation_teaser_verified_at) {
    receipt.activation_teaser_verified_at = result.activation_teaser_verified_at
  }

  return receipt
}

function appendLiveUploadReceiptHistory(
  existingHistory: UploadProofReceipt[] | undefined,
  receipt: UploadProofReceipt,
): UploadProofReceipt[] {
  const receiptKey = receipt.request_id ?? receipt.report_snapshot_id
  const history = receiptKey
    ? (existingHistory ?? []).filter((item) => (item.request_id ?? item.report_snapshot_id) !== receiptKey)
    : existingHistory ?? []

  return [...history, receipt].slice(-5)
}

function buildLiveUploadSessionPatch(
  result: TradeUploadResponse,
  sessionMeta: ShibuyaSessionMeta | null,
  uploadTransport: LiveUploadTransport,
): Partial<ShibuyaSessionMeta> {
  const receipt = buildLiveUploadReceipt(result, uploadTransport)
  const hasArtifactProof = hasGeneratedUploadArtifactProof(result)
  const patch: Partial<ShibuyaSessionMeta> = {
    caseStatus: hasArtifactProof ? 'baseline_ready' : 'processing',
    latestUploadReceipt: receipt,
    uploadReceiptHistory: appendLiveUploadReceiptHistory(sessionMeta?.uploadReceiptHistory, receipt),
  }

  if (hasArtifactProof) {
    patch.lastReportSnapshotId = result.report_snapshot_id ?? sessionMeta?.lastReportSnapshotId ?? null
    patch.firstUploadReceipt = sessionMeta?.firstUploadReceipt ?? receipt
  }

  return patch
}

function buildFirstUploadLifecycleMetadata(
  result: TradeUploadResponse,
  sessionMeta: ShibuyaSessionMeta | null,
  uploadTransport: LiveUploadTransport,
): Record<string, unknown> {
  return {
    uploadTransport,
    tradesUploaded: result.trades_uploaded,
    reportSnapshotId: result.report_snapshot_id ?? null,
    reportId: result.report_id ?? null,
    artifactStatus: result.artifact_status ?? null,
    appendCount: result.append_count ?? null,
    requestId: result.request_id ?? null,
    activationSource: result.activation_source ?? sessionMeta?.activationSource,
    activationReportId: result.activation_report_id ?? sessionMeta?.activationReportId,
    activationArchetypeId: result.activation_archetype_id ?? sessionMeta?.activationArchetypeId,
    activationAxisId: result.activation_axis_id ?? sessionMeta?.activationAxisId,
    activationStorySource: result.activation_story_source ?? sessionMeta?.activationStorySource,
    activationVisitedSceneCount: result.activation_visited_scene_count ?? sessionMeta?.activationVisitedSceneCount,
    activationSignalMarkerIds: result.activation_signal_marker_ids ?? sessionMeta?.activationSignalMarkerIds,
    activationLockedSectionId: result.activation_locked_section_id ?? sessionMeta?.activationLockedSectionId,
    activationTeaserRequestId: result.activation_teaser_request_id ?? sessionMeta?.activationTeaserRequestId,
    activationTeaserTradesAnalyzed: result.activation_teaser_trades_analyzed ?? sessionMeta?.activationTeaserTradesAnalyzed,
    activationTeaserWorstPattern: result.activation_teaser_worst_pattern ?? sessionMeta?.activationTeaserWorstPattern,
    activationTeaserVerified: result.activation_teaser_verified ?? sessionMeta?.activationTeaserVerified,
    activationTeaserVerificationStatus: result.activation_teaser_verification_status ?? sessionMeta?.activationTeaserVerificationStatus,
    activationTeaserReceiptHash: result.activation_teaser_receipt_hash ?? sessionMeta?.activationTeaserReceiptHash,
    activationTeaserVerifiedAt: result.activation_teaser_verified_at ?? sessionMeta?.activationTeaserVerifiedAt,
  }
}

function shouldLogFirstUploadLifecycle(sessionMeta: ShibuyaSessionMeta | null): boolean {
  return (
    sessionMeta?.caseStatus === 'awaiting_upload'
    || sessionMeta?.caseStatus === 'awaiting_onboarding'
    || !sessionMeta?.caseStatus
  )
}

async function tryLogFirstUploadLifecycleReceipt(
  result: TradeUploadResponse,
  sessionMeta: ShibuyaSessionMeta | null,
  uploadTransport: LiveUploadTransport,
  market: Market,
): Promise<string | null> {
  if (!shouldLogFirstUploadLifecycle(sessionMeta)) {
    return null
  }

  try {
    await logTraderLifecycleEvent({
      event_name: 'first_upload_completed',
      market,
      tier: sessionMeta?.tier,
      metadata: buildFirstUploadLifecycleMetadata(result, sessionMeta, uploadTransport),
    })
    return null
  } catch {
    return 'Lifecycle receipt sync failed after upload; the generated Medallion artifact receipt remains the proof boundary. Dashboard overview should refresh the authoritative account state on the next load.'
  }
}

function buildSessionMetaFromOverview(
  sessionMeta: ShibuyaSessionMeta | null,
  overview: DashboardOverview | null,
): ShibuyaSessionMeta | null {
  if (!overview) {
    return sessionMeta
  }

  const nextMeta: ShibuyaSessionMeta = {
    ...(sessionMeta ?? {}),
    customerId: overview.customer_id ?? sessionMeta?.customerId,
    tier: overview.access_tier ?? sessionMeta?.tier,
    offerKind: overview.offer_kind ?? sessionMeta?.offerKind,
    caseStatus: overview.case_status ?? sessionMeta?.caseStatus,
    traderMode: overview.trader_mode ?? sessionMeta?.traderMode,
    nextAction: overview.next_action ?? sessionMeta?.nextAction,
    accessExpiresAt: overview.access_expires_at ?? sessionMeta?.accessExpiresAt,
    dataSource: overview.data_source ?? sessionMeta?.dataSource,
    lastReportSnapshotId: overview.last_report_snapshot_id ?? sessionMeta?.lastReportSnapshotId,
    firstUploadReceipt: overview.first_upload_receipt ?? sessionMeta?.firstUploadReceipt,
    latestUploadReceipt: overview.latest_upload_receipt ?? sessionMeta?.latestUploadReceipt,
    uploadReceiptHistory: overview.upload_receipt_history?.length
      ? overview.upload_receipt_history
      : sessionMeta?.uploadReceiptHistory,
  }

  Object.assign(
    nextMeta,
    hasVerifiedDashboardActivationOrigin(overview.activation_origin)
      ? buildDashboardActivationOriginMeta(overview.activation_origin)
      : EMPTY_ACTIVATION_ORIGIN_META,
  )

  return nextMeta
}

function formatEngagementReceipt(
  reportViewCount?: number,
  lockedSectionClickCount?: number,
  privateDemoIntentCount?: number,
): string | null {
  if (typeof reportViewCount !== 'number') {
    return null
  }

  return `${reportViewCount} report view(s), ${lockedSectionClickCount ?? 0} locked click(s), ${privateDemoIntentCount ?? 0} gate attempt(s)`
}

function buildLiveActivationProofTarget(sessionMeta: ShibuyaSessionMeta | null) {
  if (!sessionMeta?.activationSource) {
    return null
  }

  const activationReport = sessionMeta.activationReportId
    ? buildFreeReportPreview({
      reportId: sessionMeta.activationReportId,
      archetypeId: sessionMeta.activationArchetypeId,
      axisId: sessionMeta.activationAxisId,
      storySource: sessionMeta.activationStorySource,
      selectedPainAxisIds: sessionMeta.activationSelectedPainAxisIds,
      visitedSceneCount: sessionMeta.activationVisitedSceneCount,
      signalMarkerIds: sessionMeta.activationSignalMarkerIds,
    })
    : null
  const activationLockedSection = activationReport
    ? findLockedReportSectionBySlug(activationReport, sessionMeta.activationLockedSectionId)
    : null
  const archetype = sessionMeta.activationArchetypeId ? getTraderArchetype(sessionMeta.activationArchetypeId) : null
  const selectedPainAxisLabels = sessionMeta.activationSelectedPainAxisIds?.map((axisId) => getFingerprintAxis(axisId).label) ?? []
  const signalMarkerLabels = getPublicStorySignalMarkers(sessionMeta.activationSignalMarkerIds).map((marker) => marker.label)
  const storySource = sessionMeta.activationStorySource
  const visitedSceneCount = sessionMeta.activationVisitedSceneCount ?? 0
  const engagementReceipt = formatEngagementReceipt(
    sessionMeta.activationEngagementReportViewCount,
    sessionMeta.activationEngagementLockedSectionClickCount,
    sessionMeta.activationEngagementPrivateDemoIntentCount,
  )
  const activationTitle = sessionMeta.activationSource === 'locked_insight'
    ? 'Activated from locked report module'
    : sessionMeta.activationSource === 'free_report'
      ? 'Activated from public report'
      : 'Activated from public journey'

  return {
    activationTitle,
    reportId: sessionMeta.activationReportId ?? 'Direct activation',
    lockedSection: sessionMeta.activationLockedSectionTitle ?? activationLockedSection?.title ?? sessionMeta.activationLockedSectionId ?? 'Not provided',
    fingerprint: [
      archetype ? `${archetype.name}: ${archetype.title}` : null,
      sessionMeta.activationAxisId ? getFingerprintAxis(sessionMeta.activationAxisId).label : null,
    ].filter(Boolean).join(' - ') || 'Not provided',
    storyHandoff: storySource
      ? `${storySource}; scenes ${visitedSceneCount}; axes ${selectedPainAxisLabels.join(', ') || 'none captured'}`
      : 'No guided story packet attached.',
    signalMarkers: signalMarkerLabels.length ? signalMarkerLabels.join(', ') : 'No public markers attached.',
    bridgeHeadline: sessionMeta.activationBridgeHeadline ?? activationReport?.resetProBridge.headline,
    bridgeDecisionQuestion: sessionMeta.activationBridgeDecisionQuestion ?? activationReport?.resetProBridge.decisionQuestion,
    bridgeWhyNow: sessionMeta.activationBridgeWhyNow ?? activationReport?.resetProBridge.whyNow,
    bridgeLiveProof: sessionMeta.activationBridgeLiveProof ?? activationReport?.resetProBridge.liveWorkspaceMustProve ?? [],
    engagementReceipt: engagementReceipt ?? 'No activation engagement receipt attached.',
    engagementBoundary: sessionMeta.activationEngagementBoundary,
    teaserReceipt: sessionMeta.activationTeaserRequestId
      ? `${sessionMeta.activationTeaserRequestId}; ${sessionMeta.activationTeaserTradesAnalyzed ?? 'unknown'} trades; ${sessionMeta.activationTeaserWorstPattern ?? 'pattern not returned'}; verification ${sessionMeta.activationTeaserVerificationStatus ?? 'not provided'}`
      : 'No backend teaser receipt attached.',
  }
}

export function AppendTradesPage() {
  const [paste, setPaste] = useState('')
  const [notes, setNotes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [parsedPreview, setParsedPreview] = useState<ParsePreview | null>(null)
  const [profileContext, setProfileContext] = useState<TraderProfileContext | null>(null)
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null)
  const [liveUploadProof, setLiveUploadProof] = useState<TradeUploadResponse | null>(null)
  const [liveUploadReadiness, setLiveUploadReadiness] = useState<LiveUploadReadinessState>(
    CHECKING_LIVE_UPLOAD_READINESS,
  )
  const [tradingReportComparison, setTradingReportComparison] = useState<TradingReportComparisonResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const runtimeContract = readRuntimeContract()
  const sampleMode = runtimeContract.mode === 'sample'
  const navigate = useNavigate()
  const sessionMeta = getStoredSessionMeta()
  const effectiveSessionMeta = useMemo(
    () => buildSessionMetaFromOverview(sessionMeta, sampleMode ? null : dashboardOverview),
    [dashboardOverview, sampleMode, sessionMeta],
  )
  const resetProPreview = sampleMode && effectiveSessionMeta?.samplePreview === 'reset_pro'
  const resetProAppendShortcut = resetProPreview && effectiveSessionMeta?.demoEntryMode === 'append_proof_shortcut'
  const market = effectiveSessionMeta?.market ?? 'india'
  const readOnlyAccess = isReadOnlySession(effectiveSessionMeta)
  const premiumAccess = effectiveSessionMeta?.tier === 'reset_pro'
  const journeyState = buildJourneyState({ overview: dashboardOverview, profile: profileContext, sessionMeta: effectiveSessionMeta, market })
  const uploadPlaybook = useMemo(() => buildUploadPlaybook(profileContext), [profileContext])
  const traderMode = profileContext?.trader_mode ?? effectiveSessionMeta?.traderMode
  const liveActivationProofTarget = sampleMode ? null : buildLiveActivationProofTarget(effectiveSessionMeta)
  const liveUploadHasGeneratedArtifactProof = liveUploadProof ? hasGeneratedUploadArtifactProof(liveUploadProof) : false
  const resetProEngagementReceipt = formatEngagementReceipt(
    effectiveSessionMeta?.demoEngagementReportViewCount,
    effectiveSessionMeta?.demoEngagementLockedSectionClickCount,
    effectiveSessionMeta?.demoEngagementPrivateDemoIntentCount,
  )
  const resetProProofReceiptRows = [
    {
      label: 'Unlock receipt carried',
      body: effectiveSessionMeta?.demoUnlockReceiptId
        ? `${effectiveSessionMeta.demoUnlockReceiptId}. ${effectiveSessionMeta.demoUnlockBoundary ?? 'Presenter gate receipt was attached without exposing the presenter code.'}`
        : 'No private demo unlock receipt was attached to this sample append.',
    },
    {
      label: 'Engagement receipt carried',
      body: resetProEngagementReceipt
        ? `${resetProEngagementReceipt}. ${effectiveSessionMeta?.demoEngagementBoundary ?? 'Route continuity only; not trader evidence.'}`
        : 'No report engagement receipt was attached to this append close.',
    },
    {
      label: 'Sample parse demonstrated',
      body: 'The operator showed how a session enters the proof loop without claiming the sample account changed.',
    },
    {
      label: 'Private question preserved',
      body: effectiveSessionMeta?.demoBridgeDecisionQuestion
        ?? effectiveSessionMeta?.demoLockedSectionTitle
        ?? 'No locked private question was attached to this sample run.',
    },
    {
      label: 'Live proof still required',
      body: 'Activation, first meaningful upload, generated artifacts, and append history are still required before any account-specific Reset Pro conclusion.',
    },
  ]
  const resetProCloseChecklistRows = [
    {
      label: 'Context carried',
      body: effectiveSessionMeta?.demoBridgeDecisionQuestion
        ? `Close with the carried question: ${effectiveSessionMeta.demoBridgeDecisionQuestion}`
        : effectiveSessionMeta?.demoLockedSectionTitle
          ? `Close with the locked module: ${effectiveSessionMeta.demoLockedSectionTitle}`
          : 'No private question was attached; call this a cold sample append.',
    },
    {
      label: 'Workflow to show',
      body: 'Load sample trades, parse preview, confirm sample append, then read the append receipt.',
    },
    {
      label: 'Forbidden close',
      body: 'Do not claim persistence, backend analytics, trader improvement, or live account evidence from sample mode.',
    },
    {
      label: 'Live proof path',
      body: 'Activation, real upload, generated artifacts, and repeat append packets are the evidence path.',
    },
  ]

  useEffect(() => {
    if (sampleMode) {
      return
    }

    let active = true

    async function loadLiveContext() {
      const [profileResult, overviewResult, readinessResult] = await Promise.allSettled([
        getTraderProfileContext(),
        getDashboardOverview(),
        getLiveUploadAppendReadiness(),
      ])

      if (!active) {
        return
      }

      if (profileResult.status === 'fulfilled') {
        setProfileContext(profileResult.value)
      } else {
        setProfileContext(null)
      }

      if (overviewResult.status === 'fulfilled') {
        setDashboardOverview(overviewResult.value)
      }

      if (readinessResult.status === 'fulfilled') {
        setLiveUploadReadiness(summarizeLiveUploadReadiness(readinessResult.value))
      } else {
        setLiveUploadReadiness(summarizeLiveUploadReadinessFailure(readinessResult.reason))
      }
    }

    void loadLiveContext()
    return () => {
      active = false
    }
  }, [sampleMode])

  useEffect(() => {
    if (!success || sampleMode) {
      return
    }

    const timeout = window.setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 6000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [navigate, sampleMode, success])

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'shibuya_trade_template.csv'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const refreshLiveUploadReadiness = async (): Promise<string | null> => {
    if (sampleMode) {
      return null
    }

    try {
      const readiness = await getLiveUploadAppendReadiness()
      const nextReadiness = summarizeLiveUploadReadiness(readiness)
      setLiveUploadReadiness(nextReadiness)
      return nextReadiness.status === 'ready' ? null : nextReadiness.detail
    } catch (caughtError) {
      const nextReadiness = summarizeLiveUploadReadinessFailure(caughtError)
      setLiveUploadReadiness(nextReadiness)
      return nextReadiness.detail
    }
  }

  const handleParse = async () => {
    if (readOnlyAccess) {
      setError('This reset window is now read only. Start a new package or live tier to upload fresh trades.')
      return
    }
    if (!paste.trim()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setParsedPreview(null)
      setLiveUploadProof(null)

      const preview = await parseTradePaste({ body: paste })
      const feedbackNotes = [
        `${preview.rowsParsed} rows detected`,
        `Symbols: ${preview.symbols.join(', ')}`,
        sampleMode
          ? 'Sample workspace can preview the parser, but it will not write trades to a permanent account.'
          : 'Confirm upload to append these trades to your live account and rerun analytics.',
      ]

      if (preview.issues && preview.issues.length > 0) {
        feedbackNotes.push(`Issues: ${preview.issues.join(', ')}`)
      }

      setNotes(feedbackNotes)
      setParsedPreview(preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse trades')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (readOnlyAccess) {
      setError('This reset window is now read only. Start a new package or live tier to upload fresh trades.')
      return
    }
    if (!parsedPreview) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const readinessError = await refreshLiveUploadReadiness()
      if (readinessError) {
        setError(`${readinessError} No live append was submitted.`)
        return
      }

      const result = await submitParsedTrades({
        trades: parsedPreview.trades || [],
        rawText: paste,
      })

      if (sampleMode || result.status === 'sample') {
        setSuccess(`Sample workspace processed ${result.trades_uploaded} trades.`)
        setNotes(buildSampleNotes(result.trades_uploaded))
        setLiveUploadProof(null)
        setTradingReportComparison(null)
      } else {
        setLiveUploadProof(result)
        const liveUploadSessionPatch = buildLiveUploadSessionPatch(result, effectiveSessionMeta, 'paste')
        if (!hasGeneratedUploadArtifactProof(result)) {
          updateSessionMeta(liveUploadSessionPatch)
          setTradingReportComparison(null)
          setSuccess('Upload received, but artifact proof is still pending.')
          setNotes(formatIncompleteUploadProofNotes(result))
        } else {
          updateSessionMeta(liveUploadSessionPatch)
          const lifecycleWarning = await tryLogFirstUploadLifecycleReceipt(result, effectiveSessionMeta, 'paste', market)
          const memory = await getTradePasteMemory().catch(() => null)
          const appendProofExpected = typeof result.append_count === 'number' && result.append_count >= 2
          const comparison = appendProofExpected
            ? await getTradingReportComparison().catch(() => null)
            : null
          setTradingReportComparison(comparison)
          const proofNotes = lifecycleWarning
            ? [...formatLiveUploadProofNotes(result), lifecycleWarning]
            : formatLiveUploadProofNotes(result)
          setSuccess(`Uploaded ${result.trades_uploaded} trades to your live account.`)
          setNotes(
            memory
              ? [...proofNotes, ...formatMemoryDelta(memory), ...(appendProofExpected ? formatAppendProofNotes(comparison) : [])]
              : [
                  ...proofNotes,
                  ...(appendProofExpected ? formatAppendProofNotes(comparison) : []),
                  'Analytics reran; artifact receipt above is the proof boundary for this append.',
                  'Trade Paste Memory is temporarily unavailable. Check back after your next session.',
                ],
          )
        }
      }

      setPaste('')
      setParsedPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload trades')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelUpload = () => {
    setParsedPreview(null)
    setLiveUploadProof(null)
    setTradingReportComparison(null)
    setNotes([])
  }

  const loadResetProSampleAppend = () => {
    setPaste(SAMPLE_PLACEHOLDER)
    setError(null)
    setSuccess(null)
    setParsedPreview(null)
    setLiveUploadProof(null)
    setNotes([
      'Reset Pro sample append packet loaded. Parse it to demonstrate the proof exit without claiming live persistence.',
      effectiveSessionMeta?.demoBridgeDecisionQuestion
        ? `Question being preserved: ${effectiveSessionMeta.demoBridgeDecisionQuestion}`
        : 'No carried private question was attached to this sample append.',
    ])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnlyAccess) {
      setError('This reset window is now read only. Start a new package or live tier to upload fresh trades.')
      resetFileInput()
      return
    }
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file')
      resetFileInput()
      return
    }

    let rescuedNotes: string[] = []

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const rescued = await rescueCsvForUpload(file)
      rescuedNotes = rescued.notes

      const readinessError = await refreshLiveUploadReadiness()
      if (readinessError) {
        setError(`${readinessError} No live CSV append was submitted.`)
        return
      }

      const result = await uploadTradesCSV(rescued.file)

      if (sampleMode || result.status === 'sample') {
        setSuccess('Sample workspace accepted the file for preview only.')
        setLiveUploadProof(null)
        setTradingReportComparison(null)
        setNotes([
          ...buildSampleNotes(Math.max(result.trades_uploaded, 1)),
          ...(rescued.applied ? rescued.notes : []),
        ])
      } else {
        setLiveUploadProof(result)
        const liveUploadSessionPatch = buildLiveUploadSessionPatch(result, effectiveSessionMeta, 'csv')
        if (!hasGeneratedUploadArtifactProof(result)) {
          updateSessionMeta(liveUploadSessionPatch)
          setTradingReportComparison(null)
          setSuccess('Upload received, but artifact proof is still pending.')
          setNotes([
            ...formatIncompleteUploadProofNotes(result),
            ...(rescued.applied ? rescued.notes : []),
          ])
        } else {
          updateSessionMeta(liveUploadSessionPatch)
          const lifecycleWarning = await tryLogFirstUploadLifecycleReceipt(result, effectiveSessionMeta, 'csv', market)
          const memory = await getTradePasteMemory().catch(() => null)
          const appendProofExpected = typeof result.append_count === 'number' && result.append_count >= 2
          const comparison = appendProofExpected
            ? await getTradingReportComparison().catch(() => null)
            : null
          setTradingReportComparison(comparison)
          const proofNotes = lifecycleWarning
            ? [...formatLiveUploadProofNotes(result), lifecycleWarning]
            : formatLiveUploadProofNotes(result)
          setSuccess(`Uploaded ${result.trades_uploaded} trades to your live account.`)
          setNotes(
            memory
              ? [
                  ...proofNotes,
                  ...(rescued.applied ? rescued.notes : []),
                  ...formatMemoryDelta(memory),
                  ...(appendProofExpected ? formatAppendProofNotes(comparison) : []),
                ]
              : [
                  ...proofNotes,
                  ...(rescued.applied ? rescued.notes : []),
                  ...(appendProofExpected ? formatAppendProofNotes(comparison) : []),
                  'Analytics reran; artifact receipt above is the proof boundary for this append.',
                  'Upload another batch to compare what actually changed between sessions.',
                ],
          )
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      if (rescuedNotes.length > 0) {
        setNotes([
          'Rescue summary before the failed upload:',
          ...rescuedNotes,
          'If the export is still failing, use the template or paste the smallest clean recent block manually.',
        ])
      }
    } finally {
      resetFileInput()
      setLoading(false)
    }
  }

  return (
    <div className="append-trades">
      {!sampleMode && <JourneyProgressCard state={journeyState} />}

      <div style={{ marginBottom: '1.5rem' }}>
        <PublicJourneySpine
          activeStage="append"
          detail="Close the sample Reset Pro demo on append proof. The endpoint shows workflow continuity, while live evidence still requires activation, normalized upload, generated artifacts, and repeat append history."
        />
      </div>

      <header className="section-header">
        <p className="badge">Append model</p>
        <h1>Paste today's trades</h1>
        <p className="text-muted">
          We normalize any format, dedupe against your baseline, and rerun analytics. The point is not file
          handling. The point is knowing what changed in your behavior after each session.
        </p>
      </header>

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <p className="badge">{runtimeContract.label}</p>
        <h3 style={{ marginTop: '0.5rem' }}>
          {sampleMode ? 'Learn the workflow before you connect real data.' : 'Append trades and inspect the delta, not just the upload.'}
        </h3>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          {sampleMode
            ? runtimeContract.proofBoundary
            : 'Live mode writes to your account history. Each upload should leave you with a cleaner view of win rate, discipline tax, stress score, and the decisions you need to make next.'}
        </p>
        {!sampleMode && traderMode && (
          <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            Current mode: {humanizeTraderMode(traderMode)}. Upload the block that best exposes the leak you actually need fixed, not the prettiest export you can find.
          </p>
        )}
      </section>

      <div aria-label="LIVE PROOF READINESS append contract">
        <LiveProofReadinessCard
          title="Before this upload can become live proof."
          overview={sampleMode ? null : dashboardOverview}
          sessionMeta={effectiveSessionMeta}
          profileCompleted={profileContext?.completed ?? dashboardOverview?.profile_completed ?? null}
          market={market}
          mode={runtimeContract.mode}
          appendProof={sampleMode ? null : tradingReportComparison?.append_proof ?? null}
        />
      </div>

      {!sampleMode ? (
        <section
          className="glass-panel"
          aria-label="LIVE APPEND READINESS boundary"
          style={{
            marginBottom: '1.5rem',
            borderColor:
              liveUploadReadiness.status === 'ready'
                ? 'rgba(16,185,129,0.24)'
                : liveUploadReadiness.status === 'checking'
                  ? 'rgba(14,165,233,0.22)'
                  : 'rgba(244,63,94,0.28)',
            background:
              liveUploadReadiness.status === 'ready'
                ? 'rgba(16,185,129,0.07)'
                : liveUploadReadiness.status === 'checking'
                  ? 'rgba(14,165,233,0.06)'
                  : 'rgba(244,63,94,0.08)',
          }}
        >
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>LIVE APPEND WRITE BOUNDARY</p>
              <h3 style={{ marginBottom: '0.5rem' }}>{liveUploadReadiness.headline}</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadReadiness.detail}</p>
            </div>
            <span className="badge">{liveUploadReadiness.status}</span>
          </div>
          <div className="grid-responsive four" style={{ marginTop: '1rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Uploads used</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadReadiness.uploadCount ?? 'Not returned'}</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Upload limit</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadReadiness.uploadLimit ?? 'Live/unbounded'}</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Remaining</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadReadiness.uploadsRemaining ?? 'Not capped'}</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Last snapshot</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadReadiness.lastReportSnapshotId ?? 'None yet'}</p>
            </article>
          </div>
          {liveUploadReadiness.blockers.length > 0 ? (
            <p className="text-muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
              Blockers: {liveUploadReadiness.blockers.join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}

      {liveActivationProofTarget ? (
        <section
          className="glass-panel"
          style={{
            marginBottom: '1.5rem',
            borderColor: 'rgba(16,185,129,0.24)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.09), rgba(14,165,233,0.05))',
          }}
        >
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>LIVE ACTIVATION PROOF TARGET</p>
              <h3 style={{ marginBottom: '0.5rem' }}>First meaningful upload turns this from carried context into account evidence.</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Payment and activation preserved the public story, report, and locked question. This page is the evidence checkpoint:
                upload real history, generate backend artifacts, then use append history to prove whether behavior changed.
              </p>
            </div>
          </div>
          <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {[
              ['Origin', liveActivationProofTarget.activationTitle],
              ['Report', liveActivationProofTarget.reportId],
              ['Locked module', liveActivationProofTarget.lockedSection],
              ['Public fingerprint', liveActivationProofTarget.fingerprint],
              ['Story handoff', liveActivationProofTarget.storyHandoff],
              ['Public signal markers', liveActivationProofTarget.signalMarkers],
              ['Backend teaser receipt', liveActivationProofTarget.teaserReceipt],
              ['Activation engagement receipt', liveActivationProofTarget.engagementReceipt],
            ].map(([label, value]) => (
              <article key={label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{label}</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{value}</p>
              </article>
            ))}
          </div>
          {liveActivationProofTarget.engagementBoundary ? (
            <p className="text-muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
              Engagement boundary: {liveActivationProofTarget.engagementBoundary}
            </p>
          ) : null}
          {liveActivationProofTarget.bridgeDecisionQuestion ? (
            <article
              className="glass-panel"
              style={{
                marginTop: '1rem',
                background: 'rgba(16,185,129,0.08)',
                borderColor: 'rgba(16,185,129,0.22)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO LIVE QUESTION</p>
              <h4 style={{ marginBottom: '0.5rem' }}>
                {liveActivationProofTarget.bridgeHeadline ?? 'The private question survived activation.'}
              </h4>
              <p style={{ marginBottom: '0.75rem', fontWeight: 700 }}>{liveActivationProofTarget.bridgeDecisionQuestion}</p>
              {liveActivationProofTarget.bridgeWhyNow ? (
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{liveActivationProofTarget.bridgeWhyNow}</p>
              ) : null}
              <p className="text-muted" style={{ marginBottom: liveActivationProofTarget.bridgeLiveProof.length ? '0.75rem' : 0 }}>
                The answer remains locked until this account supplies normalized history, generated artifacts, and repeat append evidence.
              </p>
              {liveActivationProofTarget.bridgeLiveProof.length ? (
                <ul className="notes-list" style={{ marginBottom: 0 }}>
                  {liveActivationProofTarget.bridgeLiveProof.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ) : null}
        </section>
      ) : null}

      <section
        className="glass-panel"
        style={{
          marginBottom: '1.5rem',
          borderColor: resetProPreview ? 'rgba(129, 140, 248, 0.28)' : 'rgba(255,255,255,0.08)',
          background: resetProPreview ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO PROOF EXIT</p>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {sampleMode ? 'This is the demo endpoint, not live evidence.' : 'This is where the live proof loop starts.'}
            </h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              The private demo ends here on purpose: parsing a sample proves the workflow, while live upload is what creates persistent history, deltas, and report artifacts.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {[
            {
              label: 'Parser preview',
              status: 'Ready now',
              detail: sampleMode
                ? 'Paste a sample block to show how Shibuya reads trade history without writing account data.'
                : 'Paste or upload a real session to preview what will be appended before committing it.',
            },
            {
              label: 'Persistence',
              status: sampleMode ? 'Sample only' : 'Live write',
              detail: sampleMode
                ? 'Sample mode does not persist uploads, change account history, or prove trader-specific improvement.'
                : 'Confirmed uploads write to the live account and move the workspace toward baseline_ready.',
            },
            {
              label: 'Reset Pro review',
              status: sampleMode ? 'Still locked for proof' : 'Evidence path',
              detail: sampleMode
                ? 'Guided review language can be demonstrated, but the real checkpoint requires activation plus the first meaningful upload.'
                : 'The first meaningful upload is the evidence trigger for deeper Reset Pro review surfaces.',
            },
          ].map((item) => (
            <article key={item.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>{item.status}</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{item.label}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{item.detail}</p>
            </article>
          ))}
        </div>
        {resetProPreview ? (
          <>
            {resetProAppendShortcut ? (
              <div
                className="glass-panel"
                style={{
                  marginTop: '1rem',
                  borderColor: 'rgba(251,191,36,0.3)',
                  background: 'rgba(251,191,36,0.08)',
                }}
              >
                <p className="badge" style={{ marginBottom: '0.5rem' }}>PRESENTER-GATED APPEND SHORTCUT</p>
                <h4 style={{ marginBottom: '0.5rem' }}>This close was opened directly after the private gate.</h4>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>
                  The presenter code created Reset Pro sample context, then routed here to close the demo quickly.
                  This bypasses Mission HQ intentionally for recovery speed; it does not prove live persistence or account analytics.
                </p>
                <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
                  {[
                    {
                      label: 'Gate proof',
                      body: 'Presenter code accepted; sample context attached.',
                    },
                    {
                      label: 'Route skipped',
                      body: 'Mission HQ was bypassed for append close; do not claim the full private workspace walkthrough happened.',
                    },
                    {
                      label: 'Correct close',
                      body: 'Load sample trades, parse, confirm, then read the append proof receipt.',
                    },
                  ].map((row) => (
                    <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
                      <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
                      <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: 'rgba(129, 140, 248, 0.3)',
                background: 'rgba(99,102,241,0.08)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO APPEND CLOSE CHECKLIST</p>
              <h4 style={{ marginBottom: '0.5rem' }}>End the demo by proving the workflow, not the trader.</h4>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                Use this before loading the sample packet so the close stays tight: context carried, workflow shown,
                claims bounded, live proof path stated.
              </p>
              <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
                {resetProCloseChecklistRows.map((row) => (
                  <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: 'rgba(125,211,252,0.22)',
                background: 'rgba(14,165,233,0.07)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO SAMPLE APPEND PACKET</p>
              <h4 style={{ marginBottom: '0.5rem' }}>Load the closing sample in one click.</h4>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                This fills the paste parser with a tiny trade block so the presenter can show parse, confirm, and append receipt.
                It is still sample workflow proof only.
              </p>
              <button className="btn btn-sm btn-secondary" type="button" onClick={loadResetProSampleAppend}>
                Load Reset Pro Sample Trades
              </button>
            </div>
          </>
        ) : null}
      </section>

      {readOnlyAccess && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <p className="badge">Read only</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            This legacy bounded reset window has expired. You can still review the board and trade history, but new uploads require a live monthly tier.
          </p>
        </div>
      )}

      {error && (
        <div className="error-panel glass-panel">
          <p>Warning: {error}</p>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setError(null)}
            style={{ marginTop: '0.5rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="success-panel glass-panel">
          <p>{success}</p>
          {resetProPreview ? (
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: 'rgba(16,185,129,0.24)',
                background: 'rgba(16,185,129,0.07)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO APPEND PROOF RECEIPT</p>
              <h3 style={{ marginBottom: '0.5rem' }}>The demo closed correctly: workflow shown, live proof still locked.</h3>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                This receipt is the final presenter boundary after the private workspace demo. It proves the append path is understandable;
                it does not prove trader-specific improvement, persistence, or generated backend analytics.
              </p>
              <div className="grid-responsive three">
                {resetProProofReceiptRows.map((row) => (
                  <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
                  </article>
                ))}
              </div>
              <div className="flex items-center gap-3" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link to={addMarketToPath('/dashboard', market)} className="btn btn-sm btn-primary">
                  Return To Mission HQ
                </Link>
                <Link to={addMarketToPath('/pricing?upgrade=reset-pro', market)} className="btn btn-sm btn-secondary">
                  Activate Live Reset Pro
                </Link>
              </div>
            </div>
          ) : null}
          {!sampleMode && liveUploadProof ? (
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: liveUploadHasGeneratedArtifactProof ? 'rgba(16,185,129,0.24)' : 'rgba(245,158,11,0.32)',
                background: liveUploadHasGeneratedArtifactProof ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.08)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>LIVE APPEND PROOF RECEIPT</p>
              <h3 style={{ marginBottom: '0.5rem' }}>
                {liveUploadHasGeneratedArtifactProof
                  ? 'Backend artifact generated for this account.'
                  : 'Upload succeeded, but artifact proof is incomplete.'}
              </h3>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                This receipt comes from the Medallion upload response. A live baseline is only claimed after a generated artifact
                snapshot, request receipt, and durable append count are all present.
              </p>
              <div className="grid-responsive three">
                <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Snapshot</h4>
                  <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadProof.report_snapshot_id ?? 'Missing from response'}</p>
                </article>
                <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Report artifact</h4>
                  <p className="text-muted" style={{ marginBottom: 0 }}>{liveUploadProof.report_id ?? 'Not returned'}</p>
                </article>
                <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Append count</h4>
                  <p className="text-muted" style={{ marginBottom: 0 }}>
                    {typeof liveUploadProof.append_count === 'number' ? liveUploadProof.append_count : 'Not returned'}
                  </p>
                </article>
              </div>
            </div>
          ) : null}
          {!sampleMode && (
            <div className="flex items-center gap-3" style={{ marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-sm btn-primary" style={{ display: 'inline-flex' }}>
                Open Action Board
              </Link>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                Redirecting there automatically in a moment.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="append-grid">
        <div className="glass-panel">
          <div className="csv-requirements">
            <div className="requirements-header">
              <span className="requirements-title">
                CSV format requirements
                <InfoTooltip content="Your CSV must include these exact column headers." />
              </span>
              <button className="btn btn-sm btn-secondary" onClick={downloadTemplate}>
                Download template
              </button>
            </div>
            <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              Auto-rescue now handles the ugly-export reality too: semicolon, tab, and pipe files, split
              date/time columns, currency-formatted PnL, and obvious ledger or charge rows.
            </p>
            <div className="requirements-list">
              <div className="requirement-item">
                <code>timestamp</code>
                <span>Entry time (YYYY-MM-DD HH:MM:SS)</span>
              </div>
              <div className="requirement-item">
                <code>exit_time</code>
                <span>Exit time (YYYY-MM-DD HH:MM:SS)</span>
              </div>
              <div className="requirement-item">
                <code>Symbol</code>
                <span>Trading instrument (for example, NIFTY, BANKNIFTY, RELIANCE, TCS)</span>
              </div>
              <div className="requirement-item">
                <code>size</code>
                <span>Position size in lots</span>
              </div>
              <div className="requirement-item">
                <code>pnl</code>
                <span>Profit or loss in account currency</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>{uploadPlaybook.title}</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Best source right now: {uploadPlaybook.sourceLabel}. {uploadPlaybook.successHint}
            </p>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Fallback if the native export is ugly: {uploadPlaybook.fallbackSource}
            </p>
            <div className="grid-responsive two" style={{ marginBottom: '0.75rem' }}>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Best path</strong>
                <ul className="notes-list">
                  {uploadPlaybook.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Watchouts</strong>
                <ul className="notes-list">
                  {uploadPlaybook.watchouts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          {!sampleMode && (
            <ImportConciergeCard
              profile={profileContext}
              playbook={uploadPlaybook}
              premiumAccess={premiumAccess}
            />
          )}

          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Popular export starting points</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              If you trade through Zerodha, Dhan, Angel One, Upstox, FYERS, MT4, MT5, or a prop platform, export the session to CSV and map it into the template if needed. The point is not perfect formatting. The point is getting the next-session leak on screen quickly.
            </p>
            <div className="grid-responsive three" style={{ marginBottom: '0.75rem' }}>
              {INDIA_EXPORT_PRESETS.map((preset) => (
                <article key={preset.label} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{preset.label}</strong>
                  <p className="text-muted" style={{ marginBottom: 0 }}>{preset.body}</p>
                </article>
              ))}
            </div>
            <ul className="notes-list">
              <li>Use one row per closed trade.</li>
              <li>Keep timestamps in local trade order so session clusters stay interpretable.</li>
              <li>Profit and loss should be in your account currency.</li>
              <li>If your broker only emails contract notes, export the recent closed trades from there and clean it into the template. That is a valid V1 path.</li>
            </ul>
          </div>

          <div className="upload-section">
            <label className="file-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading || readOnlyAccess}
              />
              <span className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}>
                {loading ? 'Uploading...' : 'Upload CSV file'}
              </span>
            </label>
            <p className="text-muted divider">or paste trades below</p>
          </div>

          <label>
            Trades
            <textarea
              value={paste}
              onChange={(event) => {
                setPaste(event.target.value)
                if (parsedPreview) {
                  setParsedPreview(null)
                  setNotes([])
                }
              }}
              placeholder={SAMPLE_PLACEHOLDER}
              disabled={loading || readOnlyAccess}
            />
          </label>

          {!parsedPreview ? (
            <button className="btn btn-secondary" onClick={handleParse} disabled={!paste.trim() || loading || readOnlyAccess}>
              {loading ? 'Parsing...' : 'Parse and preview trades'}
            </button>
          ) : (
            <div className="confirm-actions">
              <button className="btn btn-primary" onClick={handleConfirmUpload} disabled={loading || readOnlyAccess}>
                {loading ? 'Uploading...' : `Confirm upload (${parsedPreview.rowsParsed} trades)`}
              </button>
              <button className="btn btn-secondary" onClick={handleCancelUpload} disabled={loading}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="glass-panel">
          <p className="badge">Trade Paste Memory</p>
          {notes.length === 0 ? (
            <div>
              <p className="text-muted">
                {sampleMode
                  ? 'Parse a sample session to see what the workflow feels like.'
                  : 'Upload a real session to see what changed between your latest and previous baseline.'}
              </p>
              <ul className="notes-list">
                <li>Win rate</li>
                <li>Discipline tax</li>
                <li>Stress score (BDS)</li>
                <li>Sharpe ratio</li>
              </ul>
            </div>
          ) : (
            <ul className="notes-list">
              {notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}

          <div className="supported-platforms">
            <p className="platform-label">Supported Platforms</p>
            <div className="platform-list">
              <span className="platform-badge">Zerodha CSV</span>
              <span className="platform-badge">Dhan CSV</span>
              <span className="platform-badge">Angel One CSV</span>
              <span className="platform-badge">Upstox CSV</span>
              <span className="platform-badge">FYERS CSV</span>
              <span className="platform-badge">MT4</span>
              <span className="platform-badge">MT5</span>
              <span className="platform-badge">Prop Portal CSV</span>
              <span className="platform-badge">Contract Note Export</span>
              <span className="platform-badge">Email Contract Note</span>
              <span className="platform-badge">Custom CSV</span>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>What happens after upload</h4>
            <ul className="notes-list">
              <li>Your account history updates.</li>
              <li>The Action Board reranks the most expensive behavioral leak.</li>
              <li>Trade Paste Memory compares this session against the previous one.</li>
              <li>Reset Pro traders unlock the deeper corrective surfaces when they matter.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
