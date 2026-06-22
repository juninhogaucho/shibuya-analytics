import type { AppendProofSummary, DashboardOverview, UploadProofReceipt } from './types'
import type { Market } from './market'
import type { ShibuyaRuntimeMode, ShibuyaSessionMeta } from './runtime'

export type LiveProofPhaseKey =
  | 'anonymous'
  | 'sample_preview'
  | 'activated_awaiting_context'
  | 'activated_awaiting_upload'
  | 'baseline_artifact_ready'
  | 'append_proof_ready'
  | 'read_only'

export type LiveProofEvidenceSource = 'none' | 'sample' | 'session' | 'overview' | 'mixed' | 'append_proof'

export interface LiveProofPhaseState {
  phase: LiveProofPhaseKey
  label: string
  statusLabel: string
  summary: string
  boundary: string
  nextAction: {
    label: string
    to: string
  }
  canClaimLiveActivation: boolean
  canClaimBaselineProof: boolean
  canClaimAppendProof: boolean
  evidenceSource: LiveProofEvidenceSource
  generatedUploadReceiptCount: number
  latestGeneratedReceipt: UploadProofReceipt | null
}

export interface BuildLiveProofPhaseOptions {
  overview?: DashboardOverview | null
  sessionMeta?: ShibuyaSessionMeta | null
  profileCompleted?: boolean | null
  market?: Market
  mode?: ShibuyaRuntimeMode
  appendProof?: AppendProofSummary | null
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function toInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value)
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function hasGeneratedUploadReceipt(receipt?: UploadProofReceipt | null): receipt is UploadProofReceipt {
  const appendCount = toInt(receipt?.append_count)
  const tradesUploaded = toInt(receipt?.trades_uploaded)
  return Boolean(
    receipt &&
      !hasText(receipt.proof_validation_error) &&
      receipt.artifact_status === 'generated' &&
      hasText(receipt.report_snapshot_id) &&
      hasText(receipt.request_id) &&
      tradesUploaded !== null &&
      tradesUploaded >= 1 &&
      appendCount !== null &&
      appendCount >= 1,
  )
}

function generatedReceipts(receipts: Array<UploadProofReceipt | null | undefined>): UploadProofReceipt[] {
  const seen = new Set<string>()
  const generated: UploadProofReceipt[] = []

  for (const receipt of receipts) {
    if (!hasGeneratedUploadReceipt(receipt)) {
      continue
    }

    const key = receipt.request_id ?? receipt.report_snapshot_id ?? `${generated.length}`
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    generated.push(receipt)
  }

  return generated
}

function collectGeneratedReceipts(
  overview?: DashboardOverview | null,
  sessionMeta?: ShibuyaSessionMeta | null,
): { receipts: UploadProofReceipt[]; source: LiveProofEvidenceSource } {
  const overviewReceipts = generatedReceipts([
    ...(overview?.upload_receipt_history ?? []),
    overview?.first_upload_receipt,
    overview?.latest_upload_receipt,
  ])
  const sessionReceipts = generatedReceipts([
    ...(sessionMeta?.uploadReceiptHistory ?? []),
    sessionMeta?.firstUploadReceipt,
    sessionMeta?.latestUploadReceipt,
  ])

  if (overviewReceipts.length && sessionReceipts.length) {
    return { receipts: generatedReceipts([...overviewReceipts, ...sessionReceipts]), source: 'mixed' }
  }
  if (overviewReceipts.length) {
    return { receipts: overviewReceipts, source: 'overview' }
  }
  if (sessionReceipts.length) {
    return { receipts: sessionReceipts, source: 'session' }
  }

  return { receipts: [], source: 'none' }
}

function hasAppendProof(receipts: UploadProofReceipt[]): boolean {
  if (receipts.length >= 2) {
    return true
  }

  const latest = receipts[receipts.length - 1]
  const latestAppendCount = toInt(latest?.append_count)
  return latestAppendCount !== null && latestAppendCount >= 2
}

function hasGeneratedAppendProofSummary(proof?: AppendProofSummary | null): proof is AppendProofSummary {
  const uploadCount = toInt(proof?.upload_count)
  return Boolean(
    proof &&
      proof.status === 'comparison_ready' &&
      uploadCount !== null &&
      uploadCount >= 2 &&
      proof.latest_artifact_status === 'generated' &&
      hasText(proof.baseline_snapshot_id) &&
      hasText(proof.latest_snapshot_id) &&
      hasText(proof.latest_request_id),
  )
}

