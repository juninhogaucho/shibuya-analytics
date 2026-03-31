import { useEffect, useState } from 'react'
import { MetricCard } from '../../components/ui/MetricCard'
import { InfoTooltip } from '../../components/ui/Tooltip'
import { SkeletonCard, SkeletonMetricCard } from '../../components/ui/Skeleton'
import { StreakCounter, ProgressRing } from '../../components/ui/Gamification'
import { Badge, ToneBadge, EdgeBadge } from '../../components/ui/Badge'
import { EngineTag } from '../../components/engine/EngineTag'
import { ChartCard } from '../../components/charts/ChartCard'
import { EquityCurve, generateEquityData } from '../../components/charts/EquityCurve'
import { DisciplineTaxTrend, generateTaxTrendData } from '../../components/charts/DisciplineTaxTrend'
import { getDashboardOverview } from '../../lib/api'
import { buildTradingMandate } from '../../lib/decisionSupport'
import type { DashboardOverview, EdgeItem } from '../../lib/types'
import { Link } from 'react-router-dom'
import { BarChart2, TrendingDown, Calendar } from 'lucide-react'

const EXPLANATIONS = {
  bql: (
    <div style={{ maxWidth: '280px' }}>
      <strong>BQL = Behavioral Quality Level</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Our Bayesian Hidden Markov Model detects patterns often associated with emotional trading (tilt, fatigue, euphoria). A high score means your recent behavior deviates from your disciplined baseline. Use this as a check-engine light.
      </p>
    </div>
  ),
  disciplineTax: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Discipline Tax = Estimated Cost of Behavioral Errors</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        DEAN (our Huber IRLS regression) decomposes your P&L into market conditions, execution quality, timing, and behavior. The discipline tax is the behavioral slice — money you earned and gave back through errors.
      </p>
    </div>
  ),
  monteCarlo: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Monte Carlo Edge = Luck-adjusted Alpha</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        10,000 simulations of your trade history isolate what skill produced vs. what luck contributed. This is your real edge, stripped of noise. If it's positive, you have genuine alpha. If it's negative, you're not profitable — you've been lucky.
      </p>
    </div>
  ),
  ruinProbability: (
    <div style={{ maxWidth: '280px' }}>
      <strong>Ruin Probability = EVT Survival Analysis</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Generalized Pareto Distribution fitted via MLE with Newton-Raphson. Basel III requires this exact method for bank capital adequacy. Reduce your behavioral errors and this number drops immediately.
      </p>
    </div>
  ),
}

const DAILY_PRINCIPLES = [
  "Problems are soluble. Your trading struggles are not permanent character flaws.",
  "Good explanations are the key to progress. Don't just lose; understand why.",
  "The only way to fail is to stop correcting your errors.",
  "Discipline is not a trait. It's a skill you build, one trade at a time.",
]

