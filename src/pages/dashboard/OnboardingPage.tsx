import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { getTraderProfileContext, logTraderLifecycleEvent, saveTraderProfileContext } from '../../lib/api'
import { buildJourneyState } from '../../lib/journeyState'
import type {
  TraderCapitalBand,
  TraderFocus,
  TraderIncomeBand,
  TraderInstrumentFocus,
  TraderProfileContext,
} from '../../lib/types'
import { getStoredSessionMeta, updateSessionMeta } from '../../lib/runtime'

const CAPITAL_OPTIONS: Array<{ value: TraderCapitalBand; label: string }> = [
  { value: 'under_50k_inr', label: 'Under ₹50k' },
  { value: '50k_to_250k_inr', label: '₹50k to ₹250k' },
  { value: '250k_to_1m_inr', label: '₹250k to ₹10L' },
  { value: 'over_1m_inr', label: 'Over ₹10L' },
]

const INCOME_OPTIONS: Array<{ value: TraderIncomeBand; label: string }> = [
  { value: 'student_or_none', label: 'Student / no steady income' },
  { value: 'under_25k_inr', label: 'Under ₹25k / month' },
  { value: '25k_to_75k_inr', label: '₹25k to ₹75k / month' },
  { value: '75k_to_200k_inr', label: '₹75k to ₹2L / month' },
  { value: 'over_200k_inr', label: 'Over ₹2L / month' },
]

const FOCUS_OPTIONS: Array<{ value: TraderFocus; label: string; description: string }> = [
  { value: 'retail_fo', label: 'Retail F&O survival', description: 'You want to stop bleeding in discretionary Indian F&O trading.' },
  { value: 'prop_eval', label: 'Prop evaluation', description: 'Your main objective is passing and protecting funded-account style rules.' },
  { value: 'mixed', label: 'Both', description: 'You trade your own book and also care about prop-style rule survival.' },
  { value: 'profitable_refinement', label: 'Already profitable', description: 'You are profitable but want to remove remaining behavioral leakage.' },
]

const INSTRUMENT_OPTIONS: Array<{ value: TraderInstrumentFocus; label: string }> = [
  { value: 'nifty_options', label: 'Nifty options' },
  { value: 'banknifty_options', label: 'BankNifty options' },
  { value: 'stock_options', label: 'Stock options' },
  { value: 'futures', label: 'Index / stock futures' },
  { value: 'forex', label: 'Forex' },
  { value: 'gold', label: 'Gold / commodities' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'us_indices', label: 'US indices' },
  { value: 'other', label: 'Other' },
]

