import type { Market } from './market'
import type { CheckoutIntent } from './checkoutIntent'
import type { PublicReportEngagementSummary } from './publicReportEngagement'
import {
  FINGERPRINT_AXES,
  PUBLIC_STORY_SIGNAL_MARKERS,
  TRADER_ARCHETYPES,
} from './storyExperience'

const RECENT_ORDER_ACCESS_KEY = 'shibuya_recent_order_access'
const VERIFIED_PUBLIC_TEASER_EVIDENCE_LABEL = 'Backend verified public teaser receipt'
const VERIFIED_PUBLIC_TEASER_ARTIFACT_STATUS = 'Backend teaser persisted'

const PUBLIC_STORY_SOURCES = new Set<string>(['guided', 'direct'])
const PUBLIC_STORY_ARCHETYPE_IDS = new Set<string>(TRADER_ARCHETYPES.map((archetype) => archetype.id))
const PUBLIC_STORY_AXIS_IDS = new Set<string>(FINGERPRINT_AXES.map((axis) => axis.id))
const PUBLIC_STORY_SIGNAL_MARKER_IDS = new Set<string>(PUBLIC_STORY_SIGNAL_MARKERS.map((marker) => marker.id))

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

function isSafePositiveIntegerWhenPresent(value?: number): boolean {
  return value === undefined || (Number.isSafeInteger(value) && value > 0)
}

function allKnownValues(values: string[] | undefined, allowedValues: Set<string>): boolean {
  return (values ?? []).every((value) => allowedValues.has(value))
}

function hasSameMembers(left: string[] | undefined, right: string[] | undefined): boolean {
  if (!left?.length) {
    return true
  }
  if (!right?.length || left.length !== right.length) {
    return false
  }

  const rightValues = new Set(right)
  return left.every((value) => rightValues.has(value))
}

function routeValueMatchesIntent(routeValue: string | undefined, handoffValue: string | undefined): boolean {
  return !routeValue || routeValue === handoffValue
}

function routeNumberMatchesIntent(routeValue: number | undefined, handoffValue: number | undefined): boolean {
  return routeValue === undefined || routeValue === handoffValue
}

function hasCanonicalRecentCheckoutIntent(intent?: CheckoutIntent | null): intent is CheckoutIntent {
  if (!intent || intent.source !== 'locked_insight') {
    return false
  }
  if (!intent.reportId?.trim() || !intent.lockedSectionId?.trim()) {
    return false
  }
  if (!intent.archetypeId || !PUBLIC_STORY_ARCHETYPE_IDS.has(intent.archetypeId)) {
    return false
  }
  if (!intent.axisId || !PUBLIC_STORY_AXIS_IDS.has(intent.axisId)) {
    return false
  }
  if (intent.storySource && !PUBLIC_STORY_SOURCES.has(intent.storySource)) {
    return false
  }
  if (!isSafePositiveIntegerWhenPresent(intent.visitedSceneCount)) {
    return false
  }
  if (!allKnownValues(intent.selectedPainAxisIds, PUBLIC_STORY_AXIS_IDS)) {
    return false
  }
  if (!allKnownValues(intent.signalMarkerIds, PUBLIC_STORY_SIGNAL_MARKER_IDS)) {
    return false
  }

  return true
}

function hasVerifiedRecentContextReceipt(handoff: RecentActivationHandoff): boolean {
  const receipt = handoff.contextReceipt
  if (!receipt || !handoff.verifiedAt?.trim()) {
    return false
  }
  if (receipt.evidenceLabel !== VERIFIED_PUBLIC_TEASER_EVIDENCE_LABEL) {
    return false
  }
  if (receipt.artifactStatusLabel !== VERIFIED_PUBLIC_TEASER_ARTIFACT_STATUS) {
    return false
  }
  if (receipt.productionArtifactProven !== false) {
    return false
  }
  if (!receipt.validationSummary?.trim()) {
    return false
  }
  if (receipt.storySource && !PUBLIC_STORY_SOURCES.has(receipt.storySource)) {
    return false
  }
  if (!isSafePositiveIntegerWhenPresent(receipt.visitedSceneCount)) {
    return false
  }
  if (receipt.storySource && handoff.checkoutIntent.storySource && receipt.storySource !== handoff.checkoutIntent.storySource) {
    return false
  }
  if (
    receipt.visitedSceneCount !== undefined &&
    handoff.checkoutIntent.visitedSceneCount !== undefined &&
    receipt.visitedSceneCount !== handoff.checkoutIntent.visitedSceneCount
  ) {
    return false
  }

  return true
}

function hasVerifiedRecentActivationHandoff(handoff?: RecentActivationHandoff | null): handoff is RecentActivationHandoff {
  return Boolean(
    handoff?.source === 'checkout_success' &&
      hasCanonicalRecentCheckoutIntent(handoff.checkoutIntent) &&
      hasVerifiedRecentContextReceipt(handoff),
  )
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
  if (!intent || !hasVerifiedRecentActivationHandoff(handoff)) {
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
    ) &&
    routeValueMatchesIntent(intent.archetypeId, handoffIntent.archetypeId) &&
    routeValueMatchesIntent(intent.axisId, handoffIntent.axisId) &&
    routeValueMatchesIntent(intent.storySource, handoffIntent.storySource) &&
    routeNumberMatchesIntent(intent.visitedSceneCount, handoffIntent.visitedSceneCount) &&
    hasSameMembers(intent.selectedPainAxisIds, handoffIntent.selectedPainAxisIds) &&
    hasSameMembers(intent.signalMarkerIds, handoffIntent.signalMarkerIds)

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
