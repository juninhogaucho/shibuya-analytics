import { describe, expect, it } from 'vitest'
import { formatCompactMoney, formatMoney, formatSignedCompactMoney, formatSignedMoney, humanizeFocus, humanizeInstrument } from '../display'

describe('display helpers', () => {
  it('formats India money in rupees', () => {
    expect(formatMoney(1499, 'india')).toContain('1,499')
    expect(formatMoney(1499, 'india')).toContain('₹')
  })

  it('formats signed values', () => {
    expect(formatSignedMoney(250, 'global')).toMatch(/^\+/)
    expect(formatSignedMoney(-250, 'india')).toMatch(/^-/)
  })

  it('formats compact money for dashboard surfaces', () => {
    expect(formatCompactMoney(12500, 'india')).toContain('₹')
    expect(formatSignedCompactMoney(-12500, 'india')).toMatch(/^-/)
  })

  it('humanizes focus and instruments', () => {
    expect(humanizeFocus('prop_eval')).toBe('Prop evaluation')
    expect(humanizeInstrument('banknifty_options')).toBe('BankNifty options')
  })
})
