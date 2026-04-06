import type { TradeHistoryInsights } from './tradeHistoryInsights'
import type { DashboardOverview, TraderMode, TraderProfileContext } from './types'
import { deriveTraderModeFromProfileContext } from './traderMode'

export interface ExecutionProtocolLedgerEntry {
  title: string
  detail: string
  severity: 'danger' | 'warning' | 'success'
}

export interface ExecutionProtocol {
  standardLevel: 'in_control' | 'under_pressure' | 'loss_of_command'
  headline: string
  summary: string
  lossQualityLabel: string
  lossQualityDetail: string
  unforcedErrorRate: number
  nextCommand: string
  violatedStandards: string[]
  preSessionChecklist: string[]
  postLossProtocol: string[]
  hardStops: string[]
  recoveryConditions: string[]
  ledger: ExecutionProtocolLedgerEntry[]
}

function getTraderMode(overview: DashboardOverview, profile: TraderProfileContext | null): TraderMode {
  return overview.trader_mode ?? profile?.trader_mode ?? deriveTraderModeFromProfileContext(profile)
}

function pushUnique(items: string[], value: string | null | undefined) {
  if (!value || items.includes(value)) {
    return
  }
  items.push(value)
}

function buildLossQualityDetail(level: ExecutionProtocol['standardLevel'], mode: TraderMode): string {
  if (level === 'loss_of_command') {
    return mode === 'prop_eval_survival'
      ? 'These are not funded-account quality losses. The issue is loss of command under pressure, not lack of screen time.'
      : 'These losses are not clean business expenses. They are unforced damage caused by degraded execution.'
  }

  if (level === 'under_pressure') {
    return mode === 'profitable_refiner'
      ? 'The edge still exists, but execution drift is taxing it. Fix the leak before you widen the playbook.'
      : 'The leak is not catastrophic yet, but the standard has already slipped. Tighten the loop before it compounds.'
  }

  return 'Losses look closer to normal trading variance than to emotional damage. Protect the standard and keep the process boring.'
}

