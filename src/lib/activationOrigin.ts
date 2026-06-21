import type { ShibuyaSessionMeta } from './runtime'
import type { ActivationResponse, DashboardActivationOrigin } from './types'

export const EMPTY_ACTIVATION_ORIGIN_META: Partial<ShibuyaSessionMeta> = {
  activationSource: undefined,
  activationReportId: undefined,
  activationArchetypeId: undefined,
  activationAxisId: undefined,
  activationReportArtifactStatus: undefined,
  activationProductionArtifactProven: undefined,
  activationTeaserRequestId: undefined,
  activationTeaserTradesAnalyzed: undefined,
  activationTeaserWorstPattern: undefined,
  activationTeaserVerified: undefined,
  activationTeaserVerificationStatus: undefined,
  activationTeaserReceiptHash: undefined,
  activationTeaserVerifiedAt: undefined,
  activationStorySource: undefined,
  activationSelectedPainAxisIds: undefined,
  activationVisitedSceneCount: undefined,
  activationSignalMarkerIds: undefined,
  activationLockedSectionId: undefined,
  activationLockedSectionTitle: undefined,
  activationBridgeHeadline: undefined,
  activationBridgeDecisionQuestion: undefined,
  activationBridgeWhyNow: undefined,
  activationBridgeLiveProof: undefined,
  activationEngagementReportViewCount: undefined,
  activationEngagementLockedSectionClickCount: undefined,
  activationEngagementCurrentSectionClickCount: undefined,
  activationEngagementPrivateDemoIntentCount: undefined,
  activationEngagementBoundary: undefined,
}

function splitOverviewContextList(value?: string | null): string[] | undefined {
  const items = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return items && items.length > 0 ? items : undefined
}

function parseOverviewContextCount(value?: number | string | null): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function isTrueString(value?: string | null): boolean {
  return value?.trim().toLowerCase() === 'true'
}

function isFalseString(value?: string | null): boolean {
  return value?.trim().toLowerCase() === 'false'
}

function hasValidReceiptHash(value?: string | null): boolean {
  return Boolean(value && /^[a-f0-9]{64}$/i.test(value.trim()))
}

interface ActivationOriginCandidate {
  source?: string | null
  reportId?: string | null
  sectionId?: string | null
  archetypeId?: string | null
  axisId?: string | null
  packetSource?: string | null
  artifactStatus?: string | null
  productionArtifactProven?: string | null
  teaserRequestId?: string | null
  teaserTradesAnalyzed?: number | string | null
  teaserWorstPattern?: string | null
  teaserVerified?: string | null
  teaserVerificationStatus?: string | null
  teaserReceiptHash?: string | null
  teaserVerifiedAt?: string | null
  storySource?: string | null
  storySceneCount?: number | string | null
  painAxes?: string | null
  signalMarkers?: string | null
  reportViews?: number | string | null
  lockedClicks?: number | string | null
  currentSectionClicks?: number | string | null
  privateGateAttempts?: number | string | null
}

const DASHBOARD_ACTIVATION_ORIGIN_BOUNDARY = 'Activation context came from verified backend dashboard metadata.'
const ORDER_ACTIVATION_ORIGIN_BOUNDARY = 'Activation context came from verified backend order metadata.'

function hasVerifiedActivationOriginCandidate(candidate?: ActivationOriginCandidate | null): candidate is ActivationOriginCandidate {
  const tradesAnalyzed = parseOverviewContextCount(candidate?.teaserTradesAnalyzed)

  return Boolean(
    candidate?.source === 'locked_insight' &&
      candidate.packetSource === 'backend_teaser' &&
      candidate.artifactStatus === 'backend_teaser_persisted' &&
      isFalseString(candidate.productionArtifactProven) &&
      candidate.reportId?.trim() &&
      candidate.sectionId?.trim() &&
      candidate.archetypeId?.trim() &&
      candidate.axisId?.trim() &&
      candidate.teaserRequestId?.trim() &&
      Number.isFinite(tradesAnalyzed) &&
      (tradesAnalyzed ?? 0) >= 10 &&
      isTrueString(candidate.teaserVerified) &&
      candidate.teaserVerificationStatus === 'verified' &&
      hasValidReceiptHash(candidate.teaserReceiptHash) &&
      candidate.teaserVerifiedAt?.trim(),
  )
}

