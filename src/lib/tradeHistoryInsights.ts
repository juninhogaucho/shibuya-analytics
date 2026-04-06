import type { TradeHistoryTrade } from './types'

interface SymbolInsight {
  symbol: string
  pnl: number
  trades: number
}

interface DayInsight {
  day: string
  pnl: number
  trades: number
}

interface RevengeClusterInsight {
  tradeCount: number
  totalPnl: number
  start: string
  end: string
}

export interface TradeHistoryInsights {
  worstSymbol: SymbolInsight | null
  bestSymbol: SymbolInsight | null
  worstDay: DayInsight | null
  stressedTradeCount: number
  stressedAveragePnl: number | null
  revengeCluster: RevengeClusterInsight | null
}

function toDayKey(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

export function buildTradeHistoryInsights(trades: TradeHistoryTrade[]): TradeHistoryInsights {
  if (!trades.length) {
    return {
      worstSymbol: null,
      bestSymbol: null,
      worstDay: null,
      stressedTradeCount: 0,
      stressedAveragePnl: null,
      revengeCluster: null,
    }
  }

  const symbolMap = new Map<string, SymbolInsight>()
  const dayMap = new Map<string, DayInsight>()

  for (const trade of trades) {
    const symbolEntry = symbolMap.get(trade.symbol) ?? { symbol: trade.symbol, pnl: 0, trades: 0 }
    symbolEntry.pnl += trade.pnl
    symbolEntry.trades += 1
    symbolMap.set(trade.symbol, symbolEntry)

    const dayKey = toDayKey(trade.timestamp)
    const dayEntry = dayMap.get(dayKey) ?? { day: dayKey, pnl: 0, trades: 0 }
    dayEntry.pnl += trade.pnl
    dayEntry.trades += 1
    dayMap.set(dayKey, dayEntry)
  }

  const symbols = [...symbolMap.values()]
  const days = [...dayMap.values()]
  const stressedTrades = trades.filter((trade) => (trade.bds_at_time ?? 0) > 0.6)
  const stressedAveragePnl =
    stressedTrades.length > 0
      ? stressedTrades.reduce((sum, trade) => sum + trade.pnl, 0) / stressedTrades.length
      : null

  const sortedTrades = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  let bestCluster: RevengeClusterInsight | null = null
  let currentCluster: TradeHistoryTrade[] = []

  function flushCluster() {
    if (currentCluster.length < 2) {
      currentCluster = []
      return
    }
    const totalPnl = currentCluster.reduce((sum, trade) => sum + trade.pnl, 0)
    if (totalPnl >= 0) {
      currentCluster = []
      return
    }

    const cluster: RevengeClusterInsight = {
      tradeCount: currentCluster.length,
      totalPnl,
      start: currentCluster[0].timestamp,
      end: currentCluster[currentCluster.length - 1].timestamp,
    }

    if (!bestCluster || Math.abs(cluster.totalPnl) > Math.abs(bestCluster.totalPnl)) {
      bestCluster = cluster
    }
    currentCluster = []
  }

  for (const trade of sortedTrades) {
    if (trade.pnl >= 0) {
      flushCluster()
      continue
    }

    if (!currentCluster.length) {
      currentCluster = [trade]
      continue
    }

    const previous = currentCluster[currentCluster.length - 1]
    const gapMinutes = (new Date(trade.timestamp).getTime() - new Date(previous.timestamp).getTime()) / (60 * 1000)

    if (gapMinutes <= 90) {
      currentCluster.push(trade)
      continue
    }

    flushCluster()
    currentCluster = [trade]
  }

  flushCluster()

  return {
    worstSymbol: symbols.reduce((lowest, current) => (lowest == null || current.pnl < lowest.pnl ? current : lowest), null as SymbolInsight | null),
    bestSymbol: symbols.reduce((highest, current) => (highest == null || current.pnl > highest.pnl ? current : highest), null as SymbolInsight | null),
    worstDay: days.reduce((lowest, current) => (lowest == null || current.pnl < lowest.pnl ? current : lowest), null as DayInsight | null),
    stressedTradeCount: stressedTrades.length,
    stressedAveragePnl,
    revengeCluster: bestCluster,
  }
}
