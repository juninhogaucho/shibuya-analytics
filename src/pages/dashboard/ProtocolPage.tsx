import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EngineTag } from '../../components/engine/EngineTag'
import { Badge } from '../../components/ui/Badge'
import { SkeletonCard, Skeleton, SkeletonMetricCard } from '../../components/ui/Skeleton'
import { getDashboardOverview, getTradeHistory, getTraderProfileContext } from '../../lib/api'
import { buildExecutionProtocol } from '../../lib/executionProtocol'
import { formatMoney, humanizeFocus, humanizeInstrument } from '../../lib/display'
import { buildTradeHistoryInsights } from '../../lib/tradeHistoryInsights'
import { getStoredSessionMeta, hasPremiumAccess } from '../../lib/runtime'
import { humanizeTraderMode } from '../../lib/traderMode'
import type { DashboardOverview, TradeHistoryResponse, TraderProfileContext } from '../../lib/types'

function getStandardBadge(level: 'in_control' | 'under_pressure' | 'loss_of_command') {
  switch (level) {
    case 'loss_of_command':
      return { variant: 'danger' as const, label: 'Loss of command' }
    case 'under_pressure':
      return { variant: 'warning' as const, label: 'Under pressure' }
    default:
      return { variant: 'success' as const, label: 'In control' }
  }
}

export function ProtocolPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryResponse | null>(null)
  const market = getStoredSessionMeta()?.market ?? 'india'
  const premiumAccess = hasPremiumAccess()

  useEffect(() => {
    async function fetchProtocolData() {
      try {
        setLoading(true)
        setError(null)
        const [overviewResponse, profileResponse, tradeHistoryResponse] = await Promise.all([
          getDashboardOverview(),
          getTraderProfileContext().catch(() => null),
          getTradeHistory().catch(() => null),
        ])
        setOverview(overviewResponse)
        setProfile(profileResponse)
        setTradeHistory(tradeHistoryResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load execution protocol')
      } finally {
        setLoading(false)
      }
    }

    void fetchProtocolData()
  }, [])

  const insights = useMemo(
    () => buildTradeHistoryInsights(tradeHistory?.trades ?? []),
    [tradeHistory?.trades],
  )

  const protocol = useMemo(
    () => (overview ? buildExecutionProtocol({ overview, profile, insights }) : null),
    [overview, profile, insights],
  )

  if (loading) {
    return (
      <div className="dashboard-stack">
        <header className="section-header">
          <p className="badge">Analyzing standard</p>
          <Skeleton style={{ width: '240px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
          <Skeleton style={{ width: '420px', height: '1rem', borderRadius: '4px' }} />
        </header>
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

  if (error || !overview || !protocol) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load execution protocol</h3>
          <p>{error ?? 'This workspace does not have enough data yet.'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  const standardBadge = getStandardBadge(protocol.standardLevel)
  const modeLabel = humanizeTraderMode(overview.trader_mode ?? profile?.trader_mode ?? 'retail_fn0_struggler')
  const contextLine = profile
    ? `${humanizeFocus(profile.trader_focus)} on ${profile.broker_platform} using ${profile.primary_instruments.map(humanizeInstrument).join(', ')}`
    : 'Complete trader context so the standard can adapt to the actual job you are trying to do.'

  return (
    <div className="dashboard-stack">
      <header className="section-header">
        <div className="flex items-center gap-2 mb-2">
          <p className="badge" style={{ marginBottom: 0 }}>Execution Protocol</p>
          <Badge variant={standardBadge.variant} label={standardBadge.label} />
          <Badge variant="neutral" label={modeLabel} />
          <EngineTag engineId="bql" label="control state" />
        </div>
        <h1>Professional standard</h1>
        <p className="text-muted">
          Shibuya is not here to soothe you. It is here to show whether you are trading like a professional, where command is breaking, and what protocol applies next.
        </p>
      </header>

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>{protocol.headline}</h3>
            <p className="text-muted" style={{ maxWidth: '58rem' }}>{protocol.summary}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard/upload" className="btn btn-sm btn-primary">Upload fresh trades</Link>
            <Link to="/dashboard/history" className="btn btn-sm btn-secondary">Open trade ledger</Link>
          </div>
        </div>

        <div className="grid-responsive four" style={{ marginTop: '1.25rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Standard status</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>{standardBadge.label}</p>
            <p className="text-muted" style={{ marginBottom: 0 }}>{protocol.nextCommand}</p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Loss quality</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>{protocol.lossQualityLabel}</p>
            <p className="text-muted" style={{ marginBottom: 0 }}>{protocol.lossQualityDetail}</p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Unforced error rate</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>{protocol.unforcedErrorRate}%</p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {formatMoney(overview.discipline_tax_30d, market)} of recent output has leaked through avoidable behavior.
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Trader context</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>{modeLabel}</p>
            <p className="text-muted" style={{ marginBottom: 0 }}>{contextLine}</p>
          </article>
        </div>
      </section>

      <div className="grid-responsive three" style={{ marginBottom: '1.5rem' }}>
        <section className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Standards currently being violated</h3>
          <ul className="digest-preview">
            {protocol.violatedStandards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Pre-session checklist</h3>
          <ul className="digest-preview">
            {protocol.preSessionChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Post-loss interruption protocol</h3>
          <ul className="digest-preview">
            {protocol.postLossProtocol.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
        <section className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Hard stops right now</h3>
          <ul className="digest-preview">
            {protocol.hardStops.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Recovery conditions</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Do not press size or widen the playbook until these conditions are visible in the next real data.
              </p>
            </div>
            {premiumAccess ? (
              <Link to="/dashboard/slump" className="btn btn-sm btn-secondary">
                Open reset protocol
              </Link>
            ) : null}
          </div>
          <ul className="digest-preview" style={{ marginTop: '1rem' }}>
            {protocol.recoveryConditions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Standards ledger</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              This is the part most traders avoid. Not because it is unclear, but because it is uncomfortably specific.
            </p>
          </div>
          <Link to="/dashboard/reports" className="btn btn-sm btn-secondary">
            Open report library
          </Link>
        </div>

        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          {protocol.ledger.map((entry) => (
            <article key={entry.title} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={entry.severity === 'danger' ? 'danger' : entry.severity === 'warning' ? 'warning' : 'success'} label={entry.title} />
              </div>
              <p className="text-muted" style={{ marginBottom: 0 }}>{entry.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProtocolPage
