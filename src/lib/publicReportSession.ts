import type { Market } from './market'
import type { PublicTeaserReportResponse } from './api/publicReport'
import { buildLiveProofReadinessContract, type LiveProofReadinessRow } from './liveProofReadiness'
import {
  getFingerprintAxis,
  getPublicStorySignalMarkers,
  normalizePublicStorySignalMarkerIds,
  type FingerprintAxisId,
  type PublicStorySignalMarkerId,
  type StoryArchetypeId,
} from './storyExperience'

export const PUBLIC_REPORT_SESSION_STORAGE_KEY = 'shibuya_public_report_sessions_v1'
export const DEMO_LAUNCHER_SAMPLE_PACKET_PARAM = 'demo_packet'
export const DEMO_LAUNCHER_SAMPLE_PACKET_VALUE = 'launcher_sample'

export type PublicReportSource = 'file' | 'paste' | 'mixed' | 'sample' | 'backend_teaser'
export type PublicReportArtifactStatus =
  | 'local_preview_only'
  | 'sample_demo_only'
  | 'backend_teaser_generated'
  | 'backend_teaser_persisted'

export interface PublicReportValidationInput {
  reportId: string
  market: Market
  archetypeId: StoryArchetypeId
  axisId: FingerprintAxisId
  fileName?: string
  fileValidationFacts?: string[]
  pasteBody?: string
  source: 'upload' | 'sample' | 'backend_teaser'
  storySource?: string | null
  selectedPainAxisIds?: string[]
  visitedSceneCount?: number
  signalMarkerIds?: string[]
  backendTeaser?: PublicTeaserReportResponse | null
}

export interface PublicReportSession {
  reportId: string
  market: Market
  archetypeId: StoryArchetypeId
  axisId: FingerprintAxisId
  source: PublicReportSource
  createdAt: string
  evidenceLabel: string
  artifactStatus: PublicReportArtifactStatus
  artifactStatusLabel: string
  productionArtifactProven: boolean
  validationSummary: string
  validationFacts: string[]
  boundary: string
  storySource?: 'guided' | 'direct'
  selectedPainAxisIds: FingerprintAxisId[]
  visitedSceneCount: number
  signalMarkerIds: PublicStorySignalMarkerId[]
  liveProofGap: PublicReportLiveProofGap
  backendTeaser?: PublicTeaserReportReceipt | null
}

export interface PublicTeaserReportReceipt {
  reportId?: string
  requestId: string
  artifactStatus?: string
  receiptHash?: string
  tradesAnalyzed: number
  disciplineTax?: number
  totalPnl?: number
  winRate?: number
  worstPattern?: string
  hook?: string
  processingTimeSeconds?: number
  createdAt?: string
}

export interface PublicReportLiveProofGap {
  statusLabel: string
  headline: string
  rows: LiveProofReadinessRow[]
  boundary: string
}

export interface PublicReportInputValidationState {
  fileValidationPassed?: boolean
  fileValidationError?: string | null
}

interface PublicReportSessionStore {
  sessions: Record<string, PublicReportSession>
}

interface HeaderGroup {
  label: string
  patterns: RegExp[]
}

const PASTE_SEPARATORS = [',', '\t', ';', '|'] as const

const REQUIRED_PASTE_HEADER_GROUPS: HeaderGroup[] = [
  {
    label: 'date/time',
    patterns: [/\bdate\b/i, /\btime\b/i, /\btimestamp\b/i, /\bopened\b/i, /\bclosed\b/i],
  },
  {
    label: 'symbol/instrument',
    patterns: [/\bsymbol\b/i, /\bticker\b/i, /\binstrument\b/i, /\bpair\b/i, /\bmarket\b/i],
  },
  {
    label: 'side/direction',
    patterns: [/\bside\b/i, /\bdirection\b/i, /\btype\b/i, /\baction\b/i, /\bbuy\b/i, /\bsell\b/i],
  },
  {
    label: 'pnl/price',
    patterns: [/\bpnl\b/i, /\bp\/l\b/i, /\bprofit\b/i, /\bloss\b/i, /\bnet\b/i, /\bentry\b/i, /\bexit\b/i, /\bprice\b/i],
  },
]

