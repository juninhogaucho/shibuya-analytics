import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEdgePortfolio } from '../../lib/api'
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton'
import { InfoTooltip } from '../../components/ui/Tooltip'
import { Badge, EdgeBadge } from '../../components/ui/Badge'
import { EngineTag } from '../../components/engine/EngineTag'
import { ChartCard } from '../../components/charts/ChartCard'
import { EdgeComparisonChart } from '../../components/charts/EdgeComparisonChart'
import { formatSignedCompactMoney } from '../../lib/display'
import { getStoredSessionMeta } from '../../lib/runtime'
import type { EdgePortfolioResponse, EdgeItem } from '../../lib/types'

// Human-readable interpretations
const interpretExpectancy = (exp: number): string => {
  if (exp >= 0.5) return 'Strong edge, lean into this'
  if (exp >= 0.2) return 'Solid edge, keep trading it'
  if (exp >= 0) return 'Break-even, needs work'
  if (exp >= -0.2) return 'Slight loser, fix or drop'
  return 'Major loser, stop trading this'
}

const interpretMaxDD = (dd: number): string => {
  if (dd <= 3) return 'Smooth ride'
  if (dd <= 6) return 'Normal swings'
  if (dd <= 10) return 'Bumpy'
  return 'Roller coaster'
}

// Explain what each edge name means for a newbie trader
const getEdgeExplanation = (edgeName: string): { what: string; when: string; why: string } => {
  const explanations: Record<string, { what: string; when: string; why: string }> = {
    'Nifty opening drive': {
      what: 'Trading the first clean directional drive after the Nifty cash open',
      when: 'During the first part of the NSE session, once the opening range resolves',
      why: 'The open concentrates liquidity and emotion. A clean opening drive often gives your best directional read of the day.',
    },
    'BankNifty reversal fade': {
      what: 'Fading the first overextended move in BankNifty after the early impulse',
      when: 'After the first expansion leg, when volatility starts to overshoot',
      why: 'BankNifty moves fast enough to punish late entries. Reversal fades work when the first move exhausts impatient size.',
    },
    'Expiry-day breakout chase': {
      what: 'Chasing breakouts during high-volatility weekly expiry conditions',
      when: 'Mainly on Nifty or BankNifty expiry sessions',
      why: 'These moves feel irresistible, but they often force emotional size and bad late entries if the process is weak.',
    },
    'Options scalp around VWAP': {
      what: 'Short-horizon scalps when price reclaims or rejects VWAP cleanly',
      when: 'Usually mid-session after the open noise settles',
      why: 'VWAP gives structure. If your execution is disciplined, these trades can be repeatable without forcing hero size.',
    },
    'Friday overtrade spiral': {
      what: 'A repeated Friday pattern where you keep taking lower-quality trades after the best move is gone',
      when: 'Late Friday or after a strong week when discipline drops',
      why: 'Fatigue, greed, and “one more trade” syndrome combine into the worst version of your process.',
    },
  }
  
  return explanations[edgeName] || {
    what: 'A trading pattern we identified from your trade history',
    when: 'Based on timing patterns in your trades',
    why: 'We group similar trades to show you what works and what doesn\'t',
  }
}

