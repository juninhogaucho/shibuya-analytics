import { API_BASE_URL, isApiBaseConfiguredForLive } from './constants'
import { buildLiveProofPhase, type BuildLiveProofPhaseOptions, type LiveProofPhaseState } from './liveProofPhase'

export interface LiveProofReadinessRow {
  label: string
  status: 'ready' | 'blocked' | 'required'
  detail: string
}

export interface LiveProofReadinessContract {
  statusLabel: string
  headline: string
  body: string
  rows: LiveProofReadinessRow[]
  boundary: string
}

interface LiveProofReadinessOptions extends BuildLiveProofPhaseOptions {
  apiBaseUrl?: string
  backendConfigured?: boolean
}

function describeBackendTarget(apiBaseUrl: string, backendConfigured: boolean): string {
  if (!backendConfigured) {
    return 'VITE_API_BASE is missing for the production build, so live backend proof cannot be claimed.'
  }

  if (apiBaseUrl.includes('127.0.0.1') || apiBaseUrl.includes('localhost')) {
    return 'A local backend target is present. This supports development only; public live proof still requires a reachable production API.'
  }

  return 'A backend target is configured. Live proof still requires successful activation, upload, generated artifacts, and append history.'
}

function shouldUseRuntimeEvidence(options: LiveProofReadinessOptions): boolean {
  return Boolean(options.mode || options.overview || options.sessionMeta || options.profileCompleted != null)
}

function sourceLabel(phase: LiveProofPhaseState): string {
  switch (phase.evidenceSource) {
    case 'overview':
      return 'backend overview'
    case 'session':
      return 'latest upload response'
    case 'mixed':
      return 'backend overview plus this device'
    case 'sample':
      return 'sample receipt'
    default:
      return 'no generated receipt'
  }
}

function proofValue(value: unknown, fallback = 'not recorded'): string {
  if (value == null || value === '') {
    return fallback
  }
  return String(value)
}

function buildStatusLabel(backendConfigured: boolean, phase: LiveProofPhaseState | null): string {
  if (!backendConfigured) {
    return 'LIVE BACKEND BLOCKED'
  }
  if (!phase) {
    return 'BACKEND TARGET PRESENT'
  }
  if (phase.canClaimAppendProof) {
    return 'APPEND PROOF READY'
  }
  if (phase.canClaimBaselineProof) {
    return 'BASELINE PROOF READY'
  }
  if (phase.canClaimLiveActivation) {
    return 'LIVE ACTIVATION READY'
  }
  if (phase.evidenceSource === 'sample') {
    return 'SAMPLE ONLY'
  }
  return 'BACKEND TARGET PRESENT'
}

function buildHeadline(backendConfigured: boolean, phase: LiveProofPhaseState | null): string {
  if (!backendConfigured) {
    return 'Live proof is blocked before the first real upload.'
  }
  if (!phase) {
    return 'Live proof has a backend target, but still needs evidence.'
  }
  if (phase.canClaimAppendProof) {
    return 'Append proof is available from generated upload evidence.'
  }
  if (phase.canClaimBaselineProof) {
    return 'Baseline proof exists. Append proof is still the next boundary.'
  }
  if (phase.canClaimLiveActivation) {
    return 'Activation opened the live workspace. Upload proof is still missing.'
  }
  if (phase.evidenceSource === 'sample') {
    return 'Sample receipts cannot become live proof.'
  }
  return 'Live proof has a backend target, but still needs evidence.'
}

function activationRow(phase: LiveProofPhaseState | null): LiveProofReadinessRow {
  if (!phase) {
    return {
      label: 'Activation',
      status: 'required',
      detail: 'Email and order code must verify into a live trader session before any persistent workspace claim is valid.',
    }
  }
  if (phase.canClaimLiveActivation) {
    return {
      label: 'Activation',
      status: 'ready',
      detail: 'A live trader session is present. This proves access only; account behavior still requires upload evidence.',
    }
  }
  if (phase.evidenceSource === 'sample') {
    return {
      label: 'Activation',
      status: 'blocked',
      detail: 'Sample or presenter-gated access cannot satisfy the paid/live activation boundary.',
    }
  }
  return {
    label: 'Activation',
    status: 'required',
    detail: 'Email and order code must verify into a live trader session before any persistent workspace claim is valid.',
  }
}

function firstUploadRow(phase: LiveProofPhaseState | null): LiveProofReadinessRow {
  if (phase?.canClaimBaselineProof) {
    return {
      label: 'First meaningful upload',
      status: 'ready',
      detail: `${sourceLabel(phase)} returned generated artifact ${proofValue(phase.latestGeneratedReceipt?.report_snapshot_id)} with request ${proofValue(phase.latestGeneratedReceipt?.request_id)}.`,
    }
  }
  if (phase?.evidenceSource === 'sample') {
    return {
      label: 'First meaningful upload',
      status: 'blocked',
      detail: 'Sample uploads can teach the workflow, but they cannot create a live baseline artifact.',
    }
  }
  return {
    label: 'First meaningful upload',
    status: 'required',
    detail: 'Real trade history must normalize through the backend and create generated account artifacts.',
  }
}

function appendHistoryRow(phase: LiveProofPhaseState | null): LiveProofReadinessRow {
  if (phase?.canClaimAppendProof) {
    return {
      label: 'Append history',
      status: 'ready',
      detail: `${phase.generatedUploadReceiptCount} generated receipt(s) are available; the workspace can compare behavior across sessions.`,
    }
  }
  if (phase?.canClaimBaselineProof) {
    return {
      label: 'Append history',
      status: 'required',
      detail: 'Baseline proof exists. A later generated upload must confirm, reject, or update the carried private question.',
    }
  }
  if (phase?.evidenceSource === 'sample') {
    return {
      label: 'Append history',
      status: 'blocked',
      detail: 'Sample append receipts prove route continuity only, not durable account history.',
    }
  }
  return {
    label: 'Append history',
    status: 'required',
    detail: 'A later upload must confirm, reject, or update the carried private question before improvement is claimed.',
  }
}

export function buildLiveProofReadinessContract(options: LiveProofReadinessOptions = {}): LiveProofReadinessContract {
  const apiBaseUrl = options.apiBaseUrl ?? API_BASE_URL
  const backendConfigured = options.backendConfigured ?? isApiBaseConfiguredForLive()
  const phase = shouldUseRuntimeEvidence(options) ? buildLiveProofPhase(options) : null

  return {
    statusLabel: buildStatusLabel(backendConfigured, phase),
    headline: buildHeadline(backendConfigured, phase),
    body: phase
      ? `${phase.summary} This contract separates the sample demo from the live evidence path.`
      : 'This contract separates the sample demo from the live evidence path. It is valid only when each stage has current proof, not just routing context.',
    rows: [
      {
        label: 'Backend target',
        status: backendConfigured ? 'ready' : 'blocked',
        detail: describeBackendTarget(apiBaseUrl, backendConfigured),
      },
      activationRow(phase),
      firstUploadRow(phase),
      appendHistoryRow(phase),
    ],
    boundary: 'Sample routes, URL context, and presenter codes can prove workflow continuity only. They cannot prove payment, live upload, generated backend artifacts, or trader-specific conclusions.',
  }
}