function appendProofUploadReceipt(proof: AppendProofSummary): UploadProofReceipt {
  const appendCount = toInt(proof.latest_append_count) ?? toInt(proof.upload_count) ?? 2
  const latestTradesUploaded = toInt(proof.latest_trades_uploaded)
  const receipt: UploadProofReceipt = {
    artifact_status: 'generated',
    report_snapshot_id: proof.latest_snapshot_id?.trim(),
    request_id: proof.latest_request_id?.trim(),
    append_count: appendCount,
  }

  if (hasText(proof.latest_report_id)) {
    receipt.report_id = proof.latest_report_id.trim()
  }
  if (hasText(proof.latest_upload_completed_at)) {
    receipt.completed_at = proof.latest_upload_completed_at.trim()
  }
  if (latestTradesUploaded !== null) {
    receipt.trades_uploaded = latestTradesUploaded
  }
  if (hasText(proof.activation_source)) {
    receipt.activation_source = proof.activation_source.trim()
  }
  if (hasText(proof.activation_report_id)) {
    receipt.activation_report_id = proof.activation_report_id.trim()
  }
  if (hasText(proof.activation_locked_section_id)) {
    receipt.activation_locked_section_id = proof.activation_locked_section_id.trim()
  }
  if (hasText(proof.activation_teaser_request_id)) {
    receipt.activation_teaser_request_id = proof.activation_teaser_request_id.trim()
  }
  if (typeof proof.activation_teaser_trades_analyzed === 'number' || hasText(proof.activation_teaser_trades_analyzed)) {
    receipt.activation_teaser_trades_analyzed = proof.activation_teaser_trades_analyzed
  }
  if (hasText(proof.activation_teaser_worst_pattern)) {
    receipt.activation_teaser_worst_pattern = proof.activation_teaser_worst_pattern.trim()
  }
  if (hasText(proof.activation_teaser_verified)) {
    receipt.activation_teaser_verified = proof.activation_teaser_verified.trim()
  }
  if (hasText(proof.activation_teaser_verification_status)) {
    receipt.activation_teaser_verification_status = proof.activation_teaser_verification_status.trim()
  }
  if (hasText(proof.activation_teaser_receipt_hash)) {
    receipt.activation_teaser_receipt_hash = proof.activation_teaser_receipt_hash.trim()
  }
  if (hasText(proof.activation_teaser_verified_at)) {
    receipt.activation_teaser_verified_at = proof.activation_teaser_verified_at.trim()
  }

  return receipt
}

function hasPrivateSampleReceipt(meta?: ShibuyaSessionMeta | null): boolean {
  return Boolean(
    meta?.samplePreview === 'reset_pro' &&
      meta.demoSource &&
      meta.demoReportId &&
      meta.demoPrivateGateChecksum &&
      meta.demoUnlockReceiptId &&
      meta.demoUnlockBoundary,
  )
}

function sourceLabel(source: LiveProofEvidenceSource): string {
  switch (source) {
    case 'overview':
      return 'Backend overview'
    case 'session':
      return 'Latest upload response'
    case 'mixed':
      return 'Backend overview plus this device'
    case 'append_proof':
      return 'Backend append proof'
    case 'sample':
      return 'Sample receipt'
    default:
      return 'No proof receipt'
  }
}

