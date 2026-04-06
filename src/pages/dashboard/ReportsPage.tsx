import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock3, Download } from 'lucide-react'
import { getDashboardOverview, getTraderProfileContext, getTradingReportComparison, getTradingReports } from '../../lib/api'
import { buildActionBrief } from '../../lib/actionBrief'
import { buildTradingMandate } from '../../lib/decisionSupport'
import { buildCampaignMetrics, readCampaignJournal } from '../../lib/dailyPractice'
import { formatMoney, formatSignedMoney } from '../../lib/display'
import { buildFieldKitArtifacts, downloadFieldKitArtifact } from '../../lib/fieldKit'
import { MissionBriefCard } from '../../components/dashboard/MissionBriefCard'
import { buildPerformanceStory } from '../../lib/performanceStory'
import { buildThirtyDayCampaignArtifact, buildWeeklyRecapArtifact, downloadCampaignRecapArtifact } from '../../lib/recapArtifact'
import { buildReportArtifact, downloadReportArtifact } from '../../lib/reportArtifact'
import { getStoredSessionMeta, hasPremiumAccess, isSampleMode } from '../../lib/runtime'
import { humanizeTraderMode } from '../../lib/traderMode'
import type { DashboardOverview, TraderProfileContext, TradingReportComparisonResponse, TradingReportRecord } from '../../lib/types'

function inferReportLabel(report: TradingReportRecord, premiumAccess: boolean): string {
  const name = (report.name ?? '').toLowerCase()
  if (name.includes('premium') || name.includes('reset')) {
    return 'Reset report'
  }
  if (premiumAccess) {
    return 'Reset brief'
  }
  return 'Baseline brief'
}

