import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getTraderProfileContext,
  logTraderLifecycleEvent,
} from '../../lib/api/trader'
import {
  getTradePasteMemory,
  parseTradePaste,
  submitParsedTrades,
  uploadTradesCSV,
} from '../../lib/api/dashboard'
import { JourneyProgressCard } from '../../components/dashboard/JourneyProgressCard'
import { ImportConciergeCard } from '../../components/dashboard/ImportConciergeCard'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { getShibuyaRuntimeContract, getStoredSessionMeta, isReadOnlySession, updateSessionMeta } from '../../lib/runtime'
import { buildJourneyState } from '../../lib/journeyState'
import { addMarketToPath } from '../../lib/market'
import { buildUploadPlaybook } from '../../lib/uploadPlaybook'
import { rescueCsvForUpload } from '../../lib/csvRescue'
import { humanizeTraderMode } from '../../lib/traderMode'
import { getFingerprintAxis, getPublicStorySignalMarkers, getTraderArchetype } from '../../lib/storyExperience'
import type { ShibuyaSessionMeta } from '../../lib/runtime'
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

function buildLiveActivationProofTarget(sessionMeta: ShibuyaSessionMeta | null) {
  if (!sessionMeta?.activationSource) {
    return null
  }

  const archetype = sessionMeta.activationArchetypeId ? getTraderArchetype(sessionMeta.activationArchetypeId) : null
  const selectedPainAxisLabels = sessionMeta.activationSelectedPainAxisIds?.map((axisId) => getFingerprintAxis(axisId).label) ?? []
  const signalMarkerLabels = getPublicStorySignalMarkers(sessionMeta.activationSignalMarkerIds).map((marker) => marker.label)
  const storySource = sessionMeta.activationStorySource
  const visitedSceneCount = sessionMeta.activationVisitedSceneCount ?? 0
  const activationTitle = sessionMeta.activationSource === 'locked_insight'
    ? 'Activated from locked report module'
    : sessionMeta.activationSource === 'free_report'
      ? 'Activated from public report'
      : 'Activated from public journey'

  return {
    activationTitle,
    reportId: sessionMeta.activationReportId ?? 'Direct activation',
    lockedSection: sessionMeta.activationLockedSectionTitle ?? sessionMeta.activationLockedSectionId ?? 'Not provided',
    fingerprint: [
      archetype ? `${archetype.name}: ${archetype.title}` : null,
      sessionMeta.activationAxisId ? getFingerprintAxis(sessionMeta.activationAxisId).label : null,
    ].filter(Boolean).join(' - ') || 'Not provided',
    storyHandoff: storySource
      ? `${storySource}; scenes ${visitedSceneCount}; axes ${selectedPainAxisLabels.join(', ') || 'none captured'}`
      : 'No guided story packet attached.',
    signalMarkers: signalMarkerLabels.length ? signalMarkerLabels.join(', ') : 'No public markers attached.',
    bridgeHeadline: sessionMeta.activationBridgeHeadline,
    bridgeDecisionQuestion: sessionMeta.activationBridgeDecisionQuestion,
    bridgeWhyNow: sessionMeta.activationBridgeWhyNow,
    bridgeLiveProof: sessionMeta.activationBridgeLiveProof ?? [],
  }
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
  const runtimeContract = getShibuyaRuntimeContract()
  const sampleMode = runtimeContract.mode === 'sample'
  const navigate = useNavigate()
  const sessionMeta = getStoredSessionMeta()
  const resetProPreview = sampleMode && sessionMeta?.samplePreview === 'reset_pro'
  const market = sessionMeta?.market ?? 'india'
  const readOnlyAccess = isReadOnlySession(sessionMeta)
  const premiumAccess = sessionMeta?.tier === 'reset_pro'
  const journeyState = buildJourneyState({ overview: null, profile: null, sessionMeta, market })
  const uploadPlaybook = useMemo(() => buildUploadPlaybook(profileContext), [profileContext])
  const traderMode = profileContext?.trader_mode ?? sessionMeta?.traderMode
  const liveActivationProofTarget = sampleMode ? null : buildLiveActivationProofTarget(sessionMeta)
  const resetProProofReceiptRows = [
    {
      label: 'Unlock receipt carried',
      body: sessionMeta?.demoUnlockReceiptId
        ? `${sessionMeta.demoUnlockReceiptId}. ${sessionMeta.demoUnlockBoundary ?? 'Founder gate receipt was attached without exposing the private code.'}`
        : 'No private demo unlock receipt was attached to this sample append.',
    },
    {
      label: 'Sample parse demonstrated',
      body: 'The operator showed how a session enters the proof loop without claiming the sample account changed.',
    },
    {
      label: 'Private question preserved',
      body: sessionMeta?.demoBridgeDecisionQuestion
        ?? sessionMeta?.demoLockedSectionTitle
        ?? 'No locked private question was attached to this sample run.',
    },
    {
      label: 'Live proof still required',
      body: 'Activation, first meaningful upload, generated artifacts, and append history are still required before any account-specific Reset Pro conclusion.',
    },
  ]
  const resetProCloseChecklistRows = [
    {
      label: 'Context carried',
      body: sessionMeta?.demoBridgeDecisionQuestion
        ? `Close with the carried question: ${sessionMeta.demoBridgeDecisionQuestion}`
        : sessionMeta?.demoLockedSectionTitle
          ? `Close with the locked module: ${sessionMeta.demoLockedSectionTitle}`
          : 'No private question was attached; call this a cold sample append.',
    },
    {
      label: 'Workflow to show',
      body: 'Load sample trades, parse preview, confirm sample append, then read the append receipt.',
    },
    {
      label: 'Forbidden close',
      body: 'Do not claim persistence, backend analytics, trader improvement, or live account evidence from sample mode.',
    },
    {
      label: 'Live proof path',
      body: 'Activation, real upload, generated artifacts, and repeat append packets are the evidence path.',
    },
  ]

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

  const loadResetProSampleAppend = () => {
    setPaste(SAMPLE_PLACEHOLDER)
    setError(null)
    setSuccess(null)
    setParsedPreview(null)
    setNotes([
      'Reset Pro sample append packet loaded. Parse it to demonstrate the proof exit without claiming live persistence.',
      sessionMeta?.demoBridgeDecisionQuestion
        ? `Question being preserved: ${sessionMeta.demoBridgeDecisionQuestion}`
        : 'No carried private question was attached to this sample append.',
    ])
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

      <div style={{ marginBottom: '1.5rem' }}>
        <PublicJourneySpine
          activeStage="append"
          detail="Close the sample Reset Pro demo on append proof. The endpoint shows workflow continuity, while live evidence still requires activation, normalized upload, generated artifacts, and repeat append history."
        />
      </div>

      <header className="section-header">
        <p className="badge">Append model</p>
        <h1>Paste today's trades</h1>
        <p className="text-muted">
          We normalize any format, dedupe against your baseline, and rerun analytics. The point is not file
          handling. The point is knowing what changed in your behavior after each session.
        </p>
      </header>

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <p className="badge">{runtimeContract.label}</p>
        <h3 style={{ marginTop: '0.5rem' }}>
          {sampleMode ? 'Learn the workflow before you connect real data.' : 'Append trades and inspect the delta, not just the upload.'}
        </h3>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          {sampleMode
            ? runtimeContract.proofBoundary
            : 'Live mode writes to your account history. Each upload should leave you with a cleaner view of win rate, discipline tax, stress score, and the decisions you need to make next.'}
        </p>
        {!sampleMode && traderMode && (
          <p className="text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            Current mode: {humanizeTraderMode(traderMode)}. Upload the block that best exposes the leak you actually need fixed, not the prettiest export you can find.
          </p>
        )}
      </section>

      {liveActivationProofTarget ? (
        <section
          className="glass-panel"
          style={{
            marginBottom: '1.5rem',
            borderColor: 'rgba(16,185,129,0.24)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.09), rgba(14,165,233,0.05))',
          }}
        >
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>LIVE ACTIVATION PROOF TARGET</p>
              <h3 style={{ marginBottom: '0.5rem' }}>First meaningful upload turns this from carried context into account evidence.</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Payment and activation preserved the public story, report, and locked question. This page is the evidence checkpoint:
                upload real history, generate backend artifacts, then use append history to prove whether behavior changed.
              </p>
            </div>
          </div>
          <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            {[
              ['Origin', liveActivationProofTarget.activationTitle],
              ['Report', liveActivationProofTarget.reportId],
              ['Locked module', liveActivationProofTarget.lockedSection],
              ['Public fingerprint', liveActivationProofTarget.fingerprint],
              ['Story handoff', liveActivationProofTarget.storyHandoff],
              ['Public signal markers', liveActivationProofTarget.signalMarkers],
            ].map(([label, value]) => (
              <article key={label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{label}</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{value}</p>
              </article>
            ))}
          </div>
          {liveActivationProofTarget.bridgeDecisionQuestion ? (
            <article
              className="glass-panel"
              style={{
                marginTop: '1rem',
                background: 'rgba(16,185,129,0.08)',
                borderColor: 'rgba(16,185,129,0.22)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO LIVE QUESTION</p>
              <h4 style={{ marginBottom: '0.5rem' }}>
                {liveActivationProofTarget.bridgeHeadline ?? 'The private question survived activation.'}
              </h4>
              <p style={{ marginBottom: '0.75rem', fontWeight: 700 }}>{liveActivationProofTarget.bridgeDecisionQuestion}</p>
              {liveActivationProofTarget.bridgeWhyNow ? (
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{liveActivationProofTarget.bridgeWhyNow}</p>
              ) : null}
              <p className="text-muted" style={{ marginBottom: liveActivationProofTarget.bridgeLiveProof.length ? '0.75rem' : 0 }}>
                The answer remains locked until this account supplies normalized history, generated artifacts, and repeat append evidence.
              </p>
              {liveActivationProofTarget.bridgeLiveProof.length ? (
                <ul className="notes-list" style={{ marginBottom: 0 }}>
                  {liveActivationProofTarget.bridgeLiveProof.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ) : null}
        </section>
      ) : null}

      <section
        className="glass-panel"
        style={{
          marginBottom: '1.5rem',
          borderColor: resetProPreview ? 'rgba(129, 140, 248, 0.28)' : 'rgba(255,255,255,0.08)',
          background: resetProPreview ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO PROOF EXIT</p>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {sampleMode ? 'This is the demo endpoint, not live evidence.' : 'This is where the live proof loop starts.'}
            </h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              The private demo ends here on purpose: parsing a sample proves the workflow, while live upload is what creates persistent history, deltas, and report artifacts.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {[
            {
              label: 'Parser preview',
              status: 'Ready now',
              detail: sampleMode
                ? 'Paste a sample block to show how Shibuya reads trade history without writing account data.'
                : 'Paste or upload a real session to preview what will be appended before committing it.',
            },
            {
              label: 'Persistence',
              status: sampleMode ? 'Sample only' : 'Live write',
              detail: sampleMode
                ? 'Sample mode does not persist uploads, change account history, or prove trader-specific improvement.'
                : 'Confirmed uploads write to the live account and move the workspace toward baseline_ready.',
            },
            {
              label: 'Reset Pro review',
              status: sampleMode ? 'Still locked for proof' : 'Evidence path',
              detail: sampleMode
                ? 'Guided review language can be demonstrated, but the real checkpoint requires activation plus the first meaningful upload.'
                : 'The first meaningful upload is the evidence trigger for deeper Reset Pro review surfaces.',
            },
          ].map((item) => (
            <article key={item.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>{item.status}</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{item.label}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{item.detail}</p>
            </article>
          ))}
        </div>
        {resetProPreview ? (
          <>
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: 'rgba(129, 140, 248, 0.3)',
                background: 'rgba(99,102,241,0.08)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO APPEND CLOSE CHECKLIST</p>
              <h4 style={{ marginBottom: '0.5rem' }}>End the demo by proving the workflow, not the trader.</h4>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                Use this before loading the sample packet so the close stays tight: context carried, workflow shown,
                claims bounded, live proof path stated.
              </p>
              <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
                {resetProCloseChecklistRows.map((row) => (
                  <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: 'rgba(125,211,252,0.22)',
                background: 'rgba(14,165,233,0.07)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO SAMPLE APPEND PACKET</p>
              <h4 style={{ marginBottom: '0.5rem' }}>Load the closing sample in one click.</h4>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                This fills the paste parser with a tiny trade block so the presenter can show parse, confirm, and append receipt.
                It is still sample workflow proof only.
              </p>
              <button className="btn btn-sm btn-secondary" type="button" onClick={loadResetProSampleAppend}>
                Load Reset Pro Sample Trades
              </button>
            </div>
          </>
        ) : null}
      </section>

      {readOnlyAccess && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <p className="badge">Read only</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            This legacy bounded reset window has expired. You can still review the board and trade history, but new uploads require a live monthly tier.
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
          {resetProPreview ? (
            <div
              className="glass-panel"
              style={{
                marginTop: '1rem',
                borderColor: 'rgba(16,185,129,0.24)',
                background: 'rgba(16,185,129,0.07)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO APPEND PROOF RECEIPT</p>
              <h3 style={{ marginBottom: '0.5rem' }}>The demo closed correctly: workflow shown, live proof still locked.</h3>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                This receipt is the final presenter boundary after the private workspace demo. It proves the append path is understandable;
                it does not prove trader-specific improvement, persistence, or generated backend analytics.
              </p>
              <div className="grid-responsive three">
                {resetProProofReceiptRows.map((row) => (
                  <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
                    <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
                  </article>
                ))}
              </div>
              <div className="flex items-center gap-3" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                <Link to={addMarketToPath('/dashboard', market)} className="btn btn-sm btn-primary">
                  Return To Mission HQ
                </Link>
                <Link to={addMarketToPath('/pricing?upgrade=reset-pro', market)} className="btn btn-sm btn-secondary">
                  Activate Live Reset Pro
                </Link>
              </div>
            </div>
          ) : null}
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
