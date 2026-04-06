import { describe, expect, it } from 'vitest'
import { buildJourneyState } from '../journeyState'

describe('buildJourneyState', () => {
  it('pushes incomplete profiles into onboarding first', () => {
    const state = buildJourneyState({
      overview: null,
      profile: null,
      sessionMeta: { market: 'india', offerKind: 'psych_audit' },
      market: 'india',
    })

    expect(state.nextAction?.to).toBe('/dashboard/onboarding')
    expect(state.steps.find((step) => step.key === 'context')?.status).toBe('current')
  })

  it('marks read-only one-time access as a warning stage', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const state = buildJourneyState({
      overview: {
        access_tier: 'psych_audit',
        billing_status: 'active',
        offer_kind: 'psych_audit',
        case_status: 'read_only',
        trader_mode: 'retail_fn0_struggler',
        next_action: 'Renew or upgrade access',
        access_expires_at: pastDate,
        days_left: 0,
        data_source: 'manual_upload',
        bql_state: 'WATCH',
        bql_score: 0.4,
        monte_carlo_drift: 100,
        ruin_probability: 0.1,
        discipline_tax_30d: 200,
        sharpe_scenario: 1,
        total_trades: 20,
        winning_trades: 10,
        edge_portfolio: [],
        loyalty_unlock: null,
        next_coach_date: new Date().toISOString(),
      },
      profile: {
        capital_band: '50k_to_250k_inr',
        monthly_income_band: '25k_to_75k_inr',
        trader_focus: 'retail_fo',
        broker_platform: 'Zerodha',
        primary_instruments: ['nifty_options'],
        trader_mode: 'retail_fn0_struggler',
        completed: true,
      },
      sessionMeta: { market: 'india', offerKind: 'psych_audit', accessExpiresAt: pastDate },
      market: 'india',
    })

    expect(state.nextAction?.to).toContain('/pricing')
    expect(state.steps.find((step) => step.key === 'continuity')?.status).toBe('warning')
  })
})
