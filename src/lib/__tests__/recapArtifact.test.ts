import { describe, expect, it } from 'vitest'
import { buildThirtyDayCampaignArtifact, buildWeeklyRecapArtifact } from '../recapArtifact'
import type { CampaignMetrics, DashboardOverview, TraderProfileContext, TradingReportComparisonResponse } from '../types'
import type { PerformanceStory } from '../performanceStory'

const story: PerformanceStory = {
  campaignChapter: 'Chapter 2: Baseline locked',
  operatorIdentity: 'Capital protector',
  currentEnemy: 'The enemy is emotional recovery trading.',
  missionLine: 'Break the revenge loop.',
  momentumLine: 'Momentum is earned.',
  proofTarget: 'Recover the leak.',
  commandLine: 'Best loser wins.',
  chapter: 'Chapter 2: Baseline locked',
  identity: 'Capital protector',
  enemy: 'The enemy is emotional recovery trading.',
  mission: 'Break the revenge loop.',
  momentum: 'Momentum is earned.',
  proof: 'Recover the leak.',
  reasonToStay: 'Become harder to break.',
  mantra: 'Best loser wins.',
}

const overview: DashboardOverview = {
  bql_state: 'UNDER_PRESSURE',
  bql_score: 0.58,
  monte_carlo_drift: 800,
  ruin_probability: 0.06,
  discipline_tax_30d: 9400,
  discipline_tax_breakdown: {
    revenge_trades: 5000,
    overtrading: 2600,
    size_violations: 1800,
  },
  sharpe_scenario: 1.2,
  pnl_gross: 18000,
  pnl_net: 8600,
  total_trades: 32,
  winning_trades: 18,
  edge_portfolio: [],
  loyalty_unlock: null,
  next_coach_date: '2026-04-10',
}

const profile: TraderProfileContext = {
  capital_band: 'under_50k_inr',
  monthly_income_band: 'student_or_none',
  trader_focus: 'retail_fo',
  broker_platform: 'Zerodha',
  primary_instruments: ['nifty_options'],
  trader_mode: 'retail_fn0_struggler',
  completed: true,
}

const comparison: TradingReportComparisonResponse = {
  has_comparison: true,
  baseline: {
    snapshot_id: 'baseline',
    discipline_tax: 14000,
    bql_score: 0.66,
    bql_state: 'ALERT',
    pnl_net: -2100,
    pnl_gross: 2000,
    total_trades: 25,
    winning_trades: 10,
    ruin_probability: 0.09,
    behavior_share: 0.57,
    breach_risk_score: 0.71,
  },
  latest: {
    snapshot_id: 'latest',
    discipline_tax: 9000,
    bql_score: 0.41,
    bql_state: 'STABLE',
    pnl_net: 1200,
    pnl_gross: 3000,
    total_trades: 29,
    winning_trades: 15,
    ruin_probability: 0.05,
    behavior_share: 0.39,
    breach_risk_score: 0.46,
  },
  delta_summary: {
    discipline_tax_change: -5000,
    revenge_change: -3200,
    overtrading_change: -1200,
    size_change: -600,
    edge_vs_behavior_shift: 'Less behavioral drag',
    breach_risk_shift: 'Improved',
    bql_change: -0.25,
  },
  last_report_snapshot_id: 'latest',
}

const metrics: CampaignMetrics = {
  daily_briefing_completed: true,
  daily_debrief: null,
  standards_held_today: ['Capital preserved'],
  standards_broken_today: [],
  saved_capital_vs_baseline: 5000,
  clean_session_count: 3,
  revenge_free_streak: 4,
  size_discipline_streak: 3,
  sessions_stopped_correctly: 2,
  best_controlled_week: 3,
  recurring_enemy: 'Revenge trading',
  standards_held_most_often: 'Capital preserved',
  standards_broken_most_often: 'Revenge trading',
  most_dangerous_session: '31 Mar: revenge session after first loss',
  cleanest_session: '02 Apr: stopped correctly after one clean rotation',
  last_real_improvement: 'Recovered 5,000 in discipline leak versus baseline.',
}

describe('recapArtifact', () => {
  it('builds a private weekly recap with highlights', () => {
    const artifact = buildWeeklyRecapArtifact({
      story,
      overview,
      profile,
      comparison,
      metrics,
      market: 'india',
    })

    expect(artifact.title).toContain('7-Day')
    expect(artifact.highlights[0]).toContain('Saved capital')
    expect(artifact.body).toContain('WHAT YOU STOPPED PAYING FOR')
  })

  it('builds a sanitized campaign recap that hides money values', () => {
    const artifact = buildThirtyDayCampaignArtifact({
      story,
      overview,
      profile,
      comparison,
      metrics,
      market: 'india',
    })

    expect(artifact.sanitized_body).toContain('Private amount hidden')
    expect(artifact.sanitized_filename).toContain('sanitized')
  })
})
