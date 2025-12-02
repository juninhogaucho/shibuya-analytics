import { useEffect, useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { InfoTooltip } from '../../components/ui/Tooltip'
import { SkeletonCard, SkeletonMetricCard } from '../../components/ui/Skeleton'
import { StreakCounter, Badge, ProgressRing } from '../../components/ui/Gamification'
import { getDashboardOverview } from '../../lib/api'
import type { DashboardOverview, EdgeItem } from '../../lib/types'
import { Link } from 'react-router-dom'

export function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardOverview | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const overview = await getDashboardOverview()
        setData(overview)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-stack">
        <header className="overview-header" style={{ marginBottom: '1.5rem' }}>
          <div className="overview-header__text">
            <p className="badge">⏳ Analyzing...</p>
            <h1>Your Trading Reality</h1>
            <p className="text-muted">Crunching your numbers, please wait...</p>
          </div>
        </header>
        
        <SkeletonCard style={{ height: '180px', marginBottom: '1.5rem' }} />
        
        <div className="grid-responsive three">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        
        <SkeletonCard style={{ height: '200px' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>⚠️ Unable to load dashboard</h3>
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
          <h3>No data yet</h3>
          <p>Upload your first CSV to see your Margin of Safety analysis.</p>
        </div>
      </div>
    )
  }

  const winRate = data.total_trades && data.winning_trades 
    ? ((data.winning_trades / data.total_trades) * 100).toFixed(1) 
    : null

  return (
    <div className="dashboard-stack">
      {/* Header with BQL State Alert */}
      <header className="overview-header">
        <div className="overview-header__text">
          <p className="badge">Live Analysis • {data.total_trades || 0} trades analyzed</p>
          <h1>Your Trading Reality</h1>
          <p className="text-muted">
            This is not a journal. This is the unfiltered truth about where your money goes.
          </p>
        </div>
        
        {/* BQL Alert Banner */}
        <div className={`bql-alert bql-alert--${data.bql_state.toLowerCase().replace('_', '-')}`}>
          <div className="bql-alert__status">
            <span className="bql-label">
              BQL STATE
              <InfoTooltip content="Behavioral Quality Level - measures how much emotions are influencing your trades" />
            </span>
            <span className="bql-value">{data.bql_state.replace('_', ' ')}</span>
          </div>
          <div className="bql-alert__score">
            <span className="score-value">{(data.bql_score * 100).toFixed(0)}%</span>
            <span className="score-label">Emotional Influence</span>
          </div>
          {data.bql_score > 0.5 && (
            <Link to="/dashboard/slump" className="bql-alert__action btn btn-sm">
              View Prescription →
            </Link>
          )}
        </div>
      </header>

      {/* Quick Stats Row - Streak Counter */}
      {data.streak && (
        <div className="quick-stats-row">
          <StreakCounter 
            days={data.streak.current} 
            best={data.streak.best}
            label={data.streak.message || 'Discipline Streak'}
          />
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
            <ProgressRing 
              progress={Math.min(100, (data.winning_trades || 0) / Math.max(1, data.total_trades || 1) * 100)} 
              size={60}
              label="Win Rate"
            />
            <div>
              <Badge type="milestone" color="success" size="sm" label="Trades" value={data.total_trades || 0} />
            </div>
          </div>
        </div>
      )}

      {/* The Money Shot - Discipline Tax */}
      <section className="discipline-tax-section">
        <div className="glass-panel discipline-tax-card">
          <div className="discipline-tax-header">
            <h2>
              💸 Your Discipline Tax (30 days)
              <InfoTooltip content="Money lost due to behavioral mistakes like revenge trading, overtrading, and position sizing errors" />
            </h2>
            <span className="tax-amount">${data.discipline_tax_30d.toLocaleString()}</span>
          </div>
          <p className="discipline-tax-subtitle">
            This is money you <em>earned</em>, then gave back through behavioral errors.
          </p>
          
          {data.discipline_tax_breakdown && (
            <div className="tax-breakdown">
              <div className="tax-breakdown-item">
                <span className="breakdown-icon">🔥</span>
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.revenge_trades}</span>
                  <span className="breakdown-label">
                    Revenge Trades
                    <InfoTooltip content="Impulsive trades made to recover losses, usually ending in more losses" position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <span className="breakdown-icon">⚡</span>
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.overtrading}</span>
                  <span className="breakdown-label">
                    Overtrading
                    <InfoTooltip content="Excessive trades beyond your optimal frequency" position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <span className="breakdown-icon">📏</span>
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.size_violations}</span>
                  <span className="breakdown-label">
                    Size Violations
                    <InfoTooltip content="Trades that exceeded your risk limits or position sizing rules" position="bottom" />
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="tax-comparison">
            <div className="comparison-item">
              <span className="comparison-label">Gross PnL</span>
              <span className="comparison-value positive">+${(data.pnl_gross || 0).toLocaleString()}</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-label">Net PnL (after tax)</span>
              <span className="comparison-value">${(data.pnl_net || 0).toLocaleString()}</span>
            </div>
            <div className="comparison-item highlight">
              <span className="comparison-label">Money Left on Table</span>
              <span className="comparison-value negative">-${data.discipline_tax_30d.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Metrics Grid */}
      <div className="grid-responsive three">
        <MetricCard
          label="Monte Carlo Edge"
          value={`${data.monte_carlo_drift >= 0 ? '+' : ''}$${Math.abs(data.monte_carlo_drift).toLocaleString()}`}
          delta={`Luck-adjusted alpha over 1000 simulations`}
          tone={data.monte_carlo_drift > 0 ? 'success' : 'danger'}
          caption={`Ruin probability: ${(data.ruin_probability * 100).toFixed(1)}%`}
          tooltip="Your expected edge after removing luck factors through Monte Carlo simulation"
        />
        <MetricCard
          label="Win Rate"
          value={winRate ? `${winRate}%` : 'N/A'}
          delta={`${data.winning_trades || 0} wins / ${data.total_trades || 0} trades`}
          tone={parseFloat(winRate || '0') >= 50 ? 'success' : 'primary'}
          caption={`Sharpe: ${data.sharpe_scenario.toFixed(2)}`}
          tooltip="Percentage of trades that were profitable"
        />
        <MetricCard
          label="Discipline Streak"
          value={`${data.streak?.current || 0} days`}
          delta={data.streak?.message || 'Start your streak today'}
          tone={data.streak && data.streak.current >= 5 ? 'success' : 'primary'}
          caption={data.streak ? `Best: ${data.streak.best} days` : undefined}
          tooltip="Consecutive days following your trading rules without behavioral violations"
        />
      </div>

      {/* Recent Costly Mistakes */}
      {data.recent_errors && data.recent_errors.length > 0 && (
        <section className="glass-panel recent-errors">
          <h3>🔴 Recent Costly Mistakes</h3>
          <p className="text-muted">These specific trades hurt you. Learn from them.</p>
          <div className="errors-list">
            {data.recent_errors.map((err, idx) => (
              <div key={idx} className="error-item">
                <div className="error-date">{new Date(err.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="error-pair">{err.pair}</div>
                <div className="error-description">{err.error}</div>
                <div className="error-cost">-${err.cost}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edge Portfolio Summary */}
      <section className="glass-panel">
        <div className="section-header-inline">
          <div>
            <h3>💎 Edge Portfolio</h3>
            <p className="text-muted">Your strategies, treated like employees. Some get promoted. Some get fired.</p>
          </div>
          <Link to="/dashboard/edges" className="btn btn-sm ghost">View Full Analysis →</Link>
        </div>
        <div className="portfolio-grid">
          {data.edge_portfolio.map((edge: EdgeItem) => (
            <article key={edge.name} className={`portfolio-card status-${edge.status.toLowerCase()}`}>
              <div className="portfolio-card__header">
                <h4>{edge.name}</h4>
                <span className={`edge-badge edge-badge--${edge.status.toLowerCase()}`}>{edge.status}</span>
              </div>
              <div className="portfolio-card__stats">
                <div className="stat">
                  <span className="stat-value">{edge.win_rate}%</span>
                  <span className="stat-label">Win Rate</span>
                </div>
                {edge.pnl !== undefined && (
                  <div className="stat">
                    <span className={`stat-value ${edge.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {edge.pnl >= 0 ? '+' : ''}${Math.abs(edge.pnl).toLocaleString()}
                    </span>
                    <span className="stat-label">PnL</span>
                  </div>
                )}
                {edge.trades !== undefined && (
                  <div className="stat">
                    <span className="stat-value">{edge.trades}</span>
                    <span className="stat-label">Trades</span>
                  </div>
                )}
              </div>
              <p className="portfolio-card__action">{edge.action}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Loyalty & Next Steps */}
      <div className="grid-responsive two">
        {data.loyalty_unlock && (
          <div className="glass-panel loyalty-card">
            <span className="loyalty-badge">🎁 LOYALTY REWARD</span>
            <h3>{data.loyalty_unlock.reward}</h3>
            <p className="text-muted">{data.loyalty_unlock.message}</p>
            {data.loyalty_unlock.progress_pct && (
              <div className="loyalty-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${data.loyalty_unlock.progress_pct}%` }}></div>
                </div>
                <span className="progress-label">{data.loyalty_unlock.progress_pct}% complete</span>
              </div>
            )}
          </div>
        )}
        
        <div className="glass-panel next-coach">
          <span className="coach-badge">📅 NEXT COACH SESSION</span>
          <h3>{new Date(data.next_coach_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <p className="text-muted">Your Sunday digest will include Monte Carlo drift, BQL update, and weekly prescription.</p>
        </div>
      </div>
    </div>
  )
}
