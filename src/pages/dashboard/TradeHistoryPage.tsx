import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import { EngineTag } from '../../components/engine/EngineTag'
import { ChartCard } from '../../components/charts/ChartCard'
import { PnLDistribution, generateDistributionData } from '../../components/charts/PnLDistribution'
import { PerformanceHeatmap, generateHeatmapData } from '../../components/charts/PerformanceHeatmap'
import { getDashboardOverview, getTradeHistory, getTraderProfileContext } from '../../lib/api'
import { formatSignedMoney } from '../../lib/display'
import { buildExecutionProtocol } from '../../lib/executionProtocol'
import { buildTradeHistoryInsights } from '../../lib/tradeHistoryInsights'
import { humanizeTraderMode } from '../../lib/traderMode'
import type { DashboardOverview, TradeHistoryResponse, TradeHistoryTrade, TraderProfileContext } from '../../lib/types'
import { getStoredSessionMeta, isSampleMode } from '../../lib/runtime'

// Sample workspace data - sized to match the dashboard story without implying live persistence.
const DEMO_TRADES: TradeHistoryTrade[] = [
  { id: 'T-1001', timestamp: '2025-12-02T04:12:00Z', exit_time: '2025-12-02T04:35:00Z', symbol: 'NIFTY24DEC22500CE', side: 'BUY', size: 2, pnl: 4520, bds_at_time: 0.32 },
  { id: 'T-1002', timestamp: '2025-12-02T05:05:00Z', exit_time: '2025-12-02T05:22:00Z', symbol: 'BANKNIFTY24DEC48000PE', side: 'SELL', size: 1, pnl: -2180, bds_at_time: 0.64 },
  { id: 'T-1003', timestamp: '2025-12-01T04:18:00Z', exit_time: '2025-12-01T04:44:00Z', symbol: 'NIFTY24DEC22400PE', side: 'BUY', size: 2, pnl: 3810, bds_at_time: 0.29 },
  { id: 'T-1004', timestamp: '2025-12-01T06:10:00Z', exit_time: '2025-12-01T06:28:00Z', symbol: 'BANKNIFTY24DEC48100CE', side: 'BUY', size: 1, pnl: -3560, bds_at_time: 0.71 },
  { id: 'T-1005', timestamp: '2025-11-30T04:02:00Z', exit_time: '2025-11-30T04:40:00Z', symbol: 'RELIANCE', side: 'SELL', size: 15, pnl: 2980, bds_at_time: 0.24 },
  { id: 'T-1006', timestamp: '2025-11-30T05:20:00Z', exit_time: '2025-11-30T05:42:00Z', symbol: 'NIFTY24DEC22350CE', side: 'BUY', size: 3, pnl: -1840, bds_at_time: 0.59 },
  { id: 'T-1007', timestamp: '2025-11-29T04:25:00Z', exit_time: '2025-11-29T05:10:00Z', symbol: 'BANKNIFTY24DEC47900PE', side: 'SELL', size: 1, pnl: 5120, bds_at_time: 0.33 },
  { id: 'T-1008', timestamp: '2025-11-29T05:40:00Z', exit_time: '2025-11-29T06:01:00Z', symbol: 'MIDCPNIFTY', side: 'BUY', size: 2, pnl: 1460, bds_at_time: 0.28 },
  { id: 'T-1009', timestamp: '2025-11-28T04:30:00Z', exit_time: '2025-11-28T04:43:00Z', symbol: 'BANKNIFTY24DEC48200CE', side: 'BUY', size: 2, pnl: -4210, bds_at_time: 0.82 },
  { id: 'T-1010', timestamp: '2025-11-28T04:55:00Z', exit_time: '2025-11-28T05:09:00Z', symbol: 'BANKNIFTY24DEC48200CE', side: 'BUY', size: 2, pnl: -2890, bds_at_time: 0.84 },
  { id: 'T-1011', timestamp: '2025-11-27T04:08:00Z', exit_time: '2025-11-27T04:29:00Z', symbol: 'NIFTY24DEC22600PE', side: 'SELL', size: 2, pnl: 2670, bds_at_time: 0.26 },
  { id: 'T-1012', timestamp: '2025-11-27T06:00:00Z', exit_time: '2025-11-27T06:18:00Z', symbol: 'FINNIFTY', side: 'BUY', size: 1, pnl: -1320, bds_at_time: 0.47 },
  { id: 'T-1013', timestamp: '2025-11-26T04:10:00Z', exit_time: '2025-11-26T04:37:00Z', symbol: 'RELIANCE', side: 'BUY', size: 20, pnl: 3240, bds_at_time: 0.27 },
  { id: 'T-1014', timestamp: '2025-11-26T05:35:00Z', exit_time: '2025-11-26T05:54:00Z', symbol: 'NIFTY24DEC22450CE', side: 'SELL', size: 1, pnl: 1180, bds_at_time: 0.31 },
  { id: 'T-1015', timestamp: '2025-11-25T04:22:00Z', exit_time: '2025-11-25T04:47:00Z', symbol: 'BANKNIFTY24DEC47800PE', side: 'SELL', size: 1, pnl: -2480, bds_at_time: 0.57 },
  { id: 'T-1016', timestamp: '2025-11-25T05:12:00Z', exit_time: '2025-11-25T05:35:00Z', symbol: 'NIFTY24DEC22300PE', side: 'BUY', size: 2, pnl: 2140, bds_at_time: 0.25 },
  { id: 'T-1017', timestamp: '2025-11-24T04:45:00Z', exit_time: '2025-11-24T05:20:00Z', symbol: 'TCS', side: 'BUY', size: 10, pnl: 1680, bds_at_time: 0.29 },
  { id: 'T-1018', timestamp: '2025-11-24T05:50:00Z', exit_time: '2025-11-24T06:06:00Z', symbol: 'BANKNIFTY24DEC47900CE', side: 'BUY', size: 1, pnl: -1760, bds_at_time: 0.63 },
]

