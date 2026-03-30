import { useRef, useState } from 'react'
import {
  getTradePasteMemory,
  parseTradePaste,
  submitParsedTrades,
  uploadTradesCSV,
} from '../../lib/api'
import { isSampleMode } from '../../lib/runtime'
import type { TradePasteMemoryResponse } from '../../lib/types'
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

const SAMPLE_PLACEHOLDER = `2024-01-15 09:32 EURUSD BUY 1.0 1.0875 1.0892
2024-01-15 11:45 GBPUSD SELL 0.5 1.2650 1.2635`

const CSV_TEMPLATE = `timestamp,exit_time,Symbol,size,pnl
2024-01-15 09:32:00,2024-01-15 09:58:00,EURUSD,1.0,125.50
2024-01-15 11:45:00,2024-01-15 12:30:00,GBPUSD,0.5,-45.20
2024-01-16 08:15:00,2024-01-16 09:00:00,USDJPY,2.0,89.00`

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sampleMode = isSampleMode()

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
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      resetFileInput()
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const result = await uploadTradesCSV(file)

      if (sampleMode || result.status === 'sample') {
        setSuccess('Sample workspace accepted the file for preview only.')
        setNotes(buildSampleNotes(Math.max(result.trades_uploaded, 1)))
      } else {
        const memory = await getTradePasteMemory().catch(() => null)
        setSuccess(`Uploaded ${result.trades_uploaded} trades to your live account.`)
        setNotes(
          memory
            ? [`${result.trades_uploaded} trades processed from CSV.`, ...formatMemoryDelta(memory)]
            : [
                `${result.trades_uploaded} trades processed from CSV.`,
                'Analytics reran successfully.',
                'Upload another batch to compare what actually changed between sessions.',
              ],
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      resetFileInput()
      setLoading(false)
    }
  }

  return (
    <div className="append-trades">
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
      </section>

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
                <span>Trading pair (for example, EURUSD)</span>
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

          <div className="upload-section">
            <label className="file-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
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
              disabled={loading}
            />
          </label>

          {!parsedPreview ? (
            <button className="btn btn-secondary" onClick={handleParse} disabled={!paste.trim() || loading}>
              {loading ? 'Parsing...' : 'Parse and preview trades'}
            </button>
          ) : (
            <div className="confirm-actions">
              <button className="btn btn-primary" onClick={handleConfirmUpload} disabled={loading}>
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
              <span className="platform-badge">MT4</span>
              <span className="platform-badge">MT5</span>
              <span className="platform-badge">cTrader</span>
              <span className="platform-badge">TradingView</span>
              <span className="platform-badge">Custom CSV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
