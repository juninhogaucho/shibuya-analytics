export interface PartnerEconomicsInput {
  eligibleAccounts: number
  accountFeeUsd: number
  partnerChannelShareRate: number
  verifiedAnnualizedTvaUsd: number
  tvaFloorUsd: number
  tvaSuccessShareRate: number
}

export interface PartnerEconomicsResult extends PartnerEconomicsInput {
  monthlyGrossRevenueUsd: number
  partnerMonthlyShareUsd: number
  shibuyaMonthlyRetainedUsd: number
  shibuyaAnnualRetainedBaseUsd: number
  eligibleAnnualizedTvaUsd: number
  shibuyaTvaSuccessFeeUsd: number
  shibuyaFirstYearRevenueUsd: number
}

export interface TvaLedgerSource {
  id: string
  label: string
  body: string
  billableRule: string
}

export const DEFAULT_PARTNER_ECONOMICS: PartnerEconomicsInput = {
  eligibleAccounts: 1_000,
  accountFeeUsd: 12,
  partnerChannelShareRate: 0.3,
  verifiedAnnualizedTvaUsd: 80_000,
  tvaFloorUsd: 25_000,
  tvaSuccessShareRate: 0.15,
}

export const TVA_LEDGER_SOURCES: TvaLedgerSource[] = [
  {
    id: 'conversion',
    label: 'Conversion lift',
    body: 'Incremental attach, challenge purchase, or activation rate after a Shibuya-assisted journey.',
    billableRule: 'Billable only against a pre-agreed eligible cohort and comparison window.',
  },
  {
    id: 'retention',
    label: 'Retention and reactivation',
    body: 'Renewal, reactivation, or funded-account continuity improvement tied to Shibuya usage.',
    billableRule: 'Billable only above the baseline churn, renewal, or reactivation rate.',
  },
  {
    id: 'operating-load',
    label: 'Operating load removed',
    body: 'Support, review, dispute, fraud, or abuse workload reduced by clearer trader-state evidence.',
    billableRule: 'Billable only when hours, cases, or avoided manual reviews can be reconciled.',
  },
  {
    id: 'risk-leakage',
    label: 'Risk leakage reduced',
    body: 'Preventable payout, refund, chargeback, abuse, or rule-pressure leakage reduced in eligible accounts.',
    billableRule: 'Billable only when exclusions and non-Shibuya interventions are removed first.',
  },
]

export function calculatePartnerEconomics(input: PartnerEconomicsInput): PartnerEconomicsResult {
  const monthlyGrossRevenueUsd = input.eligibleAccounts * input.accountFeeUsd
  const partnerMonthlyShareUsd = monthlyGrossRevenueUsd * input.partnerChannelShareRate
  const shibuyaMonthlyRetainedUsd = monthlyGrossRevenueUsd - partnerMonthlyShareUsd
  const shibuyaAnnualRetainedBaseUsd = shibuyaMonthlyRetainedUsd * 12
  const eligibleAnnualizedTvaUsd = Math.max(0, input.verifiedAnnualizedTvaUsd - input.tvaFloorUsd)
  const shibuyaTvaSuccessFeeUsd = eligibleAnnualizedTvaUsd * input.tvaSuccessShareRate

  return {
    ...input,
    monthlyGrossRevenueUsd,
    partnerMonthlyShareUsd,
    shibuyaMonthlyRetainedUsd,
    shibuyaAnnualRetainedBaseUsd,
    eligibleAnnualizedTvaUsd,
    shibuyaTvaSuccessFeeUsd,
    shibuyaFirstYearRevenueUsd: shibuyaAnnualRetainedBaseUsd + shibuyaTvaSuccessFeeUsd,
  }
}

export function formatUsd(amount: number): string {
  return `USD ${Math.round(amount).toLocaleString('en-US')}`
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`
}

export function buildTvaReconciliationLine(result: PartnerEconomicsResult): string {
  return `If verified annualized TVA is ${formatUsd(result.verifiedAnnualizedTvaUsd)} and the agreed floor is ${formatUsd(result.tvaFloorUsd)}, eligible TVA is ${formatUsd(result.eligibleAnnualizedTvaUsd)}. At ${formatPercent(result.tvaSuccessShareRate)}, Shibuya earns ${formatUsd(result.shibuyaTvaSuccessFeeUsd)} only after reconciliation.`
}