export function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reports, setReports] = useState<TradingReportRecord[]>([])
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const [comparison, setComparison] = useState<TradingReportComparisonResponse | null>(null)
  const sessionMeta = getStoredSessionMeta()
  const market = sessionMeta?.market ?? 'india'
  const premiumAccess = hasPremiumAccess()
  const sampleMode = isSampleMode()

  useEffect(() => {
    let active = true

    async function loadReports() {
      try {
        setLoading(true)
        setError(null)
        const [response, nextOverview, nextProfile, nextComparison] = await Promise.all([
          getTradingReports(),
          sampleMode ? Promise.resolve(null) : getDashboardOverview().catch(() => null),
          sampleMode ? Promise.resolve(null) : getTraderProfileContext().catch(() => null),
          sampleMode ? Promise.resolve(null) : getTradingReportComparison().catch(() => null),
        ])
        if (!active) {
          return
        }
        setReports(response.reports ?? [])
        setOverview(nextOverview)
        setProfile(nextProfile)
        setComparison(nextComparison)
      } catch (err) {
        if (!active) {
          return
        }
        setError(err instanceof Error ? err.message : 'Could not load your report library.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadReports()
    return () => {
      active = false
    }
  }, [sampleMode])

  const latestReport = reports[0] ?? null
  const guidedReviewReady = Boolean(overview?.guided_review_included && overview?.guided_review_url)
  const comparisonReady = Boolean(comparison?.has_comparison && comparison.baseline && comparison.latest && comparison.delta_summary)
  const summaryLine = useMemo(() => {
    if (!latestReport) {
      return 'Every paid upload that reaches a usable brief should leave an artifact here. Right now the next move is generating the first one.'
    }

    const reportName = latestReport.name ?? 'Latest report'
    const createdAt = latestReport.created_at
      ? new Date(latestReport.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'unknown date'
    return `${reportName} is the newest artifact in your library, created ${createdAt}.`
  }, [latestReport])
  const performanceStory = overview
    ? buildPerformanceStory({
        overview,
        profile,
        market,
        comparison,
        metrics: buildCampaignMetrics({
          entries: readCampaignJournal(sessionMeta?.customerId),
          comparison,
          overview,
        }),
      })
    : null
  const campaignMetrics = useMemo(() => buildCampaignMetrics({
    entries: readCampaignJournal(sessionMeta?.customerId),
    comparison,
    overview,
  }), [comparison, overview, sessionMeta?.customerId])
  const tradingMandate = overview ? buildTradingMandate(overview) : null
  const actionBrief = overview && tradingMandate
    ? buildActionBrief({
        overview,
        mandate: tradingMandate,
        profile,
        market,
        premiumAccess,
      })
    : null
  const reportArtifact = overview && actionBrief && tradingMandate
    ? buildReportArtifact({
        overview,
        brief: actionBrief,
        mandate: tradingMandate,
        profile,
        market,
        premiumAccess,
      })
    : null
  const weeklyRecap = overview && performanceStory
    ? buildWeeklyRecapArtifact({
        story: performanceStory,
        overview,
        profile,
        comparison,
        metrics: campaignMetrics,
        market,
      })
    : null
  const monthlyRecap = overview && performanceStory
    ? buildThirtyDayCampaignArtifact({
        story: performanceStory,
        overview,
        profile,
        comparison,
        metrics: campaignMetrics,
        market,
      })
    : null
  const fieldKitArtifacts = overview && performanceStory
    ? buildFieldKitArtifacts({
        overview,
        profile,
        story: performanceStory,
        metrics: campaignMetrics,
        market,
        premiumAccess,
      })
    : []

  if (loading) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>Loading report library...</h3>
          <p className="text-muted">Pulling baseline and reset artifacts for this workspace.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load report library</h3>
          <p>{error}</p>
          <button className="btn btn-sm btn-secondary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      {performanceStory ? <MissionBriefCard story={performanceStory} /> : null}

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>REPORT CENTER</p>
            <h1 style={{ marginBottom: '0.5rem' }}>Your report library and delivery trail.</h1>
            <p className="text-muted" style={{ maxWidth: '56rem' }}>
              {summaryLine}
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Back to Action Board
          </Link>
        </div>

        {overview?.market_context_status === 'estimated' ? (
          <div
            className="glass-panel"
            style={{
              marginTop: '1rem',
              borderColor: 'rgba(245, 158, 11, 0.22)',
              background: 'rgba(245, 158, 11, 0.06)',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Market-context honesty</strong>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {overview.market_context_note ?? 'Behavioral analysis and delivery artifacts are real. Regime-style overlays stay approximate until OHLC is connected for the symbols you trade.'}
            </p>
          </div>
        ) : null}

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Artifacts ready</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {reports.length} {reports.length === 1 ? 'report' : 'reports'} archived for this workspace.
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Current model</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {sampleMode
                ? 'Sample mode shows the loop only. Live paid workspaces create real report artifacts after the baseline is ready.'
                : premiumAccess
                  ? 'Reset Pro or premium reset access should leave a deeper trail of briefs, reports, and follow-up comparisons.'
                  : 'Psych Audit should leave a clean baseline artifact before you decide whether deeper intervention is worth it.'}
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Campaign review</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Wrapped-style private proof lives in the campaign review. Use it to revisit what changed, what nearly broke, and what you reclaimed.
            </p>
            <Link to="/dashboard/campaign-review" className="btn btn-sm btn-secondary">
              Open campaign review
            </Link>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Trader mode</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {overview?.trader_mode ? humanizeTraderMode(overview.trader_mode) : 'Context still incomplete'}
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Best next step</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              {reports.length
                ? 'Use the current action board export after each meaningful session change so the next brief becomes tighter, not noisier.'
                : 'Complete the first upload and let the board generate the first baseline artifact.'}
            </p>
            <Link to={reports.length ? '/dashboard/upload' : '/dashboard/onboarding'} className="btn btn-sm btn-secondary">
              {reports.length ? 'Upload another session' : 'Finish setup'}
            </Link>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Guided review</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              {guidedReviewReady
                ? overview?.guided_review_status === 'invited'
                  ? 'Your guided reset checkpoint is unlocked right now.'
                  : 'This workspace includes a guided review once the first meaningful upload is in.'
                : 'Self-serve loop unless your current offer includes a guided review checkpoint.'}
            </p>
            {guidedReviewReady ? (
              <a href={overview?.guided_review_url ?? '#'} className="btn btn-sm btn-secondary" target="_blank" rel="noreferrer">
                Book guided review
              </a>
            ) : (
              <span className="badge">{overview?.guided_review_included ? 'Awaiting trigger' : 'Not included'}</span>
            )}
          </article>
        </div>
      </section>

      {comparisonReady && comparison?.baseline && comparison.latest && comparison.delta_summary && (
        <section className="glass-panel">
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>IMPROVEMENT PROOF</p>
              <h3 style={{ marginBottom: '0.5rem' }}>Baseline versus latest state.</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                This is the part that matters commercially: has behavior actually improved, or are you just looking at prettier screens?
              </p>
            </div>
            <Link to="/dashboard/upload" className="btn btn-sm btn-secondary">
              Add new session
            </Link>
          </div>

          <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Discipline tax delta</h4>
              <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
                {formatSignedMoney(comparison.delta_summary.discipline_tax_change, market)}
              </p>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Baseline {formatMoney(comparison.baseline.discipline_tax, market)} {'->'} latest {formatMoney(comparison.latest.discipline_tax, market)}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Behavior shift</h4>
              <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
                {comparison.delta_summary.edge_vs_behavior_shift}
              </p>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                BQL delta {comparison.delta_summary.bql_change > 0 ? '+' : ''}{comparison.delta_summary.bql_change.toFixed(2)}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Breach / blowup risk</h4>
              <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
                {comparison.delta_summary.breach_risk_shift}
              </p>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Baseline {comparison.baseline.breach_risk_score.toFixed(1)} {'->'} latest {comparison.latest.breach_risk_score.toFixed(1)}
              </p>
            </article>
          </div>

          <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Revenge delta</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {formatSignedMoney(comparison.delta_summary.revenge_change, market)}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Overtrading delta</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {formatSignedMoney(comparison.delta_summary.overtrading_change, market)}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Sizing delta</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {formatSignedMoney(comparison.delta_summary.size_change, market)}
              </p>
            </article>
          </div>
        </section>
      )}

      {!!overview && (
        <section className="glass-panel">
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>PRIVATE ARTIFACT VAULT</p>
              <h3 style={{ marginBottom: '0.5rem' }}>Downloads the buyer only discovers after paying.</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                This is the overdelivery layer: the report, the proof artifacts, and the quiet tools that make the workspace feel more like a private operating system than a dashboard.
              </p>
            </div>
            <span className="badge">
              {overview.artifact_descriptors?.length ?? 0} tracked deliverable{(overview.artifact_descriptors?.length ?? 0) === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
            {reportArtifact ? (
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{reportArtifact.title}</h4>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                  The current diagnosis, written down so the next session starts from evidence instead of memory.
                </p>
                <button className="btn btn-sm btn-primary" onClick={() => downloadReportArtifact(reportArtifact)}>
                  <Download className="w-4 h-4" />
                  Download {premiumAccess ? 'reset' : 'baseline'} report
                </button>
              </article>
            ) : null}

            {weeklyRecap ? (
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{weeklyRecap.title}</h4>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{weeklyRecap.subtitle}</p>
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => downloadCampaignRecapArtifact(weeklyRecap)}>
                    <Download className="w-4 h-4" />
                    Download private recap
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => downloadCampaignRecapArtifact(weeklyRecap, true)}>
                    <Download className="w-4 h-4" />
                    Download sanitized share card
                  </button>
                </div>
              </article>
            ) : null}

            {monthlyRecap ? (
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{monthlyRecap.title}</h4>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{monthlyRecap.subtitle}</p>
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => downloadCampaignRecapArtifact(monthlyRecap)}>
                    <Download className="w-4 h-4" />
                    Download private review
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => downloadCampaignRecapArtifact(monthlyRecap, true)}>
                    <Download className="w-4 h-4" />
                    Download sanitized share card
                  </button>
                </div>
              </article>
            ) : null}

            {!!fieldKitArtifacts.length && (
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Field kit extras</h4>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                  Quiet paid extras: desk cards, emergency scripts, scorecards, and premium prep packets.
                </p>
                <div className="grid-responsive two">
                  {fieldKitArtifacts.slice(0, 4).map((artifact) => (
                    <article key={artifact.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ marginBottom: '0.35rem' }}>{artifact.title}</h5>
                      <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{artifact.summary}</p>
                      <button className="btn btn-sm btn-secondary" onClick={() => downloadFieldKitArtifact(artifact)}>
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </article>
                  ))}
                </div>
              </article>
            )}
          </div>
        </section>
      )}

      {!reports.length && (
        <section className="glass-panel">
          <h3 style={{ marginBottom: '0.5rem' }}>No archived reports yet.</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            The first artifact appears after activation, onboarding, and a real upload. The action board is the live operating surface; this library is the historical proof trail.
          </p>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/dashboard/onboarding" className="btn btn-sm btn-primary">Complete Trader Context</Link>
            <Link to="/dashboard/upload" className="btn btn-sm btn-secondary">Open Upload Flow</Link>
          </div>
        </section>
      )}

      {!!reports.length && (
        <section className="dashboard-stack" style={{ gap: '1rem' }}>
          {reports.map((report) => {
            const createdAt = report.created_at
              ? new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Unknown date'

            return (
              <article key={report.id} className="glass-panel">
                <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                      <p className="badge" style={{ marginBottom: 0 }}>{inferReportLabel(report, premiumAccess).toUpperCase()}</p>
                      <span className="badge">{createdAt}</span>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{report.name ?? 'Trading report artifact'}</h3>
                    <p className="text-muted" style={{ marginBottom: 0 }}>
                      {report.primary_pattern ?? 'This artifact exists so the next session starts from evidence, not from memory.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link to="/dashboard" className="btn btn-sm btn-secondary">
                      <Download className="w-4 h-4" />
                      Open board export
                    </Link>
                  </div>
                </div>

                <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
                  <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Discipline score</h4>
                    <p style={{ marginBottom: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                      {report.discipline_score != null ? `${Math.round(report.discipline_score)}` : 'N/A'}
                    </p>
                  </article>
                  <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Behavioral cost</h4>
                    <p style={{ marginBottom: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                      {report.emotional_cost != null ? formatMoney(report.emotional_cost, market) : 'N/A'}
                    </p>
                  </article>
                  <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Recorded</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>
                      <Clock3 className="w-4 h-4" style={{ display: 'inline-block', marginRight: '0.35rem', verticalAlign: 'text-bottom' }} />
                      {createdAt}
                    </p>
                  </article>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>DELIVERY LOGIC</p>
            <h3 style={{ marginBottom: '0.5rem' }}>How reports should work in Shibuya.</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Reports are not meant to replace the board. They preserve the current diagnosis so the next upload, next mandate, and next review can be measured against something real.
            </p>
          </div>
          <FileText className="w-5 h-5 text-neutral-400" />
        </div>
      </section>
    </div>
  )
}
