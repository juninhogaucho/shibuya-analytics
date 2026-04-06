import { describe, expect, it } from 'vitest'
import { buildReportArtifact } from '../reportArtifact'

describe('buildReportArtifact', () => {
  it('builds a readable baseline report file from live board data', () => {
    const artifact = buildReportArtifact({
      overview: {
        access_tier: 'psych_audit',
        billing_status: 'active',
        offer_kind: 'psych_audit',
        case_status: 'baseline_ready',
        trader_mode: 'retail_fn0_struggler',
        next_action: 'Carry the next-session mandate',
        access_expires_at: new Date().toISOString(),
        data_source: 'manual_upload',
        bql_state: 'ALERT',
        bql_score: 0.66,
        monte_carlo_drift: 450,
        ruin_probability: 0.12,
        discipline_tax_30d: 825,
        discipline_tax_breakdown: {
          revenge_trades: 400,
          overtrading: 250,
          size_violations: 175,
        },
        pnl_gross: 2200,
        pnl_net: 1375,
        sharpe_scenario: 1.1,
        total_trades: 18,
        winning_trades: 9,
        edge_portfolio: [
          { name: 'Nifty opening drive', status: 'PRIME', win_rate: 63, action: 'Press only this setup.' },
        ],
        recent_errors: [
          { date: '2026-04-01', pair: 'NIFTY', error: 'Revenge entries', cost: 320 },
        ],
        loyalty_unlock: null,
        next_coach_date: new Date().toISOString(),
      },
      brief: {
        title: 'Next Session Brief',
        subtitle: 'Carry this into the next session.',
        leakHeadline: 'Revenge trading is the biggest leak right now.',
        doNow: ['Trade half size'],
        stopNow: ['No revenge entries'],
        protectLine: 'Protect runway first.',
        copyText: 'brief body',
      },
      mandate: {
        headline: 'Protect the account',
        summary: 'Shrink the behavioral leak before pressing size.',
        tone: 'protect',
        doNow: ['Trade half size'],
        stopNow: ['No revenge entries'],
        reviewNext: ['Review the Nifty open only'],
        cta: { label: 'View board', to: '/dashboard' },
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

    expect(artifact.filename).toContain('shibuya-baseline-report')
    expect(artifact.body).toContain('CURRENT STATE')
    expect(artifact.body).toContain('Trader mode: Retail F&O struggler')
    expect(artifact.body).toContain('NEXT SESSION BRIEF')
    expect(artifact.body).toContain('RECENT COSTLY MISTAKES')
  })
})
