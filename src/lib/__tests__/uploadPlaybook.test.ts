import { describe, expect, it } from 'vitest'
import { buildUploadPlaybook } from '../uploadPlaybook'

describe('buildUploadPlaybook', () => {
  it('builds a broker-specific playbook for Zerodha option traders', () => {
    const playbook = buildUploadPlaybook({
      capital_band: 'under_50k_inr',
      monthly_income_band: 'student_or_none',
      trader_focus: 'retail_fo',
      broker_platform: 'Zerodha',
      primary_instruments: ['nifty_options'],
      trader_mode: 'retail_fn0_struggler',
      completed: true,
    })

    expect(playbook.sourceLabel).toContain('Zerodha')
    expect(playbook.steps[0]).toContain('Zerodha Console')
    expect(playbook.watchouts.some((item) => item.includes('expiry-day'))).toBe(true)
    expect(playbook.fallbackSource).toContain('contract notes')
  })

  it('emphasizes rule pressure for prop-eval traders', () => {
    const playbook = buildUploadPlaybook({
      capital_band: '250k_to_1m_inr',
      monthly_income_band: '75k_to_200k_inr',
      trader_focus: 'prop_eval',
      broker_platform: 'Prop portal',
      primary_instruments: ['banknifty_options'],
      trader_mode: 'prop_eval_survival',
      completed: true,
    })

    expect(playbook.sourceLabel).toContain('Prop portal')
    expect(playbook.watchouts.some((item) => item.includes('rule-sensitive'))).toBe(true)
    expect(playbook.successHint).toContain('rulebook pressure')
  })
})