function getFileExtension(fileName: string): string {
  const candidate = fileName.split('.').pop()?.trim().toLowerCase()

  if (!candidate || candidate === fileName.toLowerCase()) {
    return 'file'
  }

  return candidate.replace(/[^a-z0-9]/g, '') || 'file'
}

function getSource(params: Pick<PublicReportValidationInput, 'fileName' | 'pasteBody' | 'source'>): PublicReportSource {
  if (params.source === 'sample') {
    return 'sample'
  }
  if (params.source === 'backend_teaser') {
    return 'backend_teaser'
  }

  const hasFile = Boolean(params.fileName)
  const hasPaste = Boolean(params.pasteBody?.trim())

  if (hasFile && hasPaste) {
    return 'mixed'
  }
  if (hasFile) {
    return 'file'
  }
  return 'paste'
}

function normalizeVisitedSceneCount(value?: number): number {
  if (!Number.isFinite(value) || !value) {
    return 0
  }

  return Math.max(0, Math.min(15, Math.floor(value)))
}

function normalizePainAxes(axisIds?: string[]): FingerprintAxisId[] {
  const seen = new Set<FingerprintAxisId>()

  for (const axisId of axisIds ?? []) {
    const axis = getFingerprintAxis(axisId)
    if (axis.id === axisId && !seen.has(axis.id)) {
      seen.add(axis.id)
    }
  }

  return [...seen]
}

function getPasteRows(pasteBody?: string): string[] {
  return (pasteBody ?? '')
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
}

function detectPasteSeparator(headerRow: string): (typeof PASTE_SEPARATORS)[number] | null {
  let bestSeparator: (typeof PASTE_SEPARATORS)[number] | null = null
  let bestCount = 0

  for (const separator of PASTE_SEPARATORS) {
    const count = headerRow.split(separator).length - 1
    if (count > bestCount) {
      bestSeparator = separator
      bestCount = count
    }
  }

  return bestCount > 0 ? bestSeparator : null
}

function splitPasteRow(row: string, separator: (typeof PASTE_SEPARATORS)[number]): string[] {
  return row.split(separator).map((cell) => cell.trim()).filter(Boolean)
}

function getMissingPasteHeaderGroups(headerCells: string[]): string[] {
  return REQUIRED_PASTE_HEADER_GROUPS
    .filter((group) => !headerCells.some((cell) => group.patterns.some((pattern) => pattern.test(cell))))
    .map((group) => group.label)
}

export function validatePublicPasteSample(pasteBody?: string): string | null {
  const rows = getPasteRows(pasteBody)

  if (rows.length === 0) {
    return 'Attach a CSV/export, choose a local file, or paste a small table with headers such as date, symbol, side, entry, exit, pnl. For a demo, use the sample report button.'
  }

  const separator = detectPasteSeparator(rows[0])
  if (!separator) {
    return 'Paste a table-like sample, not free text: use comma, tab, semicolon, or pipe-separated columns such as date, symbol, side, entry, exit, pnl.'
  }

  const headerCells = splitPasteRow(rows[0], separator)
  if (headerCells.length < 4) {
    return 'The pasted header needs at least four columns, including date/time, symbol/instrument, side/direction, and pnl/price fields.'
  }

  const missingGroups = getMissingPasteHeaderGroups(headerCells)
  if (missingGroups.length > 0) {
    return `The pasted header is missing required fields: ${missingGroups.join(', ')}. Use headers such as date, symbol, side, entry, exit, pnl.`
  }

  if (rows.length < 2) {
    return 'Paste at least one trade row under the header so the preview can validate the sample structure.'
  }

  const firstTradeRowCells = splitPasteRow(rows[1], separator)
  if (firstTradeRowCells.length < 3 || firstTradeRowCells.length < Math.min(4, headerCells.length - 1)) {
    return 'The first pasted trade row needs multiple columns under the header, for example: 2026-06-18,EURUSD,buy,1.0800,1.0830,30.'
  }

  return null
}

