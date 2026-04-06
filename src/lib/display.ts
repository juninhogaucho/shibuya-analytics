import type { Market } from './market'
import type { TraderFocus, TraderInstrumentFocus } from './types'

const MARKET_LOCALE: Record<Market, string> = {
  india: 'en-IN',
  global: 'en-IE',
}

const MARKET_CURRENCY: Record<Market, 'INR' | 'EUR'> = {
  india: 'INR',
  global: 'EUR',
}

interface MoneyOptions {
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}

interface CompactMoneyOptions extends MoneyOptions {
  notation?: 'standard' | 'compact'
}

export function formatMoney(value: number, market: Market = 'india', options: MoneyOptions = {}): string {
  const absolute = Math.abs(value)
  const useDecimals = absolute > 0 && absolute < 100

  return new Intl.NumberFormat(MARKET_LOCALE[market], {
    style: 'currency',
    currency: MARKET_CURRENCY[market],
    maximumFractionDigits: options.maximumFractionDigits ?? (useDecimals ? 2 : 0),
    minimumFractionDigits: options.minimumFractionDigits ?? (useDecimals ? 2 : 0),
  }).format(value)
}

export function formatCompactMoney(
  value: number,
  market: Market = 'india',
  options: CompactMoneyOptions = {},
): string {
  const absolute = Math.abs(value)
  const useCompact = options.notation === 'compact' || absolute >= 1000
  const useDecimals = absolute > 0 && absolute < 100

  return new Intl.NumberFormat(MARKET_LOCALE[market], {
    style: 'currency',
    currency: MARKET_CURRENCY[market],
    notation: useCompact ? 'compact' : 'standard',
    maximumFractionDigits: options.maximumFractionDigits ?? (useCompact ? 1 : useDecimals ? 2 : 0),
    minimumFractionDigits: options.minimumFractionDigits ?? (useCompact ? 0 : useDecimals ? 2 : 0),
  }).format(value)
}

export function formatSignedMoney(value: number, market: Market = 'india', options: MoneyOptions = {}): string {
  const formatted = formatMoney(Math.abs(value), market, options)
  if (value > 0) {
    return `+${formatted}`
  }
  if (value < 0) {
    return `-${formatted}`
  }
  return formatted
}

export function formatSignedCompactMoney(
  value: number,
  market: Market = 'india',
  options: CompactMoneyOptions = {},
): string {
  const formatted = formatCompactMoney(Math.abs(value), market, options)
  if (value > 0) {
    return `+${formatted}`
  }
  if (value < 0) {
    return `-${formatted}`
  }
  return formatted
}

export function humanizeFocus(focus: TraderFocus): string {
  switch (focus) {
    case 'retail_fo':
      return 'Retail F&O survival'
    case 'prop_eval':
      return 'Prop evaluation'
    case 'mixed':
      return 'Retail and prop'
    case 'profitable_refinement':
      return 'Profitable refinement'
    default:
      return String(focus).replace(/_/g, ' ')
  }
}

export function humanizeInstrument(instrument: TraderInstrumentFocus): string {
  switch (instrument) {
    case 'nifty_options':
      return 'Nifty options'
    case 'banknifty_options':
      return 'BankNifty options'
    case 'stock_options':
      return 'Stock options'
    case 'futures':
      return 'Futures'
    case 'forex':
      return 'Forex'
    case 'gold':
      return 'Gold'
    case 'crypto':
      return 'Crypto'
    case 'us_indices':
      return 'US indices'
    default:
      return String(instrument || 'other').replace(/_/g, ' ')
  }
}