export function buildExecutionProtocol({
  overview,
  profile,
  insights,
}: {
  overview: DashboardOverview
  profile: TraderProfileContext | null
  insights?: TradeHistoryInsights | null
}): ExecutionProtocol {
  const traderMode = getTraderMode(overview, profile)
  const breakdown = overview.discipline_tax_breakdown
  const revengeCost = breakdown?.revenge_trades ?? 0
  const overtradingCost = breakdown?.overtrading ?? 0
  const sizeCost = breakdown?.size_violations ?? 0
  const grossReference = Math.max(
    Math.abs(overview.pnl_gross ?? 0),
    Math.abs(overview.pnl_net ?? 0) + Math.abs(overview.discipline_tax_30d),
    Math.abs(overview.discipline_tax_30d),
    1,
  )
  const unforcedErrorRate = Math.round((Math.abs(overview.discipline_tax_30d) / grossReference) * 100)
  const revengeCluster = insights?.revengeCluster ?? null
  const stressedTrades = insights?.stressedTradeCount ?? 0
  const stressedAveragePnl = insights?.stressedAveragePnl ?? null
  const backendLevel = overview.recovery_ladder
  const lossOfCommand =
    backendLevel === 'loss_of_command' ||
    overview.bql_score >= 0.65 ||
    (revengeCluster?.tradeCount ?? 0) >= 3 ||
    revengeCost >= Math.max(Math.abs(overview.discipline_tax_30d) * 0.4, 1) ||
    (stressedTrades >= 3 && (stressedAveragePnl ?? 0) < 0)
  const underPressure =
    backendLevel === 'under_pressure' ||
    !lossOfCommand &&
    (overview.bql_score >= 0.45 ||
      unforcedErrorRate >= 18 ||
      overtradingCost > 0 ||
      sizeCost > 0 ||
      stressedTrades >= 1)
  const standardLevel: ExecutionProtocol['standardLevel'] = backendLevel ?? (lossOfCommand
    ? 'loss_of_command'
    : underPressure
      ? 'under_pressure'
      : 'in_control')

  const headline =
    standardLevel === 'loss_of_command'
      ? 'Re-establish command before you try to make money again'
      : standardLevel === 'under_pressure'
        ? 'The standard slipped. Tighten the loop before it turns into damage.'
        : 'Hold the professional standard and keep the process boring'

  const summary =
    standardLevel === 'loss_of_command'
      ? `Your recent behavior says recovery, speed, or emotion is making decisions for you. The next session is about restoring command, not proving toughness.`
      : standardLevel === 'under_pressure'
        ? `You still have enough control to fix this cheaply, but the ledger already shows avoidable leakage. Treat the next session like a standards check, not a money hunt.`
        : `The process is closer to professional than chaotic. Your job now is to protect that standard instead of improvising because things feel better.`

  const lossQualityLabel =
    overview.loss_quality === 'unacceptable_losses' || standardLevel === 'loss_of_command'
      ? 'Unacceptable losses'
      : overview.loss_quality === 'leaking_discipline' || standardLevel === 'under_pressure'
        ? 'Leaking discipline'
        : 'Acceptable losses'

  const violatedStandards: string[] = []
  pushUnique(violatedStandards, revengeCost > 0 ? 'Tried to win money back instead of resetting after damage.' : null)
  pushUnique(violatedStandards, overtradingCost > 0 ? 'Let trade count outrun setup quality.' : null)
  pushUnique(violatedStandards, sizeCost > 0 ? 'Sized emotion instead of verified edge.' : null)
  pushUnique(
    violatedStandards,
    revengeCluster ? `Compressed ${revengeCluster.tradeCount} losing trades into one revenge sequence.` : null,
  )
  pushUnique(
    violatedStandards,
    stressedTrades > 0 ? `Placed ${stressedTrades} trade${stressedTrades === 1 ? '' : 's'} while the state was visibly degraded.` : null,
  )
  pushUnique(
    violatedStandards,
    insights?.worstSymbol && insights.worstSymbol.pnl < 0
      ? `${insights.worstSymbol.symbol} is acting like a tax, not a setup.`
      : null,
  )

  if (violatedStandards.length === 0) {
    violatedStandards.push('Current data does not show a major standards breach. Keep the routine strict anyway.')
  }

  const preSessionChecklist = [
    'Write the one setup you are allowed to trade and the invalidation that kills it.',
    traderMode === 'prop_eval_survival'
      ? 'Check rulebook buffer, daily loss limits, and consistency constraints before the open.'
      : 'Fix max rupee risk before the open. Size is decided before emotion arrives.',
    'Define the number of losses that ends the session before the first order is placed.',
    traderMode === 'profitable_refiner'
      ? 'Pick one refinement variable only. Everything else stays deliberately boring.'
      : 'Do not add a second setup unless the first one has proven itself over real samples.',
  ]

  const postLossProtocol = [
    'After any meaningful loss, flatten, write the reason, and stop trying to get the money back quickly.',
    lossOfCommand
      ? 'Mandatory hard pause before the next order. No rapid-fire recovery trades.'
      : 'Take a deliberate pause before re-entry and make sure the next trade has a fresh reason.',
    'If the next trade idea exists mainly to erase the previous red number, the session is over.',
    'Only resume when a new setup and a written plan both exist.',
  ]

  const hardStops: string[] = [
    sizeCost > 0
      ? 'No discretionary size increases. Base size only until the next clean upload.'
      : 'No size increase unless the next upload proves the leak is falling.',
    revengeCluster
      ? 'No rapid-fire sequence trading. One loss cluster is enough evidence for the day.'
      : 'No second-chance trade just because the first trade hurt.',
    traderMode === 'prop_eval_survival'
      ? 'If rulebook danger is visible, you are in survival mode, not growth mode.'
      : 'If unforced error rate stays elevated, stop trading and update the board before the next session.',
  ]

  if (insights?.worstSymbol && insights.worstSymbol.pnl < 0) {
    hardStops.push(`Bench ${insights.worstSymbol.symbol} until the ledger stops showing it as a tax instrument.`)
  }

  const recoveryConditions = [
    'Two clean sessions with no size violations or recovery trades.',
    'A lower discipline tax and fewer stressed-state entries on the next upload.',
    traderMode === 'prop_eval_survival'
      ? 'Rulebook buffer restored before you press size again.'
      : 'Only press harder once the same leak stops showing up in the brief.',
  ]

  const nextCommand =
    overview.analysis_summary?.next_session_command ??
    (standardLevel === 'loss_of_command'
      ? 'Trade smaller, slower, and only when the written plan survives first contact.'
      : standardLevel === 'under_pressure'
        ? 'Reduce noise before you try to increase output.'
        : 'Keep doing less, better, and with tighter written standards.')

  const ledger: ExecutionProtocolLedgerEntry[] = []

  if (revengeCost > 0) {
    ledger.push({
      title: 'Recovery trading',
      detail: `Revenge behavior has already cost part of the last cycle. The correct response to damage is reset, not speed.`,
      severity: lossOfCommand ? 'danger' : 'warning',
    })
  }
  if (overtradingCost > 0) {
    ledger.push({
      title: 'Trade-count discipline',
      detail: 'The account is paying for extra activity that did not deserve capital.',
      severity: 'warning',
    })
  }
  if (sizeCost > 0) {
    ledger.push({
      title: 'Position-size discipline',
      detail: 'Sizing drift is making normal variance more expensive than it needs to be.',
      severity: lossOfCommand ? 'danger' : 'warning',
    })
  }
  if (revengeCluster) {
    ledger.push({
      title: 'Compressed loss cluster',
      detail: `${revengeCluster.tradeCount} losing trades landed in one compressed window. That is loss of command, not bad luck.`,
      severity: 'danger',
    })
  }
  if (stressedTrades > 0) {
    ledger.push({
      title: 'Elevated-state entries',
      detail: `${stressedTrades} trade${stressedTrades === 1 ? '' : 's'} were placed while the state was elevated${stressedAveragePnl != null ? `, averaging ${stressedAveragePnl < 0 ? 'a loss' : 'a gain'} per trade` : ''}.`,
      severity: stressedTrades >= 3 ? 'danger' : 'warning',
    })
  }
  if (insights?.worstDay && insights.worstDay.pnl < 0) {
    ledger.push({
      title: 'Worst session control',
      detail: `One session still stands out as a major standards failure. The issue is not one red day; it is how quickly it snowballed.`,
      severity: 'warning',
    })
  }
  if (ledger.length === 0) {
    ledger.push({
      title: 'Standards holding',
      detail: 'Current data does not show a major breakdown in execution discipline. Keep the checklist strict anyway.',
      severity: 'success',
    })
  }

  return {
    standardLevel,
    headline,
    summary,
    lossQualityLabel,
    lossQualityDetail: buildLossQualityDetail(standardLevel, traderMode),
    unforcedErrorRate,
    nextCommand,
    violatedStandards,
    preSessionChecklist,
    postLossProtocol,
    hardStops,
    recoveryConditions,
    ledger,
  }
}
