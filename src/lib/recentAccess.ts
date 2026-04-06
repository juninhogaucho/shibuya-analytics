import type { Market } from './market'

const RECENT_ORDER_ACCESS_KEY = 'shibuya_recent_order_access'

export interface RecentOrderAccess {
  email?: string
  orderCode?: string
  market?: Market
  planId?: string
  planName?: string
  timestamp?: string
}

function parseRecentOrderAccess(raw: string | null): RecentOrderAccess | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as RecentOrderAccess
  } catch {
    return null
  }
}

export function readRecentOrderAccess(): RecentOrderAccess | null {
  if (typeof window === 'undefined') {
    return null
  }

  return parseRecentOrderAccess(window.localStorage.getItem(RECENT_ORDER_ACCESS_KEY))
}

export function rememberRecentOrderAccess(patch: RecentOrderAccess): RecentOrderAccess | null {
  if (typeof window === 'undefined') {
    return null
  }

  const previous = readRecentOrderAccess() ?? {}
  const next: RecentOrderAccess = {
    ...previous,
    ...patch,
    timestamp: patch.timestamp ?? previous.timestamp ?? new Date().toISOString(),
  }

  const hasValue = Object.values(next).some(Boolean)
  if (!hasValue) {
    return null
  }

  window.localStorage.setItem(RECENT_ORDER_ACCESS_KEY, JSON.stringify(next))
  return next
}

export function clearRecentOrderAccess(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(RECENT_ORDER_ACCESS_KEY)
}
