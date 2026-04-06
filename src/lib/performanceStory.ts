import type { CampaignMetrics, DashboardOverview, TraderProfileContext, TradingReportComparisonResponse, TraderMode } from './types'
import type { Market } from './market'
import { formatMoney } from './display'

export interface PerformanceStory {
  campaignChapter: string
  operatorIdentity: string
  currentEnemy: string
  missionLine: string
  momentumLine: string
  proofTarget: string
  commandLine: string
  chapter: string
  identity: string
  enemy: string
  mission: string
  momentum: string
  proof: string
  reasonToStay: string
  mantra: string
}

function getBiggestLeakKey(overview: DashboardOverview): 'revenge' | 'overtrading' | 'sizing' | 'general' {
  const breakdown = overview.discipline_tax_breakdown
  if (!breakdown) {
    return 'general'
  }

  const entries = [
    ['revenge', breakdown.revenge_trades],
    ['overtrading', breakdown.overtrading],
    ['sizing', breakdown.size_violations],
  ] as const

  return [...entries].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general'
}

function getIdentity(mode: TraderMode | undefined, profile: TraderProfileContext | null): string {
  if (mode === 'prop_eval_survival') {
    return 'Rule-survival operator'
  }
  if (mode === 'profitable_refiner') {
    return 'Edge refiner'
  }
  if (profile?.monthly_income_band === 'student_or_none' || profile?.capital_band === 'under_50k_inr') {
    return 'Capital protector'
  }
  return 'Market survivor'
}

function getChapter(overview: DashboardOverview): string {
  switch (overview.case_status) {
    case 'awaiting_upload':
      return 'Chapter 1: Face the real leak'
    case 'baseline_ready':
      return 'Chapter 2: Baseline locked'
    case 'call_pending':
      return 'Chapter 3: Reset checkpoint'
    case 'follow_up_ready':
      return 'Chapter 4: Prove the change'
    case 'read_only':
      return 'Chapter 5: Review and recommit'
    default:
      return 'Current campaign: tighten the process'
  }
}

function getEnemy(
  leakKey: ReturnType<typeof getBiggestLeakKey>,
  market: Market,
  overview: DashboardOverview,
  metrics?: CampaignMetrics,
): string {
  const backendEnemy = overview.analysis_summary?.current_enemy
  if (backendEnemy) {
    return backendEnemy
  }
  const amount = formatMoney(overview.discipline_tax_30d, market)
  const recurringEnemy = metrics?.recurring_enemy && !metrics.recurring_enemy.includes('not repeated')
    ? `${metrics.recurring_enemy}. `
    : ''

  switch (leakKey) {
    case 'revenge':
      return `${recurringEnemy}The enemy is emotional recovery trading. It already cost ${amount} in the current window.`
    case 'overtrading':
      return `${recurringEnemy}The enemy is compulsive activity. It is turning decent reads into noise and already cost ${amount}.`
    case 'sizing':
      return `${recurringEnemy}The enemy is size indiscipline. One oversized decision is doing more damage than several average trades.`
    default:
      return `${recurringEnemy}The enemy is unforced process leakage. ${amount} is leaving the account without improving your edge.`
  }
}

function getMission(mode: TraderMode | undefined, leakKey: ReturnType<typeof getBiggestLeakKey>): string {
  if (mode === 'prop_eval_survival') {
    return 'Survive the next sequence cleanly. Stay inside the rulebook, cut emotional follow-up trades, and protect funded-account viability.'
  }
  if (mode === 'profitable_refiner') {
    return 'Strip the last execution leak from a process that already works. Protect the edge and remove the drift.'
  }

  switch (leakKey) {
    case 'revenge':
      return 'Break the revenge loop. No reactive recovery trading, no oversized follow-up, no ego sessions.'
    case 'overtrading':
      return 'Trade less, not more. Make selectivity feel like strength again.'
    case 'sizing':
      return 'Bring risk back under command. No trade gets to become a referendum on your self-worth.'
    default:
      return 'Make the next session cleaner than the last one. The job is to stop donating money through avoidable mistakes.'
  }
}

