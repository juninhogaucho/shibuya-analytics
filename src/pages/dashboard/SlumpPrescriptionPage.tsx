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

function getRuleExplanation(rule: string): string {
  const ruleLower = rule.toLowerCase()

  if (ruleLower.includes('max') && ruleLower.includes('trade')) {
    return 'When command is compromised, extra trades usually mean extra damage. Trade-count limits force selectivity.'
  }
  if (ruleLower.includes('cooldown') || ruleLower.includes('wait')) {
    return 'A hard pause breaks the recovery-trade impulse and stops one red number from turning into a full sequence.'
  }
  if (ruleLower.includes('position') || ruleLower.includes('size') || ruleLower.includes('lot')) {
    return 'Smaller size keeps bad execution from doing permanent damage while you restore control.'
  }
  if (ruleLower.includes('avoid') || ruleLower.includes('banned') || ruleLower.includes('stop trading')) {
    return 'These instruments have already acted like accelerants during similar breakdowns. Bench them until the ledger improves.'
  }
  if (ruleLower.includes('session') || ruleLower.includes('london') || ruleLower.includes('new york') || ruleLower.includes('asian')) {
    return 'Session filters keep you inside the windows where your decisions are historically less sloppy.'
  }
  if (ruleLower.includes('journal') || ruleLower.includes('review')) {
    return 'Writing the setup before the trade makes it harder to hide from your own standards.'
  }
  if (ruleLower.includes('profit') || ruleLower.includes('daily')) {
    return 'Small clean sessions rebuild control faster than trying to force one heroic comeback.'
  }

  return 'This constraint exists because similar breakdowns in your history were expensive and avoidable.'
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
        setError(err instanceof Error ? err.message : 'Failed to load protocol')
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-stack">
        <header className="section-header">
          <p className="badge">Analyzing control state...</p>
          <Skeleton style={{ width: '220px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
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
          <h3>Unable to load protocol</h3>
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
          <p>Upload trades to generate the control-state analysis and hard constraints that power Shibuya intervention.</p>
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
          <p className="badge" style={{ marginBottom: 0 }}>Control Failure Detection</p>
          <EngineTag engineId="bql" label="BQL state detection" />
          <EngineTag engineId="snell" label="Snell optimal stopping" />
        </div>
        <h1>Loss-of-command protocol</h1>
        <p className="text-muted">
          When execution quality breaks, you do not need motivation. You need constraints. This page exists to stop a temporary breakdown from becoming a full account event.
        </p>
      </header>

      {data.is_slump && (
        <div className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
          <ChartCard
            title="Drawdown trajectory"
            subtitle="Where command started to break"
            height={160}
            headerRight={<EngineTag engineId="cox" label="Cox hazard" />}
          >
            <DrawdownCurve
              data={generateDrawdownData(data.drawdown_pct || 6, 20)}
              maxDrawdown={data.prescription?.position_cap_pct ? data.drawdown_pct : undefined}
              height={160}
            />
          </ChartCard>

          <ChartCard
            title="Behavioral state timeline"
            subtitle="Recent sessions, not just the latest loss"
            height={160}
            headerRight={<EngineTag engineId="bql" />}
          >
            <div style={{ paddingTop: '1rem' }}>
              <StateTimeline segments={generateStateSegments(data.bql_state, 7)} height={80} />
              <p className="text-xs text-neutral-500 mt-3" style={{ fontFamily: 'monospace' }}>
                {data.days_in_slump || 0} days in state | {data.consecutive_losses || 0} consecutive losses
              </p>
            </div>
          </ChartCard>
        </div>
      )}

      <div className={`glass-panel state-indicator ${data.is_slump ? 'slump' : 'healthy'}`}>
        <Badge variant={data.is_slump ? 'danger' : 'success'} label={data.is_slump ? 'Protocol active' : 'Control intact'} size="md" />
        <div className="state-content">
          <h3>{data.bql_state.replace('_', ' ')}</h3>
          <p>
            {data.is_slump
              ? `Command has broken down: ${data.consecutive_losses || 0} consecutive losses, ${data.drawdown_pct?.toFixed(1) || 0}% drawdown, ${data.days_in_slump || 0} days inside the failure state.`
              : 'Current data does not justify emergency constraints. Hold the standard and keep the process boring.'}
          </p>
        </div>
      </div>

      {data.is_slump && data.prescription && (
        <>
          <section className="glass-panel prescription-main">
            <div className="flex items-center gap-2 mb-3">
              <h2>Emergency constraint set</h2>
              <EngineTag engineId="snell" label="Snell Envelope" />
            </div>
            <p className="prescription-message">{data.prescription.message}</p>
          </section>

          {executionChecklist.length > 0 && (
            <section className="glass-panel">
              <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3>Before the next order</h3>
                  <p className="text-muted">This is the minimum acceptable standard for the next 72 hours. If you are not going to follow it, do not trade.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/dashboard/upload" className="btn btn-sm btn-primary">Upload latest trades</Link>
                  <Link to="/dashboard/alerts" className="btn btn-sm ghost">Review warnings</Link>
                </div>
              </div>
              <ul className="guidelines-list" style={{ marginTop: '1rem' }}>
                {executionChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid-responsive four">
            <article className="glass-panel metric-highlight">
              <span className="metric-val">{data.prescription.max_trades_per_session}</span>
              <span className="metric-label">Max trades / session</span>
            </article>
            <article className="glass-panel metric-highlight">
              <span className="metric-val">{data.prescription.position_cap_pct}%</span>
              <span className="metric-label">Position size cap</span>
            </article>
            <article className="glass-panel metric-highlight">
              <span className="metric-val">{data.prescription.cooldown_hours}h</span>
              <span className="metric-label">Cooldown between sessions</span>
            </article>
            <article className="glass-panel metric-highlight danger">
              <span className="metric-val">{data.prescription.banned_assets.length}</span>
              <span className="metric-label">Benched instruments</span>
            </article>
          </div>

          <section className="glass-panel prescription-card">
            <h3>Non-negotiable constraints (next 72h)</h3>
            <ul className="rule-list-detailed">
              {data.prescription.rules.map((rule, idx) => (
                <li key={idx} className="rule-item">
                  <div className="rule-text">{rule}</div>
                  <div className="rule-why">{getRuleExplanation(rule)}</div>
                </li>
              ))}
            </ul>
          </section>

          {data.prescription.banned_assets.length > 0 && (
            <section className="glass-panel">
              <div className="flex items-center gap-2 mb-2">
                <h3>High-risk instruments</h3>
                <EngineTag engineId="cox" label="Cox hazard" />
                <Badge variant="danger" label={`${data.prescription.banned_assets.length} assets`} />
              </div>
              <p className="text-muted">Historically, these instruments contributed most to damage during similar breakdowns:</p>
              <div className="banned-list">
                {data.prescription.banned_assets.map((asset) => (
                  <span key={asset} className="banned-tag">{asset}</span>
                ))}
              </div>
            </section>
          )}

          {data.prescription.recovery_criteria && (
            <section className="glass-panel recovery-criteria">
              <h3>Return to normal size only when:</h3>
              <ul className="recovery-list">
                {data.prescription.recovery_criteria.map((criteria, idx) => (
                  <li key={idx}>{criteria}</li>
                ))}
              </ul>
            </section>
          )}

          {data.prescription.historical_context && (
            <section className="glass-panel historical-context">
              <h3>Historical context</h3>
              <p>{data.prescription.historical_context}</p>
            </section>
          )}
        </>
      )}

      {!data.is_slump && (
        <section className="glass-panel healthy-state">
          <h3>Operating standard</h3>
          <p>Your metrics are currently stable. Keep the standard intact with the same discipline you would expect on a professional desk:</p>
          <ul className="guidelines-list">
            <li>Follow edge conditions as defined in Edge Portfolio</li>
            <li>Respect fatigue limits based on historical patterns</li>
            <li>Review margin-of-safety context every Sunday</li>
            <li>Upload trades regularly so the board stays honest</li>
          </ul>
          <div className="healthy-stats">
            <p className="text-muted">Keep BQL below 50% and your behavior boring enough that the emergency protocol never needs to fire.</p>
          </div>
        </section>
      )}
    </div>
  )
}
