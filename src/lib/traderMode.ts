import type { TraderFocus, TraderProfileContext, TraderMode } from './types'

export function deriveTraderModeFromFocus(focus: TraderFocus): TraderMode {
  switch (focus) {
    case 'prop_eval':
    case 'mixed':
      return 'prop_eval_survival'
    case 'profitable_refinement':
      return 'profitable_refiner'
    case 'retail_fo':
    default:
      return 'retail_fn0_struggler'
  }
}

export function deriveTraderModeFromProfileContext(
  profile: Pick<TraderProfileContext, 'trader_focus'> | null | undefined,
): TraderMode {
  return deriveTraderModeFromFocus(profile?.trader_focus ?? 'retail_fo')
}

export function humanizeTraderMode(mode: TraderMode): string {
  switch (mode) {
    case 'prop_eval_survival':
      return 'Prop-eval survival'
    case 'profitable_refiner':
      return 'Profitable refiner'
    case 'retail_fn0_struggler':
    default:
      return 'Retail F&O struggler'
  }
}

export function describeTraderMode(mode: TraderMode): string {
  switch (mode) {
    case 'prop_eval_survival':
      return 'The board should protect rule survival first, then press only the setups that can survive funded-account constraints.'
    case 'profitable_refiner':
      return 'The board should treat activity as the enemy and remove the last remaining behavioral leak from an edge that already works.'
    case 'retail_fn0_struggler':
    default:
      return 'The board should cut friction, revenge trading, and overtrading before it talks about scale or elegance.'
  }
}

export function buildModeSpecificMandateLabel(mode: TraderMode): string {
  switch (mode) {
    case 'prop_eval_survival':
      return 'Protect the rulebook before you protect the ego.'
    case 'profitable_refiner':
      return 'Protect process purity and strip out the last leak.'
    case 'retail_fn0_struggler':
    default:
      return 'Protect cash runway first.'
  }
}