function buildInitialState(existing?: TraderProfileContext | null) {
  return {
    capital_band: existing?.capital_band ?? '50k_to_250k_inr',
    monthly_income_band: existing?.monthly_income_band ?? '25k_to_75k_inr',
    trader_focus: existing?.trader_focus ?? 'retail_fo',
    broker_platform: existing?.broker_platform ?? '',
    primary_instruments: existing?.primary_instruments ?? ([] as TraderInstrumentFocus[]),
  }
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const sessionMeta = getStoredSessionMeta()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState(buildInitialState())

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        const profile = await getTraderProfileContext()
        if (!active) return
        setForm(buildInitialState(profile))
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load your trader profile.')
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
  }, [])

  const selectedFocus = useMemo(
    () => FOCUS_OPTIONS.find((option) => option.value === form.trader_focus),
    [form.trader_focus],
  )
  const journeyState = useMemo(
    () => buildJourneyState({ overview: null, profile: null, sessionMeta, market: sessionMeta?.market ?? 'india' }),
    [sessionMeta],
  )

  const toggleInstrument = (instrument: TraderInstrumentFocus) => {
    setForm((current) => {
      const exists = current.primary_instruments.includes(instrument)
      const next = exists
        ? current.primary_instruments.filter((value) => value !== instrument)
        : [...current.primary_instruments, instrument]

      return { ...current, primary_instruments: next.slice(0, 4) }
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.broker_platform.trim()) {
      setError('Add the broker or platform you trade through most often.')
      return
    }

    if (!form.primary_instruments.length) {
      setError('Pick at least one instrument focus so the action board can adapt.')
      return
    }

    try {
      setSaving(true)
      const saved = await saveTraderProfileContext({
        capital_band: form.capital_band,
        monthly_income_band: form.monthly_income_band,
        trader_focus: form.trader_focus,
        broker_platform: form.broker_platform.trim(),
        primary_instruments: form.primary_instruments,
      })

      await logTraderLifecycleEvent({
        event_name: 'onboarding_completed',
        market: sessionMeta?.market,
        tier: sessionMeta?.tier,
        metadata: {
          trader_focus: saved.trader_focus,
          primary_instruments: saved.primary_instruments,
        },
      })

      updateSessionMeta({
        caseStatus: 'awaiting_upload',
        traderMode: saved.trader_mode,
        dataSource: sessionMeta?.dataSource ?? 'broker_csv',
      })

      setSuccess('Profile saved. Your action board will now adapt to your actual trading context.')
      navigate('/dashboard/upload', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your trader profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-stack">
        <div className="glass-panel">
          <h3>Loading trader context…</h3>
          <p className="text-muted">Pulling the profile that shapes your Shibuya action board.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-stack">
      <JourneyProgressCard state={journeyState} />

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>INDIA TRADER PROFILE</p>
            <h1 style={{ marginBottom: '0.5rem' }}>Tell Shibuya who you actually are.</h1>
            <p className="text-muted" style={{ maxWidth: '50rem' }}>
              This is not for demographics theater. It changes the action board so the product can treat a low-capital F&O struggler differently from a prop-eval trader trying not to breach.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid-responsive two">
        <section className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>Context</h3>
          <div className="dashboard-stack" style={{ gap: '1rem' }}>
            <label>
              <span className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Capital band</span>
              <select
                value={form.capital_band}
                onChange={(event) => setForm((current) => ({ ...current, capital_band: event.target.value as TraderCapitalBand }))}
                className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-white"
              >
                {CAPITAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Monthly income band</span>
              <select
                value={form.monthly_income_band}
                onChange={(event) => setForm((current) => ({ ...current, monthly_income_band: event.target.value as TraderIncomeBand }))}
                className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-white"
              >
                {INCOME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Broker or platform</span>
              <input
                type="text"
                value={form.broker_platform}
                onChange={(event) => setForm((current) => ({ ...current, broker_platform: event.target.value }))}
                placeholder="Zerodha, Dhan, Angel One, prop portal…"
                className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-white"
              />
            </label>
          </div>
        </section>

        <section className="glass-panel">
          <h3 style={{ marginBottom: '1rem' }}>Intent</h3>
          <div className="dashboard-stack" style={{ gap: '0.75rem' }}>
            {FOCUS_OPTIONS.map((option) => {
              const active = form.trader_focus === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, trader_focus: option.value }))}
                  className="glass-panel"
                  style={{
                    textAlign: 'left',
                    borderColor: active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.06)',
                    background: active ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong>{option.label}</strong>
                    {active && <span className="badge">ACTIVE</span>}
                  </div>
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>{option.description}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1rem' }}>Instrument focus</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Pick up to four. This lets Shibuya call out expiry-day patterns, index-option overtrading, and prop-rule risk in a way that matches your actual book.
          </p>
          <div className="grid-responsive three">
            {INSTRUMENT_OPTIONS.map((option) => {
              const active = form.primary_instruments.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleInstrument(option.value)}
                  className="glass-panel"
                  style={{
                    textAlign: 'left',
                    borderColor: active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.06)',
                    background: active ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <strong>{option.label}</strong>
                </button>
              )
            })}
          </div>
        </section>

        <section className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>WHAT THIS CHANGES</p>
              <h3 style={{ marginBottom: '0.5rem' }}>
                {selectedFocus?.label ?? 'Your trader focus'}
              </h3>
              <p className="text-muted">
                {selectedFocus?.description}
              </p>
            </div>
          </div>

          <ul className="digest-preview" style={{ marginTop: '1rem' }}>
            <li>Action Board language will adapt to your capital reality, not generic journaling fluff.</li>
            <li>Prop-eval traders get stronger rule-protection framing; retail F&O traders get stronger behavioral-leak framing.</li>
            <li>Instrument tags help Shibuya call out expiry-day, zero-to-hero, and repeat-breach patterns with more precision.</li>
          </ul>

          {error && (
            <div className="glass-panel" style={{ marginTop: '1rem', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' }}>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="glass-panel" style={{ marginTop: '1rem', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }}>
              <p>{success}</p>
            </div>
          )}

          <div className="flex gap-3" style={{ marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Context And Continue'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Skip For Now
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
