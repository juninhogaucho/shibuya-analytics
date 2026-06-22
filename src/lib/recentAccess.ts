import type { Market } from './market'
import type { CheckoutIntent } from './checkoutIntent'
import type { PublicReportEngagementSummary } from './publicReportEngagement'

const RECENT_ORDER_ACCESS_KEY = 'shibuya_recent_order_access'

export interface RecentActivationContextReceipt {
  evidenceLabel: string
  artifactStatusLabel: string
  productionArtifactProven: boolean
  validationSummary: string
  storySource?: 'guided' | 'direct'
  visitedSceneCount?: number
}

export interface RecentActivationHandoff {
  source: 'checkout_success'
  verifiedAt: string
  checkoutIntent: CheckoutIntent
  engagementSummary?: PublicReportEngagementSummary
  contextReceipt?: RecentActivationContextReceipt
}

export interface RecentOrderAccess {
  email?: string
  orderCode?: string
  market?: Market
  planId?: string
  planName?: string
  activationHandoff?: RecentActivationHandoff
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

export function getRecentActivationHandoffForIntent(
  intent?: CheckoutIntent | null,
  recentAccess: RecentOrderAccess | null = readRecentOrderAccess(),
): RecentActivationHandoff | null {
  const handoff = recentAccess?.activationHandoff
  if (!intent || !handoff || handoff.source !== 'checkout_success') {
    return null
  }

  const handoffIntent = handoff.checkoutIntent
  const matchesRequiredRoute =
    intent.source === 'locked_insight' &&
    handoffIntent.source === intent.source &&
    Boolean(intent.reportId && handoffIntent.reportId && handoffIntent.reportId === intent.reportId) &&
    Boolean(
      intent.lockedSectionId &&
        handoffIntent.lockedSectionId &&
        handoffIntent.lockedSectionId === intent.lockedSectionId,
    )

  if (!matchesRequiredRoute) {
    return null
  }

  return handoff
}

export function clearRecentOrderAccess(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(RECENT_ORDER_ACCESS_KEY)
}
