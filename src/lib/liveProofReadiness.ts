import { API_BASE_URL, isApiBaseConfiguredForLive } from './constants'

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

interface LiveProofReadinessOptions {
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

export function buildLiveProofReadinessContract(options: LiveProofReadinessOptions = {}): LiveProofReadinessContract {
  const apiBaseUrl = options.apiBaseUrl ?? API_BASE_URL
  const backendConfigured = options.backendConfigured ?? isApiBaseConfiguredForLive()

  return {
    statusLabel: backendConfigured ? 'BACKEND TARGET PRESENT' : 'LIVE BACKEND BLOCKED',
    headline: backendConfigured
      ? 'Live proof has a backend target, but still needs evidence.'
      : 'Live proof is blocked before the first real upload.',
    body: 'This contract separates the sample demo from the live evidence path. It is valid only when each stage has current proof, not just routing context.',
    rows: [
      {
        label: 'Backend target',
        status: backendConfigured ? 'ready' : 'blocked',
        detail: describeBackendTarget(apiBaseUrl, backendConfigured),
      },
      {
        label: 'Activation',
        status: 'required',
        detail: 'Email and order code must verify into a live trader session before any persistent workspace claim is valid.',
      },
      {
        label: 'First meaningful upload',
        status: 'required',
        detail: 'Real trade history must normalize through the backend and create generated account artifacts.',
      },
      {
        label: 'Append history',
        status: 'required',
        detail: 'A later upload must confirm, reject, or update the carried private question before improvement is claimed.',
      },
    ],
    boundary: 'Sample routes, URL context, and presenter codes can prove workflow continuity only. They cannot prove payment, live upload, generated backend artifacts, or trader-specific conclusions.',
  }
}
