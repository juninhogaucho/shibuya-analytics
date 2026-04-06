import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { WelcomeModal } from '../components/ui/WelcomeModal'
import { getDashboardOverview } from '../lib/api'
import { buildJourneyState } from '../lib/journeyState'
import { addMarketToPath } from '../lib/market'
import { clearShibuyaSession, getSessionDaysRemaining, getStoredSessionMeta, hasPremiumAccess, isOneTimeOffer, isReadOnlySession, isSampleMode } from '../lib/runtime'
import { isSessionGateCompleteToday } from '../lib/sessionGate'
import type { DashboardOverview } from '../lib/types'

interface NavItem {
  label: string
  to: string
  premium?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Mission HQ', to: '/dashboard' },
  { label: 'Onboarding', to: '/dashboard/onboarding' },
  { label: 'Campaign Review', to: '/dashboard/campaign-review' },
  { label: 'Session Gate', to: '/dashboard/gate' },
  { label: 'Protocol', to: '/dashboard/protocol' },
  { label: 'Workspace', to: '/dashboard/workspace' },
  { label: 'Access', to: '/dashboard/access' },
  { label: 'Reports', to: '/dashboard/reports' },
  { label: 'Trade History', to: '/dashboard/history' },
  { label: 'Upload Trades', to: '/dashboard/upload' },
  { label: 'Alerts', to: '/dashboard/alerts', premium: true },
  { label: 'Reset Rx', to: '/dashboard/slump', premium: true },
  { label: 'Edge Portfolio', to: '/dashboard/edges', premium: true },
  { label: 'Shadow Boxing', to: '/dashboard/shadow-boxing', premium: true },
]

const BREADCRUMB_LABELS: Record<string, string> = {
  '/dashboard': 'Mission HQ',
  '/dashboard/onboarding': 'Onboarding',
  '/dashboard/campaign-review': 'Campaign Review',
  '/dashboard/gate': 'Session Gate',
  '/dashboard/protocol': 'Protocol',
  '/dashboard/workspace': 'Workspace',
  '/dashboard/access': 'Access',
  '/dashboard/reports': 'Reports',
  '/dashboard/history': 'Trade History',
  '/dashboard/upload': 'Upload Trades',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/slump': 'Reset Rx',
  '/dashboard/edges': 'Edge Portfolio',
  '/dashboard/shadow-boxing': 'Shadow Boxing',
}

function humanizeCaseStatus(value?: string | null, premiumAccess = false): string {
  switch (value) {
    case 'awaiting_onboarding':
      return 'Finish trader context'
    case 'awaiting_upload':
      return 'Upload the first session'
    case 'baseline_ready':
      return 'Review the baseline brief'
    case 'read_only':
      return 'Read only'
    case 'call_pending':
      return 'Book guided review'
    case 'follow_up_ready':
      return 'Review follow-up delta'
    case 'processing':
      return 'Processing upload'
    default:
      return premiumAccess ? 'Live reset loop active' : 'Core loop active'
  }
}

interface StatusCardConfig {
  label: string
  title: string
  body: string
  ctaLabel?: string
  ctaTo?: string
}

