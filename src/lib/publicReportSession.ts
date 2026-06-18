import type { Market } from './market'
import {
  getFingerprintAxis,
  type FingerprintAxisId,
  type StoryArchetypeId,
} from './storyExperience'

export const PUBLIC_REPORT_SESSION_STORAGE_KEY = 'shibuya_public_report_sessions_v1'

export type PublicReportSource = 'file' | 'paste' | 'mixed' | 'sample'

export interface PublicReportValidationInput {
  reportId: string
  market: Market
  archetypeId: StoryArchetypeId
  axisId: FingerprintAxisId
  fileName?: string
  pasteBody?: string
  source: 'upload' | 'sample'
  storySource?: string | null
  selectedPainAxisIds?: string[]
  visitedSceneCount?: number
}

export interface PublicReportSession {
  reportId: string
  market: Market
  archetypeId: StoryArchetypeId
  axisId: FingerprintAxisId
  source: PublicReportSource
  createdAt: string
  evidenceLabel: string
  validationSummary: string
  validationFacts: string[]
  boundary: string
  storySource?: 'guided' | 'direct'
  selectedPainAxisIds: FingerprintAxisId[]
  visitedSceneCount: number
}

interface PublicReportSessionStore {
  sessions: Record<string, PublicReportSession>
}

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

export function buildPublicReportSession(params: PublicReportValidationInput): PublicReportSession {
  const pasteLength = params.pasteBody?.trim().length ?? 0
  const source = getSource(params)
  const extension = params.fileName ? getFileExtension(params.fileName) : null
  const storySource = params.storySource === 'guided' ? 'guided' : 'direct'
  const selectedPainAxisIds = normalizePainAxes(params.selectedPainAxisIds)
  const visitedSceneCount = normalizeVisitedSceneCount(params.visitedSceneCount)
  const storyFacts =
    storySource === 'guided'
      ? [
          'Public story handoff: guided StoryExperience route.',
          `Story scenes viewed before upload: ${visitedSceneCount}.`,
          selectedPainAxisIds.length > 0
            ? `Selected public pain axes: ${selectedPainAxisIds.map((axisId) => getFingerprintAxis(axisId).label).join(', ')}.`
            : 'Selected public pain axes: none captured.',
        ]
      : ['Public story handoff: direct upload route.']
  const evidenceLabel =
    source === 'sample'
      ? 'Sample history packet'
      : source === 'mixed'
        ? `Local ${extension?.toUpperCase()} file plus pasted sample`
        : source === 'file'
          ? `Local ${extension?.toUpperCase()} file selected`
          : 'Pasted trade sample'

  const validationFacts =
    source === 'sample'
      ? [
          ...storyFacts,
          'Sample packet selected for expo/demo flow.',
          'No production upload or account-specific analysis is claimed.',
          'The free report remains a public preview until live activation.',
        ]
      : [
          ...storyFacts,
          params.fileName ? `Detected local file extension: ${extension}` : 'No local file selected.',
          pasteLength > 0 ? `Pasted sample length: ${pasteLength} characters.` : 'No pasted trade sample included.',
          'Raw file contents and pasted trade rows are not stored by this public preview.',
        ]

  return {
    reportId: params.reportId,
    market: params.market,
    archetypeId: params.archetypeId,
    axisId: params.axisId,
    source,
    createdAt: new Date().toISOString(),
    evidenceLabel,
    validationSummary:
      source === 'sample'
        ? 'Demo packet accepted. This proves the public journey transition, not live analytics.'
        : 'Public preview validation passed. The full production report still requires backend normalization and generated artifacts.',
    validationFacts,
    boundary: 'This packet is stored locally in the browser and contains no raw trade rows. It is not a production report artifact.',
    storySource,
    selectedPainAxisIds,
    visitedSceneCount,
  }
}

export function validatePublicReportInput(params: Pick<PublicReportValidationInput, 'fileName' | 'pasteBody' | 'source'>): string | null {
  if (params.source === 'sample') {
    return null
  }

  if (params.fileName) {
    return null
  }

  if ((params.pasteBody?.trim().length ?? 0) >= 40) {
    return null
  }

  return 'Attach a CSV/export or paste at least 40 characters of trade history. For a demo, use the sample report button.'
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