export function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [principle, setPrinciple] = useState('')

  useEffect(() => {
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
            <p className="badge">Analyzing...</p>
            <h1>Your Trading Reality</h1>
            <p className="text-muted">Crunching your numbers, please wait...</p>
          </div>
        </header>
        <SkeletonCard style={{ height: '180px', marginBottom: '1.5rem' }} />
        <div className="grid-responsive three">
          <SkeletonMetricCard /><SkeletonMetricCard /><SkeletonMetricCard />
        </div>
        <SkeletonCard style={{ height: '200px' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load dashboard</h3>
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
          <p>Upload your first trading session to generate your overview, edge portfolio, and next actions.</p>
          <Link to="/dashboard/upload" className="btn btn-sm btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Upload trades
          </Link>
        </div>
      </div>
    )
  }

  const winRate = data.total_trades && data.winning_trades
    ? ((data.winning_trades / data.total_trades) * 100).toFixed(1)
    : null
  const tradingMandate = buildTradingMandate(data)
  const mandateTone = tradingMandate.tone === 'protect'
    ? { borderColor: 'rgba(244, 63, 94, 0.28)', background: 'rgba(244, 63, 94, 0.06)' }
    : tradingMandate.tone === 'focus'
    ? { borderColor: 'rgba(245, 158, 11, 0.28)', background: 'rgba(245, 158, 11, 0.06)' }
    : { borderColor: 'rgba(16, 185, 129, 0.28)', background: 'rgba(16, 185, 129, 0.06)' }

  // Generate chart data from summary stats
  const equityData = generateEquityData(
    data.pnl_gross || 2000,
    data.discipline_tax_30d || 800,
    data.total_trades || 50
  )
  const taxTrendData = generateTaxTrendData(data.discipline_tax_30d || 800)

  return (
    <div className="dashboard-stack">
      {/* Header */}
      <header className="overview-header">
        <div className="overview-header__text">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" label={`${data.total_trades || 0} trades analyzed`} />
          </div>
          <h1>Your Trading Reality</h1>
          <p className="text-muted">{principle}</p>
        </div>

        {/* BQL Alert Banner */}
        <div className={`bql-alert bql-alert--${data.bql_state.toLowerCase().replace('_', '-')}`}>
          <div className="bql-alert__status">
            <div className="flex items-center gap-2">
              <span className="bql-label">BQL STATE</span>
              <InfoTooltip content={EXPLANATIONS.bql} />
              <EngineTag engineId="bql" />
            </div>
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
            <BarChart2 className="w-6 h-6 text-neutral-500" />
            <div className="quick-stat-details">
              <span className="quick-stat-value">{data.total_trades || 0}</span>
              <span className="quick-stat-label">Trades Analyzed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Mandate */}
      <section className="glass-panel" style={{ ...mandateTone, marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="badge" style={{ marginBottom: 0 }}>NEXT SESSION MANDATE</p>
              <ToneBadge tone={tradingMandate.tone} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{tradingMandate.headline}</h3>
            <p className="text-muted" style={{ maxWidth: '60rem' }}>{tradingMandate.summary}</p>
          </div>
          <Link to={tradingMandate.cta.to} className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {tradingMandate.cta.label}
          </Link>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1.25rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Do now</h4>
            <ul className="digest-preview">
              {tradingMandate.doNow.map((item) => (<li key={item}>{item}</li>))}
            </ul>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Stop now</h4>
            <ul className="digest-preview">
              {tradingMandate.stopNow.map((item) => (<li key={item}>{item}</li>))}
            </ul>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Review next</h4>
            <ul className="digest-preview">
              {tradingMandate.reviewNext.map((item) => (<li key={item}>{item}</li>))}
            </ul>
          </article>
        </div>
      </section>

      {/* Equity Curve — visual proof of discipline tax */}
      <div className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
        <ChartCard
          title="Actual vs Potential Equity"
          subtitle="The gap between lines is money your behavior cost you"
          height={180}
          headerRight={<EngineTag engineId="dean" label="DEAN attribution" />}
        >
          <EquityCurve data={equityData} height={180} />
        </ChartCard>

        <ChartCard
          title="Behavioral Cost — 30 Day Trend"
          subtitle="Are your errors getting worse or better?"
          height={180}
          headerRight={<EngineTag engineId="bql" label="BQL + DEAN" />}
        >
          <div className="mb-3">
            <span className="text-2xl font-mono font-bold text-rose-400">
              ${data.discipline_tax_30d.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-500 ml-2">this month</span>
          </div>
          <DisciplineTaxTrend data={taxTrendData} height={120} />
        </ChartCard>
      </div>

      {/* Discipline Tax Breakdown */}
      <section className="discipline-tax-section">
        <div className="glass-panel discipline-tax-card">
          <div className="discipline-tax-header">
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown className="w-5 h-5 text-rose-400" />
                Your Discipline Tax (30 days)
                <InfoTooltip content={EXPLANATIONS.disciplineTax} />
                <EngineTag engineId="dean" />
              </h2>
            </div>
            <span className="tax-amount">${data.discipline_tax_30d.toLocaleString()}</span>
          </div>
          <p className="discipline-tax-subtitle">
            This is money you <em>earned</em>, then gave back through behavioral errors.
          </p>

          {data.discipline_tax_breakdown && (
            <div className="tax-breakdown">
              <div className="tax-breakdown-item">
                <Badge variant="danger" label="Revenge" icon={false} />
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.revenge_trades}</span>
                  <span className="breakdown-label">
                    Revenge Trades
                    <InfoTooltip content={<div style={{maxWidth:'260px'}}><strong>Revenge Trading</strong><p style={{margin:'0.5rem 0 0',fontSize:'0.8rem',lineHeight:1.5}}>Taking quick trades after a loss to "get your money back." These have a much lower win rate because they're emotional, not planned.</p></div>} position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <Badge variant="warning" label="Overtrade" icon={false} />
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.overtrading}</span>
                  <span className="breakdown-label">
                    Overtrading
                    <InfoTooltip content={<div style={{maxWidth:'260px'}}><strong>Overtrading</strong><p style={{margin:'0.5rem 0 0',fontSize:'0.8rem',lineHeight:1.5}}>More trades doesn't mean more profit. Usually means more commissions and lower-quality setups.</p></div>} position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <Badge variant="warning" label="Sizing" icon={false} />
                <div>
                  <span className="breakdown-value">${data.discipline_tax_breakdown.size_violations}</span>
                  <span className="breakdown-label">
                    Size Violations
                    <InfoTooltip content={<div style={{maxWidth:'260px'}}><strong>Size Violations</strong><p style={{margin:'0.5rem 0 0',fontSize:'0.8rem',lineHeight:1.5}}>Trades where you risked more than your rules allow. These outsized bets cause outsized damage.</p></div>} position="bottom" />
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
          delta="Luck-adjusted alpha over 10,000 simulations"
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
          tooltip="Days in a row where you followed your trading rules: proper sizing, no revenge trades, stopped when you should."
        />
      </div>

      {/* Recent Costly Mistakes */}
      {data.recent_errors && data.recent_errors.length > 0 && (
        <section className="glass-panel recent-errors">
          <div className="flex items-center gap-2 mb-2">
            <h3>Recent Costly Mistakes</h3>
            <Badge variant="danger" label={`${data.recent_errors.length} errors`} />
          </div>
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
            <div className="flex items-center gap-2 mb-1">
              <h3>Edge Portfolio</h3>
              <EngineTag engineId="afma" />
            </div>
            <p className="text-muted">Your strategies, treated like employees. Some get promoted. Some get benched.</p>
          </div>
          <Link to="/dashboard/edges" className="btn btn-sm ghost">View Full Analysis →</Link>
        </div>
        <div className="portfolio-grid">
          {data.edge_portfolio.map((edge: EdgeItem) => (
            <article key={edge.name} className={`portfolio-card status-${edge.status.toLowerCase()}`}>
              <div className="portfolio-card__header">
                <h4>{edge.name}</h4>
                <EdgeBadge status={edge.status as 'PRIME' | 'STABLE' | 'DECAYED'} />
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
            <Badge variant="info" label="Loyalty Reward" className="mb-2" />
            <h3>{data.loyalty_unlock.reward}</h3>
            <p className="text-muted">{data.loyalty_unlock.message}</p>
            {data.loyalty_unlock.progress_pct && (
              <div className="loyalty-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${data.loyalty_unlock.progress_pct}%` }} />
                </div>
                <span className="progress-label">{data.loyalty_unlock.progress_pct}% complete</span>
              </div>
            )}
          </div>
        )}

        <div className="glass-panel next-coach">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <Badge variant="neutral" label="Weekly Digest" />
          </div>
          <h3>{new Date(data.next_coach_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <p className="text-muted">Your Sunday email will include:</p>
          <ul className="digest-preview">
            <li>Weekly P&L and performance vs last week</li>
            <li>Behavioral state update — are you improving?</li>
            <li>Top 3 actionable improvements for next week</li>
            <li>Any warnings or pattern alerts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
