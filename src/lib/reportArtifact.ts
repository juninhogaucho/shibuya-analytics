import type { DashboardOverview, TraderProfileContext } from './types'
import type { ActionBrief } from './actionBrief'
import type { TradingMandate } from './decisionSupport'
import type { Market } from './market'
import { formatMoney, formatSignedMoney, humanizeFocus, humanizeInstrument } from './display'
import { buildExecutionProtocol } from './executionProtocol'
import { buildPerformanceStory } from './performanceStory'
import { humanizeTraderMode } from './traderMode'

export interface ReportArtifact {
  filename: string
  title: string
  body: string
}

function sanitizeDate(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function formatPercent(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : 'unavailable'
}

export function buildReportArtifact({
  overview,
  brief,
  mandate,
  profile,
  market,
  premiumAccess,
}: {
  overview: DashboardOverview
  brief: ActionBrief
  mandate: TradingMandate
  profile: TraderProfileContext | null
  market: Market
  premiumAccess: boolean
}): ReportArtifact {
  const title = premiumAccess ? 'Shibuya Reset Report' : 'Shibuya Baseline Report'
  const filename = `${premiumAccess ? 'shibuya-reset-report' : 'shibuya-baseline-report'}-${sanitizeDate()}.txt`
  const breakdown = overview.discipline_tax_breakdown
  const recentErrors = (overview.recent_errors ?? []).slice(0, 3)
  const focusLine = profile
    ? `${humanizeFocus(profile.trader_focus)} via ${profile.broker_platform} on ${profile.primary_instruments.map(humanizeInstrument).join(', ')}`
    : 'Trader context incomplete'
  const traderModeLine = overview.trader_mode ? humanizeTraderMode(overview.trader_mode) : 'Mode not derived yet'
  const protocol = buildExecutionProtocol({
    overview,
    profile,
  })
  const story = buildPerformanceStory({
    overview,
    profile,
    market,
  })
  const riskPoint = overview.risk_point_ruin_probability ?? overview.ruin_probability
  const riskDecision = overview.risk_decision_ruin_probability ?? overview.ruin_probability
  const riskQuality = overview.risk_evidence_quality
  const riskBound = overview.risk_conservative_bound
  const deliveryLine = [
    `Offer kind: ${overview.offer_kind ?? 'unknown'}`,
    `Case status: ${overview.case_status ?? 'live'}`,
    `Billing status: ${overview.billing_status ?? 'active'}`,
    `Trader mode: ${traderModeLine}`,
    `Next action: ${overview.next_action ?? 'Carry the next-session mandate'}`,
    overview.upload_limit != null
      ? `Uploads used: ${overview.upload_count ?? 0} / ${overview.upload_limit}`
      : `Uploads used: ${overview.upload_count ?? 0} (live continuity)`,
  ]
  const nextCheckpoint =
    overview.guided_review_included && overview.guided_review_url
      ? 'Book the guided review once you have reviewed this artifact and the live action board.'
      : overview.case_status === 'read_only'
        ? 'The window is now read only. Reopen with a fresh package or live tier before uploading again.'
        : 'Use the live action board, then upload the next meaningful session only after a real behavioral change.'

  const sections = [
    title.toUpperCase(),
    `Generated: ${new Date().toLocaleString(market === 'india' ? 'en-IN' : 'en-IE')}`,
    '',
    'CURRENT STATE',
    `BQL state: ${overview.bql_state}`,
    `Behavioral influence: ${(overview.bql_score * 100).toFixed(0)}%`,
    `Discipline tax (30d): ${formatMoney(overview.discipline_tax_30d, market)}`,
    `Gross PnL: ${formatSignedMoney(overview.pnl_gross ?? 0, market)}`,
    `Net PnL: ${formatSignedMoney(overview.pnl_net ?? 0, market)}`,
    `Monte Carlo edge: ${formatSignedMoney(overview.monte_carlo_drift, market)}`,
    `Ruin probability: ${formatPercent(overview.ruin_probability)}`,
    `Risk point estimate: ${formatPercent(riskPoint)}`,
    `Risk decision bound: ${formatPercent(riskDecision)}`,
    `Risk evidence quality: ${riskQuality?.grade ?? 'not provided'}${typeof riskQuality?.score === 'number' ? ` (${(riskQuality.score * 100).toFixed(0)}%)` : ''}`,
    riskQuality
      ? `Risk evidence depth: ${riskQuality.n_trades ?? 'unknown'} trades, ${riskQuality.loss_observations ?? 'unknown'} losses, ${riskQuality.tail_loss_observations ?? 'unknown'} tail-loss observations`
      : 'Risk evidence depth: unavailable',
    riskBound
      ? `Conservative risk method: ${riskBound.method ?? 'unknown'} | q${riskBound.quantile ?? 'n/a'} upper ${formatPercent(riskBound.p_ruin_upper)} | p95 ${formatPercent(riskBound.p_ruin_p95)} | sampling width ${formatPercent(riskBound.sampling_width)}`
      : 'Conservative risk method: unavailable',
    `Risk decision policy: ${overview.risk_decision_policy ?? 'Use the reported ruin probability only with source-data-quality context.'}`,
    '',
    'MISSION BRIEF',
    `Chapter: ${story.chapter}`,
    `Identity: ${story.identity}`,
    `Enemy: ${story.enemy}`,
    `Mission: ${story.mission}`,
    `Momentum: ${story.momentum}`,
    `Proof target: ${story.proof}`,
    `Command line: ${story.mantra}`,
    '',
    'DELIVERY STATE',
    ...deliveryLine,
    overview.access_expires_at ? `Access window ends: ${overview.access_expires_at}` : 'Access window ends: ongoing while billing remains active',
    overview.guided_review_included
      ? `Guided review: ${overview.guided_review_status ?? 'included'}` 
      : 'Guided review: not included in this offer',
    '',
    'PROFESSIONAL STANDARD',
    `Status: ${protocol.headline}`,
    `Unforced error rate: ${protocol.unforcedErrorRate}%`,
    protocol.lossQualityDetail,
    '',
    'TRADER CONTEXT',
    focusLine,
    `Trader mode: ${traderModeLine}`,
    '',
    'BEHAVIORAL LEAK BREAKDOWN',
    breakdown
      ? `Revenge trading: ${formatMoney(breakdown.revenge_trades, market)}`
      : 'Revenge trading: unavailable',
    breakdown
      ? `Overtrading: ${formatMoney(breakdown.overtrading, market)}`
      : 'Overtrading: unavailable',
    breakdown
      ? `Size violations: ${formatMoney(breakdown.size_violations, market)}`
      : 'Size violations: unavailable',
    '',
    'NEXT SESSION BRIEF',
    brief.leakHeadline,
    mandate.summary,
    '',
    'DO NOW',
    ...brief.doNow.map((item, index) => `${index + 1}. ${item}`),
    '',
    'STOP NOW',
    ...brief.stopNow.map((item, index) => `${index + 1}. ${item}`),
    '',
    'PROTECT',
    brief.protectLine,
    '',
    'STANDARDS CURRENTLY VIOLATED',
    ...protocol.violatedStandards.map((item) => `- ${item}`),
    '',
    'NEXT CHECKPOINT',
    nextCheckpoint,
    '',
    'RECENT COSTLY MISTAKES',
    ...(recentErrors.length
      ? recentErrors.map((error) => `- ${error.date}: ${error.pair} | ${error.error} | ${formatSignedMoney(-Math.abs(error.cost), market)}`)
      : ['- No recent costly mistakes available yet.']),
    '',
    'EDGE PORTFOLIO SNAPSHOT',
    ...(overview.edge_portfolio.slice(0, 3).map((edge) => `- ${edge.name}: ${edge.status} | ${edge.win_rate}% win rate | ${edge.action}`)),
  ]

  return {
    filename,
    title,
    body: sections.join('\n'),
  }
}

export function downloadReportArtifact(report: ReportArtifact): void {
  const blob = new Blob([report.body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = report.filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
