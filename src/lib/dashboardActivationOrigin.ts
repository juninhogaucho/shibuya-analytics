import type { ShibuyaSessionMeta } from './runtime'
import type { DashboardActivationOrigin } from './types'

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

function parseOverviewContextCount(value?: string | null): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function hasVerifiedDashboardActivationOrigin(
  origin?: DashboardActivationOrigin | null,
): origin is DashboardActivationOrigin {
  const tradesAnalyzed = parseOverviewContextCount(origin?.teaser_trades_analyzed)

  return Boolean(
    origin?.source === 'locked_insight' &&
      origin.packet_source === 'backend_teaser' &&
      origin.artifact_status === 'backend_teaser_persisted' &&
      origin.production_artifact_proven === 'false' &&
      origin.report_id?.trim() &&
      origin.section_id?.trim() &&
      origin.archetype_id?.trim() &&
      origin.axis_id?.trim() &&
      origin.teaser_request_id?.trim() &&
      Number.isFinite(tradesAnalyzed) &&
      (tradesAnalyzed ?? 0) >= 10 &&
      origin.teaser_verified === 'true' &&
      origin.teaser_verification_status === 'verified' &&
      Boolean(origin.teaser_receipt_hash && /^[a-f0-9]{64}$/i.test(origin.teaser_receipt_hash.trim())) &&
      origin.teaser_verified_at?.trim(),
  )
}

export function buildDashboardActivationOriginMeta(
  origin?: DashboardActivationOrigin | null,
): Partial<ShibuyaSessionMeta> {
  if (!hasVerifiedDashboardActivationOrigin(origin)) {
    return {}
  }

  return {
    activationSource: origin.source ?? undefined,
    activationReportId: origin.report_id ?? undefined,
    activationArchetypeId: origin.archetype_id ?? undefined,
    activationAxisId: origin.axis_id ?? undefined,
    activationReportArtifactStatus: origin.artifact_status ?? undefined,
    activationProductionArtifactProven: origin.production_artifact_proven ?? undefined,
    activationTeaserRequestId: origin.teaser_request_id ?? undefined,
    activationTeaserTradesAnalyzed: parseOverviewContextCount(origin.teaser_trades_analyzed),
    activationTeaserWorstPattern: origin.teaser_worst_pattern ?? undefined,
    activationTeaserVerified: origin.teaser_verified ?? undefined,
    activationTeaserVerificationStatus: origin.teaser_verification_status ?? undefined,
    activationTeaserReceiptHash: origin.teaser_receipt_hash ?? undefined,
    activationTeaserVerifiedAt: origin.teaser_verified_at ?? undefined,
    activationStorySource: origin.story_source ?? undefined,
    activationSelectedPainAxisIds: splitOverviewContextList(origin.pain_axes),
    activationVisitedSceneCount: parseOverviewContextCount(origin.story_scene_count),
    activationSignalMarkerIds: splitOverviewContextList(origin.signal_markers),
    activationLockedSectionId: origin.section_id ?? undefined,
    activationEngagementReportViewCount: parseOverviewContextCount(origin.report_views),
    activationEngagementLockedSectionClickCount: parseOverviewContextCount(origin.locked_clicks),
    activationEngagementCurrentSectionClickCount: parseOverviewContextCount(origin.current_section_clicks),
    activationEngagementPrivateDemoIntentCount: parseOverviewContextCount(origin.private_gate_attempts),
    activationEngagementBoundary: 'Activation context came from verified backend dashboard metadata.',
  }
}
