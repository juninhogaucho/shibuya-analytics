import { useEffect, useState } from 'react'
import { getSlumpPrescription } from '../../lib/api'
import { SkeletonCard, Skeleton, SkeletonMetricCard } from '../../components/ui/Skeleton'
import type { SlumpPrescription } from '../../lib/types'

// Function to explain WHY each rule is recommended
function getRuleExplanation(rule: string): string {
  const ruleLower = rule.toLowerCase()
  
  if (ruleLower.includes('max') && ruleLower.includes('trade')) {
    return 'When you\'re in a slump, more trades = more losses. Limiting trade count forces you to be selective and only take your best setups.'
  }
  if (ruleLower.includes('cooldown') || ruleLower.includes('wait')) {
    return 'After a loss, your decision-making is compromised for several hours. This cooldown prevents revenge trading and lets your emotions reset.'
  }
  if (ruleLower.includes('position') || ruleLower.includes('size') || ruleLower.includes('lot')) {
    return 'Smaller positions mean smaller losses during drawdowns. This preserves capital so you can recover when your edge returns.'
  }
  if (ruleLower.includes('avoid') || ruleLower.includes('banned') || ruleLower.includes('stop trading')) {
    return 'Historical data shows these assets trigger your worst losses during slumps. Temporarily avoiding them reduces damage.'
  }
  if (ruleLower.includes('session') || ruleLower.includes('london') || ruleLower.includes('new york') || ruleLower.includes('asian')) {
    return 'Your performance varies by session. This constraint focuses you on sessions where you historically perform better during drawdowns.'
  }
  if (ruleLower.includes('journal') || ruleLower.includes('review')) {
    return 'Journaling forces conscious decision-making and helps break the autopilot mode that leads to impulsive trades.'
  }
  if (ruleLower.includes('profit') || ruleLower.includes('daily')) {
    return 'During slumps, small consistent wins rebuild confidence. This target prevents overtrading to chase bigger gains.'
  }
  
  return 'Based on your historical patterns during similar drawdown periods, following this rule reduces your losses.'
}

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
        <p className="badge">Pattern Recognition</p>
        <h1>Slump Remediation</h1>
        <p className="text-muted">
          When your trading patterns match historical slump conditions, we suggest specific constraints to protect capital. 
          These are guardrails derived from your own past behavior.
        </p>
      </header>

      {/* State Indicator */}
      <div className={`glass-panel state-indicator ${data.is_slump ? 'slump' : 'healthy'}`}>
        <span className="state-icon">{data.is_slump ? '🚨' : '✅'}</span>
        <div className="state-content">
          <h3>{data.bql_state.replace('_', ' ')}</h3>
          <p>
            {data.is_slump 
              ? `Your metrics suggest a slump phase. ${data.consecutive_losses || 0} consecutive losses, ${data.drawdown_pct?.toFixed(1) || 0}% drawdown, ${data.days_in_slump || 0} days.` 
              : 'You are trading within healthy parameters. Keep it up!'}
          </p>
        </div>
      </div>

      {data.is_slump && data.prescription && (
        <>
          {/* Main Prescription Message */}
          <section className="glass-panel prescription-main">
            <h2>🛡️ Suggested Protocol</h2>
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

          {/* Rules List with WHY explanations */}
          <section className="glass-panel prescription-card">
            <h3>📋 Recommended Constraints (Next 72h)</h3>
            <ul className="rule-list-detailed">
              {data.prescription.rules.map((rule, idx) => (
                <li key={idx} className="rule-item">
                  <div className="rule-text">{rule}</div>
                  <div className="rule-why">
                    {getRuleExplanation(rule)}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Banned Assets */}
          {data.prescription.banned_assets.length > 0 && (
            <section className="glass-panel">
              <h3>🚫 High-Risk Assets</h3>
              <p className="text-muted">Historically, these assets have contributed most to your drawdowns during similar periods:</p>
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
          <h3>🎯 Current Focus Areas</h3>
          <p>Your metrics are currently stable. Recommended focus areas:</p>
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
