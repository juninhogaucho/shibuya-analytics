import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getTraderProfileContext,
  getTradePasteMemory,
  logTraderLifecycleEvent,
  parseTradePaste,
  submitParsedTrades,
  uploadTradesCSV,
} from '../../lib/api'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { ImportConciergeCard } from '../../components/dashboard/ImportConciergeCard'
import { getStoredSessionMeta, isReadOnlySession, isSampleMode, updateSessionMeta } from '../../lib/runtime'
import { buildJourneyState } from '../../lib/journeyState'
import { buildUploadPlaybook } from '../../lib/uploadPlaybook'
import { rescueCsvForUpload } from '../../lib/csvRescue'
import { humanizeTraderMode } from '../../lib/traderMode'
import type { TradePasteMemoryResponse, TraderProfileContext } from '../../lib/types'
import { InfoTooltip } from '../../components/ui/Tooltip'

interface ParsedTrade {
  timestamp: string
  symbol: string
  side: string
  size: number
  entry_price?: number
  exit_price?: number
  pnl?: number
}

interface ParsePreview {
  rowsParsed: number
  symbols: string[]
  issues?: string[]
  trades?: ParsedTrade[]
}

const SAMPLE_PLACEHOLDER = `2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20
2024-01-15 11:45 BANKNIFTY24JAN48200PE SELL 1 210.00 184.35`

const CSV_TEMPLATE = `timestamp,exit_time,Symbol,size,pnl
2024-01-15 09:32:00,2024-01-15 09:58:00,NIFTY24JAN22500CE,2,4520
2024-01-15 11:45:00,2024-01-15 12:30:00,BANKNIFTY24JAN48200PE,1,-1850
2024-01-16 10:05:00,2024-01-16 10:42:00,RELIANCE,15,2760`

const INDIA_EXPORT_PRESETS = [
  {
    label: 'Zerodha tradebook CSV',
    body: 'Export closed trades or P&L from Console, keep one row per closed trade, then map the timestamps and PnL into the template if needed.',
  },
  {
    label: 'Dhan / Angel / Upstox / FYERS',
    body: 'Use the trade history or ledger export. If the raw file is messy, paste a clean subset first and let the parser show what it understands.',
  },
  {
    label: 'Prop portal or MT5 export',
    body: 'Closed-trade CSV is enough for V1. EA and direct connectors stay future lanes; the point now is getting the leak on screen fast.',
  },
]

function formatMemoryDelta(memory: TradePasteMemoryResponse): string[] {
  if (!memory.has_previous || memory.deltas.length === 0) {
    return [
      memory.message,
      'Upload another session to compare win rate, discipline tax, stress score, and Sharpe.',
    ]
  }

  return [
    memory.message,
    ...memory.deltas.map((delta) => `${delta.metric}: ${delta.previous} -> ${delta.current} (${delta.delta})`),
  ]
}

function buildSampleNotes(tradesUploaded: number): string[] {
  return [
    `${tradesUploaded} trades ran through the sample workspace.`,
    'Sample mode shows parsing and workflow only. It does not persist uploads or update your account history.',
    'Use a live trader account to store sessions, compare deltas, and generate live prescriptions.',
  ]
}

