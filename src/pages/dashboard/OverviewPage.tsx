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
import { getDashboardOverview, getTraderProfileContext, getTradingReportComparison, logTraderLifecycleEvent } from '../../lib/api'
import { buildActionBrief } from '../../lib/actionBrief'
import { buildTradingMandate } from '../../lib/decisionSupport'
import { buildCampaignMetrics, readCampaignJournal } from '../../lib/dailyPractice'
import { formatMoney, formatSignedMoney, humanizeFocus, humanizeInstrument } from '../../lib/display'
import { DailyCommandDeck } from '../../components/dashboard/DailyCommandDeck'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { CampaignProofCard } from '../../components/dashboard/CampaignProofCard'
import { FieldKitCard } from '../../components/dashboard/FieldKitCard'
import { MissionBriefCard } from '../../components/dashboard/MissionBriefCard'
import { buildJourneyState } from '../../lib/journeyState'
import { buildReportArtifact, downloadReportArtifact } from '../../lib/reportArtifact'
import { buildExecutionProtocol } from '../../lib/executionProtocol'
import { buildPerformanceStory } from '../../lib/performanceStory'
import { getStoredSessionMeta, hasPremiumAccess, isSampleMode } from '../../lib/runtime'
import { describeTraderMode, humanizeTraderMode } from '../../lib/traderMode'
import type { DashboardOverview, EdgeItem, TraderProfileContext, TradingReportComparisonResponse } from '../../lib/types'
import { Link } from 'react-router-dom'
import { BarChart2, TrendingDown, Calendar, CheckCircle2, Copy, Download, Printer } from 'lucide-react'

