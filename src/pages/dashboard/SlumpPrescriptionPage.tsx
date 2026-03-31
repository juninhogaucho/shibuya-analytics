import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSlumpPrescription } from '../../lib/api'
import { buildSlumpExecutionChecklist } from '../../lib/decisionSupport'
import { SkeletonCard, Skeleton, SkeletonMetricCard } from '../../components/ui/Skeleton'
import { Badge } from '../../components/ui/Badge'
import { EngineTag } from '../../components/engine/EngineTag'
import { ChartCard } from '../../components/charts/ChartCard'
import { DrawdownCurve, generateDrawdownData } from '../../components/charts/DrawdownCurve'
import { StateTimeline, generateStateSegments } from '../../components/charts/StateTimeline'
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
          <p>Upload trades to generate the behavioral state and constraint suggestions that power slump remediation.</p>
          <Link to="/dashboard/upload" className="btn btn-sm btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Upload trades
          </Link>
        </div>
      </div>
    )
  }

  const executionChecklist = buildSlumpExecutionChecklist(data)

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <div className="flex items-center gap-2 mb-2">
          <p className="badge" style={{ marginBottom: 0 }}>Pattern Recognition</p>
          <EngineTag engineId="bql" label="BQL state detection" />
          <EngineTag engineId="snell" label="Snell optimal stopping" />
        </div>
        <h1>Slump Remediation</h1>
        <p className="text-muted">
          The intervention timing isn't guesswork — it's the Snell Envelope: the same backward induction that prices American options. We compute the mathematically optimal moment to pull you back.
        </p>
      </header>

      {/* Drawdown + State Timeline visual */}
      {data.is_slump && (
        <div className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
          <ChartCard
            title="Drawdown Trajectory"
            subtitle="Where you are in the drawdown right now"
            height={160}
            headerRight={<EngineTag engineId="cox" label="Cox Hazard" />}
          >
            <DrawdownCurve
              data={generateDrawdownData(data.drawdown_pct || 6, 20)}
              maxDrawdown={data.prescription?.position_cap_pct ? data.drawdown_pct : undefined}
              height={160}
            />
          </ChartCard>

          <ChartCard
            title="Behavioral State — Recent Sessions"
            subtitle="Not just this session — the pattern over time"
            height={160}
            headerRight={<EngineTag engineId="bql" />}
          >
            <div style={{ paddingTop: '1rem' }}>
              <StateTimeline
                segments={generateStateSegments(data.bql_state, 7)}
                height={80}
              />
              <p className="text-xs text-neutral-500 mt-3" style={{ fontFamily: 'monospace' }}>
                {data.days_in_slump || 0} days in current state · {data.consecutive_losses || 0} consecutive losses
              </p>
            </div>
          </ChartCard>
        </div>
      )}

      {/* State Indicator */}
      <div className={`glass-panel state-indicator ${data.is_slump ? 'slump' : 'healthy'}`}>
        <Badge variant={data.is_slump ? 'danger' : 'success'} label={data.is_slump ? 'Slump Detected' : 'Healthy'} size="md" />
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
            <div className="flex items-center gap-2 mb-3">
              <h2>Suggested Protocol</h2>
              <EngineTag engineId="snell" label="Snell Envelope" />
            </div>
            <p className="prescription-message">{data.prescription.message}</p>
          </section>

          {executionChecklist.length > 0 && (
            <section className="glass-panel">
              <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3>Before the next order</h3>
                  <p className="text-muted">This is the minimum standard for the next 72 hours. If you are not going to follow it, do not trade.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/dashboard/upload" className="btn btn-sm btn-primary">Upload latest trades</Link>
                  <Link to="/dashboard/alerts" className="btn btn-sm ghost">Review alerts</Link>
                </div>
              </div>
              <ul className="guidelines-list" style={{ marginTop: '1rem' }}>
                {executionChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

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
              <div className="flex items-center gap-2 mb-2">
                <h3>High-Risk Assets</h3>
                <EngineTag engineId="cox" label="Cox Hazard survival" />
                <Badge variant="danger" label={`${data.prescription.banned_assets.length} assets`} />
              </div>
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
              <h3>Exit Slump When:</h3>
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
              <h3>Historical Context</h3>
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