export function EdgePortfolioPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<EdgePortfolioResponse | null>(null)
  const [expandedEdge, setExpandedEdge] = useState<string | null>(null)
  const market = getStoredSessionMeta()?.market ?? 'india'

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
          <p className="badge">⏳ Analyzing your edges...</p>
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
          <p>We need more trades to identify the setups you should press, refine, or stop trading.</p>
          <Link to="/dashboard/upload" className="btn btn-sm btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Upload trades
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <div className="flex items-center gap-2 mb-2">
          <p className="badge" style={{ marginBottom: 0 }}>Edge Portfolio</p>
          <EngineTag engineId="afma" label="AFMA drift detection" />
        </div>
        <h1>Which setups are actually making you money?</h1>
        <p className="text-muted">
          4 independent drift metrics per setup. PSI, Wasserstein, KS, and MMD — each with bootstrap confidence intervals. Not one stat deciding your fate — four running simultaneously.
        </p>
      </header>

      {/* Summary Stats */}
      <div className="edge-summary glass-panel">
        <div className="edge-stat">
          <span className="stat-value">{data.summary.total}</span>
          <span className="stat-label">Setups Analyzed</span>
        </div>
        <div className="edge-stat prime">
          <span className="stat-value">{data.summary.prime}</span>
          <span className="stat-label">
            Profitable
            <InfoTooltip 
              content="PRIME setups: These are making you money. Trade more of these." 
              position="bottom"
            />
          </span>
        </div>
        <div className="edge-stat stable">
          <span className="stat-value">{data.summary.stable}</span>
          <span className="stat-label">
            Break-even
            <InfoTooltip 
              content="STABLE setups: Not losing money, not making much either. Could be improved." 
              position="bottom"
            />
          </span>
        </div>
        <div className="edge-stat decayed">
          <span className="stat-value">{data.summary.decayed}</span>
          <span className="stat-label">
            Losing Money
            <InfoTooltip 
              content="DECAYED setups: These are bleeding your account. Stop trading them." 
              position="bottom"
            />
          </span>
        </div>
        {data.summary.total_pnl !== undefined && (
          <div className={`edge-stat ${data.summary.total_pnl >= 0 ? 'prime' : 'decayed'}`}>
            <span className="stat-value">
              {formatSignedCompactMoney(data.summary.total_pnl, market)}
            </span>
            <span className="stat-label">Total P&L</span>
          </div>
        )}
      </div>

      {/* Edge comparison chart */}
      {data.edges.length > 0 && (
        <ChartCard
          title="Edge P&L Comparison"
          subtitle="Which setups are making vs. costing you money"
          height={Math.max(140, data.edges.length * 36)}
          headerRight={<EngineTag engineId="afma" />}
        >
          <EdgeComparisonChart
            data={data.edges.map((e) => ({
              name: e.name,
              pnl: e.pnl ?? 0,
              status: e.status as 'PRIME' | 'STABLE' | 'DECAYED',
            }))}
            height={Math.max(140, data.edges.length * 36)}
            market={market}
          />
        </ChartCard>
      )}

      {/* Recommendation */}
      <section className="glass-panel recommendation-card">
        <Badge variant="info" label="Recommendation" className="mb-2" />
        <p>{data.summary.recommendation}</p>
      </section>

      {/* Edge Cards */}
      <section className="edge-list">
        <h3>Your Setups: The Breakdown</h3>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          Click any card to see what this setup means and why it works (or doesn't).
        </p>
        <div className="grid-responsive two">
          {data.edges.map((edge: EdgeItem) => {
            const explanation = getEdgeExplanation(edge.name)
            const isExpanded = expandedEdge === edge.name
            
            return (
            <article 
              key={edge.name} 
              className={`glass-panel edge-card edge-card--${edge.status.toLowerCase()} ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setExpandedEdge(isExpanded ? null : edge.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className="edge-header">
                <h4>{edge.name}</h4>
                <EdgeBadge status={edge.status as 'PRIME' | 'STABLE' | 'DECAYED'} />
              </div>
              
              <div className="edge-metrics">
                <div className="edge-metric">
                  <span className="metric-value">{edge.win_rate}%</span>
                  <span className="metric-label">Win Rate</span>
                </div>
                {edge.pnl !== undefined && (
                  <div className="edge-metric">
                    <span className={`metric-value ${edge.pnl >= 0 ? 'positive' : 'negative'}`}>
                      {formatSignedCompactMoney(edge.pnl, market)}
                    </span>
                    <span className="metric-label">P&L</span>
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
                    <span className="metric-value">
                      {edge.avg_rr >= 0 ? '+' : ''}{edge.avg_rr.toFixed(1)}x
                    </span>
                    <span className="metric-label">
                      Avg Return
                      <InfoTooltip 
                        content={`When you win, you make ${edge.avg_rr.toFixed(1)}x what you risked. Above 1.0x is good.`} 
                        position="bottom"
                      />
                    </span>
                  </div>
                )}
              </div>

              {/* Expandable explanation section */}
              {isExpanded && (
                <div className="edge-explanation">
                  <div className="explanation-item">
                    <strong>What is this?</strong>
                    <p>{explanation.what}</p>
                  </div>
                  <div className="explanation-item">
                    <strong>When do you trade it?</strong>
                    <p>{explanation.when}</p>
                  </div>
                  <div className="explanation-item">
                    <strong>Why does it work?</strong>
                    <p>{explanation.why}</p>
                  </div>
                  
                  {/* Advanced Metrics - Human readable */}
                  {(edge.expectancy !== undefined || edge.max_dd_pct !== undefined) && (
                    <div className="edge-advanced">
                      {edge.expectancy !== undefined && (
                        <span className={`adv-stat ${edge.expectancy >= 0 ? 'positive' : 'negative'}`}>
                          {interpretExpectancy(edge.expectancy)}
                        </span>
                      )}
                      {edge.max_dd_pct !== undefined && (
                        <span className={`adv-stat ${edge.max_dd_pct <= 6 ? 'positive' : edge.max_dd_pct <= 10 ? '' : 'negative'}`}>
                          {interpretMaxDD(edge.max_dd_pct)} ({edge.max_dd_pct.toFixed(1)}% worst drawdown)
                        </span>
                      )}
                    </div>
                  )}

                  {edge.best_month && (
                    <div className="edge-best-month">
                      <span className="best-label">Best month:</span> {edge.best_month}
                    </div>
                  )}
                </div>
              )}
              
              <div className="edge-action">
                <p>{edge.action}</p>
              </div>
              
              <div className="edge-expand-hint">
                {isExpanded ? '▲ Click to collapse' : '▼ Click to learn more'}
              </div>
            </article>
          )})}
        </div>
      </section>

      {/* Simple Guide */}
      <section className="glass-panel">
        <h3>What This Means For Your Trading</h3>
        <div className="guide-grid">
          <div className="guide-item">
            <div className="flex items-center gap-2 mb-2"><EdgeBadge status="PRIME" /> <span className="text-sm font-semibold">= Trade More</span></div>
            <p>These setups are making you money. Look for more opportunities like these. If you're only taking 2 of these per week, can you find 4?</p>
          </div>
          <div className="guide-item">
            <div className="flex items-center gap-2 mb-2"><EdgeBadge status="STABLE" /> <span className="text-sm font-semibold">= Improve or Skip</span></div>
            <p>Breaking even isn't bad, but it's not great. Either refine your entries/exits or focus your energy on PRIME setups instead.</p>
          </div>
          <div className="guide-item">
            <div className="flex items-center gap-2 mb-2"><EdgeBadge status="DECAYED" /> <span className="text-sm font-semibold">= Stop Immediately</span></div>
            <p>These setups are costing you real money. Remove them from your playbook. Don't hope they'll "come back" – they won't.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
