import { describe, expect, test } from 'vitest'
import {
  DEFAULT_PARTNER_ECONOMICS,
  TVA_LEDGER_SOURCES,
  buildTvaReconciliationLine,
  calculatePartnerEconomics,
  formatPercent,
  formatUsd,
} from '../partnerEconomics'

describe('partner economics', () => {
  test('separates distribution revenue from verified TVA upside', () => {
    const economics = calculatePartnerEconomics(DEFAULT_PARTNER_ECONOMICS)

    expect(economics.monthlyGrossRevenueUsd).toBe(12_000)
    expect(economics.partnerMonthlyShareUsd).toBe(3_600)
    expect(economics.shibuyaMonthlyRetainedUsd).toBe(8_400)
    expect(economics.shibuyaAnnualRetainedBaseUsd).toBe(100_800)
    expect(economics.eligibleAnnualizedTvaUsd).toBe(55_000)
    expect(economics.shibuyaTvaSuccessFeeUsd).toBe(8_250)
    expect(economics.shibuyaFirstYearRevenueUsd).toBe(109_050)
  })

  test('does not create a success fee below the agreed TVA floor', () => {
    const economics = calculatePartnerEconomics({
      ...DEFAULT_PARTNER_ECONOMICS,
      verifiedAnnualizedTvaUsd: 20_000,
      tvaFloorUsd: 25_000,
    })

    expect(economics.eligibleAnnualizedTvaUsd).toBe(0)
    expect(economics.shibuyaTvaSuccessFeeUsd).toBe(0)
  })

  test('formats the reconciliation line without hiding the floor', () => {
    const economics = calculatePartnerEconomics(DEFAULT_PARTNER_ECONOMICS)

    expect(formatUsd(economics.shibuyaTvaSuccessFeeUsd)).toBe('USD 8,250')
    expect(formatPercent(economics.tvaSuccessShareRate)).toBe('15%')
    expect(buildTvaReconciliationLine(economics)).toContain('eligible TVA is USD 55,000')
    expect(buildTvaReconciliationLine(economics)).toContain('only after reconciliation')
  })

  test('defines billable value sources with claim boundaries', () => {
    expect(TVA_LEDGER_SOURCES.map((source) => source.id)).toEqual([
      'conversion',
      'retention',
      'operating-load',
      'risk-leakage',
    ])
    expect(TVA_LEDGER_SOURCES.every((source) => source.billableRule.includes('Billable only'))).toBe(true)
  })
})
