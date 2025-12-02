import { useEffect, useState } from 'react'
import { getSlumpPrescription } from '../../lib/api'
import { SkeletonCard, Skeleton, SkeletonMetricCard } from '../../components/ui/Skeleton'
import type { SlumpPrescription } from '../../lib/types'

export function SlumpPrescriptionPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SlumpPrescription | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await getSlumpPrescription()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prescription')
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
          <p className="badge">⏳ Analyzing state...</p>
          <Skeleton style={{ width: '200px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
          <Skeleton style={{ width: '450px', height: '1rem', borderRadius: '4px' }} />
        </header>
        <SkeletonCard style={{ height: '100px' }} />
        <div className="grid-responsive four">
          <SkeletonMetricCard />
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
          <h3>⚠️ Unable to load prescription</h3>
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
          <p>Upload trades to get your personalized slump prescription.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <p className="badge">Automated Triage</p>
        <h1>Slump Prescription</h1>
        <p className="text-muted">
          When BQL detects emotional degradation, we generate specific prescriptions based on your history.
          This is your automated risk manager stepping in when you can't.
        </p>
      </header>

      {/* State Indicator */}
      <div className={`glass-panel state-indicator ${data.is_slump ? 'slump' : 'healthy'}`}>
        <span className="state-icon">{data.is_slump ? '🚨' : '✅'}</span>
        <div className="state-content">
          <h3>{data.bql_state.replace('_', ' ')}</h3>
          <p>
            {data.is_slump 
              ? `You are in a verified slump. ${data.consecutive_losses || 0} consecutive losses, ${data.drawdown_pct?.toFixed(1) || 0}% drawdown, ${data.days_in_slump || 0} days.` 
              : 'You are trading within healthy parameters. Keep it up!'}
          </p>
        </div>
      </div>

      {data.is_slump && data.prescription && (
        <>
          {/* Main Prescription Message */}
          <section className="glass-panel prescription-main">
            <h2>🩺 Your Prescription</h2>
            <p className="prescription-message">{data.prescription.message}</p>
          </section>

          {/* Metrics Grid */}
          <div className="grid-responsive four">
            <article className="glass-panel metric-highlight">
              <span className="metric-val">{data.prescription.max_trades_per_session}</span>
              <span className="metric-label">Max Trades/Session</span>
            </article>
            <article className="glass-panel metric-highlight">
              <span className="metric-val">{data.prescription.position_cap_pct}%</span>
              <span className="metric-label">Position Size Cap</span>
            </article>
            <article className="glass-panel metric-highlight">
              <span className="metric-val">{data.prescription.cooldown_hours}h</span>
              <span className="metric-label">Cooldown Between</span>
            </article>
            <article className="glass-panel metric-highlight danger">
              <span className="metric-val">{data.prescription.banned_assets.length}</span>
              <span className="metric-label">Banned Assets</span>
            </article>
          </div>

          {/* Rules List */}
          <section className="glass-panel prescription-card">
            <h3>📋 Your Rules for the Next 72 Hours</h3>
            <ul className="rule-list">
              {data.prescription.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </section>

          {/* Banned Assets */}
          {data.prescription.banned_assets.length > 0 && (
            <section className="glass-panel">
              <h3>🚫 Banned Assets</h3>
              <p className="text-muted">Do NOT trade these until you recover. These are your "tilt pairs":</p>
              <div className="banned-list">
                {data.prescription.banned_assets.map((asset) => (
                  <span key={asset} className="banned-tag">{asset}</span>
                ))}
              </div>
            </section>
          )}

          {/* Recovery Criteria */}
          {data.prescription.recovery_criteria && (
            <section className="glass-panel recovery-criteria">
              <h3>✅ Exit Slump When:</h3>
              <ul className="recovery-list">
                {data.prescription.recovery_criteria.map((criteria, idx) => (
                  <li key={idx}>{criteria}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Historical Context */}
          {data.prescription.historical_context && (
            <section className="glass-panel historical-context">
              <h3>📊 Historical Context</h3>
              <p>{data.prescription.historical_context}</p>
            </section>
          )}
        </>
      )}

      {!data.is_slump && (
        <section className="glass-panel healthy-state">
          <h3>🎯 Current Trading Guidelines</h3>
          <p>Your current state is healthy. Here are your standard operating parameters:</p>
          <ul className="guidelines-list">
            <li>Follow your edge conditions as defined in Edge Portfolio</li>
            <li>Respect fatigue limits based on your historical patterns</li>
            <li>Review Margin of Safety Coach every Sunday</li>
            <li>Upload trades regularly to maintain accurate analysis</li>
          </ul>
          <div className="healthy-stats">
            <p className="text-muted">Keep your BQL score below 50% to stay in this state.</p>
          </div>
        </section>
      )}
    </div>
  )
}