export function buildPublicReportSession(params: PublicReportValidationInput): PublicReportSession {
  const pasteLength = params.pasteBody?.trim().length ?? 0
  const source = getSource(params)
  const extension = params.fileName ? getFileExtension(params.fileName) : null
  const storySource = params.storySource === 'guided' ? 'guided' : 'direct'
  const selectedPainAxisIds = normalizePainAxes(params.selectedPainAxisIds)
  const visitedSceneCount = normalizeVisitedSceneCount(params.visitedSceneCount)
  const signalMarkerIds = normalizePublicStorySignalMarkerIds(params.signalMarkerIds)
  const signalMarkers = getPublicStorySignalMarkers(signalMarkerIds)
  const liveProofGap = buildLiveProofReadinessContract()
  const backendTeaser = params.backendTeaser?.status === 'success'
    ? {
        reportId: params.backendTeaser.report_id,
        requestId: params.backendTeaser.request_id,
        artifactStatus: params.backendTeaser.artifact_status,
        receiptHash: params.backendTeaser.receipt_hash,
        tradesAnalyzed: params.backendTeaser.trades_analyzed,
        disciplineTax: params.backendTeaser.headline?.discipline_tax,
        totalPnl: params.backendTeaser.headline?.total_pnl,
        winRate: params.backendTeaser.headline?.win_rate,
        worstPattern: params.backendTeaser.headline?.worst_pattern,
        hook: params.backendTeaser.headline?.hook,
        processingTimeSeconds: params.backendTeaser.processing_time_seconds,
        createdAt: params.backendTeaser.created_at,
      }
    : null
  const backendTeaserPersisted = backendTeaser?.artifactStatus === 'backend_teaser_persisted'
  const storyFacts =
    storySource === 'guided'
      ? [
          'Public story handoff: guided StoryExperience route.',
          `Story scenes viewed before upload: ${visitedSceneCount}.`,
          selectedPainAxisIds.length > 0
            ? `Selected public pain axes: ${selectedPainAxisIds.map((axisId) => getFingerprintAxis(axisId).label).join(', ')}.`
            : 'Selected public pain axes: none captured.',
          signalMarkers.length > 0
            ? `Website-level signal markers: ${signalMarkers.map((marker) => marker.label).join(', ')}.`
            : 'Website-level signal markers: none captured.',
        ]
      : ['Public story handoff: direct upload recovery route; no guided StoryExperience packet was attached.']
  const evidenceLabel =
    source === 'sample'
      ? 'Sample history packet'
      : source === 'backend_teaser'
        ? 'Persisted backend teaser receipt'
      : source === 'mixed'
        ? `Local ${extension?.toUpperCase()} file plus pasted sample`
        : source === 'file'
          ? `Local ${extension?.toUpperCase()} file selected`
          : 'Pasted trade sample'
  const artifactStatus: PublicReportArtifactStatus = backendTeaser
    ? backendTeaserPersisted
      ? 'backend_teaser_persisted'
      : 'backend_teaser_generated'
    : source === 'sample'
      ? 'sample_demo_only'
      : 'local_preview_only'
  const artifactStatusLabel = backendTeaser
    ? backendTeaserPersisted
      ? 'Backend teaser persisted'
      : 'Backend teaser generated'
    : source === 'sample'
      ? 'Sample demo only'
      : 'Local preview only'

  const validationFacts =
    source === 'sample'
      ? [
          ...storyFacts,
          'Artifact status: sample demo only; no backend-generated production report exists for this packet.',
          'Sample packet selected for expo/demo flow.',
          'No production upload or account-specific analysis is claimed.',
          'The free report remains a public preview until live activation.',
        ]
      : source === 'backend_teaser'
        ? [
            ...storyFacts,
            backendTeaser
              ? backendTeaserPersisted && backendTeaser.reportId
                ? `Backend teaser recovered: report ${backendTeaser.reportId}; request ${backendTeaser.requestId}; ${backendTeaser.tradesAnalyzed} trades analyzed.`
                : `Backend teaser recovered: request ${backendTeaser.requestId}; ${backendTeaser.tradesAnalyzed} trades analyzed.`
              : 'Backend teaser recovery failed; no backend report receipt is attached.',
            backendTeaserPersisted && backendTeaser?.receiptHash
              ? `Backend teaser receipt hash: ${backendTeaser.receiptHash}.`
              : null,
            backendTeaser?.hook ? `Backend teaser hook: ${backendTeaser.hook}` : null,
            'Recovered from Medallion by report id/request id; no raw trade rows or local file metadata are stored in this browser packet.',
            'Private conclusions still require activation, live upload, generated artifacts, and append history.',
          ].filter((fact): fact is string => Boolean(fact))
      : [
          ...storyFacts,
          backendTeaser
            ? backendTeaserPersisted && backendTeaser.reportId
              ? `Backend teaser persisted: report ${backendTeaser.reportId}; request ${backendTeaser.requestId}; ${backendTeaser.tradesAnalyzed} trades analyzed.`
              : `Backend teaser generated: request ${backendTeaser.requestId}; ${backendTeaser.tradesAnalyzed} trades analyzed.`
            : 'Artifact status: local preview only; no backend-generated production report exists for this packet.',
          backendTeaserPersisted && backendTeaser.receiptHash
            ? `Backend teaser receipt hash: ${backendTeaser.receiptHash}.`
            : null,
          backendTeaser?.hook ? `Backend teaser hook: ${backendTeaser.hook}` : null,
          params.fileName ? `Detected local file extension: ${extension}` : 'No local file selected.',
          ...(params.fileValidationFacts ?? []),
          pasteLength > 0 ? `Pasted sample length: ${pasteLength} characters.` : 'No pasted trade sample included.',
          pasteLength > 0 && !validatePublicPasteSample(params.pasteBody)
            ? 'Pasted sample passed local structure check: date/time, instrument, direction, and result/price fields detected.'
            : 'No validated pasted table structure included.',
          'Raw file contents and pasted trade rows are not stored by this public preview.',
        ].filter((fact): fact is string => Boolean(fact))

  return {
    reportId: params.reportId,
    market: params.market,
    archetypeId: params.archetypeId,
    axisId: params.axisId,
    source,
    createdAt: new Date().toISOString(),
    evidenceLabel,
    artifactStatus,
    artifactStatusLabel,
    productionArtifactProven: false,
    validationSummary:
      source === 'sample'
        ? 'Demo packet accepted. This proves the public journey transition, not live analytics.'
        : backendTeaser
          ? source === 'backend_teaser'
            ? 'Backend teaser receipt recovered from Medallion. This proves public report processing and retrieval identity, while private conclusions still require activation, live upload, and append history.'
            : backendTeaserPersisted
            ? 'Backend teaser receipt persisted. This proves public report processing and retrieval identity, while private conclusions still require activation, live upload, and append history.'
            : 'Backend teaser report generated. This proves public report processing, while private conclusions still require activation, live upload, and append history.'
          : 'Public preview validation passed. The full production report still requires backend normalization and generated artifacts.',
    validationFacts,
    boundary: backendTeaser
      ? backendTeaserPersisted
        ? 'This packet stores only the persisted backend teaser receipt and secret-free handoff metadata. Raw trade rows are not stored in browser session state.'
        : 'This packet stores only the backend teaser receipt and secret-free handoff metadata. Raw trade rows are not stored in browser session state.'
      : 'This packet is stored locally in the browser and contains no raw trade rows. It is not a production report artifact.',
    storySource,
    selectedPainAxisIds,
    visitedSceneCount,
    signalMarkerIds,
    liveProofGap: {
      statusLabel: liveProofGap.statusLabel,
      headline: liveProofGap.headline,
      rows: liveProofGap.rows,
      boundary: liveProofGap.boundary,
    },
    backendTeaser,
  }
}

