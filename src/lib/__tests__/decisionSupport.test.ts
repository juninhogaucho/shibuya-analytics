import { describe, expect, test } from 'vitest'
import { buildSlumpExecutionChecklist, buildTradingMandate, getAlertAction } from '../decisionSupport'
import type { DashboardOverview, SlumpPrescription } from '../types'

const baseOverview: DashboardOverview = {
  bql_state: 'COMPOSED',
  bql_score: 0.28,
  monte_carlo_drift: 1400,
  ruin_probability: 0.08,
  discipline_tax_30d: 700,
  sharpe_scenario: 1.4,
  total_trades: 45,
  winning_trades: 24,
  edge_portfolio: [
    { name: 'London FVG', status: 'PRIME', win_rate: 68, action: 'Press this', pnl: 4200 },
    { name: 'Friday PM Scalps', status: 'DECAYED', win_rate: 38, action: 'Stop this', pnl: -800 },
  ],
  loyalty_unlock: null,
  next_coach_date: '2026-03-30T00:00:00.000Z',
}

describe('decision support', () => {
  test('builds a protective mandate for elevated behavioral states', () => {
    const mandate = buildTradingMandate({
      ...baseOverview,
      bql_state: 'EMOTIONAL_TRAINWRECK',
      bql_score: 0.81,
    })

    expect(mandate.tone).toBe('protect')
    expect(mandate.cta.to).toBe('/dashboard/slump')
    expect(mandate.doNow[0]).toContain('London FVG')
    expect(mandate.stopNow[0]).toContain('Friday PM Scalps')
  })

  test('builds a focus mandate when edge leakage exists without full emotional breakdown', () => {
    const mandate = buildTradingMandate({
      ...baseOverview,
      bql_state: 'WATCHFUL',
      bql_score: 0.48,
    })

    expect(mandate.tone).toBe('focus')
    expect(mandate.cta.to).toBe('/dashboard/edges')
  })

  test('builds a press mandate when state is stable', () => {
    const mandate = buildTradingMandate({
      ...baseOverview,
      edge_portfolio: [{ name: 'London FVG', status: 'PRIME', win_rate: 68, action: 'Press this', pnl: 4200 }],
    })

    expect(mandate.tone).toBe('press')
    expect(mandate.headline).toContain('Press')
    expect(mandate.cta.to).toBe('/dashboard/edges')
  })

  test('maps alert types to actionable destinations', () => {
    expect(getAlertAction({
      id: '1',
      type: 'slump_warning',
      title: 'Slow down',
      body: 'State is deteriorating',
      severity: 'high',
      timestamp: '2026-03-28T00:00:00.000Z',
      acknowledged: false,
    })).toEqual({ label: 'Open slump protocol', to: '/dashboard/slump' })

    expect(getAlertAction({
      id: '2',
      type: 'margin_of_safety',
      title: 'Review size',
      body: 'Losses are widening',
      severity: 'medium',
      timestamp: '2026-03-28T00:00:00.000Z',
      acknowledged: false,
    })).toEqual({ label: 'Review trade history', to: '/dashboard/history' })
  })

  test('builds a concrete slump checklist', () => {
    const checklist = buildSlumpExecutionChecklist({
      is_slump: true,
      bql_state: 'EMOTIONAL_TRAINWRECK',
      prescription: {
        max_trades_per_session: 2,
        banned_assets: ['NAS100'],
        position_cap_pct: 25,
        cooldown_hours: 4,
        message: 'Protect capital',
        rules: ['Slow down'],
        recovery_criteria: ['3 consecutive green trades'],
      },
    } satisfies SlumpPrescription)

    expect(checklist[0]).toContain('2 trades')
    expect(checklist.some((item) => item.includes('NAS100'))).toBe(true)
    expect(checklist.some((item) => item.includes('3 consecutive green trades'))).toBe(true)
  })
})
