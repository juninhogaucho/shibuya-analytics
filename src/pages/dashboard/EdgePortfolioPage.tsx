import { useEffect, useState } from 'react'
import { getEdgePortfolio } from '../../lib/api'
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton'
import type { EdgePortfolioResponse, EdgeItem } from '../../lib/types'

export function EdgePortfolioPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<EdgePortfolioResponse | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await getEdgePortfolio()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load edge portfolio')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-stack">
        <header className="section-header">
          <p className="badge">⏳ Analyzing...</p>
          <Skeleton style={{ width: '180px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
          <Skeleton style={{ width: '400px', height: '1rem', borderRadius: '4px' }} />
        </header>
        <SkeletonCard style={{ height: '100px' }} />
        <div className="grid-responsive two">
          <SkeletonCard style={{ height: '200px' }} />
          <SkeletonCard style={{ height: '200px' }} />
          <SkeletonCard style={{ height: '200px' }} />
          <SkeletonCard style={{ height: '200px' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>⚠️ Unable to load edge portfolio</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>No edges detected yet</h3>
          <p>Upload more trades to identify your trading edges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <p className="badge">AFMA Analysis</p>
        <h1>Edge Portfolio</h1>
        <p className="text-muted">
          Your strategies, treated like employees. Some get promoted. Some get fired. 
          Stop thinking "I am a bad trader" and start thinking "My portfolio needs rebalancing."
        </p>
      </header>

      {/* Summary Stats */}
      <div className="edge-summary glass-panel">
        <div className="edge-stat">
          <span className="stat-value">{data.summary.total}</span>
          <span className="stat-label">Total Edges</span>
        </div>
        <div className="edge-stat prime">
          <span className="stat-value">{data.summary.prime}</span>
          <span className="stat-label">Prime</span>
        </div>
        <div className="edge-stat stable">
          <span className="stat-value">{data.summary.stable}</span>
          <span className="stat-label">Stable</span>
        </div>
        <div className="edge-stat decayed">
          <span className="stat-value">{data.summary.decayed}</span>
          <span className="stat-label">Decayed</span>
        </div>
        {data.summary.total_pnl !== undefined && (
          <div className={`edge-stat ${data.summary.total_pnl >= 0 ? 'prime' : 'decayed'}`}>
            <span className="stat-value">
              {data.summary.total_pnl >= 0 ? '+' : ''}${data.summary.total_pnl.toLocaleString()}
            </span>
            <span className="stat-label">Total PnL</span>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <section className="glass-panel recommendation-card">
        <h3>💡 Portfolio Recommendation</h3>
        <p>{data.summary.recommendation}</p>
      </section>

      {/* Edge Cards */}
      <section className="edge-list">
        <h3>Your Edges: Detailed Analysis</h3>
        <div className="grid-responsive two">
          {data.edges.map((edge: EdgeItem) => (
            <article key={edge.name} className={`glass-panel edge-card edge-card--${edge.status.toLowerCase()}`}>
              <div className="edge-header">
                <h4>{edge.name}</h4>
                <span className={`edge-status ${edge.status}`}>{edge.status}</span>
              </div>
              
              <div className="edge-metrics">
                <div className="edge-metric">
                  <span className="metric-value">{edge.win_rate}%</span>
                  <span className="metric-label">Win Rate</span>
                </div>
                {edge.pnl !== undefined && (
                  <div className="edge-metric">
                    <span className={`metric-value ${edge.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {edge.pnl >= 0 ? '+' : ''}${Math.abs(edge.pnl).toLocaleString()}
                    </span>
                    <span className="metric-label">PnL</span>
                  </div>
                )}
                {edge.trades !== undefined && (
                  <div className="edge-metric">
                    <span className="metric-value">{edge.trades}</span>
                    <span className="metric-label">Trades</span>
                  </div>
                )}
                {edge.avg_rr !== undefined && (
                  <div className="edge-metric">
                    <span className="metric-value">{edge.avg_rr.toFixed(1)}R</span>
                    <span className="metric-label">Avg RR</span>
                  </div>
                )}
              </div>

              {/* Advanced Metrics */}
              {(edge.expectancy !== undefined || edge.sharpe !== undefined || edge.max_dd_pct !== undefined) && (
                <div className="edge-advanced">
                  {edge.expectancy !== undefined && (
                    <span className={`adv-stat ${edge.expectancy >= 0 ? 'positive' : 'negative'}`}>
                      Exp: {edge.expectancy >= 0 ? '+' : ''}{edge.expectancy.toFixed(2)}
                    </span>
                  )}
                  {edge.sharpe !== undefined && (
                    <span className={`adv-stat ${edge.sharpe >= 1 ? 'positive' : edge.sharpe < 0 ? 'negative' : ''}`}>
                      Sharpe: {edge.sharpe.toFixed(1)}
                    </span>
                  )}
                  {edge.max_dd_pct !== undefined && (
                    <span className="adv-stat">Max DD: {edge.max_dd_pct.toFixed(1)}%</span>
                  )}
                </div>
              )}

              {edge.best_month && (
                <div className="edge-best-month">
                  <span className="best-label">Best:</span> {edge.best_month}
                </div>
              )}
              
              <div className="edge-action">
                <p>{edge.action}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Strategy Guide */}
      <section className="glass-panel">
        <h3>📚 How to Use This Portfolio</h3>
        <div className="guide-grid">
          <div className="guide-item">
            <h5>🚀 PRIME Edges</h5>
            <p>Your A+ setups. Increase risk allocation to 0.75-1R. These fund your lifestyle.</p>
          </div>
          <div className="guide-item">
            <h5>📊 STABLE Edges</h5>
            <p>Solid performers. Maintain current allocation. Look for optimization opportunities.</p>
          </div>
          <div className="guide-item">
            <h5>⚠️ DECAYED Edges</h5>
            <p>Bench immediately. Review in FXReplay. Do not trade until status improves.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
