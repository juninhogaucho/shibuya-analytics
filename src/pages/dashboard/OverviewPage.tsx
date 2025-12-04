import { useEffect, useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { InfoTooltip } from '../../components/ui/Tooltip'
import { SkeletonCard, SkeletonMetricCard } from '../../components/ui/Skeleton'
import { StreakCounter, ProgressRing } from '../../components/ui/Gamification'
import { getDashboardOverview } from '../../lib/api'
import type { DashboardOverview, EdgeItem } from '../../lib/types'
import { Link } from 'react-router-dom'

// Newbie-friendly explanations for complex concepts
const EXPLANATIONS = {
  bql: (
    <div style={{ maxWidth: '280px' }}>
      <strong>BQL = Behavioral Quality Level</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Our algorithms detect patterns often associated with emotional trading (tilt, fatigue, euphoria). 
        A high score suggests your recent behavior deviates from your baseline discipline. 
        Only you know how you truly felt. Use this as a check-engine light.
      </p>
    </div>
  ),
  disciplineTax: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Discipline Tax = Estimated Cost of Errors</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        We analyze your trade patterns to estimate money lost to likely behavioral errors. 
        While we can't know your intent, these patterns (revenge trading, oversizing) historically 
        correlate with emotional decision making. Use this as a mirror to reflect on your state of mind.
      </p>
    </div>
  ),
  monteCarlo: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Monte Carlo Edge = Probability Analysis</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        We run 1,000 simulations of your past trades to separate skill from luck. 
        Note: This assumes your future trading will resemble your past. If you change your behavior, 
        you change your odds.
      </p>
    </div>
  ),
  ruinProbability: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Ruin Probability = Theoretical Risk</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Based on your current stats, this is the mathematical probability of blowing your account. 
        It's a warning light, not a destiny. Lower your risk per trade to reduce this number immediately.
      </p>
    </div>
  ),
  revengeTrades: (
    <div style={{ maxWidth: '260px' }}>
      <strong>Revenge Trading</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Taking quick trades after a loss to "get your money back." Usually done with larger size 
        or without proper setup. These trades have a much lower win rate because they're emotional, not planned.
      </p>
    </div>
  ),
  overtrading: (
    <div style={{ maxWidth: '260px' }}>
      <strong>Overtrading</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Taking more trades than your strategy calls for. More trades doesn't mean more profit. It usually 
        means more commissions and lower-quality setups. Your best days probably have fewer trades.
      </p>
    </div>
  ),
  sizeViolations: (
    <div style={{ maxWidth: '260px' }}>
      <strong>Size Violations</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Trades where you risked more than your rules allow, usually because you were "confident" 
        or trying to recover losses quickly. These outsized bets cause outsized damage.
      </p>
    </div>
  ),
  streak: (
    <div style={{ maxWidth: '260px' }}>
      <strong>Discipline Streak</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Days in a row where you followed your trading rules: proper sizing, no revenge trades, 
        stopped when you should. The longer your streak, the more consistent your profits become.
      </p>
    </div>
  ),
  edgePortfolio: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Edge Portfolio = Your Strategy Report Card</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        We track each of your trading strategies separately. PRIME = making money, keep trading it. 
        STABLE = break-even, needs refinement. DECAYED = losing money, stop trading it immediately.
      </p>
    </div>
  ),
}

const DAILY_PRINCIPLES = [
  "Problems are soluble. Your trading struggles are not permanent character flaws.",
  "Good explanations are the key to progress. Don't just lose; understand why.",
  "The only way to fail is to stop correcting your errors.",
  "Discipline is not a trait. It's a skill you build, one trade at a time.",
  "Your trading account is a mirror of your mind. Clear the mind, clear the chart.",
]

