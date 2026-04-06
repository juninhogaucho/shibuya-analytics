import { describe, expect, it } from 'vitest'
import { buildActionBrief } from '../actionBrief'

describe('buildActionBrief', () => {
  it('builds a concrete next-session brief from overview and mandate data', () => {
    const brief = buildActionBrief({
      overview: {
        bql_state: 'ALERT',
        bql_score: 0.62,
        monte_carlo_drift: 420,
        ruin_probability: 0.08,
        discipline_tax_30d: 315,
        discipline_tax_breakdown: {
          revenge_trades: 160,
          overtrading: 95,
          size_violations: 60,
        },
        sharpe_scenario: 1.2,
        pnl_gross: 1157,
        pnl_net: 842,
        total_trades: 10,
        winning_trades: 6,
        edge_portfolio: [],
        recent_errors: [],
        loyalty_unlock: null,
        next_coach_date: new Date().toISOString(),
      },
      mandate: {
        headline: 'Protect the account',
        summary: 'Cut the expensive leak before you press size again.',
        tone: 'protect',
        doNow: ['Trade half size', 'Carry the stop list into the open'],
        stopNow: ['No revenge entries', 'No expiry-day hero trades'],
        reviewNext: ['Check alerts'],
        cta: {
          label: 'View alerts',
          to: '/dashboard/alerts',
        },
      },
      profile: {
        capital_band: 'under_50k_inr',
        monthly_income_band: 'under_25k_inr',
        trader_focus: 'retail_fo',
        broker_platform: 'Zerodha',
        primary_instruments: ['nifty_options'],
        trader_mode: 'retail_fn0_struggler',
        completed: true,
      },
      market: 'india',
      premiumAccess: false,
    })

    expect(brief.title).toBe('Next Session Brief')
    expect(brief.leakHeadline).toContain('revenge trades')
    expect(brief.copyText).toContain('SHIBUYA NEXT SESSION BRIEF')
    expect(brief.copyText).toContain('Mode: Retail F&O struggler')
    expect(brief.copyText).toContain('DO NOW')
    expect(brief.copyText).toContain('STOP NOW')
  })
})
