import { describe, expect, it } from 'vitest'
import { buildTradeHistoryInsights } from '../tradeHistoryInsights'

describe('buildTradeHistoryInsights', () => {
  it('extracts the main loss clusters and symbol/day pressure', () => {
    const insights = buildTradeHistoryInsights([
      { id: '1', timestamp: '2026-04-01T09:00:00Z', symbol: 'NIFTY', side: 'BUY', size: 1, pnl: -1200, bds_at_time: 0.72 },
      { id: '2', timestamp: '2026-04-01T09:35:00Z', symbol: 'NIFTY', side: 'BUY', size: 1, pnl: -900, bds_at_time: 0.74 },
      { id: '3', timestamp: '2026-04-01T12:00:00Z', symbol: 'BANKNIFTY', side: 'SELL', size: 1, pnl: 1800, bds_at_time: 0.35 },
      { id: '4', timestamp: '2026-04-02T10:00:00Z', symbol: 'BANKNIFTY', side: 'BUY', size: 1, pnl: -400, bds_at_time: 0.42 },
    ])

    expect(insights.worstSymbol?.symbol).toBe('NIFTY')
    expect(insights.bestSymbol?.symbol).toBe('BANKNIFTY')
    expect(insights.worstDay?.day).toBe('2026-04-02')
    expect(insights.stressedTradeCount).toBe(2)
    expect(insights.revengeCluster?.tradeCount).toBe(2)
    expect(insights.revengeCluster?.totalPnl).toBe(-2100)
  })
})
