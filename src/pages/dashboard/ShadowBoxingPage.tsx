import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getShadowBoxing } from '../../lib/api'
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import { EngineTag } from '../../components/engine/EngineTag'
import type { ShadowBoxingResponse } from '../../lib/types'

export function ShadowBoxingPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ShadowBoxingResponse | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await getShadowBoxing()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load simulations')
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
          <p className="badge">⏳ Running simulations...</p>
          <Skeleton style={{ width: '180px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
          <Skeleton style={{ width: '400px', height: '1rem', borderRadius: '4px' }} />
        </header>
        <SkeletonCard style={{ height: '160px' }} />
        <SkeletonCard style={{ height: '100px' }} />
        <div className="grid-responsive three">
          <SkeletonCard style={{ height: '280px' }} />
          <SkeletonCard style={{ height: '280px' }} />
          <SkeletonCard style={{ height: '280px' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>⚠️ Unable to load simulations</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (!data || data.simulations.length === 0) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>No simulation data yet</h3>
          <p>Upload trades to see how your real behavior maps onto funded-account rules before you spend money on a challenge.</p>
          <Link to="/dashboard/upload" className="btn btn-sm btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Upload trades
          </Link>
        </div>
      </div>
    )
  }

  const passedCount = data.simulations.filter(s => s.passed).length

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <div className="flex items-center gap-2 mb-2">
          <p className="badge" style={{ marginBottom: 0 }}>Prop Firm Simulator</p>
          <EngineTag engineId="cox" label="Cox Hazard survival" />
          <EngineTag engineId="bql" label="Monte Carlo" />
        </div>
        <h1>Shadow Boxing</h1>
        <p className="text-muted">
          We run your actual trades through funded-account evaluation rulebooks. Cox proportional hazard survival analysis predicts your breach timeline, and Monte Carlo stress-tests your pass probability across 10,000 scenarios.
        </p>
      </header>

      {/* Capital Ready Score */}
      {data.capital_ready_score !== undefined && data.capital_ready_breakdown && (
        <section className="glass-panel">
          <div className="flex items-center gap-2 mb-3">
            <h3>Capital Ready Score</h3>
            <Badge
              variant={data.capital_ready_score >= 70 ? 'success' : data.capital_ready_score >= 50 ? 'warning' : 'danger'}
              label={`${data.capital_ready_score}/100`}
              size="md"
            />
          </div>
          <div className="capital-ready-section">
            <div className="capital-score">
              <span className="capital-score-value">{data.capital_ready_score}</span>
              <span className="capital-score-label">Out of 100</span>
            </div>
            <div className="capital-breakdown">
              <div className="breakdown-item">
                <span className="label">Consistency</span>
                <div className="breakdown-bar">
                  <div 
                    className={`breakdown-fill ${data.capital_ready_breakdown.consistency >= 70 ? 'good' : data.capital_ready_breakdown.consistency >= 50 ? 'medium' : 'bad'}`}
                    style={{ width: `${data.capital_ready_breakdown.consistency}%` }}
                  />
                </div>
                <span className="breakdown-value">{data.capital_ready_breakdown.consistency}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Drawdown Control</span>
                <div className="breakdown-bar">
                  <div 
                    className={`breakdown-fill ${data.capital_ready_breakdown.drawdown_control >= 70 ? 'good' : data.capital_ready_breakdown.drawdown_control >= 50 ? 'medium' : 'bad'}`}
                    style={{ width: `${data.capital_ready_breakdown.drawdown_control}%` }}
                  />
                </div>
                <span className="breakdown-value">{data.capital_ready_breakdown.drawdown_control}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Profit Factor</span>
                <div className="breakdown-bar">
                  <div 
                    className={`breakdown-fill ${data.capital_ready_breakdown.profit_factor >= 1.5 ? 'good' : data.capital_ready_breakdown.profit_factor >= 1 ? 'medium' : 'bad'}`}
                    style={{ width: `${Math.min(data.capital_ready_breakdown.profit_factor * 33, 100)}%` }}
                  />
                </div>
                <span className="breakdown-value">{data.capital_ready_breakdown.profit_factor.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <p className="text-muted" style={{ marginTop: '1rem' }}>{data.capital_ready_breakdown.recommendation}</p>
        </section>
      )}

      {/* Results Summary */}
      <section className={`glass-panel ${passedCount > 0 ? 'success-highlight' : 'info-highlight'}`}>
        <div className="highlight-content">
          <span className="highlight-icon">{passedCount > 0 ? '🏆' : '📈'}</span>
          <div>
            <h2>{passedCount > 0 ? `Passed ${passedCount}/${data.simulations.length} Challenges` : 'Room for Improvement'}</h2>
            <p>{data.message}</p>
          </div>
        </div>
      </section>

      {/* Simulation Results */}
      <section className="simulation-grid">
        <h3>Challenge Simulations</h3>
        <div className="grid-responsive three">
          {data.simulations.map((sim, idx) => (
            <article 
              key={`${sim.firm}-${sim.account_size}-${idx}`} 
              className={`glass-panel sim-card ${sim.passed ? 'sim-passed' : 'sim-failed'}`}
            >
              <div className="sim-header">
                <h4>{sim.firm}</h4>
                <span className={`sim-status ${sim.passed ? 'passed' : 'failed'}`}>
                  {sim.passed ? '✅ PASSED' : '❌ FAILED'}
                </span>
              </div>
              
              <div className="sim-account">
                <span className="account-size">${sim.account_size.toLocaleString()}</span>
                <span className="text-muted">Evaluation size</span>
              </div>

              <div className="sim-metrics">
                <div className="sim-metric">
                  <span className="metric-label">Profit Target</span>
                  <span className="metric-value">{sim.profit_target_pct}%</span>
                  <span className={`metric-yours ${sim.your_pnl_pct >= sim.profit_target_pct ? 'good' : 'bad'}`}>
                    You: {sim.your_pnl_pct}%
                  </span>
                </div>
                <div className="sim-metric">
                  <span className="metric-label">Max Drawdown</span>
                  <span className="metric-value">{sim.max_dd_pct}%</span>
                  <span className={`metric-yours ${sim.your_max_dd_pct <= sim.max_dd_pct ? 'good' : 'bad'}`}>
                    You: {sim.your_max_dd_pct}%
                  </span>
                </div>
              </div>

              <div className="sim-probability">
                <span className="text-muted">Pass Probability:</span>
                <div className="probability-bar">
                  <div 
                    className="probability-fill" 
                    style={{ width: `${sim.pass_probability * 100}%` }}
                  />
                </div>
                <span className="probability-value">{(sim.pass_probability * 100).toFixed(0)}%</span>
              </div>

              {!sim.passed && sim.failure_reason && (
                <div className="sim-failure-reason">
                  ❌ {sim.failure_reason}
                </div>
              )}
              
              {!sim.passed && sim.improvement_needed && (
                <div className="sim-improvement">
                  💡 {sim.improvement_needed}
                </div>
              )}

              {sim.passed && sim.buffer && (
                <div className="sim-buffer">
                  ✓ {sim.buffer}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="glass-panel cta-card">
        <h3>💰 Ready for Capital?</h3>
        {data.best_result ? (
          <div className="cta-content">
            <p className="cta-recommendation">
              Your best match is <strong>{data.best_result.firm} ${data.best_result.account_size.toLocaleString()}</strong> with 
              {' '}{(data.best_result.pass_probability * 100).toFixed(0)}% pass probability.
            </p>
            <p className="text-muted">
              Focus on your PRIME edges only and you could significantly improve your pass rate across all firms.
            </p>
          </div>
        ) : (
          <div className="cta-content">
            <p className="cta-recommendation">
              Focus on improving your win rate and reducing drawdown before attempting a challenge.
            </p>
            <p className="text-muted">
              Use the Slump Prescription and Edge Portfolio to optimize your trading first.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