function getBdsIndicator(bds: number | undefined): { label: string; color: string } {
  if (bds === undefined) return { label: '-', color: 'var(--color-text-muted)' }
  if (bds < 0.35) return { label: 'Calm', color: 'var(--color-success)' }
  if (bds < 0.6) return { label: 'Alert', color: 'var(--color-warning)' }
  return { label: 'Stressed', color: 'var(--color-danger)' }
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-IN', {
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function TradeHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TradeHistoryResponse | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all')
  const [symbolFilter, setSymbolFilter] = useState<string>('all')
  const market = getStoredSessionMeta()?.market ?? 'india'

  const buildDemoPayload = (): TradeHistoryResponse => {
    const trades = DEMO_TRADES
    const wins = trades.filter(t => t.pnl > 0)
    const losses = trades.filter(t => t.pnl < 0)

    return {
      trades,
      total_count: trades.length,
      summary: {
        total_pnl: trades.reduce((sum, t) => sum + t.pnl, 0),
        win_count: wins.length,
        loss_count: losses.length,
        best_trade: Math.max(...trades.map(t => t.pnl)),
        worst_trade: Math.min(...trades.map(t => t.pnl)),
      },
    }
  }

  useEffect(() => {
    async function fetchTrades() {
      try {
        setLoading(true)
        setError(null)
        
        // Sample workspace returns controlled example data.
        if (isSampleMode()) {
          const [overviewResponse, profileResponse] = await Promise.all([
            getDashboardOverview().catch(() => null),
            getTraderProfileContext().catch(() => null),
            new Promise(resolve => setTimeout(resolve, 300)),
          ])
          setData(buildDemoPayload())
          setOverview(overviewResponse)
          setProfile(profileResponse)
          return
        }

        const [response, overviewResponse, profileResponse] = await Promise.all([
          getTradeHistory(),
          getDashboardOverview().catch(() => null),
          getTraderProfileContext().catch(() => null),
        ])
        setData(response)
        setOverview(overviewResponse)
        setProfile(profileResponse)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trades')
      } finally {
        setLoading(false)
      }
    }
    fetchTrades()
  }, [])

  const insights = useMemo(() => buildTradeHistoryInsights(data?.trades ?? []), [data?.trades])
  const protocol = useMemo(
    () => (overview ? buildExecutionProtocol({ overview, profile, insights }) : null),
    [overview, profile, insights],
  )

  if (loading) {
    return (
      <div className="dashboard-stack">
        <header className="section-header">
          <p className="badge">⏳ Loading...</p>
          <Skeleton style={{ width: '200px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
          <Skeleton style={{ width: '400px', height: '1rem', borderRadius: '4px' }} />
        </header>
        <SkeletonCard style={{ height: '100px' }} />
        <SkeletonCard style={{ height: '400px' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>⚠️ Unable to load trade history</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (!data || data.trades.length === 0) {
    return (
      <div className="dashboard-stack">
        <header className="section-header">
          <p className="badge">Trade History</p>
          <h1>Your Trades</h1>
          <p className="text-muted">View and analyze your uploaded trades</p>
        </header>
        
        <div className="glass-panel empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>📭 No trades yet</h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Your trading history will appear here once you upload or sync trades into your live workspace.
            Each trade includes behavioral context to help you spot patterns.
          </p>
        </div>
      </div>
    )
  }

  // Get unique symbols for filter
  const symbols = ['all', ...new Set(data.trades.map(t => t.symbol))]
  
  // Apply filters
  let filteredTrades = data.trades
  if (filter === 'wins') filteredTrades = filteredTrades.filter(t => t.pnl > 0)
  if (filter === 'losses') filteredTrades = filteredTrades.filter(t => t.pnl < 0)
  if (symbolFilter !== 'all') filteredTrades = filteredTrades.filter(t => t.symbol === symbolFilter)

  const winRate = data.summary.win_count / data.total_count * 100

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <div className="flex items-center gap-2 mb-2">
          <p className="badge" style={{ marginBottom: 0 }}>Trade History</p>
          <EngineTag engineId="bql" label="BQL state per trade" />
        </div>
        <h1>Your Trades</h1>
        <p className="text-muted">
          Every trade with behavioral state at time of entry. The BDS column tells you what your brain was doing when you placed the order.
        </p>
      </header>

      {/* Charts — distribution + heatmap */}
      <div className="grid-responsive three" style={{ marginBottom: '1.5rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Most expensive symbol</h3>
          <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
            {insights.worstSymbol?.symbol ?? 'No signal yet'}
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {insights.worstSymbol
              ? `${formatSignedMoney(insights.worstSymbol.pnl, market)} across ${insights.worstSymbol.trades} trades.`
              : 'Upload more history to see which instrument is taxing the process most.'}
          </p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Worst session cluster</h3>
          <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
            {insights.revengeCluster ? `${insights.revengeCluster.tradeCount} fast losses` : 'No revenge cluster yet'}
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {insights.revengeCluster
              ? `${formatSignedMoney(insights.revengeCluster.totalPnl, market)} inside one compressed sequence. This is the kind of damage the reset loop is supposed to stop.`
              : 'We have not detected a multi-trade revenge window in the current history.'}
          </p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Stress-state cost</h3>
          <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
            {insights.stressedTradeCount} stressed trades
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {insights.stressedAveragePnl != null
              ? `Average outcome: ${formatSignedMoney(insights.stressedAveragePnl, market)} while BDS was elevated.`
              : 'No high-stress trades detected yet.'}
          </p>
        </article>
      </div>

      <div className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
        <ChartCard
          title="Win/Loss Distribution"
          subtitle="Shape of your outcomes — are losses fat-tailed?"
          height={180}
          headerRight={<EngineTag engineId="evt" label="EVT tail analysis" />}
        >
          <PnLDistribution
            data={generateDistributionData(
              data.summary.best_trade * 0.4,
              Math.abs(data.summary.worst_trade) * 0.4,
              data.summary.win_count,
              data.summary.loss_count,
              market,
            )}
            height={180}
          />
        </ChartCard>

        <ChartCard
          title="Performance by Time"
          subtitle="When are you actually making money?"
          height={180}
          headerRight={<EngineTag engineId="afma" label="temporal analysis" />}
        >
          <PerformanceHeatmap data={generateHeatmapData()} height={160} />
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <div className="trade-summary glass-panel">
        <div className="summary-grid">
          <div className="summary-stat">
            <span className="stat-value">{data.total_count}</span>
            <span className="stat-label">Total Trades</span>
          </div>
          <div className="summary-stat">
            <span className={`stat-value ${data.summary.total_pnl >= 0 ? 'positive' : 'negative'}`}>
              {formatSignedMoney(data.summary.total_pnl, market)}
            </span>
            <span className="stat-label">Total PnL</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{winRate.toFixed(1)}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value positive">{formatSignedMoney(Math.abs(data.summary.best_trade), market)}</span>
            <span className="stat-label">Best Trade</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value negative">{formatSignedMoney(data.summary.worst_trade, market)}</span>
            <span className="stat-label">Worst Trade</span>
          </div>
        </div>
      </div>

      {protocol && (
        <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="badge" style={{ marginBottom: 0 }}>Execution ledger</p>
                <Badge
                  variant={
                    protocol.standardLevel === 'loss_of_command'
                      ? 'danger'
                      : protocol.standardLevel === 'under_pressure'
                        ? 'warning'
                        : 'success'
                  }
                  label={humanizeTraderMode(overview?.trader_mode ?? profile?.trader_mode ?? 'retail_fn0_struggler')}
                />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{protocol.headline}</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {protocol.ledger[0]?.detail ?? protocol.summary}
              </p>
            </div>
            <Link to="/dashboard/protocol" className="btn btn-sm btn-secondary">
              Open protocol
            </Link>
          </div>

          <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
            {protocol.ledger.slice(0, 3).map((entry) => (
              <article key={entry.title} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={entry.severity === 'danger' ? 'danger' : entry.severity === 'warning' ? 'warning' : 'success'}
                    label={entry.title}
                  />
                </div>
                <p className="text-muted" style={{ marginBottom: 0 }}>{entry.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="trade-filters glass-panel">
        <div className="filter-group">
          <label>Show:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({data.total_count})
            </button>
            <button 
              className={`filter-btn wins ${filter === 'wins' ? 'active' : ''}`}
              onClick={() => setFilter('wins')}
            >
              Wins ({data.summary.win_count})
            </button>
            <button 
              className={`filter-btn losses ${filter === 'losses' ? 'active' : ''}`}
              onClick={() => setFilter('losses')}
            >
              Losses ({data.summary.loss_count})
            </button>
          </div>
        </div>
        <div className="filter-group">
          <label>Symbol:</label>
          <select 
            value={symbolFilter} 
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="symbol-select"
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Symbols' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trade Table */}
      <div className="glass-panel trade-table-container">
        <table className="trade-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Size</th>
              <th>PnL</th>
              <th>Mental State</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((trade) => {
              const bdsInfo = getBdsIndicator(trade.bds_at_time)
              return (
                <tr key={trade.id} className={trade.pnl >= 0 ? 'trade-win' : 'trade-loss'}>
                  <td className="trade-date">{formatDate(trade.timestamp)}</td>
                  <td className="trade-symbol">{trade.symbol}</td>
                  <td className={`trade-side ${trade.side.toLowerCase()}`}>{trade.side}</td>
                  <td className="trade-size">{trade.size.toFixed(2)}</td>
                  <td className={`trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {formatSignedMoney(trade.pnl, market)}
                  </td>
                  <td className="trade-bds">
                    <span className="bds-badge" style={{ color: bdsInfo.color }}>
                      {bdsInfo.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {filteredTrades.length === 0 && (
          <div className="empty-filter-state">
            <p className="text-muted">No trades match your filters.</p>
          </div>
        )}
      </div>

      {/* Insight Box */}
      <div className="glass-panel insight-box">
        <h3>💡 Quick Insight</h3>
        {insights.stressedTradeCount > 0 ? (
          <p>
            You have <strong>{insights.stressedTradeCount}</strong> trades 
            taken while in a "Stressed" mental state. These trades have an average PnL of 
            <strong className={(insights.stressedAveragePnl ?? 0) >= 0 ? ' positive' : ' negative'}>
              {' '}{formatSignedMoney(insights.stressedAveragePnl ?? 0, market, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </strong>
            . Consider reducing trading when your BDS is elevated.
          </p>
        ) : (
          <p>
            Great job staying calm! Most of your trades were taken in a good mental state.
            Keep following your Slump Prescription rules when stress rises.
          </p>
        )}
      </div>
    </div>
  )
}
