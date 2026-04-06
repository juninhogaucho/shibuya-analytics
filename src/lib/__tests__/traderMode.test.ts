import { describe, expect, it } from 'vitest'
import {
  buildModeSpecificMandateLabel,
  deriveTraderModeFromFocus,
  deriveTraderModeFromProfileContext,
  humanizeTraderMode,
} from '../traderMode'

describe('traderMode helpers', () => {
  it('derives the right mode from trader focus', () => {
    expect(deriveTraderModeFromFocus('retail_fo')).toBe('retail_fn0_struggler')
    expect(deriveTraderModeFromFocus('prop_eval')).toBe('prop_eval_survival')
    expect(deriveTraderModeFromFocus('mixed')).toBe('prop_eval_survival')
    expect(deriveTraderModeFromFocus('profitable_refinement')).toBe('profitable_refiner')
  })

  it('derives trader mode from profile context safely', () => {
    expect(deriveTraderModeFromProfileContext(null)).toBe('retail_fn0_struggler')
    expect(
      deriveTraderModeFromProfileContext({
        trader_focus: 'profitable_refinement',
      }),
    ).toBe('profitable_refiner')
  })

  it('humanizes modes and mandate labels', () => {
    expect(humanizeTraderMode('prop_eval_survival')).toBe('Prop-eval survival')
    expect(buildModeSpecificMandateLabel('retail_fn0_struggler')).toContain('cash runway')
  })
})