export function AppendTradesPage() {
  const [paste, setPaste] = useState('')
  const [notes, setNotes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [parsedPreview, setParsedPreview] = useState<ParsePreview | null>(null)
  const [profileContext, setProfileContext] = useState<TraderProfileContext | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sampleMode = isSampleMode()
  const navigate = useNavigate()
  const sessionMeta = getStoredSessionMeta()
  const readOnlyAccess = isReadOnlySession(sessionMeta)
  const premiumAccess = sessionMeta?.tier === 'reset_pro'
  const journeyState = useMemo(
    () => buildJourneyState({ overview: null, profile: null, sessionMeta, market: sessionMeta?.market ?? 'india' }),
    [sessionMeta],
  )
  const uploadPlaybook = useMemo(() => buildUploadPlaybook(profileContext), [profileContext])
  const traderMode = profileContext?.trader_mode ?? sessionMeta?.traderMode

  useEffect(() => {
    if (sampleMode) {
      return
    }

    let active = true

    async function loadProfile() {
      try {
        const profile = await getTraderProfileContext()
        if (!active) {
          return
        }
        setProfileContext(profile)
      } catch {
        if (!active) {
          return
        }
        setProfileContext(null)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [sampleMode])

  useEffect(() => {
    if (!success || sampleMode) {
      return
    }

    const timeout = window.setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1800)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [navigate, sampleMode, success])

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'shibuya_trade_template.csv'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleParse = async () => {
    if (readOnlyAccess) {
      setError('This reset window is now read only. Start a new package or live tier to upload fresh trades.')
      return
    }
    if (!paste.trim()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setParsedPreview(null)

      const preview = await parseTradePaste({ body: paste })
      const feedbackNotes = [
        `${preview.rowsParsed} rows detected`,
        `Symbols: ${preview.symbols.join(', ')}`,
        sampleMode
          ? 'Sample workspace can preview the parser, but it will not write trades to a permanent account.'
          : 'Confirm upload to append these trades to your live account and rerun analytics.',
      ]

      if (preview.issues && preview.issues.length > 0) {
        feedbackNotes.push(`Issues: ${preview.issues.join(', ')}`)
      }

      setNotes(feedbackNotes)
      setParsedPreview(preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse trades')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (readOnlyAccess) {
      setError('This reset window is now read only. Start a new package or live tier to upload fresh trades.')
      return
    }
    if (!parsedPreview) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await submitParsedTrades({
        trades: parsedPreview.trades || [],
        rawText: paste,
      })

      if (sampleMode || result.status === 'sample') {
        setSuccess(`Sample workspace processed ${result.trades_uploaded} trades.`)
        setNotes(buildSampleNotes(result.trades_uploaded))
      } else {
        const memory = await getTradePasteMemory().catch(() => null)
        if (sessionMeta?.caseStatus === 'awaiting_upload' || sessionMeta?.caseStatus === 'awaiting_onboarding' || !sessionMeta?.caseStatus) {
          await logTraderLifecycleEvent({
            event_name: 'first_upload_completed',
          })
        }
        updateSessionMeta({ caseStatus: 'baseline_ready' })
        setSuccess(`Uploaded ${result.trades_uploaded} trades to your live account.`)
        setNotes(
          memory
            ? [`${result.trades_uploaded} trades added to your account.`, ...formatMemoryDelta(memory)]
            : [
                `${result.trades_uploaded} trades added to your account.`,
                'Analytics reran successfully.',
                'Trade Paste Memory is temporarily unavailable. Check back after your next session.',
              ],
        )
      }

      setPaste('')
      setParsedPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload trades')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelUpload = () => {
    setParsedPreview(null)
    setNotes([])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnlyAccess) {
      setError('This reset window is now read only. Start a new package or live tier to upload fresh trades.')
      resetFileInput()
      return
    }
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file')
      resetFileInput()
      return
    }

    let rescuedNotes: string[] = []

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const rescued = await rescueCsvForUpload(file)
      rescuedNotes = rescued.notes
      const result = await uploadTradesCSV(rescued.file)

      if (sampleMode || result.status === 'sample') {
        setSuccess('Sample workspace accepted the file for preview only.')
        setNotes([
          ...buildSampleNotes(Math.max(result.trades_uploaded, 1)),
          ...(rescued.applied ? rescued.notes : []),
        ])
      } else {
        const memory = await getTradePasteMemory().catch(() => null)
        if (sessionMeta?.caseStatus === 'awaiting_upload' || sessionMeta?.caseStatus === 'awaiting_onboarding' || !sessionMeta?.caseStatus) {
          await logTraderLifecycleEvent({
            event_name: 'first_upload_completed',
          })
        }
        updateSessionMeta({ caseStatus: 'baseline_ready' })
        setSuccess(`Uploaded ${result.trades_uploaded} trades to your live account.`)
        setNotes(
          memory
            ? [
                `${result.trades_uploaded} trades processed from CSV.`,
                ...(rescued.applied ? rescued.notes : []),
                ...formatMemoryDelta(memory),
              ]
            : [
                `${result.trades_uploaded} trades processed from CSV.`,
                ...(rescued.applied ? rescued.notes : []),
                'Analytics reran successfully.',
                'Upload another batch to compare what actually changed between sessions.',
              ],
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      if (rescuedNotes.length > 0) {
        setNotes([
          'Rescue summary before the failed upload:',
          ...rescuedNotes,
          'If the export is still failing, use the template or paste the smallest clean recent block manually.',
        ])
      }
    } finally {
      resetFileInput()
      setLoading(false)
    }
  }

  return (
    <div className="append-trades">
      {!sampleMode && <JourneyProgressCard state={journeyState} />}

      <header className="section-header">
        <p className="badge">Append model</p>
        <h1>Paste today's trades</h1>
        <p className="text-muted">
          We normalize any format, dedupe against your baseline, and rerun analytics. The point is not file
          handling. The point is knowing what changed in your behavior after each session.
        </p>
      </header>

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <p className="badge">{sampleMode ? 'Sample workspace' : 'Live trader account'}</p>
        <h3 style={{ marginTop: '0.5rem' }}>
          {sampleMode ? 'Learn the workflow before you connect real data.' : 'Append trades and inspect the delta, not just the upload.'}
        </h3>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          {sampleMode
            ? 'Sample workspace lets you test paste and CSV parsing without writing to trade history. When you switch to a live account, uploads persist and feed your real dashboard, alerts, and prescriptions.'
            : 'Live mode writes to your account history. Each upload should leave you with a cleaner view of win rate, discipline tax, stress score, and the decisions you need to make next.'}
        </p>
        {!sampleMode && traderMode && (
          <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            Current mode: {humanizeTraderMode(traderMode)}. Upload the block that best exposes the leak you actually need fixed, not the prettiest export you can find.
          </p>
        )}
      </section>

      {readOnlyAccess && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <p className="badge">Read only</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            This one-time reset window has expired. You can still review the board and trade history, but new uploads require a fresh package or a live monthly tier.
          </p>
        </div>
      )}

      {error && (
        <div className="error-panel glass-panel">
          <p>Warning: {error}</p>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setError(null)}
            style={{ marginTop: '0.5rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="success-panel glass-panel">
          <p>{success}</p>
          {!sampleMode && (
            <div className="flex items-center gap-3" style={{ marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-sm btn-primary" style={{ display: 'inline-flex' }}>
                Open Action Board
              </Link>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                Redirecting there automatically in a moment.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="append-grid">
        <div className="glass-panel">
          <div className="csv-requirements">
            <div className="requirements-header">
              <span className="requirements-title">
                CSV format requirements
                <InfoTooltip content="Your CSV must include these exact column headers." />
              </span>
              <button className="btn btn-sm btn-secondary" onClick={downloadTemplate}>
                Download template
              </button>
            </div>
            <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              Auto-rescue now handles the ugly-export reality too: semicolon, tab, and pipe files, split
              date/time columns, currency-formatted PnL, and obvious ledger or charge rows.
            </p>
            <div className="requirements-list">
              <div className="requirement-item">
                <code>timestamp</code>
                <span>Entry time (YYYY-MM-DD HH:MM:SS)</span>
              </div>
              <div className="requirement-item">
                <code>exit_time</code>
                <span>Exit time (YYYY-MM-DD HH:MM:SS)</span>
              </div>
              <div className="requirement-item">
                <code>Symbol</code>
                <span>Trading instrument (for example, NIFTY, BANKNIFTY, RELIANCE, TCS)</span>
              </div>
              <div className="requirement-item">
                <code>size</code>
                <span>Position size in lots</span>
              </div>
              <div className="requirement-item">
                <code>pnl</code>
                <span>Profit or loss in account currency</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>{uploadPlaybook.title}</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Best source right now: {uploadPlaybook.sourceLabel}. {uploadPlaybook.successHint}
            </p>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              Fallback if the native export is ugly: {uploadPlaybook.fallbackSource}
            </p>
            <div className="grid-responsive two" style={{ marginBottom: '0.75rem' }}>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Best path</strong>
                <ul className="notes-list">
                  {uploadPlaybook.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
              <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Watchouts</strong>
                <ul className="notes-list">
                  {uploadPlaybook.watchouts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          {!sampleMode && (
            <ImportConciergeCard
              profile={profileContext}
              playbook={uploadPlaybook}
              premiumAccess={premiumAccess}
            />
          )}

          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Popular export starting points</h4>
            <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
              If you trade through Zerodha, Dhan, Angel One, Upstox, FYERS, MT4, MT5, or a prop platform, export the session to CSV and map it into the template if needed. The point is not perfect formatting. The point is getting the next-session leak on screen quickly.
            </p>
            <div className="grid-responsive three" style={{ marginBottom: '0.75rem' }}>
              {INDIA_EXPORT_PRESETS.map((preset) => (
                <article key={preset.label} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{preset.label}</strong>
                  <p className="text-muted" style={{ marginBottom: 0 }}>{preset.body}</p>
                </article>
              ))}
            </div>
            <ul className="notes-list">
              <li>Use one row per closed trade.</li>
              <li>Keep timestamps in local trade order so session clusters stay interpretable.</li>
              <li>Profit and loss should be in your account currency.</li>
              <li>If your broker only emails contract notes, export the recent closed trades from there and clean it into the template. That is a valid V1 path.</li>
            </ul>
          </div>

          <div className="upload-section">
            <label className="file-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading || readOnlyAccess}
              />
              <span className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}>
                {loading ? 'Uploading...' : 'Upload CSV file'}
              </span>
            </label>
            <p className="text-muted divider">or paste trades below</p>
          </div>

          <label>
            Trades
            <textarea
              value={paste}
              onChange={(event) => {
                setPaste(event.target.value)
                if (parsedPreview) {
                  setParsedPreview(null)
                  setNotes([])
                }
              }}
              placeholder={SAMPLE_PLACEHOLDER}
              disabled={loading || readOnlyAccess}
            />
          </label>

          {!parsedPreview ? (
            <button className="btn btn-secondary" onClick={handleParse} disabled={!paste.trim() || loading || readOnlyAccess}>
              {loading ? 'Parsing...' : 'Parse and preview trades'}
            </button>
          ) : (
            <div className="confirm-actions">
              <button className="btn btn-primary" onClick={handleConfirmUpload} disabled={loading || readOnlyAccess}>
                {loading ? 'Uploading...' : `Confirm upload (${parsedPreview.rowsParsed} trades)`}
              </button>
              <button className="btn btn-secondary" onClick={handleCancelUpload} disabled={loading}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="glass-panel">
          <p className="badge">Trade Paste Memory</p>
          {notes.length === 0 ? (
            <div>
              <p className="text-muted">
                {sampleMode
                  ? 'Parse a sample session to see what the workflow feels like.'
                  : 'Upload a real session to see what changed between your latest and previous baseline.'}
              </p>
              <ul className="notes-list">
                <li>Win rate</li>
                <li>Discipline tax</li>
                <li>Stress score (BDS)</li>
                <li>Sharpe ratio</li>
              </ul>
            </div>
          ) : (
            <ul className="notes-list">
              {notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}

          <div className="supported-platforms">
            <p className="platform-label">Supported Platforms</p>
            <div className="platform-list">
              <span className="platform-badge">Zerodha CSV</span>
              <span className="platform-badge">Dhan CSV</span>
              <span className="platform-badge">Angel One CSV</span>
              <span className="platform-badge">Upstox CSV</span>
              <span className="platform-badge">FYERS CSV</span>
              <span className="platform-badge">MT4</span>
              <span className="platform-badge">MT5</span>
              <span className="platform-badge">Prop Portal CSV</span>
              <span className="platform-badge">Contract Note Export</span>
              <span className="platform-badge">Email Contract Note</span>
              <span className="platform-badge">Custom CSV</span>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>What happens after upload</h4>
            <ul className="notes-list">
              <li>Your account history updates.</li>
              <li>The Action Board reranks the most expensive behavioral leak.</li>
              <li>Trade Paste Memory compares this session against the previous one.</li>
              <li>Reset Pro traders unlock the deeper corrective surfaces when they matter.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
