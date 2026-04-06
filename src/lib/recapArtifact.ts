import type {
  CampaignMetrics,
  CampaignRecapArtifact,
  DashboardOverview,
  TradingReportComparisonResponse,
  TraderProfileContext,
} from './types'
import type { Market } from './market'
import type { PerformanceStory } from './performanceStory'
import { formatMoney, humanizeFocus, humanizeInstrument } from './display'

function sanitizeDate(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function maybeRedactMoney(value: number, market: Market, redact: boolean): string {
  return redact ? 'Private amount hidden' : formatMoney(value, market)
}

function buildArtifactBody({
  title,
  subtitle,
  story,
  overview,
  profile,
  comparison,
  metrics,
  market,
  redactMoney,
}: {
  title: string
  subtitle: string
  story: PerformanceStory
  overview: DashboardOverview
  profile: TraderProfileContext | null
  comparison?: TradingReportComparisonResponse | null
  metrics: CampaignMetrics
  market: Market
  redactMoney: boolean
}): string {
  const breakdown = overview.discipline_tax_breakdown
  const contextLine = profile
    ? `${humanizeFocus(profile.trader_focus)} via ${profile.broker_platform} on ${profile.primary_instruments.map(humanizeInstrument).join(', ')}`
    : 'Trader context incomplete'

  const sections = [
    title.toUpperCase(),
    subtitle,
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '',
    'CAMPAIGN STATE',
    `Chapter: ${story.campaignChapter}`,
    `Operator identity: ${story.operatorIdentity}`,
    `Current enemy: ${story.currentEnemy}`,
    `Mission line: ${story.missionLine}`,
    `Momentum line: ${story.momentumLine}`,
    `Proof target: ${story.proofTarget}`,
    `Command line: ${story.commandLine}`,
    '',
    'WHAT YOU STOPPED PAYING FOR',
    `Discipline tax in current window: ${maybeRedactMoney(overview.discipline_tax_30d, market, redactMoney)}`,
    `Saved capital vs baseline: ${maybeRedactMoney(metrics.saved_capital_vs_baseline, market, redactMoney)}`,
    breakdown
      ? `Revenge leak: ${maybeRedactMoney(breakdown.revenge_trades, market, redactMoney)}`
      : 'Revenge leak: unavailable',
    breakdown
      ? `Overtrading leak: ${maybeRedactMoney(breakdown.overtrading, market, redactMoney)}`
      : 'Overtrading leak: unavailable',
    breakdown
      ? `Size-discipline leak: ${maybeRedactMoney(breakdown.size_violations, market, redactMoney)}`
      : 'Size-discipline leak: unavailable',
    '',
    'STANDARDS PROOF',
    `Standards held most often: ${metrics.standards_held_most_often}`,
    `Standards broken most often: ${metrics.standards_broken_most_often}`,
    `Revenge-free streak: ${metrics.revenge_free_streak} day(s)`,
    `Size-discipline streak: ${metrics.size_discipline_streak} day(s)`,
    `Sessions stopped correctly: ${metrics.sessions_stopped_correctly}`,
    `Best controlled week: ${metrics.best_controlled_week} clean session(s)`,
    `Clean sessions logged: ${metrics.clean_session_count}`,
    '',
    'SESSION MEMORY',
    `Cleanest session: ${metrics.cleanest_session}`,
    `Most dangerous session: ${metrics.most_dangerous_session}`,
    `Last real improvement: ${metrics.last_real_improvement}`,
    '',
    'TRADER CONTEXT',
    contextLine,
    '',
    'NEXT CAMPAIGN OBJECTIVE',
    story.missionLine,
    '',
    'BASELINE VS LATEST',
    comparison?.has_comparison && comparison.baseline && comparison.latest && comparison.delta_summary
      ? `Baseline discipline tax ${maybeRedactMoney(comparison.baseline.discipline_tax, market, redactMoney)} -> latest ${maybeRedactMoney(comparison.latest.discipline_tax, market, redactMoney)}`
      : 'Comparison not available yet. The next upload has to create a better proof trail.',
    comparison?.has_comparison && comparison.delta_summary
      ? `Behavior shift: ${comparison.delta_summary.edge_vs_behavior_shift}`
      : 'Behavior shift not available yet.',
  ]

  return sections.join('\n')
}

function buildArtifact({
  title,
  subtitle,
  slug,
  story,
  overview,
  profile,
  comparison,
  metrics,
  market,
}: {
  title: string
  subtitle: string
  slug: string
  story: PerformanceStory
  overview: DashboardOverview
  profile: TraderProfileContext | null
  comparison?: TradingReportComparisonResponse | null
  metrics: CampaignMetrics
  market: Market
}): CampaignRecapArtifact {
  return {
    title,
    subtitle,
    highlights: [
      `Saved capital: ${formatMoney(metrics.saved_capital_vs_baseline, market)}`,
      `Recurring enemy: ${metrics.recurring_enemy}`,
      `Best controlled week: ${metrics.best_controlled_week} clean session(s)`,
      `Proof target: ${story.proofTarget}`,
    ],
    body: buildArtifactBody({
      title,
      subtitle,
      story,
      overview,
      profile,
      comparison,
      metrics,
      market,
      redactMoney: false,
    }),
    sanitized_body: buildArtifactBody({
      title,
      subtitle,
      story,
      overview,
      profile,
      comparison,
      metrics,
      market,
      redactMoney: true,
    }),
    filename: `${slug}-${sanitizeDate()}.txt`,
    sanitized_filename: `${slug}-sanitized-${sanitizeDate()}.txt`,
  }
}

export function buildWeeklyRecapArtifact(args: {
  story: PerformanceStory
  overview: DashboardOverview
  profile: TraderProfileContext | null
  comparison?: TradingReportComparisonResponse | null
  metrics: CampaignMetrics
  market: Market
}): CampaignRecapArtifact {
  return buildArtifact({
    ...args,
    title: '7-Day Reset Recap',
    subtitle: 'What changed, what nearly killed you, and what you reclaimed this week.',
    slug: 'shibuya-7-day-reset-recap',
  })
}

export function buildThirtyDayCampaignArtifact(args: {
  story: PerformanceStory
  overview: DashboardOverview
  profile: TraderProfileContext | null
  comparison?: TradingReportComparisonResponse | null
  metrics: CampaignMetrics
  market: Market
}): CampaignRecapArtifact {
  return buildArtifact({
    ...args,
    title: '30-Day Campaign Review',
    subtitle: 'Private proof of composure, recovery, and standards held over the current campaign.',
    slug: 'shibuya-30-day-campaign-review',
  })
}

export function downloadCampaignRecapArtifact(artifact: CampaignRecapArtifact, sanitized = false): void {
  const body = sanitized ? artifact.sanitized_body : artifact.body
  const filename = sanitized ? artifact.sanitized_filename : artifact.filename
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
