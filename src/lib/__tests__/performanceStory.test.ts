import { describe, expect, it } from 'vitest'
import { buildPerformanceStory } from '../performanceStory'
import type { DashboardOverview, TraderProfileContext, TradingReportComparisonResponse } from '../types'

const overview: DashboardOverview = {
  bql_state: 'UNDER_PRESSURE',
  bql_score: 0.62,
  monte_carlo_drift: 1200,
  ruin_probability: 0.08,
  discipline_tax_30d: 12000,
  discipline_tax_breakdown: {
    revenge_trades: 7000,
    overtrading: 3000,
    size_violations: 2000,
  },
  sharpe_scenario: 1.2,
  edge_portfolio: [],
  loyalty_unlock: null,
  next_coach_date: '2026-04-10',
  total_trades: 30,
  winning_trades: 14,
  case_status: 'baseline_ready',
  trader_mode: 'retail_fn0_struggler',
  upload_count: 1,
  streak: {
    current: 3,
    best: 3,
    message: 'Keep going',
  },
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

describe('buildPerformanceStory', () => {
  it('builds a stronger campaign narrative from the current state', () => {
    const story = buildPerformanceStory({
      overview,
      profile,
      market: 'india',
    })

    expect(story.chapter).toContain('Baseline')
    expect(story.identity).toBe('Capital protector')
    expect(story.enemy).toContain('emotional recovery trading')
    expect(story.mission).toContain('Break the revenge loop')
    expect(story.reasonToStay).toContain('harder to break')
  })

  it('uses comparison data when improvement proof exists', () => {
    const comparison: TradingReportComparisonResponse = {
      has_comparison: true,
      baseline: {
        snapshot_id: 'baseline',
        discipline_tax: 12000,
        bql_score: 0.62,
        bql_state: 'UNDER_PRESSURE',
        pnl_net: -1000,
        pnl_gross: 2000,
        total_trades: 30,
        winning_trades: 14,
        ruin_probability: 0.08,
        behavior_share: 0.5,
        breach_risk_score: 0.6,
      },
      latest: {
        snapshot_id: 'latest',
        discipline_tax: 8000,
        bql_score: 0.41,
        bql_state: 'STABLE',
        pnl_net: 500,
        pnl_gross: 2400,
        total_trades: 35,
        winning_trades: 18,
        ruin_probability: 0.05,
        behavior_share: 0.38,
        breach_risk_score: 0.42,
      },
      delta_summary: {
        discipline_tax_change: -4000,
        revenge_change: -2500,
        overtrading_change: -1000,
        size_change: -500,
        edge_vs_behavior_shift: 'Less behavioral drag',
        breach_risk_shift: 'Improved',
        bql_change: -0.21,
      },
      last_report_snapshot_id: 'latest',
    }

    const story = buildPerformanceStory({
      overview,
      profile,
      market: 'india',
      comparison,
    })

    expect(story.momentum).toContain('Momentum is real')
    expect(story.proof).toContain('baseline discipline tax')
  })
})
