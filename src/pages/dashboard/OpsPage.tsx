import { useCallback, useEffect, useState } from 'react'
import {
  getShibuyaAffiliateReport,
  getShibuyaOpsCase,
  getShibuyaOpsCases,
  sendShibuyaOpsReminder,
  updateShibuyaOpsCase,
} from '../../lib/api'
import type { ShibuyaAffiliateRow, ShibuyaOpsCaseDetail, ShibuyaOpsCaseSummary } from '../../lib/types'

const CASE_STATUS_OPTIONS = [
  'awaiting_activation',
  'awaiting_onboarding',
  'awaiting_upload',
  'processing',
  'baseline_ready',
  'call_pending',
  'follow_up_ready',
  'delivered',
  'read_only',
  'closed',
]

const GUIDED_REVIEW_OPTIONS = ['available', 'invited', 'booked', 'completed']

function humanize(value?: string | null): string {
  if (!value) return 'n/a'
  return value.replaceAll('_', ' ')
}

function formatDate(value?: string | null): string {
  if (!value) return 'n/a'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN')
}

export function OpsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cases, setCases] = useState<ShibuyaOpsCaseSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ShibuyaOpsCaseDetail | null>(null)
  const [affiliateRows, setAffiliateRows] = useState<ShibuyaAffiliateRow[]>([])
  const [affiliateNote, setAffiliateNote] = useState<string>('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [nextActionInput, setNextActionInput] = useState('')
  const [caseStatusInput, setCaseStatusInput] = useState('')
  const [guidedReviewInput, setGuidedReviewInput] = useState('')

  const loadCases = useCallback(async () => {
    const [casesResponse, affiliateResponse] = await Promise.all([
      getShibuyaOpsCases({
        q: search || undefined,
        status: statusFilter || undefined,
        limit: 200,
      }),
      getShibuyaAffiliateReport(),
    ])
    setCases(casesResponse.cases)
    setAffiliateRows(affiliateResponse.rows)
    setAffiliateNote(affiliateResponse.note ?? '')
    if (!selectedId && casesResponse.cases[0]?.customer_id) {
      setSelectedId(casesResponse.cases[0].customer_id)
    }
  }, [search, selectedId, statusFilter])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        await loadCases()
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load Shibuya ops')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [loadCases])

  useEffect(() => {
    let active = true
    if (!selectedId) {
      setDetail(null)
      return
    }
    const customerId = selectedId

    async function loadDetail() {
      try {
        setError(null)
        const response = await getShibuyaOpsCase(customerId)
        if (!active) return
        setDetail(response.case)
        setCaseStatusInput(response.case.case_status ?? '')
        setGuidedReviewInput(response.case.guided_review_status ?? '')
        setNextActionInput(response.case.next_action ?? '')
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load case detail')
      }
    }

    void loadDetail()
    return () => {
      active = false
    }
  }, [selectedId])

  async function refresh() {
    try {
      setLoading(true)
      await loadCases()
      const customerId = selectedId
      if (customerId) {
        const response = await getShibuyaOpsCase(customerId)
        setDetail(response.case)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh Shibuya ops')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!selectedId) return
    try {
      setSaving(true)
      const response = await updateShibuyaOpsCase(selectedId, {
        case_status: caseStatusInput || undefined,
        guided_review_status: guidedReviewInput || undefined,
        next_action: nextActionInput || undefined,
        note: noteInput.trim() || undefined,
      })
      setDetail(response.case)
      setNoteInput('')
      await loadCases()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update case')
    } finally {
      setSaving(false)
    }
  }

  async function handleReminder(reminderType: 'onboarding' | 'upload' | 'guided_review' | 'expiry') {
    if (!selectedId) return
    try {
      setSaving(true)
      await sendShibuyaOpsReminder(selectedId, reminderType)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reminder')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-stack">
      <section className="glass-panel">
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>INTERNAL OPS</p>
            <h1 style={{ marginBottom: '0.5rem' }}>Shibuya delivery queue</h1>
            <p className="text-muted" style={{ maxWidth: '56rem' }}>
              This is the internal surface for manual fulfillment: queue health, guided review state, reminders, affiliate-sourced demand, and what every paid customer needs next.
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => void refresh()} disabled={loading || saving}>
            Refresh
          </button>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
          <label>
            Search
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="email, broker, affiliate, ref code" />
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {CASE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{humanize(status)}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-sm btn-primary" onClick={() => void refresh()} disabled={loading || saving}>
              Apply filters
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="error-panel glass-panel">
          <h3>Ops error</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="grid-responsive two">
        <section className="glass-panel">
          <h3 style={{ marginBottom: '0.75rem' }}>Cases</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {cases.map((item) => (
              <button
                key={item.customer_id}
                type="button"
                className="glass-panel"
                onClick={() => setSelectedId(item.customer_id)}
                style={{
                  textAlign: 'left',
                  background: selectedId === item.customer_id ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                  borderColor: selectedId === item.customer_id ? 'rgba(59, 130, 246, 0.3)' : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                  <span className="badge">{humanize(item.case_status)}</span>
                  <span className="badge">{humanize(item.offer_kind)}</span>
                  {item.affiliate_slug ? <span className="badge">{item.affiliate_slug}</span> : null}
                </div>
                <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{item.name || item.email || item.customer_id}</strong>
                <p className="text-muted" style={{ marginBottom: '0.35rem' }}>
                  {item.email || 'No email'} | {item.broker || 'broker unknown'} | {humanize(item.trader_mode)}
                </p>
                <p className="text-muted" style={{ marginBottom: 0 }}>
                  Uploads {item.uploads_used ?? 0}
                  {item.uploads_allowed != null ? ` / ${item.uploads_allowed}` : ''}
                  {' | '}Reports {item.reports_ready ?? 0}
                  {item.days_left != null ? ` | ${item.days_left} day${item.days_left === 1 ? '' : 's'} left` : ''}
                </p>
              </button>
            ))}
            {!cases.length && !loading && (
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-muted" style={{ marginBottom: 0 }}>No cases match the current filter set.</p>
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel">
          <h3 style={{ marginBottom: '0.75rem' }}>Case detail</h3>
          {!detail ? (
            <p className="text-muted" style={{ marginBottom: 0 }}>Select a case to inspect delivery state, notes, reminders, and affiliate attribution.</p>
          ) : (
            <div className="dashboard-stack" style={{ gap: '1rem' }}>
              <div className="grid-responsive two">
                <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Customer</h4>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>{detail.name || 'n/a'}</p>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>{detail.email || 'n/a'}</p>
                  <p className="text-muted" style={{ marginBottom: 0 }}>{detail.customer_id}</p>
                </article>
                <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Delivery state</h4>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>Case: {humanize(detail.case_status)}</p>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>Review: {humanize(detail.guided_review_status)}</p>
                  <p className="text-muted" style={{ marginBottom: 0 }}>Next action: {detail.next_action || 'n/a'}</p>
                </article>
                <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Commercial</h4>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>Offer: {humanize(detail.offer_kind)}</p>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>Affiliate: {detail.affiliate_slug || 'n/a'}</p>
                  <p className="text-muted" style={{ marginBottom: 0 }}>Campaign: {detail.utm_campaign || 'n/a'}</p>
                </article>
                <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Usage</h4>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>Uploads: {detail.uploads_used ?? 0}{detail.uploads_allowed != null ? ` / ${detail.uploads_allowed}` : ''}</p>
                  <p className="text-muted" style={{ marginBottom: '0.35rem' }}>Reports: {detail.reports_ready ?? 0}</p>
                  <p className="text-muted" style={{ marginBottom: 0 }}>Expiry: {detail.access_expires_at ? formatDate(detail.access_expires_at) : 'n/a'}</p>
                </article>
              </div>

              <div className="grid-responsive two">
                <label>
                  Case status
                  <select value={caseStatusInput} onChange={(e) => setCaseStatusInput(e.target.value)}>
                    <option value="">No change</option>
                    {CASE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{humanize(status)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Guided review
                  <select value={guidedReviewInput} onChange={(e) => setGuidedReviewInput(e.target.value)}>
                    <option value="">No change</option>
                    {GUIDED_REVIEW_OPTIONS.map((status) => (
                      <option key={status} value={status}>{humanize(status)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Next action override
                <input value={nextActionInput} onChange={(e) => setNextActionInput(e.target.value)} placeholder="What should happen next?" />
              </label>

              <label>
                Ops note
                <textarea value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add an internal note for this case..." style={{ minHeight: '90px' }} />
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-primary" onClick={() => void handleSave()} disabled={saving}>
                  Save case updates
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => void handleReminder('onboarding')} disabled={saving}>
                  Send onboarding reminder
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => void handleReminder('upload')} disabled={saving}>
                  Send upload reminder
                </button>
                {detail.guided_review_included ? (
                  <button className="btn btn-sm btn-secondary" onClick={() => void handleReminder('guided_review')} disabled={saving}>
                    Send guided-review reminder
                  </button>
                ) : null}
                {detail.access_expires_at ? (
                  <button className="btn btn-sm btn-secondary" onClick={() => void handleReminder('expiry')} disabled={saving}>
                    Send expiry reminder
                  </button>
                ) : null}
              </div>

              {detail.latest_delta_summary && (
                <div className="grid-responsive three">
                  <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Discipline tax delta</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{detail.latest_delta_summary.discipline_tax_change}</p>
                  </article>
                  <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Behavior shift</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{detail.latest_delta_summary.edge_vs_behavior_shift}</p>
                  </article>
                  <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Risk shift</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{detail.latest_delta_summary.breach_risk_shift}</p>
                  </article>
                </div>
              )}

              {!!detail.ops_notes?.length && (
                <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Ops notes</h4>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {detail.ops_notes.slice().reverse().map((note, index) => (
                      <article key={`${note.at}-${index}`} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-muted" style={{ marginBottom: '0.35rem' }}>{formatDate(note.at)} | {note.by || 'admin'}</p>
                        <p style={{ marginBottom: 0 }}>{note.note || ''}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="glass-panel">
        <h3 style={{ marginBottom: '0.75rem' }}>Affiliate report</h3>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          {affiliateNote || 'Grouped from attributed checkout and customer records.'}
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="trade-table">
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Ref</th>
                <th>Campaign</th>
                <th>Visits</th>
                <th>Starts</th>
                <th>Paid</th>
                <th>Visit {'->'} start</th>
                <th>Start {'->'} paid</th>
                <th>Active monthly</th>
                <th>One-time done</th>
                <th>Expired one-time</th>
                <th>Monthly at risk</th>
              </tr>
            </thead>
            <tbody>
              {affiliateRows.map((row, index) => (
                <tr key={`${row.affiliate_slug || 'none'}-${row.ref_code || 'none'}-${index}`}>
                  <td>{row.affiliate_slug || 'n/a'}</td>
                  <td>{row.ref_code || 'n/a'}</td>
                  <td>{row.utm_campaign || 'n/a'}</td>
                  <td>{row.visits}</td>
                  <td>{row.checkout_starts}</td>
                  <td>{row.paid_conversions}</td>
                  <td>{row.visit_to_checkout_rate.toFixed(1)}%</td>
                  <td>{row.checkout_to_paid_rate.toFixed(1)}%</td>
                  <td>{row.active_monthly_customers}</td>
                  <td>{row.one_time_completions}</td>
                  <td>{row.expired_one_time_customers}</td>
                  <td>{row.monthly_at_risk}</td>
                </tr>
              ))}
              {!affiliateRows.length && (
                <tr>
                  <td colSpan={12} className="text-muted">No attributed rows yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default OpsPage