function buildActivationOriginMeta(
  candidate?: ActivationOriginCandidate | null,
  boundary = ORDER_ACTIVATION_ORIGIN_BOUNDARY,
): Partial<ShibuyaSessionMeta> {
  if (!hasVerifiedActivationOriginCandidate(candidate)) {
    return {}
  }

  return {
    activationSource: candidate.source ?? undefined,
    activationReportId: candidate.reportId ?? undefined,
    activationArchetypeId: candidate.archetypeId ?? undefined,
    activationAxisId: candidate.axisId ?? undefined,
    activationReportArtifactStatus: candidate.artifactStatus ?? undefined,
    activationProductionArtifactProven: candidate.productionArtifactProven ?? undefined,
    activationTeaserRequestId: candidate.teaserRequestId ?? undefined,
    activationTeaserTradesAnalyzed: parseOverviewContextCount(candidate.teaserTradesAnalyzed),
    activationTeaserWorstPattern: candidate.teaserWorstPattern ?? undefined,
    activationTeaserVerified: candidate.teaserVerified ?? undefined,
    activationTeaserVerificationStatus: candidate.teaserVerificationStatus ?? undefined,
    activationTeaserReceiptHash: candidate.teaserReceiptHash ?? undefined,
    activationTeaserVerifiedAt: candidate.teaserVerifiedAt ?? undefined,
    activationStorySource: candidate.storySource ?? undefined,
    activationSelectedPainAxisIds: splitOverviewContextList(candidate.painAxes),
    activationVisitedSceneCount: parseOverviewContextCount(candidate.storySceneCount),
    activationSignalMarkerIds: splitOverviewContextList(candidate.signalMarkers),
    activationLockedSectionId: candidate.sectionId ?? undefined,
    activationEngagementReportViewCount: parseOverviewContextCount(candidate.reportViews),
    activationEngagementLockedSectionClickCount: parseOverviewContextCount(candidate.lockedClicks),
    activationEngagementCurrentSectionClickCount: parseOverviewContextCount(candidate.currentSectionClicks),
    activationEngagementPrivateDemoIntentCount: parseOverviewContextCount(candidate.privateGateAttempts),
    activationEngagementBoundary: boundary,
  }
}

function dashboardOriginToCandidate(origin?: DashboardActivationOrigin | null): ActivationOriginCandidate | null {
  if (!origin) {
    return null
  }

  return {
    source: origin.source,
    reportId: origin.report_id,
    sectionId: origin.section_id,
    archetypeId: origin.archetype_id,
    axisId: origin.axis_id,
    packetSource: origin.packet_source,
    artifactStatus: origin.artifact_status,
    productionArtifactProven: origin.production_artifact_proven,
    teaserRequestId: origin.teaser_request_id,
    teaserTradesAnalyzed: origin.teaser_trades_analyzed,
    teaserWorstPattern: origin.teaser_worst_pattern,
    teaserVerified: origin.teaser_verified,
    teaserVerificationStatus: origin.teaser_verification_status,
    teaserReceiptHash: origin.teaser_receipt_hash,
    teaserVerifiedAt: origin.teaser_verified_at,
    storySource: origin.story_source,
    storySceneCount: origin.story_scene_count,
    painAxes: origin.pain_axes,
    signalMarkers: origin.signal_markers,
    reportViews: origin.report_views,
    lockedClicks: origin.locked_clicks,
    currentSectionClicks: origin.current_section_clicks,
    privateGateAttempts: origin.private_gate_attempts,
  }
}

function activationResponseToCandidate(data?: ActivationResponse | null): ActivationOriginCandidate | null {
  if (!data) {
    return null
  }

  return {
    source: data.publicContextSource,
    reportId: data.publicContextReportId,
    sectionId: data.publicContextSectionId,
    archetypeId: data.publicContextArchetypeId,
    axisId: data.publicContextAxisId,
    packetSource: data.publicContextPacketSource,
    artifactStatus: data.publicContextArtifactStatus,
    productionArtifactProven: data.publicContextProductionArtifactProven,
    teaserRequestId: data.publicContextTeaserRequestId,
    teaserTradesAnalyzed: data.publicContextTeaserTradesAnalyzed,
    teaserWorstPattern: data.publicContextTeaserWorstPattern,
    teaserVerified: data.publicContextTeaserVerified,
    teaserVerificationStatus: data.publicContextTeaserVerificationStatus,
    teaserReceiptHash: data.publicContextTeaserReceiptHash,
    teaserVerifiedAt: data.publicContextTeaserVerifiedAt,
    storySource: data.publicContextStorySource,
    storySceneCount: data.publicContextStorySceneCount,
    painAxes: data.publicContextPainAxes,
    signalMarkers: data.publicContextSignalMarkers,
    reportViews: data.publicContextReportViews,
    lockedClicks: data.publicContextLockedClicks,
    currentSectionClicks: data.publicContextCurrentSectionClicks,
    privateGateAttempts: data.publicContextPrivateGateAttempts,
  }
}

export function hasVerifiedDashboardActivationOrigin(
  origin?: DashboardActivationOrigin | null,
): origin is DashboardActivationOrigin {
  return hasVerifiedActivationOriginCandidate(dashboardOriginToCandidate(origin))
}

export function buildDashboardActivationOriginMeta(
  origin?: DashboardActivationOrigin | null,
): Partial<ShibuyaSessionMeta> {
  return buildActivationOriginMeta(dashboardOriginToCandidate(origin), DASHBOARD_ACTIVATION_ORIGIN_BOUNDARY)
}

export function hasVerifiedActivationResponsePublicContext(data?: ActivationResponse | null): boolean {
  return hasVerifiedActivationOriginCandidate(activationResponseToCandidate(data))
}

export function buildActivationResponsePublicContextMeta(
  data?: ActivationResponse | null,
): Partial<ShibuyaSessionMeta> {
  return buildActivationOriginMeta(activationResponseToCandidate(data), ORDER_ACTIVATION_ORIGIN_BOUNDARY)
}
