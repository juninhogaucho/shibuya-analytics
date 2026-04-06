import { describe, expect, it } from 'vitest'
import { buildExecutionProtocol } from '../executionProtocol'

describe('buildExecutionProtocol', () => {
  it('flags loss of command when revenge and stressed-state activity are present', () => {
    const protocol = buildExecutionProtocol({
      overview: {
        trader_mode: 'retail_fn0_struggler',
        bql_state: 'EMOTIONAL_TRAINWRECK',
        bql_score: 0.78,
        monte_carlo_drift: -1200,
        ruin_probability: 0.21,
        discipline_tax_30d: 8200,
        discipline_tax_breakdown: {
          revenge_trades: 4200,
          overtrading: 2500,
          size_violations: 1500,
        },
        sharpe_scenario: 0.4,
        pnl_gross: 18000,
        pnl_net: 9800,
        total_trades: 28,
        winning_trades: 11,
        edge_portfolio: [],
        recent_errors: [],
        loyalty_unlock: null,
        next_coach_date: new Date().toISOString(),
      },
      profile: {
        capital_band: 'under_50k_inr',
        monthly_income_band: 'student_or_none',
        trader_focus: 'retail_fo',
        broker_platform: 'Zerodha',
        primary_instruments: ['banknifty_options'],
        trader_mode: 'retail_fn0_struggler',
        completed: true,
      },
      insights: {
        worstSymbol: { symbol: 'BANKNIFTY', pnl: -4600, trades: 7 },
        bestSymbol: { symbol: 'NIFTY', pnl: 3200, trades: 6 },
        worstDay: { day: '2026-03-30', pnl: -7200, trades: 6 },
        stressedTradeCount: 5,
        stressedAveragePnl: -940,
        revengeCluster: {
          tradeCount: 4,
          totalPnl: -3800,
          start: '2026-03-30T04:10:00Z',
          end: '2026-03-30T05:02:00Z',
        },
      },
    })

    expect(protocol.standardLevel).toBe('loss_of_command')
    expect(protocol.lossQualityLabel).toBe('Unacceptable losses')
    expect(protocol.violatedStandards.join(' ')).toContain('win money back')
    expect(protocol.hardStops.join(' ')).toContain('Bench BANKNIFTY')
  })

  it('recognizes a cleaner process when the leak is controlled', () => {
    const protocol = buildExecutionProtocol({
      overview: {
        trader_mode: 'profitable_refiner',
        bql_state: 'COMPOSED',
        bql_score: 0.22,
        monte_carlo_drift: 4200,
        ruin_probability: 0.03,
        discipline_tax_30d: 0,
        discipline_tax_breakdown: {
          revenge_trades: 0,
          overtrading: 0,
          size_violations: 0,
        },
        sharpe_scenario: 1.8,
        pnl_gross: 16800,
        pnl_net: 16800,
        total_trades: 24,
        winning_trades: 15,
        edge_portfolio: [],
        recent_errors: [],
        loyalty_unlock: null,
        next_coach_date: new Date().toISOString(),
      },
      profile: {
        capital_band: '250k_to_1m_inr',
        monthly_income_band: '75k_to_200k_inr',
        trader_focus: 'profitable_refinement',
        broker_platform: 'Dhan',
        primary_instruments: ['nifty_options'],
        trader_mode: 'profitable_refiner',
        completed: true,
      },
      insights: {
        worstSymbol: { symbol: 'BANKNIFTY', pnl: -800, trades: 2 },
        bestSymbol: { symbol: 'NIFTY', pnl: 6200, trades: 10 },
        worstDay: { day: '2026-03-29', pnl: -1200, trades: 3 },
        stressedTradeCount: 0,
        stressedAveragePnl: null,
        revengeCluster: null,
      },
    })

    expect(protocol.standardLevel).toBe('in_control')
    expect(protocol.lossQualityLabel).toBe('Acceptable losses')
    expect(protocol.unforcedErrorRate).toBeLessThan(10)
  })
})