export function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [principle, setPrinciple] = useState('')

  useEffect(() => {
    // Pick a random principle for the day
    setPrinciple(DAILY_PRINCIPLES[Math.floor(Math.random() * DAILY_PRINCIPLES.length)])

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
          <p className="badge">Latest Analysis • {data.total_trades || 0} trades analyzed</p>
          <h1>Your Trading Reality</h1>
          <p className="text-muted">
            {principle}
          </p>
        </div>
        
        {/* BQL Alert Banner */}
        <div className={`bql-alert bql-alert--${data.bql_state.toLowerCase().replace('_', '-')}`}>
          <div className="bql-alert__status">
            <span className="bql-label">
              BQL STATE
              <InfoTooltip content={EXPLANATIONS.bql} />
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

      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        {data.streak && (
          <StreakCounter 
            days={data.streak.current} 
            best={data.streak.best}
            label={data.streak.message || 'Discipline Streak'}
          />
        )}
        <div className="glass-panel quick-stat-card">
          <div className="quick-stat-content">
            <ProgressRing 
              progress={Math.min(100, (data.winning_trades || 0) / Math.max(1, data.total_trades || 1) * 100)} 
              size={56}
              label="Win Rate"
            />
            <div className="quick-stat-details">
              <span className="quick-stat-value">{winRate || 0}%</span>
              <span className="quick-stat-label">Win Rate</span>
            </div>
          </div>
        </div>
        <div className="glass-panel quick-stat-card">
          <div className="quick-stat-content">
            <span className="quick-stat-icon">📊</span>
            <div className="quick-stat-details">
              <span className="quick-stat-value">{data.total_trades || 0}</span>
              <span className="quick-stat-label">Trades Analyzed</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Money Shot - Discipline Tax */}
      <section className="discipline-tax-section">
        <div className="glass-panel discipline-tax-card">
          <div className="discipline-tax-header">
            <h2>
              💸 Your Discipline Tax (30 days)
              <InfoTooltip content={EXPLANATIONS.disciplineTax} />
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
                    <InfoTooltip content={EXPLANATIONS.revengeTrades} position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <span className="breakdown-icon">⚡</span>
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.overtrading}</span>
                  <span className="breakdown-label">
                    Overtrading
                    <InfoTooltip content={EXPLANATIONS.overtrading} position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <span className="breakdown-icon">📏</span>
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.size_violations}</span>
                  <span className="breakdown-label">
                    Size Violations
                    <InfoTooltip content={EXPLANATIONS.sizeViolations} position="bottom" />
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
          caption={
            <span>
              Ruin probability: {(data.ruin_probability * 100).toFixed(1)}%
              <InfoTooltip content={EXPLANATIONS.ruinProbability} position="bottom" />
            </span>
          }
          tooltip={EXPLANATIONS.monteCarlo}
        />
        <MetricCard
          label="Win Rate"
          value={winRate ? `${winRate}%` : 'N/A'}
          delta={`${data.winning_trades || 0} wins / ${data.total_trades || 0} trades`}
          tone={parseFloat(winRate || '0') >= 50 ? 'success' : 'primary'}
          tooltip="The percentage of your trades that made money. Above 50% is good, but what matters more is how much you win vs how much you lose."
        />
        <MetricCard
          label="Discipline Streak"
          value={`${data.streak?.current || 0} days`}
          delta={data.streak?.message || 'Start your streak today'}
          tone={data.streak && data.streak.current >= 5 ? 'success' : 'primary'}
          caption={data.streak ? `Best: ${data.streak.best} days` : undefined}
          tooltip={EXPLANATIONS.streak}
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
            <h3>
              💎 Edge Portfolio
              <InfoTooltip content={EXPLANATIONS.edgePortfolio} />
            </h3>
            <p className="text-muted">Your strategies, treated like employees. Some get promoted. Some get benched.</p>
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
          <span className="coach-badge">📅 WEEKLY DIGEST</span>
          <h3>{new Date(data.next_coach_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <p className="text-muted">Your Sunday email will include:</p>
          <ul className="digest-preview">
            <li>📈 Weekly P&L and performance vs last week</li>
            <li>🧠 Behavioral state update (are you improving?)</li>
            <li>🎯 Top 3 actionable improvements for next week</li>
            <li>⚠️ Any warnings or pattern alerts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
