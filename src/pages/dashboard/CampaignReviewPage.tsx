import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, EyeOff } from 'lucide-react'
import { MissionBriefCard } from '../../components/dashboard/MissionBriefCard'
import { getDashboardOverview, getTraderProfileContext, getTradingReportComparison } from '../../lib/api'
import { buildCampaignMetrics, readCampaignJournal } from '../../lib/dailyPractice'
import { formatMoney, formatSignedMoney } from '../../lib/display'
import { getStoredSessionMeta } from '../../lib/runtime'
import { buildPerformanceStory } from '../../lib/performanceStory'
import { buildThirtyDayCampaignArtifact, buildWeeklyRecapArtifact, downloadCampaignRecapArtifact } from '../../lib/recapArtifact'
import type { DashboardOverview, TraderProfileContext, TradingReportComparisonResponse } from '../../lib/types'

function RecapArtifactCard({
  title,
  subtitle,
  highlights,
  onDownload,
  onDownloadSanitized,
}: {
  title: string
  subtitle: string
  highlights: string[]
  onDownload: () => void
  onDownloadSanitized: () => void
}) {
  return (
    <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <h4 style={{ marginBottom: '0.5rem' }}>{title}</h4>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>{subtitle}</p>
      <ul className="digest-preview" style={{ marginBottom: '1rem' }}>
        {highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-sm btn-primary" onClick={onDownload}>
          <Download className="w-4 h-4" />
          Download private recap
        </button>
        <button className="btn btn-sm btn-secondary" onClick={onDownloadSanitized}>
          <EyeOff className="w-4 h-4" />
          Download sanitized share card
        </button>
      </div>
    </article>
  )
}

export function CampaignReviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const [comparison, setComparison] = useState<TradingReportComparisonResponse | null>(null)
  const sessionMeta = getStoredSessionMeta()
  const market = sessionMeta?.market ?? 'india'

  useEffect(() => {
    let active = true

    async function loadCampaignReview() {
      try {
        setLoading(true)
        setError(null)
        const [nextOverview, nextProfile, nextComparison] = await Promise.all([
          getDashboardOverview(),
          getTraderProfileContext().catch(() => null),
          getTradingReportComparison().catch(() => null),
        ])

        if (!active) {
          return
        }

        setOverview(nextOverview)
        setProfile(nextProfile)
        setComparison(nextComparison)
      } catch (err) {
        if (!active) {
          return
        }
        setError(err instanceof Error ? err.message : 'Unable to load campaign review.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCampaignReview()
    return () => {
      active = false
    }
  }, [])

  const metrics = useMemo(() => buildCampaignMetrics({
    entries: readCampaignJournal(sessionMeta?.customerId),
    comparison,
    overview,
  }), [comparison, overview, sessionMeta?.customerId])

  const story = useMemo(() => {
    if (!overview) {
      return null
    }
    return buildPerformanceStory({
      overview,
      profile,
      market,
      comparison,
      metrics,
    })
  }, [comparison, market, metrics, overview, profile])

  const weeklyRecap = useMemo(() => {
    if (!overview || !story) {
      return null
    }
    return buildWeeklyRecapArtifact({
      story,
      overview,
      profile,
      comparison,
      metrics,
      market,
    })
  }, [comparison, market, metrics, overview, profile, story])

  const monthlyRecap = useMemo(() => {
    if (!overview || !story) {
      return null
    }
    return buildThirtyDayCampaignArtifact({
      story,
      overview,
      profile,
      comparison,
      metrics,
      market,
    })
  }, [comparison, market, metrics, overview, profile, story])

  if (loading) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>Loading campaign review...</h3>
          <p className="text-muted">Pulling the private proof trail for this workspace.</p>
        </div>
      </div>
    )
  }

  if (error || !overview || !story) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load campaign review</h3>
          <p>{error ?? 'Campaign review is not available right now.'}</p>
          <button className="btn btn-sm btn-secondary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      <MissionBriefCard story={story} />

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>CAMPAIGN REVIEW</p>
            <h1 style={{ marginBottom: '0.5rem' }}>Private proof that the standard is changing.</h1>
            <p className="text-muted" style={{ maxWidth: '60rem', marginBottom: 0 }}>
              This is the Wrapped layer for Shibuya, but private and useful: what you reclaimed, what nearly broke you, what standard keeps slipping, and what the next campaign has to fix.
            </p>
          </div>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-sm btn-secondary">Back to Mission HQ</Link>
            <Link to="/dashboard/reports" className="btn btn-sm btn-primary">Open reports</Link>
          </div>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Saved capital</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
              {formatMoney(metrics.saved_capital_vs_baseline, market)}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>Versus the first meaningful baseline.</p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Recurring enemy</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.2rem', fontWeight: 700 }}>{metrics.recurring_enemy}</p>
            <p className="text-muted" style={{ marginBottom: 0 }}>{metrics.most_dangerous_session}</p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Best controlled week</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
              {metrics.best_controlled_week} clean session{metrics.best_controlled_week === 1 ? '' : 's'}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>{metrics.cleanest_session}</p>
          </article>
        </div>
      </section>

      <section className="grid-responsive two">
        {weeklyRecap ? (
          <RecapArtifactCard
            title={weeklyRecap.title}
            subtitle={weeklyRecap.subtitle}
            highlights={weeklyRecap.highlights}
            onDownload={() => downloadCampaignRecapArtifact(weeklyRecap)}
            onDownloadSanitized={() => downloadCampaignRecapArtifact(weeklyRecap, true)}
          />
        ) : null}
        {monthlyRecap ? (
          <RecapArtifactCard
            title={monthlyRecap.title}
            subtitle={monthlyRecap.subtitle}
            highlights={monthlyRecap.highlights}
            onDownload={() => downloadCampaignRecapArtifact(monthlyRecap)}
            onDownloadSanitized={() => downloadCampaignRecapArtifact(monthlyRecap, true)}
          />
        ) : null}
      </section>

      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>BASELINE VS LATEST</p>
            <h3 style={{ marginBottom: '0.5rem' }}>What you stopped paying for.</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              The real test is whether the same leak costs less now than it did before.
            </p>
          </div>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Discipline tax delta</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
              {comparison?.delta_summary ? formatSignedMoney(comparison.delta_summary.discipline_tax_change, market) : 'No delta yet'}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {comparison?.baseline && comparison.latest
                ? `${formatMoney(comparison.baseline.discipline_tax, market)} -> ${formatMoney(comparison.latest.discipline_tax, market)}`
                : 'Needs at least two meaningful snapshots.'}
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Behavior shift</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.2rem', fontWeight: 700 }}>
              {comparison?.delta_summary?.edge_vs_behavior_shift ?? 'Waiting for a second honest comparison'}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {story.momentumLine}
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Next campaign objective</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {story.missionLine}
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}

export default CampaignReviewPage
