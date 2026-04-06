import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { getDashboardOverview, getTraderProfileContext } from '../../lib/api'
import { formatMoney, humanizeFocus, humanizeInstrument } from '../../lib/display'
import { buildJourneyState } from '../../lib/journeyState'
import { readRecentOrderAccess } from '../../lib/recentAccess'
import { getSessionDaysRemaining, getStoredSessionMeta, hasPremiumAccess, isOneTimeOffer, isReadOnlySession, isSampleMode } from '../../lib/runtime'
import { describeTraderMode, humanizeTraderMode } from '../../lib/traderMode'
import type { DashboardOverview, TraderProfileContext } from '../../lib/types'

function humanizeCaseStatus(caseStatus?: string | null): string {
  switch (caseStatus) {
    case 'awaiting_activation':
      return 'Awaiting activation'
    case 'awaiting_onboarding':
      return 'Awaiting trader context'
    case 'awaiting_upload':
      return 'Awaiting first upload'
    case 'processing':
      return 'Processing data'
    case 'baseline_ready':
      return 'Baseline ready'
    case 'call_pending':
      return 'Guided review pending'
    case 'follow_up_ready':
      return 'Follow-up review ready'
    case 'delivered':
      return 'Delivered'
    case 'read_only':
      return 'Read only'
    case 'closed':
      return 'Closed'
    default:
      return 'Live'
  }
}

function humanizeDataSource(dataSource?: string | null): string {
  switch (dataSource) {
    case 'broker_csv':
      return 'Broker CSV upload'
    case 'contract_note_email':
      return 'Contract note email'
    case 'mt5_ea':
      return 'MT5 EA'
    case 'broker_api':
      return 'Broker API'
    case 'manual_upload':
    case 'manual':
      return 'Manual upload'
    default:
      return 'Manual upload'
  }
}

function humanizeTier(tier?: string | null, premiumAccess?: boolean, sampleMode?: boolean): string {
  if (sampleMode) {
    return 'Sample workspace'
  }
  if (premiumAccess || tier === 'reset_pro') {
    return 'Reset Pro'
  }
  return 'Psych Audit'
}

function humanizeOfferKind(offerKind?: string | null): string {
  switch (offerKind) {
    case 'psych_audit':
    case 'edge_or_behavior':
      return 'One-time audit'
    case 'reset_intensive':
    case 'next_session_reset':
      return 'One-time reset'
    case 'psych_audit_live':
      return 'Monthly live'
    case 'reset_pro_live':
      return 'Monthly reset live'
    case 'sample':
      return 'Sample'
    default:
      return 'Live access'
  }
}

function humanizeCapitalBand(value?: string | null): string {
  switch (value) {
    case 'under_50k_inr':
      return 'Under ₹50k'
    case '50k_to_250k_inr':
      return '₹50k to ₹2.5L'
    case '250k_to_1m_inr':
      return '₹2.5L to ₹10L'
    case 'over_1m_inr':
      return 'Above ₹10L'
    default:
      return 'Not set'
  }
}

function humanizeIncomeBand(value?: string | null): string {
  switch (value) {
    case 'student_or_none':
      return 'Student / no income'
    case 'under_25k_inr':
      return 'Under ₹25k/month'
    case '25k_to_75k_inr':
      return '₹25k to ₹75k/month'
    case '75k_to_200k_inr':
      return '₹75k to ₹2L/month'
    case 'over_200k_inr':
      return 'Above ₹2L/month'
    default:
      return 'Not set'
  }
}