const EXPLANATIONS = {
  bql: (
    <div style={{ maxWidth: '280px' }}>
      <strong>BQL = Behavioral Quality Level</strong>
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', lineHeight: 1.5 }}>
        Our Bayesian Hidden Markov Model detects when decision quality is drifting away from your disciplined baseline. A high score means command is slipping. Treat it like a cockpit warning, not a mood diary.
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
  'The market does not care how you feel. Your job is to stay operational under pressure.',
  "Do not romanticize losses. Name the leak, fix the leak, and move on.",
  'Professional traders do not need more drama. They need tighter standards.',
  'Best loser wins. Lose cleanly, recover quickly, and stop paying for preventable mistakes.',
]

export function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [profileContext, setProfileContext] = useState<TraderProfileContext | null>(null)
  const [comparison, setComparison] = useState<TradingReportComparisonResponse | null>(null)
  const [principle, setPrinciple] = useState('')
  const [briefCopied, setBriefCopied] = useState(false)
  const [reportDownloaded, setReportDownloaded] = useState(false)
  const [campaignRefreshToken, setCampaignRefreshToken] = useState(0)
  const sessionMeta = getStoredSessionMeta()
  const premiumAccess = hasPremiumAccess()

  useEffect(() => {
    setPrinciple(DAILY_PRINCIPLES[Math.floor(Math.random() * DAILY_PRINCIPLES.length)])
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [overview, profile, nextComparison] = await Promise.all([
          getDashboardOverview(),
          getTraderProfileContext().catch(() => null),
          getTradingReportComparison().catch(() => null),
        ])
        setData(overview)
        setProfileContext(profile)
        setComparison(nextComparison)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!data) {
      return
    }

    void logTraderLifecycleEvent({
      event_name: 'next_session_mandate_viewed',
      market: sessionMeta?.market,
      tier: sessionMeta?.tier,
    }).catch(() => undefined)
  }, [data, sessionMeta?.market, sessionMeta?.tier])

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
    const emptyJourneyState = buildJourneyState({
      overview: null,
      profile: profileContext,
      sessionMeta,
      market: sessionMeta?.market ?? 'india',
    })

    return (
      <div className="dashboard-stack">
        <JourneyProgressCard state={emptyJourneyState} />
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
  const market = sessionMeta?.market ?? 'india'
  const accessTierLabel =
    data.access_tier === 'reset_pro' || premiumAccess
      ? 'Reset Pro'
      : sessionMeta?.tier === 'sample'
        ? 'Sample'
        : 'Psych Audit'
  const offerKindLabel =
    data.offer_kind === 'reset_intensive'
      || data.offer_kind === 'next_session_reset'
      ? 'One-time reset'
      : data.offer_kind === 'psych_audit' || data.offer_kind === 'edge_or_behavior'
        ? 'One-time audit'
        : data.offer_kind === 'reset_pro_live'
          ? 'Monthly live'
          : data.offer_kind === 'psych_audit_live'
            ? 'Monthly live'
            : sessionMeta?.offerKind === 'sample'
              ? 'Sample'
              : 'Live access'
  const oneTimeAccess = Boolean((data.offer_kind ?? sessionMeta?.offerKind) && !(data.offer_kind ?? sessionMeta?.offerKind)?.endsWith('_live') && (data.offer_kind ?? sessionMeta?.offerKind) !== 'sample')
  const billingStatusLabel =
    data.billing_status === 'active'
      ? data.offer_kind && !data.offer_kind.endsWith('_live')
        ? 'Access active'
        : 'Billing active'
      : data.billing_status === 'trialing'
        ? 'Trial running'
        : data.billing_status === 'past_due'
          ? 'Payment issue'
          : data.billing_status === 'canceled'
            ? 'Canceled'
            : 'Activation ready'
  const caseStatusLabel =
    data.case_status === 'awaiting_onboarding'
      ? 'Finish setup'
      : data.case_status === 'awaiting_upload'
        ? 'Awaiting upload'
        : data.case_status === 'baseline_ready'
          ? 'Baseline ready'
          : data.case_status === 'delivered'
            ? 'Delivered'
            : data.case_status === 'read_only'
              ? 'Read only'
              : null
  const accessExpiryLabel =
    data.access_expires_at
      ? new Date(data.access_expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : null
  const latestUploadLabel =
    data.latest_upload_at
      ? new Date(data.latest_upload_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'No upload yet'
  const latestReportLabel =
    data.latest_report_at
      ? new Date(data.latest_report_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'No report yet'
  const capitalTight =
    profileContext?.capital_band === 'under_50k_inr' ||
    profileContext?.monthly_income_band === 'student_or_none' ||
    profileContext?.monthly_income_band === 'under_25k_inr'
  const propFocused = profileContext?.trader_focus === 'prop_eval' || profileContext?.trader_focus === 'mixed'
  const expiryDayExposure = profileContext?.primary_instruments.includes('nifty_options') || profileContext?.primary_instruments.includes('banknifty_options')
  const traderMode = data.trader_mode ?? profileContext?.trader_mode ?? sessionMeta?.traderMode ?? 'retail_fn0_struggler'
  const protectionLine = traderMode === 'prop_eval_survival'
    ? 'Protect the rulebook before the rulebook protects the account for you.'
    : traderMode === 'profitable_refiner'
      ? 'Protect process purity. The edge is already there; the leak is in the execution drift.'
      : capitalTight
        ? 'Protect cash runway first. Friction and overtrading hit smaller books hardest.'
        : expiryDayExposure
          ? 'Protect yourself from expiry-day size creep and zero-to-hero impulses.'
          : 'Protect the setup that still pays you and cut the behavior that taxes it.'
  const backendProtectList = data.analysis_summary?.what_to_protect ?? []
  const protectionDirective = backendProtectList[0] ?? protectionLine
  const nextActionLabel = data.analysis_summary?.next_session_command ?? data.next_action ?? sessionMeta?.nextAction ?? 'Carry the next-session mandate into the next real session.'
  const traderModeNarrative = describeTraderMode(traderMode)
  const disciplineDrivers = [
    {
      title: 'What is costing you money right now',
      items: [
        data.discipline_tax_breakdown
          ? `Revenge trading: ${formatMoney(data.discipline_tax_breakdown.revenge_trades, market)}`
          : 'Review the latest revenge-trading sequence',
        data.discipline_tax_breakdown
          ? `Overtrading: ${formatMoney(data.discipline_tax_breakdown.overtrading, market)}`
          : 'Check overtrading pressure across recent sessions',
        data.discipline_tax_breakdown
          ? `Size violations: ${formatMoney(data.discipline_tax_breakdown.size_violations, market)}`
          : 'Audit position size drift before the next session',
      ],
    },
    {
      title: 'What to stop next session',
      items: data.analysis_summary?.current_enemy
        ? [data.analysis_summary.current_enemy, ...tradingMandate.stopNow].slice(0, 4)
        : tradingMandate.stopNow,
    },
    {
      title: 'What to protect',
      items: [
        tradingMandate.doNow[0] || 'Protect capital first.',
        ...(backendProtectList.length ? backendProtectList : [
          data.edge_portfolio[0] ? `Keep pressing: ${data.edge_portfolio[0].name}` : 'Protect the one setup that is still paying you.',
        ]),
        premiumAccess
          ? 'Use alerts and slump workflow before the damage compounds.'
          : 'Upgrade when you need deeper alerts and intervention, not just the baseline.',
        protectionDirective,
      ],
    },
  ]
  const mandateTone = tradingMandate.tone === 'protect'
    ? { borderColor: 'rgba(244, 63, 94, 0.28)', background: 'rgba(244, 63, 94, 0.06)' }
    : tradingMandate.tone === 'focus'
    ? { borderColor: 'rgba(245, 158, 11, 0.28)', background: 'rgba(245, 158, 11, 0.06)' }
    : { borderColor: 'rgba(16, 185, 129, 0.28)', background: 'rgba(16, 185, 129, 0.06)' }
  const campaignMetrics = buildCampaignMetrics({
    entries: readCampaignJournal(sessionMeta?.customerId),
    comparison,
    overview: data,
  })
  const actionBrief = buildActionBrief({
    overview: data,
    mandate: tradingMandate,
    profile: profileContext,
    market,
    premiumAccess,
  })
  const journeyState = buildJourneyState({
    overview: data,
    profile: profileContext,
    sessionMeta,
    market,
  })
  const performanceStory = buildPerformanceStory({
    overview: data,
    profile: profileContext,
    market,
    comparison,
    metrics: campaignMetrics,
  })
  const executionProtocol = buildExecutionProtocol({
    overview: data,
    profile: profileContext,
  })

  // Generate chart data from summary stats
  const equityData = generateEquityData(
    data.pnl_gross || 2000,
    data.discipline_tax_30d || 800,
    data.total_trades || 50
  )
  const taxTrendData = generateTaxTrendData(data.discipline_tax_30d || 800)
  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(actionBrief.copyText)
      setBriefCopied(true)
      window.setTimeout(() => setBriefCopied(false), 1800)
    } catch {
      setBriefCopied(false)
    }
  }
  const handleDownloadReport = () => {
    const artifact = buildReportArtifact({
      overview: data,
      brief: actionBrief,
      mandate: tradingMandate,
      profile: profileContext,
      market,
      premiumAccess,
    })
    downloadReportArtifact(artifact)
    setReportDownloaded(true)
    window.setTimeout(() => setReportDownloaded(false), 1800)
  }

  const sampleActive = isSampleMode()

  return (
    <div className="dashboard-stack">
      {sampleActive && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-5 py-3">
          <p className="text-sm text-amber-200/90">
            <strong className="font-semibold text-amber-100">Sample workspace.</strong>{' '}
            You are viewing demo data. Upload your own trades to see your real analysis.
          </p>
          <Link
            to="/dashboard/upload"
            className="shrink-0 rounded bg-amber-500/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-100 transition-colors hover:bg-amber-500/30"
          >
            Upload Trades
          </Link>
        </div>
      )}
      <JourneyProgressCard state={journeyState} />
      {data.market_context_status === 'estimated' ? (
        <div
          className="glass-panel"
          style={{
            marginBottom: '1.5rem',
            borderColor: 'rgba(245, 158, 11, 0.22)',
            background: 'rgba(245, 158, 11, 0.06)',
          }}
        >
          <p className="badge" style={{ marginBottom: '0.5rem' }}>MARKET CONTEXT</p>
          <h3 style={{ marginBottom: '0.5rem' }}>Behavioral analysis is live. Market-regime overlays are still estimated.</h3>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {data.market_context_note ?? 'The core trader-operating logic is based on your own trade history. Market-context layers become fully trustworthy once real OHLC is connected for your symbols.'}
          </p>
        </div>
      ) : null}
      <MissionBriefCard story={performanceStory} />
      <DailyCommandDeck
        key={`${sessionMeta?.customerId ?? 'anonymous'}-${campaignRefreshToken}`}
        customerId={sessionMeta?.customerId}
        story={performanceStory}
        overview={data}
        metrics={campaignMetrics}
        onUpdate={() => setCampaignRefreshToken((value) => value + 1)}
      />
      <CampaignProofCard
        metrics={campaignMetrics}
        story={performanceStory}
        market={market}
        comparison={comparison}
      />
      <FieldKitCard
        overview={data}
        profile={profileContext}
        story={performanceStory}
        metrics={campaignMetrics}
        market={market}
        premiumAccess={premiumAccess}
      />

      {/* Header */}
      <header className="overview-header">
        <div className="overview-header__text">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="neutral" label={`${data.total_trades || 0} trades analyzed`} />
            <Badge variant="info" label={accessTierLabel} />
            <Badge variant="neutral" label={offerKindLabel} />
            <Badge variant="neutral" label={humanizeTraderMode(traderMode)} />
            <Badge
              variant={data.billing_status === 'past_due' ? 'warning' : data.billing_status === 'active' ? 'success' : 'neutral'}
              label={billingStatusLabel}
            />
            {caseStatusLabel ? <Badge variant="neutral" label={caseStatusLabel} /> : null}
          </div>
          <h1>Mission HQ</h1>
          <p className="text-muted">
            {premiumAccess
              ? 'Start with the most expensive leak, lock the next-session mandate, then use the deeper corrective surfaces only if they change a decision.'
              : 'Start with the most expensive leak, lock the next-session mandate, and use this baseline to decide whether you need the deeper reset layer.'}
          </p>
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

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="badge" style={{ marginBottom: 0 }}>TODAY'S ACTION BOARD</p>
              {!premiumAccess && <ToneBadge tone="focus" />}
              <Badge variant="neutral" label={humanizeTraderMode(traderMode)} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Three things only: the leak, the stop, and the protection.</h3>
            <p className="text-muted" style={{ maxWidth: '60rem' }}>
              {traderModeNarrative} {principle}
            </p>
          </div>
          <Link to="/dashboard/upload" className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Update with new trades
          </Link>
        </div>

        {!profileContext?.completed && (
          <div className="glass-panel" style={{ marginTop: '1rem', borderColor: 'rgba(59, 130, 246, 0.22)', background: 'rgba(59, 130, 246, 0.08)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Complete your trader context before you trust the board.</h4>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              Shibuya adapts better when it knows whether you are trying to survive Indian F&O, pass prop rules, or refine an already profitable process.
            </p>
            <Link to="/dashboard/onboarding" className="btn btn-sm btn-primary" style={{ display: 'inline-flex' }}>
              Complete Trader Context
            </Link>
          </div>
        )}

        {profileContext?.completed && (
          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <p className="badge" style={{ marginBottom: '0.5rem' }}>YOUR CONTEXT</p>
                <h4 style={{ marginBottom: '0.5rem' }}>This board is adapting to your actual trading situation.</h4>
                <p className="text-muted">
                  {propFocused
                    ? 'Prop-eval protection stays near the top because rule survival matters to your process.'
                    : 'Behavioral leak control stays near the top because your main battle is direct trader survival.'}
                </p>
              </div>
              <Link to="/dashboard/onboarding" className="btn btn-sm ghost">Edit Context</Link>
            </div>

            <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Capital / income</h4>
                <p className="text-muted">
                  {profileContext.capital_band.replaceAll('_', ' ')} · {profileContext.monthly_income_band.replaceAll('_', ' ')}
                </p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Trader focus</h4>
                <p className="text-muted">{humanizeFocus(profileContext.trader_focus)} · {humanizeTraderMode(traderMode)}</p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Platform / instruments</h4>
                <p className="text-muted">
                  {profileContext.broker_platform} · {profileContext.primary_instruments.map(humanizeInstrument).join(', ')}
                </p>
              </article>
            </div>
          </div>
        )}

        <div className="grid-responsive three" style={{ marginTop: '1.25rem' }}>
          {disciplineDrivers.map((card) => (
            <article key={card.title} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>{card.title}</h4>
              <ul className="digest-preview">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="badge" style={{ marginBottom: 0 }}>PROFESSIONAL STANDARD</p>
                <Badge
                  variant={
                    executionProtocol.standardLevel === 'loss_of_command'
                      ? 'danger'
                      : executionProtocol.standardLevel === 'under_pressure'
                        ? 'warning'
                        : 'success'
                  }
                  label={
                    executionProtocol.standardLevel === 'loss_of_command'
                      ? 'Loss of command'
                      : executionProtocol.standardLevel === 'under_pressure'
                        ? 'Under pressure'
                        : 'In control'
                  }
                />
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>{executionProtocol.headline}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {executionProtocol.summary}
              </p>
            </div>
            <Link to="/dashboard/protocol" className="btn btn-sm btn-secondary">
              Open protocol
            </Link>
          </div>
        </div>

        <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>What happens next</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {nextActionLabel}
              </p>
            </div>
            <Link to="/dashboard/access" className="btn btn-sm btn-secondary">
              Billing + Access
            </Link>
          </div>
        </div>

        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="badge" style={{ marginBottom: 0 }}>BACKEND VERDICT</p>
              <Badge
                variant={
                  data.recovery_ladder === 'loss_of_command'
                    ? 'danger'
                    : data.recovery_ladder === 'under_pressure'
                      ? 'warning'
                      : 'success'
                }
                label={
                  data.recovery_ladder === 'loss_of_command'
                    ? 'Loss of command'
                    : data.recovery_ladder === 'under_pressure'
                      ? 'Under pressure'
                      : 'In control'
                }
              />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>{data.analysis_summary?.edge_verdict ?? 'Core verdict loading...'}</h4>
            <ul className="digest-preview" style={{ marginBottom: 0 }}>
              <li>{data.analysis_summary?.adherence_verdict ?? 'Standards verdict unavailable.'}</li>
              <li>{data.analysis_summary?.risk_ruin_posture ?? 'Risk posture unavailable.'}</li>
              <li>{data.analysis_summary?.drift_posture ?? 'Drift posture unavailable.'}</li>
            </ul>
          </article>

          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="badge" style={{ marginBottom: 0 }}>DELIVERY STATE</p>
              {data.review_summary?.eligible ? (
                <Badge variant="success" label="2 touchpoints included" />
              ) : (
                <Badge variant="neutral" label="Self-serve loop" />
              )}
            </div>
            <ul className="digest-preview" style={{ marginBottom: 0 }}>
              <li>
                Kickoff review: {data.review_summary?.touchpoint_1_status ?? 'locked'}
              </li>
              <li>
                Follow-up review: {data.review_summary?.touchpoint_2_status ?? 'locked'}
              </li>
              <li>
                Support load: {data.support_summary?.open_count ?? 0} open ticket{(data.support_summary?.open_count ?? 0) === 1 ? '' : 's'}
              </li>
              <li>
                Artifact pack: {data.artifact_descriptors?.length ?? 0} deliverable{(data.artifact_descriptors?.length ?? 0) === 1 ? '' : 's'} ready
              </li>
            </ul>
          </article>
        </div>
      </section>

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

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="badge" style={{ marginBottom: 0 }}>RESET BRIEF</p>
              <Badge variant={premiumAccess ? 'success' : 'neutral'} label={accessTierLabel} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{actionBrief.title}</h3>
            <p className="text-muted" style={{ maxWidth: '60rem' }}>{actionBrief.subtitle}</p>
          </div>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link to="/dashboard/reports" className="btn btn-sm btn-secondary">
              <BarChart2 className="w-4 h-4" />
              View Report Library
            </Link>
            <button className="btn btn-sm btn-secondary" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleDownloadReport}>
              <Download className="w-4 h-4" />
              {reportDownloaded ? 'Downloaded' : premiumAccess ? 'Download Reset Report' : 'Download Baseline Report'}
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => void handleCopyBrief()}>
              {briefCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {briefCopied ? 'Copied' : 'Copy Brief'}
            </button>
          </div>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1.25rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>What is leaking</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>{actionBrief.leakHeadline}</p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Do now</h4>
            <ul className="digest-preview">
              {actionBrief.doNow.map((item) => (<li key={item}>{item}</li>))}
            </ul>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Stop and protect</h4>
            <ul className="digest-preview">
              {actionBrief.stopNow.map((item) => (<li key={item}>{item}</li>))}
              <li>{actionBrief.protectLine}</li>
            </ul>
          </article>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Account continuity</h4>
            <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
              {data.case_status === 'read_only'
                ? 'This one-time reset window is now read only. Review the board and history, then renew access if you want to upload fresh data again.'
                : data.guided_review_status === 'booked'
                  ? 'Your guided review is booked. Review the board, carry the mandate, and show up with the next decision changes you actually made.'
                : data.guided_review_status === 'completed'
                  ? 'Guided review is complete. Use the follow-up window to prove the leak actually changed, not just the narrative.'
                : data.guided_review_included && data.case_status === 'call_pending'
                ? 'Your first meaningful upload is in. Review the brief, then book the guided reset checkpoint before the next session.'
                : data.billing_status === 'past_due'
                ? 'There is a billing issue on the account. Fix continuity first so your live reset loop does not go dark.'
                : data.billing_status === 'canceled'
                  ? 'This account is marked canceled. Renew it before you lose the live reset loop and history continuity.'
                  : data.offer_kind === 'reset_intensive' || data.offer_kind === 'next_session_reset'
                    ? 'Reset Intensive is active. Use the 30-day window hard, book the kickoff review, and turn the brief into a real reset.'
                    : data.offer_kind === 'psych_audit' || data.offer_kind === 'edge_or_behavior'
                      ? 'Psych Audit is active as a one-time reset window. Keep the loop simple, work the brief, and decide later if continuity is justified.'
                  : premiumAccess
                    ? 'Reset Pro is active. Use the deeper corrective surfaces only when they clearly change the next decision.'
                    : 'Psych Audit is active. Stay brutally simple until the baseline is clean enough to justify deeper intervention.'}
            </p>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              <Badge variant="neutral" label={billingStatusLabel} />
              <Badge variant="info" label={accessTierLabel} />
              <Badge variant="neutral" label={offerKindLabel} />
              {accessExpiryLabel ? <Badge variant="neutral" label={`Window ends ${accessExpiryLabel}`} /> : null}
              {data.days_left != null && oneTimeAccess ? <Badge variant="neutral" label={`${data.days_left} day${data.days_left === 1 ? '' : 's'} left`} /> : null}
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/dashboard/workspace" className="btn btn-sm btn-secondary">
                Open workspace status
              </Link>
              {data.guided_review_included && data.guided_review_url ? (
                <a
                  href={data.guided_review_url}
                  className="btn btn-sm btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: '0.5rem' }}
                >
                  Book guided review
                </a>
              ) : null}
            </div>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Delivery facts</h4>
            <ul className="digest-preview">
              <li>
                Uploads used: {data.upload_count ?? 0}
                {data.upload_limit ? ` / ${data.upload_limit}` : ' (live tier)'}
              </li>
              <li>
                {data.upload_limit
                  ? `Uploads remaining: ${data.uploads_remaining ?? 0}`
                  : 'Uploads remaining: unlimited while continuity is active'}
              </li>
              <li>Latest upload: {latestUploadLabel}</li>
              <li>Reports ready: {data.reports_ready ?? 0}</li>
              <li>Latest report: {latestReportLabel}</li>
            </ul>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Context fit</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {profileContext
                ? `Built around ${humanizeFocus(profileContext.trader_focus).toLowerCase()} with ${profileContext.primary_instruments.map(humanizeInstrument).join(', ')} as the main instrument focus.`
                : 'Complete trader context so the board can adapt to whether you are surviving Indian F&O, protecting prop rules, or refining an already profitable edge.'}
            </p>
          </article>
        </div>
      </section>

      {/* Equity Curve - visual proof of discipline tax */}
      <div className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
        <ChartCard
          title="Actual vs Potential Equity"
          subtitle="The gap between lines is money your behavior cost you"
          height={180}
          headerRight={<EngineTag engineId="dean" label="DEAN attribution" />}
        >
          <EquityCurve data={equityData} height={180} market={market} />
        </ChartCard>

        <ChartCard
          title="Behavioral Cost — 30 Day Trend"
          subtitle="Are your errors getting worse or better?"
          height={180}
          headerRight={<EngineTag engineId="bql" label="BQL + DEAN" />}
        >
          <div className="mb-3">
            <span className="text-2xl font-mono font-bold text-rose-400">
              {formatMoney(data.discipline_tax_30d, market)}
            </span>
            <span className="text-xs text-neutral-500 ml-2">this month</span>
          </div>
          <DisciplineTaxTrend data={taxTrendData} height={120} market={market} />
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
            <span className="tax-amount">{formatMoney(data.discipline_tax_30d, market)}</span>
          </div>
          <p className="discipline-tax-subtitle">
            This is money you <em>earned</em>, then gave back through behavioral errors.
          </p>

          {data.discipline_tax_breakdown && (
            <div className="tax-breakdown">
              <div className="tax-breakdown-item">
                <Badge variant="danger" label="Revenge" icon={false} />
                <div>
                  <span className="breakdown-value">{formatMoney(data.discipline_tax_breakdown.revenge_trades, market)}</span>
                  <span className="breakdown-label">
                    Revenge Trades
                    <InfoTooltip content={<div style={{maxWidth:'260px'}}><strong>Revenge Trading</strong><p style={{margin:'0.5rem 0 0',fontSize:'0.8rem',lineHeight:1.5}}>Taking quick trades after a loss to "get your money back." These have a much lower win rate because they're emotional, not planned.</p></div>} position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <Badge variant="warning" label="Overtrade" icon={false} />
                <div>
                  <span className="breakdown-value">{formatMoney(data.discipline_tax_breakdown.overtrading, market)}</span>
                  <span className="breakdown-label">
                    Overtrading
                    <InfoTooltip content={<div style={{maxWidth:'260px'}}><strong>Overtrading</strong><p style={{margin:'0.5rem 0 0',fontSize:'0.8rem',lineHeight:1.5}}>More trades doesn't mean more profit. Usually means more commissions and lower-quality setups.</p></div>} position="bottom" />
                  </span>
                </div>
              </div>
              <div className="tax-breakdown-item">
                <Badge variant="warning" label="Sizing" icon={false} />
                <div>
                  <span className="breakdown-value">{formatMoney(data.discipline_tax_breakdown.size_violations, market)}</span>
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
              <span className="comparison-value positive">{formatSignedMoney(data.pnl_gross || 0, market)}</span>
            </div>
            <div className="comparison-item">
              <span className="comparison-label">Net PnL (after tax)</span>
              <span className="comparison-value">{formatSignedMoney(data.pnl_net || 0, market)}</span>
            </div>
            <div className="comparison-item highlight">
              <span className="comparison-label">Money Left on Table</span>
              <span className="comparison-value negative">{formatSignedMoney(-Math.abs(data.discipline_tax_30d), market)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Metrics Grid */}
      <div className="grid-responsive three">
        <MetricCard
          label="Monte Carlo Edge"
          value={formatSignedMoney(data.monte_carlo_drift, market)}
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
                <div className="error-cost">{formatSignedMoney(-Math.abs(err.cost), market)}</div>
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
                      {formatSignedMoney(edge.pnl, market)}
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