function getMomentum(
  overview: DashboardOverview,
  comparison?: TradingReportComparisonResponse | null,
  market?: Market,
  metrics?: CampaignMetrics,
): string {
  if (overview.analysis_summary?.drift_posture) {
    return overview.analysis_summary.drift_posture
  }
  if (metrics?.last_real_improvement && !metrics.last_real_improvement.includes('not proven')) {
    return `Momentum is earned: ${metrics.last_real_improvement}`
  }

  if (comparison?.has_comparison && comparison.delta_summary && comparison.baseline && comparison.latest && market) {
    const change = comparison.delta_summary.discipline_tax_change
    if (change < 0) {
      return `Momentum is real: discipline tax improved by ${formatMoney(Math.abs(change), market)} between baseline and latest snapshot.`
    }
    if (change > 0) {
      return `Momentum is weak: discipline tax worsened by ${formatMoney(change, market)}. The next upload needs to prove an actual behavioral change.`
    }
  }

  if ((overview.streak?.current ?? 0) >= 5) {
    return `Momentum is building: ${overview.streak?.current} clean days in the current discipline streak.`
  }
  if ((overview.upload_count ?? 0) > 0) {
    return `Momentum exists, but it is fragile: ${overview.upload_count} upload${overview.upload_count === 1 ? '' : 's'} recorded so far.`
  }
  return 'Momentum has not been earned yet. The first honest upload is where the campaign starts.'
}

function getProof(
  overview: DashboardOverview,
  market: Market,
  comparison?: TradingReportComparisonResponse | null,
  metrics?: CampaignMetrics,
): string {
  if ((metrics?.saved_capital_vs_baseline ?? 0) > 0) {
    return `Proof now has cash behind it: ${formatMoney(metrics?.saved_capital_vs_baseline ?? 0, market)} recovered versus baseline leakage.`
  }

  if (comparison?.has_comparison && comparison.delta_summary && comparison.baseline && comparison.latest) {
    return `Proof is comparison, not vibes: baseline discipline tax ${formatMoney(comparison.baseline.discipline_tax, market)} versus latest ${formatMoney(comparison.latest.discipline_tax, market)}.`
  }

  return `Right now the proof target is simple: convert ${formatMoney(overview.discipline_tax_30d, market)} of behavioral leakage into retained capital.`
}

export function buildPerformanceStory({
  overview,
  profile,
  market,
  comparison,
  metrics,
}: {
  overview: DashboardOverview
  profile: TraderProfileContext | null
  market: Market
  comparison?: TradingReportComparisonResponse | null
  metrics?: CampaignMetrics
}): PerformanceStory {
  const mode = overview.trader_mode ?? profile?.trader_mode
  const leakKey = getBiggestLeakKey(overview)
  const chapter = getChapter(overview)
  const identity = getIdentity(mode, profile)
  const enemy = getEnemy(leakKey, market, overview, metrics)
  const mission = overview.daily_briefing?.mission_line ?? overview.analysis_summary?.next_session_command ?? getMission(mode, leakKey)
  const momentum = getMomentum(overview, comparison, market, metrics)
  const proof = getProof(overview, market, comparison, metrics)
  const mantra = overview.analysis_summary?.next_session_command ?? 'Best loser wins. Lose cleanly, stay in command, and keep what your edge earns.'

  return {
    campaignChapter: chapter,
    operatorIdentity: identity,
    currentEnemy: enemy,
    missionLine: mission,
    momentumLine: momentum,
    proofTarget: proof,
    commandLine: mantra,
    chapter,
    identity,
    enemy,
    mission,
    momentum,
    proof,
    reasonToStay: 'You are not here to feel better about trading. You are here to become harder to break.',
    mantra,
  }
}