export function hasDemoLauncherSamplePacketRequest(search: string): boolean {
  return new URLSearchParams(search).get(DEMO_LAUNCHER_SAMPLE_PACKET_PARAM) === DEMO_LAUNCHER_SAMPLE_PACKET_VALUE
}

export function isDemoLauncherSampleReportSession(session?: PublicReportSession | null): boolean {
  return session?.evidenceLabel === 'Demo launcher sample packet'
}

export function appendDemoLauncherSamplePacketParam(
  params: URLSearchParams,
  shouldAppend: boolean,
): URLSearchParams {
  if (shouldAppend) {
    params.set(DEMO_LAUNCHER_SAMPLE_PACKET_PARAM, DEMO_LAUNCHER_SAMPLE_PACKET_VALUE)
  }

  return params
}

export function appendDemoLauncherSamplePacketToPath(path: string, shouldAppend: boolean): string {
  if (!shouldAppend) {
    return path
  }

  const [pathname, search = ''] = path.split('?')
  const params = appendDemoLauncherSamplePacketParam(new URLSearchParams(search), true)

  return `${pathname}?${params.toString()}`
}

export function buildDemoLauncherSampleReportSession(
  params: Omit<PublicReportValidationInput, 'fileName' | 'pasteBody' | 'source'>,
): PublicReportSession {
  const session = buildPublicReportSession({
    ...params,
    source: 'sample',
  })

  return {
    ...session,
    evidenceLabel: 'Demo launcher sample packet',
    artifactStatus: 'sample_demo_only',
    artifactStatusLabel: 'Controlled launcher sample only',
    productionArtifactProven: false,
    validationSummary: 'Demo launcher packet accepted. This proves the shared demo path transition, not live analytics.',
    validationFacts: [
      ...session.validationFacts.filter((fact) => fact !== 'Sample packet selected for expo/demo flow.'),
      'Demo launcher initialized this sample packet from an explicit shared-link flag.',
      'No visitor file, raw trade row, production upload, or account-specific analysis is claimed.',
    ],
    boundary: 'This launcher packet is stored locally in the browser and contains no raw trade rows. It is a sample demo artifact, not a production report artifact.',
  }
}