function buildNextMilestone({
  overview,
  profile,
  sampleMode,
  readOnly,
}: {
  overview: DashboardOverview | null
  profile: TraderProfileContext | null
  sampleMode: boolean
  readOnly: boolean
}): { title: string; detail: string; ctaLabel: string; ctaTo: string } {
  if (sampleMode) {
    return {
      title: 'Move into live mode',
      detail: 'The sample workspace teaches the loop. A paid workspace is where uploads, reports, and continuity start to matter.',
      ctaLabel: 'See live pricing',
      ctaTo: '/pricing',
    }
  }

  if (!profile?.completed) {
    return {
      title: 'Complete trader context',
      detail: 'Capital, income pressure, broker, and instrument focus all change what a good mandate should look like.',
      ctaLabel: 'Open onboarding',
      ctaTo: '/dashboard/onboarding',
    }
  }

  if ((overview?.upload_count ?? 0) === 0 || overview?.case_status === 'awaiting_upload') {
    return {
      title: 'Upload the first session',
      detail: 'The first upload turns the workspace from setup into a real diagnosis.',
      ctaLabel: 'Upload trades',
      ctaTo: '/dashboard/upload',
    }
  }

  if ((overview?.reports_ready ?? 0) === 0 || overview?.case_status === 'baseline_ready') {
    return {
      title: 'Review the baseline brief',
      detail: 'The baseline only matters if you carry the next-session mandate into the next real session.',
      ctaLabel: 'Open Action Board',
      ctaTo: '/dashboard',
    }
  }

  if (overview?.guided_review_included && overview?.case_status === 'call_pending') {
    return {
      title: 'Lock the reset with guided review',
      detail: 'Your first meaningful upload is in. Review the board, then book the guided checkpoint before the next session slips back into noise.',
      ctaLabel: 'Open reports',
      ctaTo: '/dashboard/reports',
    }
  }

  if (readOnly) {
    return {
      title: 'Reopen the loop',
      detail: 'This one-time window is now read only. Reopen it with a fresh package or a monthly tier if you want new uploads.',
      ctaLabel: 'See pricing',
      ctaTo: '/pricing?upgrade=reset-pro',
    }
  }

  return {
    title: 'Append another meaningful session',
    detail: 'Do not upload noise. Upload after a real session change so the next brief tightens instead of restating the same issue.',
    ctaLabel: 'Upload another session',
    ctaTo: '/dashboard/upload',
  }
}

