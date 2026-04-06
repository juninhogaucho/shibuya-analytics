import { describe, expect, it } from 'vitest'
import { buildFieldKitArtifacts } from '../fieldKit'
import type { PerformanceStory } from '../performanceStory'
import type { CampaignMetrics, DashboardOverview, TraderProfileContext } from '../types'

const story: PerformanceStory = {
  campaignChapter: 'Chapter 3: Reset checkpoint',
  operatorIdentity: 'Capital protector',
  currentEnemy: 'The enemy is emotional recovery trading.',
  missionLine: 'Break the revenge loop and protect the cash runway.',
  momentumLine: 'Momentum is earned through cleaner sessions.',
  proofTarget: 'Recover the discipline leak.',
  commandLine: 'Best loser wins.',
  chapter: 'Chapter 3: Reset checkpoint',
  identity: 'Capital protector',
  enemy: 'The enemy is emotional recovery trading.',
  mission: 'Break the revenge loop and protect the cash runway.',
  momentum: 'Momentum is earned through cleaner sessions.',
  proof: 'Recover the discipline leak.',
  reasonToStay: 'Become harder to break.',
  mantra: 'Best loser wins.',
}

const overview: DashboardOverview = {
  trader_mode: 'retail_fn0_struggler',
  next_action: 'Carry the stricter command into the next week.',
  uploads_used: 1,
  upload_count: 1,
  bql_state: 'UNDER_PRESSURE',
  bql_score: 0.58,
  monte_carlo_drift: 1200,
  ruin_probability: 0.08,
  discipline_tax_30d: 10000,
  discipline_tax_breakdown: {
    revenge_trades: 6000,
    overtrading: 2500,
    size_violations: 1500,
  },
  sharpe_scenario: 1.1,
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

const metrics: CampaignMetrics = {
  daily_briefing_completed: true,
  daily_debrief: null,
  standards_held_today: ['Capital preserved'],
  standards_broken_today: [],
  saved_capital_vs_baseline: 4000,
  clean_session_count: 2,
  revenge_free_streak: 3,
  size_discipline_streak: 2,
  sessions_stopped_correctly: 1,
  best_controlled_week: 2,
  recurring_enemy: 'Revenge trading',
  standards_held_most_often: 'Capital preserved',
  standards_broken_most_often: 'Revenge trading',
  most_dangerous_session: '31 Mar: revenge session after first loss',
  cleanest_session: '02 Apr: stopped correctly after one clean rotation',
  last_real_improvement: 'Recovered 4,000 in discipline leak versus baseline.',
}

describe('fieldKit', () => {
  it('builds a core paid toolkit', () => {
    const artifacts = buildFieldKitArtifacts({
      overview,
      profile,
      story,
      metrics,
      market: 'india',
      premiumAccess: false,
    })

    expect(artifacts.map((artifact) => artifact.id)).toContain('desk-card')
    expect(artifacts.map((artifact) => artifact.id)).toContain('kill-switch')
    expect(artifacts.map((artifact) => artifact.id)).toContain('seven-session-scorecard')
  })

  it('adds founder review prep for premium tiers', () => {
    const artifacts = buildFieldKitArtifacts({
      overview,
      profile,
      story,
      metrics,
      market: 'india',
      premiumAccess: true,
    })

    expect(artifacts.map((artifact) => artifact.id)).toContain('founder-review-prep')
  })
})
