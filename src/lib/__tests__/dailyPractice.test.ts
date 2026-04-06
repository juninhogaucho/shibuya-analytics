import { beforeEach, describe, expect, it } from 'vitest'
import { buildCampaignMetrics, readCampaignJournal, saveDailyBriefing, saveDailyDebrief } from '../dailyPractice'
import type { TradingReportComparisonResponse } from '../types'

describe('dailyPractice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores briefing and debrief entries per customer', () => {
    saveDailyBriefing('customer-1', {
      current_state: 'under_pressure',
      current_risk: 'revenge',
      avoid_today: 'Do not trade after the first reactive loss.',
      mission_line: 'Protect the account first.',
    })
    saveDailyDebrief('customer-1', {
      gate_obeyed: true,
      stopped_correctly: true,
      protected_capital: true,
      main_lapse: '',
      main_win: 'Stopped after the first sloppy impulse.',
      tomorrow_line: 'Same standard tomorrow.',
      standards_held_today: ['Capital preserved', 'Stop respected'],
      standards_broken_today: [],
    })

    const entries = readCampaignJournal('customer-1')

    expect(entries).toHaveLength(1)
    expect(entries[0]?.briefing?.current_risk).toBe('revenge')
    expect(entries[0]?.debrief?.stopped_correctly).toBe(true)
  })

  it('builds proof-oriented campaign metrics from journal history and comparisons', () => {
    saveDailyDebrief('customer-2', {
      gate_obeyed: true,
      stopped_correctly: true,
      protected_capital: true,
      main_lapse: '',
      main_win: 'Stayed patient and did not press size.',
      tomorrow_line: 'Hold the same line.',
      standards_held_today: ['Capital preserved', 'Size discipline'],
      standards_broken_today: [],
    })

    const comparison: TradingReportComparisonResponse = {
      has_comparison: true,
      baseline: {
        snapshot_id: 'baseline',
        discipline_tax: 12000,
        bql_score: 0.62,
        bql_state: 'UNDER_PRESSURE',
        pnl_net: -1500,
        pnl_gross: 3000,
        total_trades: 25,
        winning_trades: 11,
        ruin_probability: 0.08,
        behavior_share: 0.51,
        breach_risk_score: 0.64,
      },
      latest: {
        snapshot_id: 'latest',
        discipline_tax: 7000,
        bql_score: 0.38,
        bql_state: 'STABLE',
        pnl_net: 900,
        pnl_gross: 3200,
        total_trades: 28,
        winning_trades: 15,
        ruin_probability: 0.05,
        behavior_share: 0.33,
        breach_risk_score: 0.41,
      },
      delta_summary: {
        discipline_tax_change: -5000,
        revenge_change: -3000,
        overtrading_change: -1200,
        size_change: -800,
        edge_vs_behavior_shift: 'Less behavioral drag',
        breach_risk_shift: 'Improved',
        bql_change: -0.24,
      },
      last_report_snapshot_id: 'latest',
    }

    const metrics = buildCampaignMetrics({
      entries: readCampaignJournal('customer-2'),
      comparison,
    })

    expect(metrics.saved_capital_vs_baseline).toBe(5000)
    expect(metrics.clean_session_count).toBe(1)
    expect(metrics.revenge_free_streak).toBe(1)
    expect(metrics.best_controlled_week).toBe(1)
  })

  it('prefers backend campaign state when overview already carries live proof', () => {
    const metrics = buildCampaignMetrics({
      entries: [],
      overview: {
        bql_state: 'UNDER_PRESSURE',
        bql_score: 0.58,
        monte_carlo_drift: 0,
        ruin_probability: 0.04,
        discipline_tax_30d: 4200,
        sharpe_scenario: 0.9,
        edge_portfolio: [],
        loyalty_unlock: null,
        next_coach_date: new Date().toISOString(),
        saved_capital_vs_baseline: 3100,
        recurring_enemy: 'overtrading',
        daily_briefing: {
          date: new Date().toISOString().slice(0, 10),
          current_state: 'under_pressure',
          current_risk: 'overtrading',
          avoid_today: 'Overtrading',
          mission_line: 'Trade fewer times.',
        },
        daily_debrief: {
          date: new Date().toISOString().slice(0, 10),
          gate_obeyed: true,
          stopped_correctly: true,
          protected_capital: true,
          main_lapse: '',
          main_win: 'Held the line.',
          tomorrow_line: 'Same again.',
          standards_held_today: ['Capital preserved'],
          standards_broken_today: ['Overtrading'],
        },
        standards_held_today: ['Capital preserved'],
        standards_broken_today: ['Overtrading'],
      },
    })

    expect(metrics.saved_capital_vs_baseline).toBe(3100)
    expect(metrics.recurring_enemy).toBe('overtrading')
    expect(metrics.daily_briefing_completed).toBe(true)
    expect(metrics.standards_broken_today).toEqual(['Overtrading'])
  })
})
