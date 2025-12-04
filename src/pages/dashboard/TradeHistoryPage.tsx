import { useEffect, useState } from 'react'
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton'

// Types for trade data
interface Trade {
  id: string
  timestamp: string
  exit_time?: string
  symbol: string
  side: 'BUY' | 'SELL'
  size: number
  pnl: number
  bds_at_time?: number
}

interface TradeHistoryData {
  trades: Trade[]
  total_count: number
  summary: {
    total_pnl: number
    win_count: number
    loss_count: number
    best_trade: number
    worst_trade: number
  }
}

// Demo data - more trades to match overview metrics
const DEMO_TRADES: Trade[] = [
  { id: 'T-1001', timestamp: '2025-12-02T14:32:00Z', exit_time: '2025-12-02T15:45:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 245.50, bds_at_time: 0.32 },
  { id: 'T-1002', timestamp: '2025-12-02T11:15:00Z', exit_time: '2025-12-02T11:58:00Z', symbol: 'GBP/JPY', side: 'SELL', size: 0.5, pnl: -127.30, bds_at_time: 0.58 },
  { id: 'T-1003', timestamp: '2025-12-01T09:45:00Z', exit_time: '2025-12-01T10:30:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 189.00, bds_at_time: 0.28 },
  { id: 'T-1004', timestamp: '2025-12-01T08:22:00Z', exit_time: '2025-12-01T08:55:00Z', symbol: 'NAS100', side: 'BUY', size: 2.0, pnl: -340.00, bds_at_time: 0.45 },
  { id: 'T-1005', timestamp: '2025-11-30T15:10:00Z', exit_time: '2025-11-30T16:02:00Z', symbol: 'EUR/USD', side: 'SELL', size: 1.5, pnl: 312.75, bds_at_time: 0.22 },
  { id: 'T-1006', timestamp: '2025-11-30T14:23:00Z', exit_time: '2025-11-30T14:58:00Z', symbol: 'GBP/USD', side: 'BUY', size: 1.0, pnl: -185.40, bds_at_time: 0.61 },
  { id: 'T-1007', timestamp: '2025-11-29T10:05:00Z', exit_time: '2025-11-29T11:20:00Z', symbol: 'XAU/USD', side: 'BUY', size: 0.3, pnl: 425.00, bds_at_time: 0.35 },
  { id: 'T-1008', timestamp: '2025-11-29T08:45:00Z', exit_time: '2025-11-29T09:15:00Z', symbol: 'EUR/USD', side: 'SELL', size: 1.0, pnl: 156.20, bds_at_time: 0.29 },
  { id: 'T-1009', timestamp: '2025-11-28T16:30:00Z', exit_time: '2025-11-28T17:45:00Z', symbol: 'GBP/JPY', side: 'BUY', size: 0.5, pnl: -520.00, bds_at_time: 0.78 },
  { id: 'T-1010', timestamp: '2025-11-28T14:15:00Z', exit_time: '2025-11-28T15:02:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 198.30, bds_at_time: 0.31 },
  { id: 'T-1011', timestamp: '2025-11-27T11:20:00Z', exit_time: '2025-11-27T12:45:00Z', symbol: 'NAS100', side: 'SELL', size: 1.0, pnl: -275.50, bds_at_time: 0.52 },
  { id: 'T-1012', timestamp: '2025-11-27T09:00:00Z', exit_time: '2025-11-27T09:45:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 167.80, bds_at_time: 0.25 },
  // Additional trades to match overview metrics
  { id: 'T-1013', timestamp: '2025-11-26T15:30:00Z', exit_time: '2025-11-26T16:15:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.2, pnl: 234.50, bds_at_time: 0.28 },
  { id: 'T-1014', timestamp: '2025-11-26T10:45:00Z', exit_time: '2025-11-26T11:30:00Z', symbol: 'GBP/USD', side: 'SELL', size: 0.8, pnl: 178.20, bds_at_time: 0.32 },
  { id: 'T-1015', timestamp: '2025-11-25T14:20:00Z', exit_time: '2025-11-25T15:05:00Z', symbol: 'XAU/USD', side: 'BUY', size: 0.5, pnl: -290.00, bds_at_time: 0.55 },
  { id: 'T-1016', timestamp: '2025-11-25T09:15:00Z', exit_time: '2025-11-25T10:00:00Z', symbol: 'EUR/USD', side: 'SELL', size: 1.0, pnl: 145.60, bds_at_time: 0.24 },
  { id: 'T-1017', timestamp: '2025-11-24T16:00:00Z', exit_time: '2025-11-24T16:45:00Z', symbol: 'NAS100', side: 'BUY', size: 1.5, pnl: 520.00, bds_at_time: 0.30 },
  { id: 'T-1018', timestamp: '2025-11-24T11:30:00Z', exit_time: '2025-11-24T12:15:00Z', symbol: 'GBP/JPY', side: 'SELL', size: 0.6, pnl: -165.80, bds_at_time: 0.48 },
  { id: 'T-1019', timestamp: '2025-11-23T14:45:00Z', exit_time: '2025-11-23T15:30:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 212.40, bds_at_time: 0.26 },
  { id: 'T-1020', timestamp: '2025-11-23T09:30:00Z', exit_time: '2025-11-23T10:15:00Z', symbol: 'XAU/USD', side: 'SELL', size: 0.4, pnl: 356.00, bds_at_time: 0.33 },
  { id: 'T-1021', timestamp: '2025-11-22T15:15:00Z', exit_time: '2025-11-22T16:00:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 189.30, bds_at_time: 0.29 },
  { id: 'T-1022', timestamp: '2025-11-22T10:00:00Z', exit_time: '2025-11-22T10:45:00Z', symbol: 'GBP/USD', side: 'BUY', size: 0.8, pnl: -145.20, bds_at_time: 0.42 },
  { id: 'T-1023', timestamp: '2025-11-21T14:30:00Z', exit_time: '2025-11-21T15:15:00Z', symbol: 'NAS100', side: 'SELL', size: 1.0, pnl: 278.50, bds_at_time: 0.31 },
  { id: 'T-1024', timestamp: '2025-11-21T09:45:00Z', exit_time: '2025-11-21T10:30:00Z', symbol: 'EUR/USD', side: 'SELL', size: 1.0, pnl: 134.80, bds_at_time: 0.27 },
  { id: 'T-1025', timestamp: '2025-11-20T15:00:00Z', exit_time: '2025-11-20T15:45:00Z', symbol: 'GBP/JPY', side: 'BUY', size: 0.5, pnl: -380.00, bds_at_time: 0.65 },
  { id: 'T-1026', timestamp: '2025-11-20T10:30:00Z', exit_time: '2025-11-20T11:15:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.2, pnl: 267.40, bds_at_time: 0.28 },
  { id: 'T-1027', timestamp: '2025-11-19T14:15:00Z', exit_time: '2025-11-19T15:00:00Z', symbol: 'XAU/USD', side: 'SELL', size: 0.3, pnl: 198.00, bds_at_time: 0.34 },
  { id: 'T-1028', timestamp: '2025-11-19T09:00:00Z', exit_time: '2025-11-19T09:45:00Z', symbol: 'EUR/USD', side: 'BUY', size: 1.0, pnl: 156.20, bds_at_time: 0.25 },
  { id: 'T-1029', timestamp: '2025-11-18T15:30:00Z', exit_time: '2025-11-18T16:15:00Z', symbol: 'GBP/USD', side: 'SELL', size: 0.8, pnl: -210.40, bds_at_time: 0.58 },
  { id: 'T-1030', timestamp: '2025-11-18T10:45:00Z', exit_time: '2025-11-18T11:30:00Z', symbol: 'NAS100', side: 'BUY', size: 1.0, pnl: 345.00, bds_at_time: 0.30 },
]

function isDemoMode(): boolean {
  return localStorage.getItem('shibuya_api_key') === 'shibuya_demo_mode'
}

function getBdsIndicator(bds: number | undefined): { label: string; color: string } {
  if (bds === undefined) return { label: '-', color: 'var(--color-text-muted)' }
  if (bds < 0.35) return { label: 'Calm', color: 'var(--color-success)' }
  if (bds < 0.6) return { label: 'Alert', color: 'var(--color-warning)' }
  return { label: 'Stressed', color: 'var(--color-danger)' }
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function TradeHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TradeHistoryData | null>(null)
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all')
  const [symbolFilter, setSymbolFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchTrades() {
      try {
        setLoading(true)
        setError(null)
        
        // Demo mode returns sample data
        if (isDemoMode()) {
          await new Promise(resolve => setTimeout(resolve, 300))
          const trades = DEMO_TRADES
          const wins = trades.filter(t => t.pnl > 0)
          const losses = trades.filter(t => t.pnl < 0)
          
          setData({
            trades,
            total_count: trades.length,
            summary: {
              total_pnl: trades.reduce((sum, t) => sum + t.pnl, 0),
              win_count: wins.length,
              loss_count: losses.length,
              best_trade: Math.max(...trades.map(t => t.pnl)),
              worst_trade: Math.min(...trades.map(t => t.pnl)),
            }
          })
          return
        }
        
        // TODO: Implement real API call when backend endpoint is ready
        // const response = await getTradeHistory()
        // setData(response)
        
        // For now, show empty state for real users
        setData({
          trades: [],
          total_count: 0,
          summary: {
            total_pnl: 0,
            win_count: 0,
            loss_count: 0,
            best_trade: 0,
            worst_trade: 0,
          }
        })
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trades')
      } finally {
        setLoading(false)
      }
    }
    fetchTrades()
  }, [])

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
            Your trading history will appear here once your report is generated.
            Each trade includes behavioral analysis to help you spot patterns.
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
        <p className="badge">Trade History</p>
        <h1>Your Trades</h1>
        <p className="text-muted">
          Every trade you've uploaded, with behavioral state at time of entry.
          Use this to spot patterns between your mental state and outcomes.
        </p>
      </header>

      {/* Summary Stats */}
      <div className="trade-summary glass-panel">
        <div className="summary-grid">
          <div className="summary-stat">
            <span className="stat-value">{data.total_count}</span>
            <span className="stat-label">Total Trades</span>
          </div>
          <div className="summary-stat">
            <span className={`stat-value ${data.summary.total_pnl >= 0 ? 'positive' : 'negative'}`}>
              {data.summary.total_pnl >= 0 ? '+' : ''}${data.summary.total_pnl.toFixed(2)}
            </span>
            <span className="stat-label">Total PnL</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{winRate.toFixed(1)}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value positive">+${data.summary.best_trade.toFixed(2)}</span>
            <span className="stat-label">Best Trade</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value negative">${data.summary.worst_trade.toFixed(2)}</span>
            <span className="stat-label">Worst Trade</span>
          </div>
        </div>
      </div>

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
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
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
        {data.trades.filter(t => t.bds_at_time && t.bds_at_time > 0.6).length > 0 ? (
          <p>
            You have <strong>{data.trades.filter(t => t.bds_at_time && t.bds_at_time > 0.6).length}</strong> trades 
            taken while in a "Stressed" mental state. These trades have an average PnL of 
            <strong className={data.trades.filter(t => t.bds_at_time && t.bds_at_time > 0.6).reduce((sum, t) => sum + t.pnl, 0) >= 0 ? ' positive' : ' negative'}>
              {' '}${(data.trades.filter(t => t.bds_at_time && t.bds_at_time > 0.6).reduce((sum, t) => sum + t.pnl, 0) / data.trades.filter(t => t.bds_at_time && t.bds_at_time > 0.6).length).toFixed(2)}
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