export function validatePublicReportInput(
  params: Pick<PublicReportValidationInput, 'fileName' | 'pasteBody' | 'source'> & PublicReportInputValidationState,
): string | null {
  if (params.source === 'sample') {
    return null
  }
  if (params.source === 'backend_teaser') {
    return null
  }

  const pasteError = validatePublicPasteSample(params.pasteBody)
  if (params.pasteBody?.trim() && !pasteError) {
    return null
  }

  if (params.fileName) {
    if (params.fileValidationError) {
      return params.fileValidationError
    }
    if (params.fileValidationPassed) {
      return null
    }
    return 'The selected file has not passed a local structure check yet. Use CSV/TXT with date, symbol, side, entry, exit, pnl columns, or paste a small trade table.'
  }

  return pasteError
}

function readStore(): PublicReportSessionStore {
  if (typeof window === 'undefined') {
    return { sessions: {} }
  }

  try {
    const raw = window.localStorage.getItem(PUBLIC_REPORT_SESSION_STORAGE_KEY)
    if (!raw) {
      return { sessions: {} }
    }

    const parsed = JSON.parse(raw) as Partial<PublicReportSessionStore>
    return parsed && typeof parsed === 'object' && parsed.sessions
      ? { sessions: parsed.sessions }
      : { sessions: {} }
  } catch {
    return { sessions: {} }
  }
}

export function persistPublicReportSession(session: PublicReportSession): void {
  if (typeof window === 'undefined') {
    return
  }

  const store = readStore()
  window.localStorage.setItem(
    PUBLIC_REPORT_SESSION_STORAGE_KEY,
    JSON.stringify({
      sessions: {
        ...store.sessions,
        [session.reportId]: session,
      },
    }),
  )
}

export function getPublicReportSession(reportId?: string | null): PublicReportSession | null {
  if (!reportId) {
    return null
  }

  return readStore().sessions[reportId] ?? null
}
