import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Copy, RefreshCcw } from 'lucide-react'
import { getDashboardOverview, getTraderProfileContext } from '../../lib/api'
import { buildTradingMandate } from '../../lib/decisionSupport'
import { buildExecutionProtocol } from '../../lib/executionProtocol'
import { readSessionGateRecord, saveSessionGateRecord } from '../../lib/sessionGate'
import { getStoredSessionMeta, isSampleMode } from '../../lib/runtime'
import { humanizeTraderMode } from '../../lib/traderMode'
import type { DashboardOverview, TraderProfileContext } from '../../lib/types'

export function SessionGatePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [profile, setProfile] = useState<TraderProfileContext | null>(null)
  const [setup, setSetup] = useState('')
  const [invalidation, setInvalidation] = useState('')
  const [killCriteria, setKillCriteria] = useState('')
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [completed, setCompleted] = useState(false)
  const sessionMeta = getStoredSessionMeta()
  const sampleMode = isSampleMode()
  const customerId = sessionMeta?.customerId ?? null

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [nextOverview, nextProfile] = await Promise.all([
          getDashboardOverview(),
          getTraderProfileContext().catch(() => null),
        ])
        if (!active) {
          return
        }
        setOverview(nextOverview)
        setProfile(nextProfile)

        const existing = readSessionGateRecord(customerId)
        if (existing) {
          setSetup(existing.setup)
          setInvalidation(existing.invalidation)
          setKillCriteria(existing.killCriteria)
          setCompleted(true)
        }
      } catch (err) {
        if (!active) {
          return
        }
        setError(err instanceof Error ? err.message : 'Unable to load session gate')
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
  }, [customerId])

  const protocol = useMemo(
    () => (overview ? buildExecutionProtocol({ overview, profile }) : null),
    [overview, profile],
  )
  const mandate = useMemo(() => (overview ? buildTradingMandate(overview) : null), [overview])

  const checklistItems = useMemo(() => {
    if (!protocol || !mandate) {
      return []
    }
    return [
      ...protocol.preSessionChecklist,
      ...mandate.doNow.slice(0, 2),
      `Kill the session immediately if: ${killCriteria || 'your written kill criteria is hit.'}`,
    ]
  }, [protocol, mandate, killCriteria])

  const allChecked = checklistItems.length > 0 && checklistItems.every((item) => checklistState[item])
  const formReady = setup.trim() && invalidation.trim() && killCriteria.trim()

  const handleSave = () => {
    if (!formReady) {
      return
    }
    saveSessionGateRecord({
      customerId,
      setup: setup.trim(),
      invalidation: invalidation.trim(),
      killCriteria: killCriteria.trim(),
    })
    setCompleted(true)
  }

  const handleCopy = async () => {
    if (!protocol || !mandate) {
      return
    }

    const text = [
      'SHIBUYA SESSION GATE',
      `Mode: ${humanizeTraderMode(overview?.trader_mode ?? profile?.trader_mode ?? 'retail_fn0_struggler')}`,
      '',
      `Setup allowed: ${setup || 'not set'}`,
      `Invalidation: ${invalidation || 'not set'}`,
      `Kill criteria: ${killCriteria || 'not set'}`,
      '',
      'PRE-SESSION CHECKLIST',
      ...checklistItems.map((item, index) => `${index + 1}. ${item}`),
      '',
      'MANDATE',
      mandate.summary,
    ].join('\n')

    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  if (loading) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>Loading session gate...</h3>
          <p className="text-muted">Pulling the current mandate and control protocol for today’s session.</p>
        </div>
      </div>
    )
  }

  if (error || !overview || !protocol || !mandate) {
    return (
      <div className="dashboard-stack">
        <div className="error-panel glass-panel">
          <h3>Unable to load session gate</h3>
          <p>{error ?? 'This workspace does not have enough data yet.'}</p>
          <button className="btn btn-sm btn-secondary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>SESSION GATE</p>
            <h1 style={{ marginBottom: '0.5rem' }}>No first order without a written plan.</h1>
            <p className="text-muted" style={{ maxWidth: '56rem' }}>
              This is where the app stops being an observer. Lock the setup, invalidation, and kill criteria before the open. If you are not willing to write it, you are not ready to trade it.
            </p>
          </div>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => void handleCopy()}>
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy gate'}
            </button>
            <Link to="/dashboard/protocol" className="btn btn-sm btn-secondary">
              Open protocol
            </Link>
          </div>
        </div>

        {sampleMode && (
          <div className="glass-panel" style={{ marginTop: '1rem', borderColor: 'rgba(59, 130, 246, 0.25)', background: 'rgba(59, 130, 246, 0.08)' }}>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Sample mode shows the ritual only. In a live workspace, this gate exists to force a higher standard before real risk goes on.
            </p>
          </div>
        )}

        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Today’s setup</h3>
            <label>
              Setup allowed
              <textarea
                value={setup}
                onChange={(event) => setSetup(event.target.value)}
                placeholder="Example: Nifty opening drive only, first clean pullback after initial range expansion."
                style={{ minHeight: '90px' }}
              />
            </label>
            <label>
              Invalidation
              <textarea
                value={invalidation}
                onChange={(event) => setInvalidation(event.target.value)}
                placeholder="Example: If the pullback loses VWAP and internals stop confirming, the setup is dead."
                style={{ minHeight: '90px' }}
              />
            </label>
            <label>
              Kill criteria
              <textarea
                value={killCriteria}
                onChange={(event) => setKillCriteria(event.target.value)}
                placeholder="Example: Two losses, one revenge impulse, or any discretionary size increase ends the session."
                style={{ minHeight: '90px' }}
              />
            </label>
          </article>

          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Checklist</h3>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Check every line only if it is actually true. This is not mindfulness theater. This is a control gate.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {checklistItems.map((item) => (
                <label key={item} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(checklistState[item])}
                    onChange={(event) => setChecklistState((current) => ({ ...current, [item]: event.target.checked }))}
                    style={{ marginTop: '0.15rem' }}
                  />
                  <span className="text-muted">{item}</span>
                </label>
              ))}
            </div>
          </article>
        </div>

        <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{protocol.headline}</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                {mandate.summary}
              </p>
            </div>
            <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={!formReady || !allChecked}>
              {completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Gate locked
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Lock today’s gate
                </>
              )}
            </button>
          </div>
          <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            {completed
              ? 'Today’s gate is locked on this device. Do not improvise around it once the session starts.'
              : 'The button unlocks only after the setup, invalidation, kill criteria, and checklist are all complete.'}
          </p>
        </div>
      </section>
    </div>
  )
}

export default SessionGatePage
