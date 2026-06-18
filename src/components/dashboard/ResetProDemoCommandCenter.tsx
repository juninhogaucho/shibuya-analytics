import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { BehavioralFingerprint } from '../landing/BehavioralFingerprint'
import { formatMoney } from '../../lib/display'
import { buildResetProDemoScript, type ResetProDemoOrigin } from '../../lib/resetProDemo'
import { addMarketToPath, type Market } from '../../lib/market'
import type { DashboardOverview } from '../../lib/types'

interface ResetProDemoCommandCenterProps {
  market: Market
  overview: DashboardOverview
  origin?: ResetProDemoOrigin
}

const OPERATOR_STRIP_CLOSE_MARKER = 'Close On Append Proof'

function renderMetricValue(metric: { kind: 'money' | 'percent' | 'text'; value: number | string }, market: Market) {
  if (metric.kind === 'money' && typeof metric.value === 'number') {
    return formatMoney(metric.value, market)
  }

  if (metric.kind === 'percent' && typeof metric.value === 'number') {
    return `${metric.value.toFixed(1)}%`
  }

  return metric.value
}

export function ResetProDemoCommandCenter({ market, overview, origin }: ResetProDemoCommandCenterProps) {
  const script = buildResetProDemoScript(overview, origin)
  const uploadPath = addMarketToPath('/dashboard/upload', market)
  const primaryRoute = script.presenterRoute[0]
  const closeRoute = script.presenterRoute[script.presenterRoute.length - 1]
  const nextShowRoute = script.presenterRoute.find((step) => step.phase === 'show') ?? closeRoute
  const workspaceStatusRows = [
    {
      label: 'Mode: sample-only',
      value: 'Reset Pro preview workspace',
      body: 'Demo data is loaded for structure and talk track only; no live backend artifact or account-specific claim is proven.',
    },
    {
      label: 'Context carried',
      value: origin?.evidenceLabel ?? (origin?.reportId ? 'URL context only' : 'Direct demo entry'),
      body: origin?.bridgeDecisionQuestion
        ? `Private question attached: ${origin.bridgeDecisionQuestion}`
        : origin?.lockedSectionTitle
          ? `Locked module attached: ${origin.lockedSectionTitle}`
          : 'No public report or locked question is attached; frame this as a cold sample workspace.',
    },
    {
      label: 'Next proof required',
      value: 'Append-proof exit',
      body: 'Close the workspace by showing upload/append. Live proof starts with activation, real history, generated artifacts, and repeat append packets.',
    },
  ]
  const privateGateContinuityRows = [
    {
      label: 'Checksum status',
      value: origin?.privateGateChecksum ? 'Attached after founder unlock' : 'Not attached',
      body: origin?.privateGateChecksum
        ?? 'No locked-insight checksum was stored. Treat this as a direct sample workspace, not a completed public-to-private route.',
    },
    {
      label: 'Allowed use',
      value: 'Continuity check only',
      body: 'The checksum may prove the same public question reached Reset Pro. It may not prove a live answer, payment, backend upload, or trader-specific conclusion.',
    },
  ]

  return (
    <section
      className="glass-panel"
      style={{
        marginBottom: '1.5rem',
        borderColor: 'rgba(16, 185, 129, 0.24)',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.06), rgba(255,255,255,0.02))',
      }}
    >
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <p className="badge" style={{ marginBottom: 0 }}>PRIVATE RESET PRO DEMO</p>
            <span className="badge">3-MINUTE PATH</span>
            <span className="badge">{market === 'global' ? 'MARKET: GLOBAL' : 'MARKET: INDIA'}</span>
            <span className="badge">DEMO DATA ONLY</span>
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{script.headline}</h3>
          <p className="text-muted" style={{ maxWidth: '62rem', marginBottom: 0 }}>{script.subline}</p>
        </div>
        <Link to={uploadPath} className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }}>
          Append Proof
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.16)' }}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-300" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
          <div>
            <h4 style={{ marginBottom: '0.35rem' }}>Founder thesis</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>{script.demoThesis}</p>
          </div>
        </div>
      </div>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(34,211,238,0.07)',
          borderColor: 'rgba(34,211,238,0.22)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO LIVING MIRROR</p>
            <h4 style={{ marginBottom: '0.35rem' }}>{script.livingMirror.headline}</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {script.livingMirror.body}
            </p>
          </div>
          <span className="badge">{script.livingMirror.dominantAxisLabel}</span>
        </div>
        <div className="grid-responsive two" style={{ marginTop: '1rem', alignItems: 'start' }}>
          <div>
            <BehavioralFingerprint scores={script.livingMirror.fingerprintScores} />
            <p className="text-muted" style={{ margin: '0.75rem 0 0', fontSize: '0.82rem' }}>
              Public fingerprint: {script.livingMirror.publicFingerprintLabel}
            </p>
          </div>
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
            {script.livingMirror.rows.map((row) => (
              <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="badge" style={{ marginBottom: '0.5rem' }}>{row.label}</p>
                <h4 style={{ marginBottom: '0.5rem' }}>{renderMetricValue(row, market)}</h4>
                <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="text-muted" style={{ margin: '1rem 0 0', fontSize: '0.82rem' }}>
          <strong className="text-amber-100">Boundary:</strong> {script.livingMirror.boundary}
        </p>
      </article>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(129,140,248,0.07)',
          borderColor: 'rgba(129,140,248,0.22)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO WORKSPACE STATUS SNAPSHOT</p>
            <h4 style={{ marginBottom: '0.35rem' }}>Know what is live, what is carried, and what must be proven next.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Read this before showing metrics. It keeps the private workspace demo aligned with the public story and locked-report proof boundary.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {workspaceStatusRows.map((row) => (
            <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>{row.label}</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{row.value}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
            </article>
          ))}
        </div>
      </article>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(217,70,239,0.07)',
          borderColor: 'rgba(217,70,239,0.22)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO PRIVATE GATE CHECKSUM</p>
            <h4 style={{ marginBottom: '0.35rem' }}>The workspace must match the locked-insight route it received.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              This is the first post-unlock continuity proof. It confirms route identity and claim boundary only.
            </p>
          </div>
        </div>
        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          {privateGateContinuityRows.map((row) => (
            <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>{row.label}</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{row.value}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
            </article>
          ))}
        </div>
      </article>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(245,158,11,0.07)',
          borderColor: 'rgba(245,158,11,0.22)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO DEMO DECISION PACKET</p>
            <h4 style={{ marginBottom: '0.35rem' }}>{script.decisionPacket.headline}</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              <strong className="text-white">Say first:</strong> {script.decisionPacket.sayFirst}
            </p>
          </div>
          <span className="badge">{script.decisionPacket.statusLabel}</span>
        </div>
        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Proceed if</h4>
            <ul className="digest-preview" style={{ marginBottom: 0 }}>
              {script.decisionPacket.proceedIf.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(244,63,94,0.07)', borderColor: 'rgba(244,63,94,0.2)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Stop if</h4>
            <ul className="digest-preview" style={{ marginBottom: 0 }}>
              {script.decisionPacket.stopIf.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </article>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(14,165,233,0.075)',
          borderColor: 'rgba(125,211,252,0.22)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO UNLOCK RECEIPT</p>
            <h4 style={{ marginBottom: '0.35rem' }}>{script.unlockReceipt.headline}</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {script.unlockReceipt.nextAction}
            </p>
          </div>
          <span className="badge">{script.unlockReceipt.statusLabel}</span>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          {script.unlockReceipt.facts.map((fact) => (
            <div key={fact} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)' }}>
              <p className="text-muted" style={{ marginBottom: 0, fontSize: '0.85rem' }}>{fact}</p>
            </div>
          ))}
        </div>
        <p className="text-muted" style={{ margin: '1rem 0 0', fontSize: '0.82rem' }}>
          <strong className="text-amber-100">Boundary:</strong> {script.unlockReceipt.boundary}
        </p>
      </article>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(0,0,0,0.2)',
          borderColor: 'rgba(129,140,248,0.24)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top right, rgba(129,140,248,0.18), transparent 42%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO OPERATOR STRIP</p>
              <h4 style={{ marginBottom: '0.35rem' }}>One guided path after unlock. No dashboard wandering.</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                Start at Mission HQ, show one intervention surface, then close on append proof. The deeper cards below are supporting evidence, not the demo script.
              </p>
            </div>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link to={addMarketToPath(primaryRoute.route, market)} className="btn btn-sm btn-primary">
                {primaryRoute.routeLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to={addMarketToPath(nextShowRoute.route, market)} className="btn btn-sm btn-secondary">
                {nextShowRoute.routeLabel}
              </Link>
              <Link to={addMarketToPath(closeRoute.route, market)} className="btn btn-sm btn-secondary">
                {closeRoute.routeLabel || OPERATOR_STRIP_CLOSE_MARKER}
              </Link>
            </div>
          </div>

          <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
            {script.showSequence.map((moment, index) => (
              <div
                key={`${moment.timebox}-${moment.title}-operator-strip`}
                className="glass-panel"
                style={{
                  background: index === 0
                    ? 'rgba(16,185,129,0.07)'
                    : index === script.showSequence.length - 1
                      ? 'rgba(245,158,11,0.07)'
                      : 'rgba(99,102,241,0.06)',
                  borderColor: index === 0
                    ? 'rgba(16,185,129,0.22)'
                    : index === script.showSequence.length - 1
                      ? 'rgba(245,158,11,0.22)'
                      : 'rgba(99,102,241,0.2)',
                }}
              >
                <p className="badge" style={{ marginBottom: '0.5rem' }}>{moment.timebox}</p>
                <h4 style={{ marginBottom: '0.45rem' }}>{index + 1}. {moment.title}</h4>
                <p className="text-muted" style={{ marginBottom: '0.65rem' }}>{moment.say}</p>
                <p className="text-muted" style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                  <strong className="text-amber-100">Boundary:</strong> {moment.boundary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article
        className="glass-panel"
        style={{
          marginTop: '1rem',
          background: 'rgba(245,158,11,0.07)',
          borderColor: 'rgba(245,158,11,0.22)',
        }}
      >
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO CLOSE CONTRACT</p>
            <h4 style={{ marginBottom: '0.35rem' }}>{script.closeContract.headline}</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>{script.closeContract.body}</p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {script.closeContract.rows.map((row) => (
            <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
            </article>
          ))}
        </div>
      </article>

      <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>DEMO CLAIM LEDGER</p>
            <h4 style={{ marginBottom: '0.35rem' }}>What the presenter may say, and what stays forbidden.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              This is the first workspace-level truth check after unlock. Use it before showing any sample metric.
            </p>
          </div>
        </div>
        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Allowed claims</h4>
            <ul className="digest-preview" style={{ marginBottom: 0 }}>
              {script.claimLedger.allowed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="glass-panel" style={{ background: 'rgba(244,63,94,0.07)', borderColor: 'rgba(244,63,94,0.2)' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Forbidden claims</h4>
            <ul className="digest-preview" style={{ marginBottom: 0 }}>
              {script.claimLedger.forbidden.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </article>

      <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(14,165,233,0.055)', borderColor: 'rgba(125,211,252,0.2)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO OBJECTION MAP</p>
            <h4 style={{ marginBottom: '0.35rem' }}>Fast answers for the questions that can break the demo.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Use these responses before continuing the walkthrough. If the answer would require live proof, say that before showing another card.
            </p>
          </div>
        </div>
        <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
          {script.objectionResponses.map((item) => (
            <article key={item.prompt} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>IF ASKED</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{item.prompt}</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                <strong className="text-white">Answer:</strong> {item.response}
              </p>
              <p className="text-muted" style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                <strong className="text-amber-100">Boundary:</strong> {item.boundary}
              </p>
            </article>
          ))}
        </div>
      </article>

      <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(16,185,129,0.065)', borderColor: 'rgba(16,185,129,0.22)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>PRESENTER ROUTE</p>
            <h4 style={{ marginBottom: '0.35rem' }}>Run the private demo from this rail first.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              The longer command center stays below for detail. This rail is the actual first-screen path after the founder gate.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {script.presenterRoute.map((step) => (
            <article
              key={`${step.phase}-${step.label}`}
              className="glass-panel"
              style={{
                background: step.phase === 'start'
                  ? 'rgba(16,185,129,0.08)'
                  : step.phase === 'close'
                    ? 'rgba(245,158,11,0.08)'
                    : 'rgba(99,102,241,0.07)',
                borderColor: step.phase === 'start'
                  ? 'rgba(16,185,129,0.24)'
                  : step.phase === 'close'
                    ? 'rgba(245,158,11,0.24)'
                    : 'rgba(99,102,241,0.22)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>{step.phaseLabel}</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{step.label}</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{step.proof}</p>
              <p className="text-muted" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                <strong className="text-amber-100">Boundary:</strong> {step.boundary}
              </p>
              <Link to={addMarketToPath(step.route, market)} className="btn btn-sm btn-secondary">
                {step.routeLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </article>

      <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO PROOF LADDER</p>
            <h4 style={{ marginBottom: '0.35rem' }}>What is context, what is demo, and what still needs live proof.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              This keeps the private workspace honest after the founder code unlocks the sample account.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {script.proofLadder.map((stage) => (
            <div
              key={stage.label}
              className="glass-panel"
              style={{
                background: stage.status === 'ready'
                  ? 'rgba(16,185,129,0.07)'
                  : stage.status === 'locked'
                    ? 'rgba(99,102,241,0.07)'
                    : 'rgba(245,158,11,0.07)',
                borderColor: stage.status === 'ready'
                  ? 'rgba(16,185,129,0.22)'
                  : stage.status === 'locked'
                    ? 'rgba(99,102,241,0.22)'
                    : 'rgba(245,158,11,0.22)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>
                {stage.status === 'ready' ? 'CARRIED' : stage.status === 'locked' ? 'LIVE PROOF NEEDED' : 'CALL OUT'}
              </p>
              <h4 style={{ marginBottom: '0.5rem' }}>{stage.label}</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{stage.evidence}</p>
              <p className="text-muted" style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                <strong className="text-amber-100">Boundary:</strong> {stage.boundary}
              </p>
            </div>
          ))}
        </div>
      </article>

      {script.bridgeCard ? (
        <article
          className="glass-panel"
          style={{ marginTop: '1rem', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.24)' }}
        >
          <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO BRIDGE RECEIVED</p>
              <h4 style={{ marginBottom: '0.35rem' }}>{script.bridgeCard.headline}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{script.bridgeCard.whyNow}</p>
            </div>
          </div>

          <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>QUESTION TO PROVE</p>
              <h4 style={{ marginBottom: 0 }}>{script.bridgeCard.decisionQuestion}</h4>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)' }}>
              <p className="badge" style={{ marginBottom: '0.5rem' }}>DEMO BOUNDARY</p>
              <p className="text-muted" style={{ marginBottom: 0 }}>
                This card is carried routing context. It does not become account-specific evidence until live activation, upload, and backend artifacts exist.
              </p>
            </article>
          </div>

          <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(16,185,129,0.18)' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Live Reset Pro must prove</h4>
              <ul className="digest-preview" style={{ marginBottom: 0 }}>
                {script.bridgeCard.liveProof.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="glass-panel" style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(129,140,248,0.18)' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Private demo may show</h4>
              <ul className="digest-preview" style={{ marginBottom: 0 }}>
                {script.bridgeCard.previewShows.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </article>
      ) : null}

      <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.025)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>FOUNDER SHOW SEQUENCE</p>
            <h4 style={{ marginBottom: '0.35rem' }}>Three minutes, no improvising.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Use this path when the demo starts from a public story, locked report, or private insight handoff.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {script.showSequence.map((moment) => (
            <div
              key={`${moment.timebox}-${moment.title}`}
              className="glass-panel"
              style={{ background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>{moment.timebox}</p>
              <h4 style={{ marginBottom: '0.5rem' }}>{moment.title}</h4>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                <strong className="text-white">Say:</strong> {moment.say}
              </p>
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                <strong className="text-white">Show:</strong> {moment.show}
              </p>
              <p className="text-muted" style={{ marginBottom: 0, fontSize: '0.8rem' }}>
                <strong className="text-amber-100">Boundary:</strong> {moment.boundary}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.14)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>DEMO READINESS CHECKLIST</p>
            <h4 style={{ marginBottom: '0.35rem' }}>Before showing the workspace.</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Use this as the operator control surface: show only what is marked ready, and call out warnings before the viewer asks.
            </p>
          </div>
        </div>
        <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {script.readinessChecklist.map((item) => (
            <div
              key={item.label}
              className="glass-panel"
              style={{
                background: item.status === 'ready' ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
                borderColor: item.status === 'ready' ? 'rgba(16,185,129,0.22)' : 'rgba(245,158,11,0.22)',
              }}
            >
              <p className="badge" style={{ marginBottom: '0.5rem' }}>
                {item.status === 'ready' ? 'READY' : 'CALL OUT'}
              </p>
              <h4 style={{ marginBottom: '0.5rem' }}>{item.label}</h4>
              <p className="text-muted" style={{ marginBottom: 0 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
        {script.pressureMetrics.map((metric) => (
          <article key={metric.label} className="glass-panel" style={{ background: 'rgba(255,255,255,0.025)' }}>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>{metric.label}</p>
            <div className="text-2xl font-mono font-bold text-white" style={{ marginBottom: '0.5rem' }}>
              {renderMetricValue(metric, market)}
            </div>
            <p className="text-muted" style={{ marginBottom: 0 }}>{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.025)' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Talk track</h4>
          <ol className="digest-preview" style={{ marginBottom: 0 }}>
            {script.founderTalkTrack.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.025)' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Proof artifacts in the preview</h4>
          <ul className="digest-preview" style={{ marginBottom: 0 }}>
            {script.proofArtifacts.map((artifact) => (
              <li key={artifact}>{artifact}</li>
            ))}
          </ul>
        </article>
      </div>

      {script.originCard ? (
        <article className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(129,140,248,0.22)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>{script.originCard.title}</h4>
          <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{script.originCard.body}</p>
          <ul className="digest-preview" style={{ marginBottom: 0 }}>
            {script.originCard.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {script.steps.map((step) => (
          <article
            key={step.label}
            className="glass-panel"
            style={{
              background: 'rgba(255,255,255,0.025)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <h4 style={{ marginBottom: '0.5rem' }}>{step.label}</h4>
            <p className="text-muted" style={{ minHeight: '4.5rem' }}>{step.proof}</p>
            <Link to={addMarketToPath(step.route, market)} className="btn btn-sm btn-secondary">
              {step.routeLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </article>
        ))}
      </div>

      <p
        className="text-muted"
        style={{
          margin: '1rem 0 0',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.85rem',
        }}
      >
        {script.truthBoundary}
      </p>
    </section>
  )
}
