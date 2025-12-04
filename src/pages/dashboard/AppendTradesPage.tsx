import { useState, useRef } from 'react'
import { parseTradePaste, uploadTradesCSV, submitParsedTrades } from '../../lib/api'
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

// CSV template content for download
const CSV_TEMPLATE = `timestamp,exit_time,Symbol,size,pnl
2024-01-15 09:32:00,2024-01-15 09:58:00,EURUSD,1.0,125.50
2024-01-15 11:45:00,2024-01-15 12:30:00,GBPUSD,0.5,-45.20
2024-01-16 08:15:00,2024-01-16 09:00:00,USDJPY,2.0,89.00`

export function AppendTradesPage() {
  const [paste, setPaste] = useState('')
  const [notes, setNotes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [parsedPreview, setParsedPreview] = useState<ParsePreview | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shibuya_trade_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleParse = async () => {
    if (!paste.trim()) return
    
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      setParsedPreview(null)
      
      const preview = await parseTradePaste({ body: paste })
      
      const feedbackNotes = [
        `✓ ${preview.rowsParsed} rows detected`,
        `✓ Symbols: ${preview.symbols.join(', ')}`,
      ]
      
      if (preview.issues && preview.issues.length > 0) {
        feedbackNotes.push(`⚠️ Issues: ${preview.issues.join(', ')}`)
      }
      
      setNotes(feedbackNotes)
      setParsedPreview(preview) // Store for confirmation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse trades')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (!parsedPreview) return
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await submitParsedTrades({ 
        trades: parsedPreview.trades || [],
        rawText: paste 
      })
      
      setSuccess(`🎉 Successfully uploaded ${result.trades_uploaded} trades!`)
      setNotes([
        `${result.trades_uploaded} trades added to your account`,
        '📊 Analytics updated - check Overview for new insights',
        '💡 Edge Portfolio recalculated',
      ])
      
      // Clear form after successful upload
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const result = await uploadTradesCSV(file)
      
      setSuccess(`✅ Successfully uploaded ${result.trades_uploaded} trades!`)
      setNotes([
        `${result.trades_uploaded} trades processed`,
        'Analytics updated - check Overview for new insights',
        'Edge Portfolio recalculated',
      ])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="append-trades">
      <header className="section-header">
        <p className="badge">Append model</p>
        <h1>Paste today's trades</h1>
        <p className="text-muted">
          We normalize any format, dedupe against your baseline, and rerun all analytics. Immediate Trade Paste Memory feedback rewards good behavior.
        </p>
      </header>

      {error && (
        <div className="error-panel glass-panel">
          <p>⚠️ {error}</p>
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
          {/* CSV Format Requirements */}
          <div className="csv-requirements">
            <div className="requirements-header">
              <span className="requirements-title">
                📋 CSV Format Requirements
                <InfoTooltip content="Your CSV must include these exact column headers" />
              </span>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={downloadTemplate}
              >
                ⬇️ Download Template
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
                <span>Trading pair (e.g., EURUSD)</span>
              </div>
              <div className="requirement-item">
                <code>size</code>
                <span>Position size in lots</span>
              </div>
              <div className="requirement-item">
                <code>pnl</code>
                <span>Profit/loss in account currency</span>
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
                {loading ? '⏳ Uploading...' : '📁 Upload CSV file'}
              </span>
            </label>
            <p className="text-muted divider">or paste trades below</p>
          </div>
          
          <label>
            Trades
            <textarea
              value={paste}
              onChange={(e) => {
                setPaste(e.target.value)
                // Clear preview if user changes text
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
            <button 
              className="btn btn-secondary" 
              onClick={handleParse} 
              disabled={!paste.trim() || loading}
            >
              {loading ? '⏳ Parsing...' : '🔍 Parse & preview trades'}
            </button>
          ) : (
            <div className="confirm-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmUpload} 
                disabled={loading}
              >
                {loading ? '⏳ Uploading...' : `✅ Confirm upload (${parsedPreview.rowsParsed} trades)`}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelUpload}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="glass-panel">
          <p className="badge">Trade Paste Memory</p>
          {notes.length === 0 ? (
            <p className="text-muted">Paste trades or upload CSV to see immediate deltas.</p>
          ) : (
            <ul className="notes-list">
              {notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          )}
          
          {/* Supported Platforms */}
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
