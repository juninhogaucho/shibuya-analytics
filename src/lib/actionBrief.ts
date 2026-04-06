import type { Market } from './market'
import type { DashboardOverview, TraderProfileContext } from './types'
import type { TradingMandate } from './decisionSupport'
import { formatMoney } from './display'
import { buildModeSpecificMandateLabel, deriveTraderModeFromProfileContext, humanizeTraderMode } from './traderMode'

export interface ActionBrief {
  title: string
  subtitle: string
  leakHeadline: string
  doNow: string[]
  stopNow: string[]
  protectLine: string
  copyText: string
}

function getProfileDirective(profile: TraderProfileContext | null): string {
  const mode = profile?.trader_mode ?? deriveTraderModeFromProfileContext(profile)
  const modeLabel = buildModeSpecificMandateLabel(mode)

  if (!profile) {
    return `${modeLabel} Protect the process before you try to force a bigger day.`
  }

  if (mode === 'prop_eval_survival') {
    return `${modeLabel} The job is rule survival with composure. Staying inside the rulebook matters more than feeling busy.`
  }

  if (mode === 'profitable_refiner') {
    return `${modeLabel} The goal is not activity. The goal is removing the last behavioral leak from an edge that already works.`
  }

  if (profile.capital_band === 'under_50k_inr' || profile.monthly_income_band === 'student_or_none') {
    return `${modeLabel} Small books and fragile income bands get punished hardest by friction, recovery trades, and ego sizing.`
  }

  if (profile.primary_instruments.includes('nifty_options') || profile.primary_instruments.includes('banknifty_options')) {
    return `${modeLabel} Expiry-day and zero-to-hero impulses are part of the risk model. Do not let one fast move redefine the session.`
  }

  return `${modeLabel} Protect the setups that still pay you and cut the behavior that taxes them.`
}

export function buildActionBrief({
  overview,
  mandate,
  profile,
  market,
  premiumAccess,
}: {
  overview: DashboardOverview
  mandate: TradingMandate
  profile: TraderProfileContext | null
  market: Market
  premiumAccess: boolean
}): ActionBrief {
  const leakHeadline =
    overview.discipline_tax_breakdown
      ? Object.entries(overview.discipline_tax_breakdown)
          .sort((a, b) => b[1] - a[1])[0]
      : null

  const leakLine = leakHeadline
    ? `${leakHeadline[0].replaceAll('_', ' ')} is the biggest leak right now at ${formatMoney(leakHeadline[1], market)}.`
    : `${formatMoney(overview.discipline_tax_30d, market)} is still leaking out of the process through avoidable behavior.`

  const protectLine = overview.analysis_summary?.what_to_protect?.[0] ?? getProfileDirective(profile)
  const doNow = mandate.doNow.slice(0, 2)
  const stopNow = mandate.stopNow.slice(0, 2)
  const tierLine = premiumAccess
    ? 'Reset Pro is active, so the deeper corrective loop exists to enforce better decisions, not to give you more screens to read.'
    : 'Psych Audit is active, so keep the loop brutally simple: upload, inspect the leak, carry the mandate, and do not buy more complexity unless you need a harder reset.'
  const mode = overview.trader_mode ?? profile?.trader_mode ?? deriveTraderModeFromProfileContext(profile)
  const modeLead =
    mode === 'prop_eval_survival'
      ? 'This is a rule-survival brief. Every instruction should improve your odds of staying inside funded-account constraints.'
      : mode === 'profitable_refiner'
        ? 'This is a refinement brief. The job is to remove the last remaining leak from an edge that already works.'
        : 'This is a survival brief. The job is to stop paying tuition to the market through avoidable behavior and loss of command.'
  const commandLine = overview.analysis_summary?.next_session_command

  const copyText = [
    'SHIBUYA NEXT SESSION BRIEF',
    mandate.headline.toUpperCase(),
    '',
    `Mode: ${humanizeTraderMode(mode)}`,
    modeLead,
    '',
    `Main leak: ${leakLine}`,
    `Mandate: ${commandLine ?? mandate.summary}`,
    '',
    'DO NOW',
    ...doNow.map((item, index) => `${index + 1}. ${item}`),
    '',
    'STOP NOW',
    ...stopNow.map((item, index) => `${index + 1}. ${item}`),
    '',
    'PROTECT',
    protectLine,
    '',
    tierLine,
  ].join('\n')

  return {
    title: mode === 'profitable_refiner' ? 'Refinement Brief' : mode === 'prop_eval_survival' ? 'Rule-Survival Brief' : 'Next Session Brief',
    subtitle: modeLead,
    leakHeadline: leakLine,
    doNow,
    stopNow,
    protectLine,
    copyText,
  }
}
