import type { Market } from './market'
import type { TraderMode } from './types'

export const SHIBUYA_API_KEY_STORAGE_KEY = 'shibuya_api_key'
export const SHIBUYA_SESSION_META_STORAGE_KEY = 'shibuya_session_meta'
export const SHIBUYA_SAMPLE_API_KEY = 'shibuya_demo_mode'

export type ShibuyaRuntimeMode = 'anonymous' | 'sample' | 'live'

export interface ShibuyaSessionMeta {
  customerId?: string
  tier?: string
  planId?: string
  market?: Market
  orderId?: string
  offerKind?: string
  caseStatus?: string
  traderMode?: TraderMode
  nextAction?: string
  accessExpiresAt?: string | null
  dataSource?: string | null
  affiliateSlug?: string
  refCode?: string
}

function parseSessionMeta(raw: string | null): ShibuyaSessionMeta | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as ShibuyaSessionMeta
  } catch {
    return null
  }
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)
}

export function getStoredSessionMeta(): ShibuyaSessionMeta | null {
  return parseSessionMeta(localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY))
}

export function getStoredSessionTier(): string | null {
  return getStoredSessionMeta()?.tier ?? null
}

export function getStoredSessionOfferKind(): string | null {
  return getStoredSessionMeta()?.offerKind ?? null
}

export function hasPremiumAccess(): boolean {
  return getStoredSessionTier() === 'reset_pro'
}

export function isOneTimeOffer(offerKind?: string | null): boolean {
  return Boolean(offerKind && !offerKind.endsWith('_live') && offerKind !== 'sample')
}

export function getSessionDaysRemaining(meta?: ShibuyaSessionMeta | null): number | null {
  const session = meta ?? getStoredSessionMeta()
  if (!session?.accessExpiresAt) {
    return null
  }

  const expiry = new Date(session.accessExpiresAt)
  if (Number.isNaN(expiry.getTime())) {
    return null
  }

  const diff = expiry.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

export function isReadOnlySession(meta?: ShibuyaSessionMeta | null): boolean {
  const session = meta ?? getStoredSessionMeta()
  if (!session || !isOneTimeOffer(session.offerKind) || !session.accessExpiresAt) {
    return false
  }

  const expiry = new Date(session.accessExpiresAt)
  if (Number.isNaN(expiry.getTime())) {
    return false
  }

  return expiry.getTime() < Date.now()
}

export function getShibuyaRuntimeMode(): ShibuyaRuntimeMode {
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    return 'anonymous'
  }
  return apiKey === SHIBUYA_SAMPLE_API_KEY ? 'sample' : 'live'
}

export function isSampleMode(): boolean {
  return getShibuyaRuntimeMode() === 'sample'
}

export function enterSampleMode(): void {
  localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY)
  localStorage.setItem(
    SHIBUYA_SESSION_META_STORAGE_KEY,
    JSON.stringify({ tier: 'sample', market: 'india' as Market, offerKind: 'sample' }),
  )
}

export function setLiveApiKey(apiKey: string, meta?: ShibuyaSessionMeta): void {
  localStorage.setItem(SHIBUYA_API_KEY_STORAGE_KEY, apiKey)
  if (meta) {
    const previous = getStoredSessionMeta() ?? {}
    localStorage.setItem(SHIBUYA_SESSION_META_STORAGE_KEY, JSON.stringify({ ...previous, ...meta }))
  }
}

export function updateSessionMeta(meta: Partial<ShibuyaSessionMeta>): void {
  const previous = getStoredSessionMeta() ?? {}
  localStorage.setItem(SHIBUYA_SESSION_META_STORAGE_KEY, JSON.stringify({ ...previous, ...meta }))
}

export function clearShibuyaSession(): void {
  localStorage.removeItem(SHIBUYA_API_KEY_STORAGE_KEY)
  localStorage.removeItem(SHIBUYA_SESSION_META_STORAGE_KEY)
}
