import type { TraderProfileContext } from './types'
import { humanizeTraderMode } from './traderMode'

export interface UploadPlaybook {
  title: string
  sourceLabel: string
  steps: string[]
  watchouts: string[]
  successHint: string
  fallbackSource: string
}

function normalizeBroker(brokerPlatform: string): string {
  return brokerPlatform.trim().toLowerCase()
}

function buildBrokerSpecificSteps(brokerPlatform: string): { sourceLabel: string; steps: string[]; fallbackSource: string } {
  const broker = normalizeBroker(brokerPlatform)

  if (broker.includes('zerodha')) {
    return {
      sourceLabel: 'Zerodha Console tradebook or P&L export',
      steps: [
        'Open Zerodha Console and export a recent closed-trade or P&L statement block.',
        'Keep the export focused on the last one or two sessions so the baseline reflects current behavior, not stale history.',
        'If the file contains charges, ledger rows, or open positions, map only the closed trades into the template before upload.',
      ],
      fallbackSource: 'If Console is messy, use contract notes or a hand-cleaned CSV with one row per closed trade.',
    }
  }

  if (broker.includes('dhan')) {
    return {
      sourceLabel: 'Dhan trade history or ledger export',
      steps: [
        'Export the recent Dhan trade history or statement for a single behavior block.',
        'Strip out deposits, withdrawals, and non-trade ledger noise before upload.',
        'Keep timestamps and realized PnL intact so session pressure and revenge clusters remain visible.',
      ],
      fallbackSource: 'If the ledger export is noisy, paste the last 20-40 closed trades or remap them into the template.',
    }
  }

  if (broker.includes('angel')) {
    return {
      sourceLabel: 'Angel One P&L or order history export',
      steps: [
        'Export a recent Angel One P&L or order-history file with closed trades only.',
        'Keep one row per completed trade so the board sees behavior, not order fragments.',
        'Prioritize the sessions where you felt tilt, breach pressure, or expiry-day FOMO most strongly.',
      ],
      fallbackSource: 'If Angel export formatting breaks, use a trimmed CSV or paste the recent closed-trade block.',
    }
  }

  if (broker.includes('upstox')) {
    return {
      sourceLabel: 'Upstox trade history export',
      steps: [
        'Pull a recent Upstox trade-history export for the exact sessions you want diagnosed.',
        'Preserve local timestamps and realized PnL.',
        'If needed, remap the raw columns into the template so Shibuya sees a clean closed-trade feed.',
      ],
      fallbackSource: 'Fallback to a simplified CSV if the native export carries too much account noise.',
    }
  }

  if (broker.includes('fyers')) {
    return {
      sourceLabel: 'FYERS orderbook or tradebook export',
      steps: [
        'Export the recent FYERS tradebook/orderbook with closed trades visible.',
        'Remove unfilled or partially filled noise if it overwhelms the session you care about.',
        'Upload the cleanest recent block first, then widen the window only after the baseline looks truthful.',
      ],
      fallbackSource: 'Use contract notes or a hand-cleaned CSV if the direct export is too fragmented.',
    }
  }

  if (broker.includes('mt5') || broker.includes('mt4')) {
    return {
      sourceLabel: 'MT4/MT5 account history export',
      steps: [
        'Export closed-account history from MT4/MT5 for the period you want diagnosed.',
        'Keep ticket time, symbol, and realized PnL intact so the live board can separate state leak from edge decay.',
        'Do not wait for EA automation. Manual export is enough to surface the leak now.',
      ],
      fallbackSource: 'If MT export headers are awkward, map them into the template and upload the clean version.',
    }
  }

  if (broker.includes('prop')) {
    return {
      sourceLabel: 'Prop portal account history export',
      steps: [
        'Export the recent prop-portal account history with closed trades and realized PnL.',
        'Keep breach-sensitive sessions in the file so Shibuya can call out rule pressure rather than just raw losses.',
        'Upload the last meaningful evaluation block, not the entire challenge lifetime on day one.',
      ],
      fallbackSource: 'If portal exports are weak, copy the last closed-trade block into the template manually.',
    }
  }

  return {
    sourceLabel: 'closed-trade CSV or contract-note derived export',
    steps: [
      'Export one recent block of closed trades from your broker or platform.',
      'Keep one row per closed trade and remove ledger noise, open positions, or funding movements.',
      'Upload the cleanest recent block first so the baseline becomes useful before you chase perfect ingestion.',
    ],
    fallbackSource: 'Contract notes or a manually cleaned CSV are valid starting points if native exports are messy.',
  }
}

export function buildUploadPlaybook(profile: TraderProfileContext | null): UploadPlaybook {
  if (!profile) {
    return {
      title: 'Start with one clean export, not your whole life story.',
      sourceLabel: 'closed-trade CSV',
      steps: [
        'Export one recent block of closed trades from your broker or platform.',
        'Keep one row per closed trade and map it into the CSV template if needed.',
        'Upload that file first so the baseline becomes real before you worry about perfection.',
      ],
      watchouts: [
        'Do not dump months of messy history before trader context is filled in.',
        'Keep timestamps and realized PnL intact so session behavior remains interpretable.',
      ],
      successHint: 'The first win is not ingestion elegance. It is getting the first real leak on screen.',
      fallbackSource: 'If your broker export is ugly, contract notes or a hand-cleaned CSV are completely fine for V1.',
    }
  }

  const brokerPlan = buildBrokerSpecificSteps(profile.broker_platform)
  const brokerLabel = brokerPlan.sourceLabel
  const watchouts: string[] = []
  const steps = [...brokerPlan.steps]

  if (profile.primary_instruments.includes('nifty_options') || profile.primary_instruments.includes('banknifty_options')) {
    watchouts.push('Separate expiry-day trades if possible. Zero-to-hero behavior hides itself inside noisy option chains.')
  }

  if (profile.trader_focus === 'prop_eval' || profile.trader_focus === 'mixed') {
    watchouts.push('Keep rule-sensitive sessions visible. The board should see breach pressure, not just raw PnL.')
  }

  if (profile.capital_band === 'under_50k_inr' || profile.monthly_income_band === 'student_or_none') {
    watchouts.push('Prioritize the last 20-40 trades. Small books get distorted fastest by friction and revenge sizing.')
  }

  if (profile.trader_focus === 'profitable_refinement') {
    watchouts.push('Upload your cleanest recent block first. Refinement works best when the baseline is already stable.')
  }

  if (watchouts.length === 0) {
    watchouts.push('Keep timestamps, symbols, and realized PnL clean so the next-session brief is not built on noise.')
  }

  return {
    title: `Best upload path for ${profile.broker_platform}`,
    sourceLabel: brokerLabel,
    steps,
    watchouts,
    successHint:
      profile.trader_mode === 'prop_eval_survival' || profile.trader_focus === 'prop_eval' || profile.trader_focus === 'mixed'
        ? 'A good upload here should tell you whether the problem is behavioral leakage or rulebook pressure.'
        : profile.trader_mode === 'profitable_refiner'
          ? 'A good upload here should show whether the remaining leak is actually shrinking instead of just moving around.'
        : 'A good upload here should tell you exactly where behavior is taxing the edge in rupees.',
    fallbackSource: `${brokerPlan.fallbackSource} Current mode: ${humanizeTraderMode(profile.trader_mode)}.`,
  }
}