export function WorkspacePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const sessionMeta = getStoredSessionMeta()
  const sampleMode = isSampleMode()
  const premiumAccess = hasPremiumAccess()
  const readOnly = isReadOnlySession(sessionMeta)
  const market = sessionMeta?.market ?? 'india'
  const recentAccess = readRecentOrderAccess()

  useEffect(() => {
    let active = true

    async function loadWorkspace() {
      try {
        setLoading(true)
        setError(null)

        if (sampleMode) {
          if (!active) {
            return
          }
          setOverview(null)
          setProfile(null)
          return
        }

        const [nextOverview, nextProfile] = await Promise.all([
          getDashboardOverview(),
          getTraderProfileContext().catch(() => null),
        ])

        if (!active) {
          return
        }
        setOverview(nextOverview)
        setProfile(nextProfile)
      } catch (err) {
        if (!active) {
          return
        }
        setError(err instanceof Error ? err.message : 'Unable to load workspace status.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadWorkspace()
    return () => {
      active = false
    }
  }, [sampleMode])

  const effectiveOfferKind = overview?.offer_kind ?? sessionMeta?.offerKind
  const oneTimeAccess = isOneTimeOffer(effectiveOfferKind)
  const effectiveCaseStatus = overview?.case_status ?? sessionMeta?.caseStatus
  const effectiveTraderMode = overview?.trader_mode ?? profile?.trader_mode ?? sessionMeta?.traderMode ?? null
  const effectiveExpiry = overview?.access_expires_at ?? sessionMeta?.accessExpiresAt ?? null
  const effectiveReadOnly = readOnly || effectiveCaseStatus === 'read_only'
  const effectiveDaysRemaining = getSessionDaysRemaining({
    ...sessionMeta,
    accessExpiresAt: effectiveExpiry,
  })
  const nextMilestone = buildNextMilestone({
    overview,
    profile,
    sampleMode,
    readOnly: effectiveReadOnly,
  })
  const journeyState = buildJourneyState({
    overview,
    profile,
    sessionMeta,
    market,
  })

  if (loading) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>Loading workspace status...</h3>
          <p className="text-muted">Pulling access, context, upload, and delivery state for this workspace.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load workspace status</h3>
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
      <JourneyProgressCard state={journeyState} />

      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>WORKSPACE STATUS</p>
            <h1 style={{ marginBottom: '0.5rem' }}>Everything this workspace knows about your paid loop.</h1>
            <p className="text-muted" style={{ maxWidth: '56rem' }}>
              This page exists so you do not have to guess what you bought, what state the workspace is in, what still needs doing, or what happens next.
            </p>
          </div>
          <Link to={nextMilestone.ctaTo} className="btn btn-sm btn-primary">
            {nextMilestone.ctaLabel}
          </Link>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Offer and access</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.3rem', fontWeight: 700 }}>
              {humanizeTier(overview?.access_tier ?? sessionMeta?.tier, premiumAccess, sampleMode)}
            </p>
            <p className="text-muted" style={{ marginBottom: '0.35rem' }}>
              {humanizeOfferKind(effectiveOfferKind)}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {sampleMode
                ? 'Sample mode never persists your trading data.'
                : oneTimeAccess
                  ? effectiveReadOnly
                    ? 'This one-time reset window is now read only.'
                    : effectiveDaysRemaining != null
                      ? `${effectiveDaysRemaining} day${effectiveDaysRemaining === 1 ? '' : 's'} left in the current window.`
                      : 'One-time access window is active.'
                  : 'Monthly continuity is active as long as the billing state stays healthy.'}
            </p>
          </article>

          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Current case state</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.3rem', fontWeight: 700 }}>
              {humanizeCaseStatus(effectiveCaseStatus)}
            </p>
            <p className="text-muted" style={{ marginBottom: '0.35rem' }}>
              Data source: {humanizeDataSource(overview?.data_source ?? sessionMeta?.dataSource)}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {nextMilestone.detail}
            </p>
          </article>

          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Delivery trail</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.3rem', fontWeight: 700 }}>
              {overview?.reports_ready ?? 0} artifact{(overview?.reports_ready ?? 0) === 1 ? '' : 's'}
            </p>
            <p className="text-muted" style={{ marginBottom: '0.35rem' }}>
              Uploads: {overview?.upload_count ?? 0}{overview?.upload_limit ? ` / ${overview.upload_limit}` : ''}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {overview?.latest_report_at
                ? `Latest report recorded ${new Date(overview.latest_report_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.`
                : 'No archived report yet. The first real brief should leave a permanent artifact here.'}
            </p>
          </article>
        </div>
      </section>

      <section className="grid-responsive two">
        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>TRADER CONTEXT</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Who this workspace thinks you are.</h3>
          {!profile?.completed ? (
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Trader context is still incomplete. That means the board is still protecting against guesswork instead of adapting to your actual capital pressure, instruments, and goal.
            </p>
          ) : (
            <div className="grid-responsive two" style={{ gap: '0.75rem' }}>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.35rem' }}>Trading goal</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{humanizeFocus(profile.trader_focus)}</p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.35rem' }}>Broker / platform</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{profile.broker_platform}</p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.35rem' }}>Capital band</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{humanizeCapitalBand(profile.capital_band)}</p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '0.35rem' }}>Income pressure</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{humanizeIncomeBand(profile.monthly_income_band)}</p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', gridColumn: '1 / -1' }}>
                <h4 style={{ marginBottom: '0.35rem' }}>Trader mode</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>
                  {effectiveTraderMode ? `${humanizeTraderMode(effectiveTraderMode)} · ${describeTraderMode(effectiveTraderMode)}` : 'Mode is not derived yet because trader context is incomplete.'}
                </p>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', gridColumn: '1 / -1' }}>
                <h4 style={{ marginBottom: '0.35rem' }}>Instrument focus</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>
                  {profile.primary_instruments.map(humanizeInstrument).join(', ')}
                </p>
              </article>
            </div>
          )}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/dashboard/onboarding" className="btn btn-sm btn-secondary">
              {profile?.completed ? 'Update trader context' : 'Complete trader context'}
            </Link>
          </div>
        </article>

        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>ACCESS TIMELINE</p>
          <h3 style={{ marginBottom: '0.75rem' }}>What happened, what is left, what to do now.</h3>
          <div className="grid-responsive two" style={{ gap: '0.75rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Latest upload</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {overview?.latest_upload_at
                  ? new Date(overview.latest_upload_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'No upload yet'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Access expiry</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {effectiveExpiry
                  ? new Date(effectiveExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'No expiry set'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Uploads remaining</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {overview?.upload_limit
                  ? `${overview.uploads_remaining ?? 0} of ${overview.upload_limit}`
                  : 'Not capped on live continuity'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Most recent order</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {recentAccess?.orderCode ?? 'Not stored on this device'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', gridColumn: '1 / -1' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Guided review</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                {overview?.guided_review_included
                  ? overview.guided_review_status === 'invited'
                    ? 'The guided reset checkpoint is unlocked. Review the board, then book the call.'
                    : 'This workspace includes guided review after the first meaningful upload.'
                  : 'This offer is self-serve by default. Upgrade only if the live board proves deeper intervention is justified.'}
              </p>
              {overview?.guided_review_included && overview.guided_review_url ? (
                <a href={overview.guided_review_url} className="btn btn-sm btn-secondary" target="_blank" rel="noreferrer">
                  Book guided review
                </a>
              ) : (
                <span className="badge">{overview?.guided_review_included ? 'Unlock after first upload' : 'Not included'}</span>
              )}
              {(overview?.guided_review_booked_at || overview?.guided_review_completed_at) && (
                <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {overview?.guided_review_completed_at
                    ? `Completed ${new Date(overview.guided_review_completed_at).toLocaleString('en-IN')}.`
                    : overview?.guided_review_booked_at
                      ? `Booked ${new Date(overview.guided_review_booked_at).toLocaleString('en-IN')}.`
                      : null}
                </p>
              )}
            </article>
          </div>
          {recentAccess?.planName || recentAccess?.email ? (
            <p className="text-muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
              {recentAccess.planName ? `${recentAccess.planName}` : 'Latest purchase'}{recentAccess.email ? ` for ${recentAccess.email}` : ''}.
            </p>
          ) : null}
        </article>
      </section>

      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>NEXT MILESTONE</p>
            <h3 style={{ marginBottom: '0.5rem' }}>{nextMilestone.title}</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>{nextMilestone.detail}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {nextMilestone.ctaTo.startsWith('http') ? (
              <a href={nextMilestone.ctaTo} className="btn btn-sm btn-primary" target="_blank" rel="noreferrer">
                {nextMilestone.ctaLabel}
              </a>
            ) : (
              <Link to={nextMilestone.ctaTo} className="btn btn-sm btn-primary">
                {nextMilestone.ctaLabel}
              </Link>
            )}
            <Link to="/dashboard/reports" className="btn btn-sm btn-secondary">
              Open reports
            </Link>
            <Link to="/dashboard/access" className="btn btn-sm btn-secondary">
              Billing + Access
            </Link>
            {overview?.guided_review_included && overview.guided_review_url ? (
              <a href={overview.guided_review_url} className="btn btn-sm btn-secondary" target="_blank" rel="noreferrer">
                Book guided review
              </a>
            ) : null}
          </div>
        </div>

        {!sampleMode && overview?.discipline_tax_30d != null && (
          <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Behavioral leak</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {formatMoney(overview.discipline_tax_30d, market)}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Net P&L</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {formatMoney(overview.pnl_net ?? 0, market)}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Trades analyzed</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {overview.total_trades ?? 0}
              </p>
            </article>
          </div>
        )}
      </section>
    </div>
  )
}
