import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  bookMyAppointment,
  cancelMyAppointment,
  changePassword,
  createSupportTicket,
  getAppointmentSlots,
  getDashboardOverview,
  getMyAppointments,
  getSupportTicket,
  getSupportTickets,
  getTraderProfileContext,
  replyToSupportTicket,
} from '../../lib/api'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { buildJourneyState } from '../../lib/journeyState'
import { getSessionDaysRemaining, getStoredSessionMeta, hasPremiumAccess, isOneTimeOffer, isReadOnlySession, isSampleMode } from '../../lib/runtime'
import { describeTraderMode, humanizeTraderMode } from '../../lib/traderMode'
import type {
  AppointmentRecord,
  AppointmentSlot,
  DashboardOverview,
  SupportTicketDetail,
  SupportTicketSummary,
  TraderProfileContext,
} from '../../lib/types'

function humanizeBillingStatus(value?: string | null): string {
  switch (value) {
    case 'active':
      return 'Active'
    case 'trialing':
      return 'Trialing'
    case 'past_due':
      return 'Past due'
    case 'canceled':
      return 'Canceled'
    default:
      return 'Activation ready'
  }
}

function humanizeCaseStatus(value?: string | null): string {
  switch (value) {
    case 'awaiting_activation':
      return 'Awaiting activation'
    case 'awaiting_onboarding':
      return 'Awaiting trader context'
    case 'awaiting_upload':
      return 'Awaiting first upload'
    case 'processing':
      return 'Processing'
    case 'baseline_ready':
      return 'Baseline ready'
    case 'call_pending':
      return 'Guided review pending'
    case 'follow_up_ready':
      return 'Follow-up ready'
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

function humanizeOfferKind(value?: string | null): string {
  switch (value) {
    case 'psych_audit':
    case 'edge_or_behavior':
      return 'Psych Audit one-time'
    case 'reset_intensive':
    case 'next_session_reset':
      return 'Reset Intensive one-time'
    case 'psych_audit_live':
      return 'Psych Audit monthly'
    case 'reset_pro_live':
      return 'Reset Pro monthly'
    case 'sample':
      return 'Sample workspace'
    default:
      return 'Live workspace'
  }
}

function humanizeAppointmentType(value?: string | null): string {
  switch (value) {
    case 'onboarding_intro':
      return 'Kickoff review'
    case 'review_30day':
      return 'Follow-up review'
    case 'onboarding':
      return 'Onboarding call'
    default:
      return 'Review call'
  }
}

export function AccessPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookingMessage, setBookingMessage] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingBusy, setBookingBusy] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [appointmentStatus, setAppointmentStatus] = useState<string | null>(null)
  const [appointmentBusyId, setAppointmentBusyId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDetail | null>(null)
  const [ticketThreadLoading, setTicketThreadLoading] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketReply, setTicketReply] = useState('')
  const [ticketStatus, setTicketStatus] = useState<string | null>(null)
  const [ticketBusy, setTicketBusy] = useState(false)
  const [ticketReplyBusy, setTicketReplyBusy] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [securityStatus, setSecurityStatus] = useState<string | null>(null)
  const [securityError, setSecurityError] = useState<string | null>(null)
  const [securityBusy, setSecurityBusy] = useState(false)
  const sessionMeta = getStoredSessionMeta()
  const sampleMode = isSampleMode()
  const premiumAccess = hasPremiumAccess()
  const readOnly = isReadOnlySession(sessionMeta)

  useEffect(() => {
    let active = true

    async function load() {
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
        const [nextTickets, nextAppointments] = await Promise.all([
          getSupportTickets().catch(() => ({ tickets: [] as SupportTicketSummary[] })),
          getMyAppointments().catch(() => ({ appointments: [] as AppointmentRecord[] })),
        ])
        if (!active) {
          return
        }
        setOverview(nextOverview)
        setProfile(nextProfile)
        setTickets(nextTickets.tickets ?? [])
        setAppointments(nextAppointments.appointments ?? [])
        setSelectedTicketId((current) => current ?? nextTickets.tickets?.[0]?.id ?? null)
      } catch (err) {
        if (!active) {
          return
        }
        setError(err instanceof Error ? err.message : 'Unable to load billing and access state.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [sampleMode])

  useEffect(() => {
    let active = true

    async function loadTicketDetail(ticketId: string) {
      try {
        setTicketThreadLoading(true)
        const response = await getSupportTicket(ticketId)
        if (!active) {
          return
        }
        setSelectedTicket(response.ticket)
      } catch {
        if (active) {
          setSelectedTicket(null)
        }
      } finally {
        if (active) {
          setTicketThreadLoading(false)
        }
      }
    }

    if (!selectedTicketId) {
      setSelectedTicket(null)
      return () => {
        active = false
      }
    }

    void loadTicketDetail(selectedTicketId)
    return () => {
      active = false
    }
  }, [selectedTicketId])

  const market = sessionMeta?.market ?? 'india'
  const journeyState = buildJourneyState({ overview, profile, sessionMeta, market })
  const effectiveOfferKind = overview?.offer_kind ?? sessionMeta?.offerKind
  const oneTimeAccess = isOneTimeOffer(effectiveOfferKind)
  const effectiveBillingStatus = overview?.billing_status ?? (sampleMode ? 'sample' : 'active')
  const effectiveCaseStatus = overview?.case_status ?? sessionMeta?.caseStatus
  const effectiveTraderMode = overview?.trader_mode ?? profile?.trader_mode ?? sessionMeta?.traderMode
  const effectiveReadOnly = readOnly || effectiveCaseStatus === 'read_only'
  const daysRemaining = overview?.days_left ?? getSessionDaysRemaining(sessionMeta)
  const uploadsUsed = overview?.uploads_used ?? overview?.upload_count ?? 0
  const uploadsRemaining = overview?.uploads_remaining
  const uploadsAllowed = overview?.upload_limit
  const guidedReviewState = overview?.guided_review_included
    ? overview.guided_review_status === 'completed'
      ? 'Completed'
      : overview.guided_review_status === 'booked'
        ? 'Booked'
        : overview.guided_review_status === 'invited'
          ? 'Available now'
          : 'Included, waiting for trigger'
    : 'Not included'
  const reviewBookingType = useMemo<'onboarding_intro' | 'review_30day' | 'onboarding'>(() => {
    if (overview?.review_summary?.touchpoint_1_status !== 'completed') {
      return 'onboarding_intro'
    }
    return 'review_30day'
  }, [overview?.review_summary?.touchpoint_1_status])
  const bookingLabel = reviewBookingType === 'review_30day' ? 'follow-up review' : 'kickoff review'
  const upcomingAppointments = appointments.filter((appointment) => {
    const status = String(appointment.status || '').toLowerCase()
    return status === 'scheduled' || status === 'confirmed'
  })
  const pastAppointments = appointments.filter((appointment) => !upcomingAppointments.includes(appointment)).slice(0, 3)

  const loadSlots = async () => {
    try {
      setSlotsLoading(true)
      setBookingError(null)
      const response = await getAppointmentSlots(reviewBookingType)
      setSlots(response.slots)
      setSelectedSlot((current) => current || response.slots[0]?.datetime || '')
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Unable to load booking slots.')
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBookReview = async () => {
    if (!selectedSlot) {
      setBookingError('Choose a slot first.')
      return
    }
    try {
      setBookingBusy(true)
      setBookingError(null)
      const response = await bookMyAppointment({
        appointment_type: reviewBookingType,
        scheduled_at: selectedSlot,
      })
      setBookingMessage(response.message)
      const nextAppointments = await getMyAppointments().catch(() => ({ appointments: [] as AppointmentRecord[] }))
      setAppointments(nextAppointments.appointments ?? [])
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Unable to book guided review.')
    } finally {
      setBookingBusy(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setAppointmentBusyId(appointmentId)
      setAppointmentStatus(null)
      const response = await cancelMyAppointment(appointmentId)
      setAppointmentStatus(response.message)
      const nextAppointments = await getMyAppointments().catch(() => ({ appointments: [] as AppointmentRecord[] }))
      setAppointments(nextAppointments.appointments ?? [])
    } catch (err) {
      setAppointmentStatus(err instanceof Error ? err.message : 'Unable to cancel appointment.')
    } finally {
      setAppointmentBusyId(null)
    }
  }

  const handleCreateSupportTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketStatus('Subject and message are both required.')
      return
    }
    try {
      setTicketBusy(true)
      setTicketStatus(null)
      const created = await createSupportTicket({
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        category: 'technical',
        priority: premiumAccess ? 'high' : 'medium',
      })
      setTickets((current) => [created, ...current])
      setTicketSubject('')
      setTicketMessage('')
      setTicketStatus('Support request created.')
      setSelectedTicketId(created.id)
    } catch (err) {
      setTicketStatus(err instanceof Error ? err.message : 'Unable to create support ticket.')
    } finally {
      setTicketBusy(false)
    }
  }

  const handleReplyToTicket = async () => {
    if (!selectedTicketId || !ticketReply.trim()) {
      setTicketStatus('Write a reply first.')
      return
    }
    try {
      setTicketReplyBusy(true)
      setTicketStatus(null)
      const updated = await replyToSupportTicket(selectedTicketId, { message: ticketReply.trim() })
      setSelectedTicket(updated)
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === updated.id
            ? {
                ...ticket,
                status: updated.status,
                priority: updated.priority,
                updated_at: updated.updated_at,
                message_count: updated.messages.length,
              }
            : ticket,
        ),
      )
      setTicketReply('')
      setTicketStatus('Reply sent.')
    } catch (err) {
      setTicketStatus(err instanceof Error ? err.message : 'Unable to send reply.')
    } finally {
      setTicketReplyBusy(false)
    }
  }

  const handleChangePassword = async () => {
    if (sampleMode) {
      setSecurityError('Password changes are disabled in sample mode.')
      return
    }
    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setSecurityError('Current password, new password, and confirmation are all required.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityError('New password and confirmation do not match.')
      return
    }

    try {
      setSecurityBusy(true)
      setSecurityError(null)
      setSecurityStatus(null)
      const response = await changePassword(currentPassword, newPassword)
      if (!response.success) {
        setSecurityError(response.error || response.message || 'Unable to change password.')
        return
      }
      setSecurityStatus(response.message || 'Password changed.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      setSecurityError(err instanceof Error ? err.message : 'Unable to change password.')
    } finally {
      setSecurityBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>Loading access center...</h3>
          <p className="text-muted">Pulling plan, continuity, upload allowance, and guided review state.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load access center</h3>
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
            <p className="badge" style={{ marginBottom: '0.5rem' }}>BILLING + ACCESS</p>
            <h1 style={{ marginBottom: '0.5rem' }}>Commercial truth, continuity, and next checkpoint.</h1>
            <p className="text-muted" style={{ maxWidth: '56rem' }}>
              This page exists so the trader never has to guess what offer is live, whether access is healthy, how many uploads remain, or what to do next.
            </p>
          </div>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/dashboard/workspace" className="btn btn-sm btn-secondary">
              Workspace status
            </Link>
            <Link to="/pricing?upgrade=reset-pro" className="btn btn-sm btn-primary">
              {oneTimeAccess || effectiveReadOnly ? 'Renew or upgrade' : premiumAccess ? 'Review pricing' : 'See reset options'}
            </Link>
          </div>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Current offer</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.35rem', fontWeight: 700 }}>
              {sampleMode ? 'Sample workspace' : humanizeOfferKind(effectiveOfferKind)}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {premiumAccess ? 'Premium corrective loop active.' : 'Core action loop active.'}
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Billing state</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.35rem', fontWeight: 700 }}>
              {sampleMode ? 'Sample only' : humanizeBillingStatus(effectiveBillingStatus)}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {sampleMode
                ? 'No billing or persistence in sample mode.'
                : effectiveBillingStatus === 'past_due'
                  ? 'Fix continuity first. A dead billing state turns the product into theater.'
                  : effectiveBillingStatus === 'canceled'
                    ? 'Canceled workspaces remain visible but should not be treated as active operating loops.'
                    : 'Continuity is healthy.'}
            </p>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Access state</h4>
            <p style={{ marginBottom: '0.35rem', fontSize: '1.35rem', fontWeight: 700 }}>
              {humanizeCaseStatus(effectiveCaseStatus)}
            </p>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {effectiveReadOnly
                ? 'Read only until you reopen the loop with a new one-time package or a monthly plan.'
                : oneTimeAccess
                  ? daysRemaining != null
                    ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left in this reset window.`
                    : 'One-time reset window is active.'
                  : 'Monthly live access should remain active while billing is healthy.'}
            </p>
          </article>
        </div>
      </section>

      <section className="grid-responsive two">
        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>USAGE</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Uploads, reports, and operating headroom.</h3>
          <div className="grid-responsive two" style={{ gap: '0.75rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Uploads used</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>{uploadsUsed}</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Uploads remaining</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {uploadsAllowed != null ? uploadsRemaining ?? 0 : sampleMode ? 0 : 'Unlimited'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Reports ready</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>{overview?.reports_ready ?? 0}</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Next action</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{overview?.next_action ?? sessionMeta?.nextAction ?? 'Open the Action Board'}</p>
            </article>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/dashboard/upload" className="btn btn-sm btn-secondary">
              Upload trades
            </Link>
            <Link to="/dashboard/reports" className="btn btn-sm btn-secondary" style={{ marginLeft: '0.5rem' }}>
              Open reports
            </Link>
          </div>
        </article>

        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>GUIDED REVIEW</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Premium support state and timing.</h3>
          <div className="grid-responsive two" style={{ gap: '0.75rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Status</h4>
              <p style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>{guidedReviewState}</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Booked</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {overview?.guided_review_booked_at
                  ? new Date(overview.guided_review_booked_at).toLocaleString('en-IN')
                  : 'Not booked'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Completed</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {overview?.guided_review_completed_at
                  ? new Date(overview.guided_review_completed_at).toLocaleString('en-IN')
                  : 'Not completed'}
              </p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Booking path</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {overview?.guided_review_url ? 'Live booking link configured.' : 'No guided review URL configured on this environment yet.'}
              </p>
            </article>
          </div>
          {overview?.review_summary?.eligible ? (
            <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Book {bookingLabel}</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                Use the in-product booking flow first. The external link remains available as a fallback only.
              </p>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => void loadSlots()} disabled={slotsLoading}>
                  {slotsLoading ? 'Loading slots...' : 'Load slots'}
                </button>
                {overview?.guided_review_url ? (
                  <a
                    href={overview.guided_review_url}
                    className="btn btn-sm btn-secondary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open fallback booking link
                  </a>
                ) : null}
              </div>
              {slots.length > 0 ? (
                <>
                  <select
                    value={selectedSlot}
                    onChange={(event) => setSelectedSlot(event.target.value)}
                    style={{ width: '100%', marginBottom: '0.75rem' }}
                  >
                    {slots.map((slot) => (
                      <option key={slot.datetime} value={slot.datetime}>
                        {slot.display}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-sm btn-primary" onClick={() => void handleBookReview()} disabled={bookingBusy}>
                    {bookingBusy ? 'Booking...' : `Book ${bookingLabel}`}
                  </button>
                </>
              ) : null}
              {bookingMessage ? <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>{bookingMessage}</p> : null}
              {bookingError ? <p style={{ marginTop: '0.75rem', marginBottom: 0, color: '#fca5a5' }}>{bookingError}</p> : null}
            </div>
          ) : null}
          {appointments.length ? (
            <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Review timeline</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                The review loop should stay visible inside the workspace, not disappear into someone’s inbox.
              </p>
              <div className="dashboard-stack" style={{ gap: '0.75rem' }}>
                {upcomingAppointments.map((appointment) => (
                  <article key={appointment.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <strong>{humanizeAppointmentType(appointment.type)}</strong>
                      <span className="text-muted">{appointment.status}</span>
                    </div>
                    <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                      {appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString('en-IN') : 'Not scheduled'}
                    </p>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      {appointment.meeting_link ? (
                        <a href={appointment.meeting_link} className="btn btn-sm btn-secondary" target="_blank" rel="noreferrer">
                          Open meeting link
                        </a>
                      ) : null}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => void handleCancelAppointment(appointment.id)}
                        disabled={appointmentBusyId === appointment.id}
                      >
                        {appointmentBusyId === appointment.id ? 'Cancelling...' : 'Cancel slot'}
                      </button>
                    </div>
                  </article>
                ))}
                {pastAppointments.length ? (
                  <div>
                    <p className="text-muted" style={{ marginBottom: '0.5rem' }}>Recent completed or cancelled touchpoints.</p>
                    <div className="dashboard-stack" style={{ gap: '0.5rem' }}>
                      {pastAppointments.map((appointment) => (
                        <article key={appointment.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                            <strong>{humanizeAppointmentType(appointment.type)}</strong>
                            <span className="text-muted">{appointment.status}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {appointmentStatus ? <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>{appointmentStatus}</p> : null}
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid-responsive two">
        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>SUPPORT</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Open a real support lane when something blocks delivery.</h3>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>Subject</span>
            <input
              value={ticketSubject}
              onChange={(event) => setTicketSubject(event.target.value)}
              placeholder="Example: Zerodha export needs rescue"
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>Message</span>
            <textarea
              value={ticketMessage}
              onChange={(event) => setTicketMessage(event.target.value)}
              placeholder="Describe exactly where the paid loop is blocked."
              style={{ width: '100%', minHeight: '120px' }}
            />
          </label>
          <button className="btn btn-sm btn-primary" onClick={() => void handleCreateSupportTicket()} disabled={ticketBusy}>
            {ticketBusy ? 'Opening ticket...' : premiumAccess ? 'Open premium support ticket' : 'Open support ticket'}
          </button>
          {ticketStatus ? <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>{ticketStatus}</p> : null}
        </article>

        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>OPEN TICKETS</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Current support load for this workspace.</h3>
          {tickets.length === 0 ? (
            <p className="text-muted" style={{ marginBottom: 0 }}>No support tickets open right now.</p>
          ) : (
            <div className="dashboard-stack" style={{ gap: '0.75rem' }}>
              {tickets.slice(0, 4).map((ticket) => (
                <article key={ticket.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <strong>{ticket.subject}</strong>
                    <span className="text-muted">{ticket.status ?? 'open'}</span>
                    <span className="text-muted">{ticket.priority ?? 'medium'}</span>
                  </div>
                  <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                    Updated {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('en-IN') : 'recently'}.
                  </p>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    Open thread
                  </button>
                </article>
              ))}
            </div>
          )}
          {ticketThreadLoading ? (
            <p className="text-muted" style={{ marginTop: '1rem', marginBottom: 0 }}>Loading support thread...</p>
          ) : null}
          {selectedTicket ? (
            <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{selectedTicket.subject}</h4>
              <div className="dashboard-stack" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                {selectedTicket.messages.map((message) => (
                  <article key={message.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <strong>{message.sender_type === 'admin' ? 'Shibuya support' : 'You'}</strong>
                      <span className="text-muted">
                        {message.created_at ? new Date(message.created_at).toLocaleString('en-IN') : 'recently'}
                      </span>
                    </div>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{message.message}</p>
                  </article>
                ))}
              </div>
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                <span className="text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>Reply</span>
                <textarea
                  value={ticketReply}
                  onChange={(event) => setTicketReply(event.target.value)}
                  placeholder="Reply with the exact blocker, file issue, or next question."
                  style={{ width: '100%', minHeight: '110px' }}
                />
              </label>
              <button className="btn btn-sm btn-primary" onClick={() => void handleReplyToTicket()} disabled={ticketReplyBusy}>
                {ticketReplyBusy ? 'Sending reply...' : 'Reply to ticket'}
              </button>
            </div>
          ) : null}
        </article>
      </section>

      <section className="glass-panel">
        <p className="badge" style={{ marginBottom: '0.5rem' }}>MODE</p>
        <h3 style={{ marginBottom: '0.5rem' }}>
          {effectiveTraderMode ? humanizeTraderMode(effectiveTraderMode) : 'Trader mode not derived yet'}
        </h3>
        <p className="text-muted" style={{ maxWidth: '56rem', marginBottom: 0 }}>
          {effectiveTraderMode
            ? describeTraderMode(effectiveTraderMode)
          : 'Finish trader context so Shibuya can stop acting like every trader has the same objective and the same failure mode.'}
        </p>
      </section>

      <section className="grid-responsive two">
        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>SECURITY</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Change your return-access password inside the product.</h3>
          <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
            Paid software should not force you back into a broken email chain just to rotate a password.
          </p>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Your current password"
              style={{ width: '100%' }}
              disabled={sampleMode || securityBusy}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Choose a stronger password"
              style={{ width: '100%' }}
              disabled={sampleMode || securityBusy}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span className="text-muted" style={{ display: 'block', marginBottom: '0.35rem' }}>Confirm new password</span>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              placeholder="Repeat the new password"
              style={{ width: '100%' }}
              disabled={sampleMode || securityBusy}
            />
          </label>
          <button className="btn btn-sm btn-primary" onClick={() => void handleChangePassword()} disabled={sampleMode || securityBusy}>
            {securityBusy ? 'Updating password...' : 'Change password'}
          </button>
          {securityStatus ? <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>{securityStatus}</p> : null}
          {securityError ? <p style={{ marginTop: '0.75rem', marginBottom: 0, color: '#fca5a5' }}>{securityError}</p> : null}
        </article>

        <article className="glass-panel">
          <p className="badge" style={{ marginBottom: '0.5rem' }}>RECOVERY</p>
          <h3 style={{ marginBottom: '0.75rem' }}>Self-service recovery is part of a real product.</h3>
          <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
            If you get locked out later, use the reset flow from the sign-in page. That route is now live and should not require human intervention for normal cases.
          </p>
          <div className="dashboard-stack" style={{ gap: '0.75rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Normal path</strong>
              <p className="text-muted" style={{ marginBottom: 0 }}>Sign in with email and password from the login page.</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <strong style={{ display: 'block', marginBottom: '0.35rem' }}>If locked out</strong>
              <p className="text-muted" style={{ marginBottom: 0 }}>Use “Forgot password?” from sign in and reset it from the emailed link.</p>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <strong style={{ display: 'block', marginBottom: '0.35rem' }}>If the paid loop is blocked</strong>
              <p className="text-muted" style={{ marginBottom: 0 }}>Open a support ticket above with the exact blocker instead of starting over.</p>
            </article>
          </div>
        </article>
      </section>
    </div>
  )
}

export default AccessPage