export function buildLiveProofPhase(options: BuildLiveProofPhaseOptions = {}): LiveProofPhaseState {
  const mode = options.mode ?? 'anonymous'
  const market = options.market ?? options.sessionMeta?.market ?? 'india'
  const caseStatus = options.overview?.case_status ?? options.sessionMeta?.caseStatus ?? null
  const profileCompleted = options.profileCompleted ?? options.overview?.profile_completed ?? null
  const collectedProof = collectGeneratedReceipts(options.overview, options.sessionMeta)
  const appendProof = hasGeneratedAppendProofSummary(options.appendProof) ? options.appendProof : null
  const appendProofReceipt = appendProof ? appendProofUploadReceipt(appendProof) : null
  const receipts = appendProofReceipt
    ? generatedReceipts([...collectedProof.receipts, appendProofReceipt])
    : collectedProof.receipts
  const source: LiveProofEvidenceSource = appendProof ? 'append_proof' : collectedProof.source
  const latestGeneratedReceipt = appendProofReceipt ?? receipts[receipts.length - 1] ?? null
  const canClaimBaselineProof = Boolean(latestGeneratedReceipt)
  const provenGeneratedReceiptCount = appendProof
    ? Math.max(receipts.length, toInt(appendProof.upload_count) ?? 2)
    : receipts.length
  const canClaimAppendProof = Boolean(appendProof) || (canClaimBaselineProof && hasAppendProof(receipts))
  const canClaimLiveActivation = mode === 'live'
  const commonBoundary = 'Live product claims require current backend evidence. Activation, upload proof, and append proof are separate states.'

  if (mode === 'anonymous') {
    return {
      phase: 'anonymous',
      label: 'Public visitor',
      statusLabel: 'NO LIVE ACCESS',
      summary: 'The public story can create intent, but no workspace state exists yet.',
      boundary: commonBoundary,
      nextAction: { label: 'Start with the story', to: `/upload?market=${market}` },
      canClaimLiveActivation: false,
      canClaimBaselineProof: false,
      canClaimAppendProof: false,
      evidenceSource: 'none',
      generatedUploadReceiptCount: 0,
      latestGeneratedReceipt: null,
    }
  }

  if (mode === 'sample') {
    const privateReceipt = hasPrivateSampleReceipt(options.sessionMeta)
    return {
      phase: 'sample_preview',
      label: privateReceipt ? 'Private sample workspace' : 'Sample workspace',
      statusLabel: privateReceipt ? 'SAMPLE GATE RECEIPT' : 'SAMPLE ONLY',
      summary: privateReceipt
        ? 'The private demo gate receipt proves route continuity only. It does not prove payment, persistence, or account analytics.'
        : 'Sample mode can teach the loop, but it cannot persist trades or create account-specific proof.',
      boundary: commonBoundary,
      nextAction: { label: privateReceipt ? 'Activate live Reset Pro' : 'Choose live access', to: `/pricing?market=${market}` },
      canClaimLiveActivation: false,
      canClaimBaselineProof: false,
      canClaimAppendProof: false,
      evidenceSource: 'sample',
      generatedUploadReceiptCount: 0,
      latestGeneratedReceipt: null,
    }
  }

  if (canClaimAppendProof) {
    return {
      phase: 'append_proof_ready',
      label: 'Append proof ready',
      statusLabel: 'APPEND PROOF',
      summary: `${sourceLabel(source)} shows repeated generated upload receipts. The workspace can compare behavior across sessions.`,
      boundary: commonBoundary,
      nextAction: { label: 'Review the action board', to: '/dashboard' },
      canClaimLiveActivation,
      canClaimBaselineProof,
      canClaimAppendProof,
      evidenceSource: source,
      generatedUploadReceiptCount: provenGeneratedReceiptCount,
      latestGeneratedReceipt,
    }
  }

  if (caseStatus === 'read_only') {
    return {
      phase: 'read_only',
      label: 'Read-only evidence window',
      statusLabel: 'READ ONLY',
      summary: canClaimBaselineProof
        ? `${sourceLabel(source)} still carries generated upload proof, but new uploads require renewed access.`
        : 'This workspace is read only and has no generated upload receipt available in the current session.',
      boundary: commonBoundary,
      nextAction: { label: 'Reopen the loop', to: '/pricing?upgrade=reset-pro' },
      canClaimLiveActivation,
      canClaimBaselineProof,
      canClaimAppendProof: false,
      evidenceSource: source,
      generatedUploadReceiptCount: provenGeneratedReceiptCount,
      latestGeneratedReceipt,
    }
  }

  if (canClaimBaselineProof) {
    return {
      phase: 'baseline_artifact_ready',
      label: 'Baseline artifact ready',
      statusLabel: 'BASELINE PROOF',
      summary: `${sourceLabel(source)} returned a generated artifact receipt. The next product job is append proof, not more onboarding copy.`,
      boundary: commonBoundary,
      nextAction: { label: 'Append another session', to: '/dashboard/upload' },
      canClaimLiveActivation,
      canClaimBaselineProof,
      canClaimAppendProof: false,
      evidenceSource: source,
      generatedUploadReceiptCount: provenGeneratedReceiptCount,
      latestGeneratedReceipt,
    }
  }

  if (profileCompleted === false || caseStatus === 'awaiting_onboarding') {
    return {
      phase: 'activated_awaiting_context',
      label: 'Activated, awaiting trader context',
      statusLabel: 'ACTIVATED',
      summary: 'Payment and activation opened the workspace. It still needs trader context before the upload path should be trusted.',
      boundary: commonBoundary,
      nextAction: { label: 'Complete trader context', to: '/dashboard/onboarding' },
      canClaimLiveActivation,
      canClaimBaselineProof: false,
      canClaimAppendProof: false,
      evidenceSource: 'none',
      generatedUploadReceiptCount: 0,
      latestGeneratedReceipt: null,
    }
  }

  return {
    phase: 'activated_awaiting_upload',
    label: 'Activated, awaiting first upload',
    statusLabel: 'UPLOAD REQUIRED',
    summary: 'The live workspace exists, but no generated account artifact is present yet. The first upload is the proof boundary.',
    boundary: commonBoundary,
    nextAction: { label: 'Upload trades', to: '/dashboard/upload' },
    canClaimLiveActivation,
    canClaimBaselineProof: false,
    canClaimAppendProof: false,
    evidenceSource: 'none',
    generatedUploadReceiptCount: 0,
    latestGeneratedReceipt: null,
  }
}