export function DashboardLayout() {
  const [sampleWorkspace] = useState(() => isSampleMode())
  const [shellOverview, setShellOverview] = useState<DashboardOverview | null>(null)
  const sessionMeta = getStoredSessionMeta()
  const rawPremiumAccess = hasPremiumAccess()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpenFor, setMobileMenuOpenFor] = useState<string | null>(null)
  const isMobileMenuOpen = mobileMenuOpenFor === location.key
  const setIsMobileMenuOpen = (open: boolean) => {
    setMobileMenuOpenFor(open ? location.key : null)
  }

  useEffect(() => {
    if (sampleWorkspace) {
      return
    }

    let active = true

    async function loadShellOverview() {
      try {
        const overview = await getDashboardOverview()
        if (!active) {
          return
        }
        setShellOverview(overview)
      } catch {
        if (active) {
          setShellOverview(null)
        }
      }
    }

    void loadShellOverview()
    return () => {
      active = false
    }
  }, [location.pathname, sampleWorkspace])

  const effectivePremiumAccess = shellOverview?.access_tier === 'reset_pro' || rawPremiumAccess
  const effectiveOfferKind = shellOverview?.offer_kind ?? sessionMeta?.offerKind
  const effectiveCaseStatus = shellOverview?.case_status ?? sessionMeta?.caseStatus
  const effectiveMarket = sessionMeta?.market ?? 'india'
  const readOnlyAccess = effectiveCaseStatus === 'read_only' || isReadOnlySession(sessionMeta)
  const oneTimeAccess = isOneTimeOffer(effectiveOfferKind)
  const daysRemaining = shellOverview?.days_left ?? getSessionDaysRemaining(sessionMeta)
  const sessionGateComplete = isSessionGateCompleteToday(sessionMeta?.customerId)
  const journeyState = buildJourneyState({
    overview: shellOverview,
    profile: null,
    sessionMeta,
    market: effectiveMarket,
  })

  let statusCard: StatusCardConfig | null = null
  if (sampleWorkspace) {
    statusCard = {
      label: 'SAMPLE MODE',
      title: 'You are exploring the loop, not writing to a live account.',
      body: 'Sample mode is for inspection. The live workspace is where uploads persist, artifacts stack, and the operating record becomes real.',
      ctaLabel: 'See live pricing',
      ctaTo: addMarketToPath('/pricing', effectiveMarket),
    }
  } else if (readOnlyAccess) {
    statusCard = {
      label: 'READ ONLY',
      title: 'The reset window ended. Review the work, then reopen the loop.',
      body: 'This workspace is still useful for review, but fresh uploads now require a new package or live monthly access.',
      ctaLabel: 'Renew access',
      ctaTo: addMarketToPath('/pricing?upgrade=reset-pro', effectiveMarket),
    }
  } else if (shellOverview?.billing_status === 'past_due') {
    statusCard = {
      label: 'BILLING',
      title: 'The workspace needs billing attention before continuity breaks.',
      body: 'Open Access to review the plan state and fix the issue before the live loop goes stale.',
      ctaLabel: 'Open access',
      ctaTo: '/dashboard/access',
    }
  } else if (effectiveCaseStatus === 'awaiting_onboarding') {
    statusCard = {
      label: 'START HERE',
      title: 'Finish trader context before you trust the board.',
      body: 'Capital band, income pressure, trader focus, broker, and instrument mix change what good advice looks like.',
      ctaLabel: 'Open onboarding',
      ctaTo: '/dashboard/onboarding',
    }
  } else if (effectiveCaseStatus === 'awaiting_upload') {
    statusCard = {
      label: 'FIRST UPLOAD',
      title: 'The product starts once your own trade history is on screen.',
      body: 'Use the upload concierge, push the first meaningful session through, and let the baseline become real.',
      ctaLabel: 'Upload trades',
      ctaTo: '/dashboard/upload',
    }
  } else if (effectiveCaseStatus === 'baseline_ready') {
    statusCard = {
      label: 'BASELINE READY',
      title: 'Your first brief is ready. Carry it into the next real session.',
      body: 'Do not bounce around the sidebar yet. Start at Mission HQ, read the mandate, then use Session Gate before the next order.',
      ctaLabel: 'Open Mission HQ',
      ctaTo: '/dashboard',
    }
  } else if (!sessionGateComplete && location.pathname !== '/dashboard/gate') {
    statusCard = {
      label: 'SESSION GATE',
      title: 'Today’s gate is still open.',
      body: 'No first order without a written setup, invalidation, and kill criteria. Lock the gate before you trade.',
      ctaLabel: 'Open Session Gate',
      ctaTo: '/dashboard/gate',
    }
  } else if (oneTimeAccess && daysRemaining !== null && daysRemaining <= 3) {
    statusCard = {
      label: 'RESET WINDOW',
      title: daysRemaining === 0 ? 'The window closes today.' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left in the current window.`,
      body: 'Use the remaining time on real uploads, real briefs, and a real delta instead of letting the package decay.',
      ctaLabel: 'Upload next session',
      ctaTo: '/dashboard/upload',
    }
  }

  let focusNavWhitelist: Set<string> | null = null
  if (effectiveCaseStatus === 'awaiting_onboarding') {
    focusNavWhitelist = new Set<string>(['/dashboard', '/dashboard/access', '/dashboard/onboarding'])
  } else if (effectiveCaseStatus === 'awaiting_upload') {
    focusNavWhitelist = new Set<string>(['/dashboard', '/dashboard/access', '/dashboard/upload', '/dashboard/workspace'])
  } else if (effectiveCaseStatus === 'baseline_ready') {
    focusNavWhitelist = new Set<string>(['/dashboard', '/dashboard/access', '/dashboard/upload', '/dashboard/reports', '/dashboard/gate', '/dashboard/protocol'])
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (readOnlyAccess && item.to === '/dashboard/upload') {
      return false
    }
    if (item.to === '/dashboard/onboarding' && effectiveCaseStatus !== 'awaiting_onboarding') {
      return false
    }
    if (!effectivePremiumAccess && item.premium) {
      return false
    }
    if (focusNavWhitelist && !focusNavWhitelist.has(item.to) && item.to !== location.pathname) {
      return false
    }
    return true
  })

  const breadcrumbs = [{ label: 'Dashboard', to: '/dashboard' }]
  if (location.pathname !== '/dashboard') {
    const label = BREADCRUMB_LABELS[location.pathname] ?? location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Current'
    breadcrumbs.push({ label, to: location.pathname })
  }

  const sidebarStatusLabel = sampleWorkspace
    ? 'SAMPLE MODE'
    : readOnlyAccess
      ? 'WINDOW CLOSED'
      : oneTimeAccess
        ? daysRemaining === null
          ? 'RESET WINDOW'
          : daysRemaining === 1
            ? '1 DAY LEFT'
            : `${daysRemaining} DAYS LEFT`
        : 'LIVE ACCESS'

  const handleSignOut = () => {
    clearShibuyaSession()
    navigate('/')
  }

  const handleUpgrade = () => {
    navigate(addMarketToPath('/pricing?upgrade=reset-pro', effectiveMarket), { replace: true })
  }

  const shouldShowNavigator =
    Boolean(journeyState.nextAction)
    && location.pathname !== journeyState.nextAction?.to
    && ['awaiting_onboarding', 'awaiting_upload', 'baseline_ready'].includes(effectiveCaseStatus ?? '')

  return (
    <div className="dashboard-layout">
      <WelcomeModal />

      <header className="mobile-header">
        <div className="mobile-brand">
          <span className="brand-text">Shibuya</span>
          <span className="brand-badge">{effectivePremiumAccess ? 'RESET PRO' : 'PSYCH AUDIT'}</span>
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? 'X' : 'MENU'}
        </button>
      </header>

      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span>Shibuya</span>
          <span className="brand-badge">{effectivePremiumAccess ? 'RESET PRO' : 'PSYCH AUDIT'}</span>
        </div>

        <div className="demo-mode-banner">
          <div className="demo-badge">{sidebarStatusLabel}</div>
          <p className="demo-hint">{humanizeCaseStatus(effectiveCaseStatus, effectivePremiumAccess)}</p>
        </div>

        <nav>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              end={item.to === '/dashboard'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!sampleWorkspace && !effectivePremiumAccess && (
            <button className="btn btn-primary btn-sm" onClick={handleUpgrade}>
              See Reset Options
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
            {sampleWorkspace ? 'Exit Sample' : 'Sign Out'}
          </button>
        </div>
      </aside>

      <section className="dashboard-content" id="main-content">
        {statusCard ? (
          <div className="demo-top-banner" role="status">
            <div className="demo-top-banner__text">
              <span className="disclaimer-icon">{statusCard.label}</span>
              <div>
                <strong>{statusCard.title}</strong>
                <p>{statusCard.body}</p>
              </div>
            </div>
            {statusCard.ctaLabel && statusCard.ctaTo ? (() => {
              const ctaTo = statusCard.ctaTo
              return (
                <button className="disclaimer-cta" onClick={() => navigate(ctaTo)}>
                  {statusCard.ctaLabel}
                </button>
              )
            })() : null}
          </div>
        ) : null}

        <div
          className="glass-panel"
          style={{
            marginBottom: '1.25rem',
            padding: '0.9rem 1.1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.to} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                {index > 0 ? <span className="text-muted">/</span> : null}
                {index === breadcrumbs.length - 1 ? (
                  <strong>{crumb.label}</strong>
                ) : (
                  <NavLink to={crumb.to} className="text-muted" style={{ textDecoration: 'none' }}>
                    {crumb.label}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {journeyState.summary}
          </div>
        </div>

        {shouldShowNavigator && journeyState.nextAction ? (
          <div
            className="glass-panel"
            style={{
              marginBottom: '1.25rem',
              borderColor: 'rgba(59, 130, 246, 0.22)',
              background: 'rgba(59, 130, 246, 0.08)',
            }}
          >
            <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <p className="badge" style={{ marginBottom: '0.5rem' }}>{journeyState.eyebrow}</p>
                <h3 style={{ marginBottom: '0.5rem' }}>{journeyState.title}</h3>
                <p className="text-muted" style={{ marginBottom: 0 }}>{journeyState.summary}</p>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => journeyState.nextAction?.to ? navigate(journeyState.nextAction.to) : undefined}>
                {journeyState.nextAction.label}
              </button>
            </div>
          </div>
        ) : null}

        <Outlet context={{ isDemoMode: sampleWorkspace, premiumAccess: effectivePremiumAccess }} />
      </section>
    </div>
  )
}
