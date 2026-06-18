import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { formatMoney } from '../../lib/display'
import { buildResetProDemoScript, type ResetProDemoOrigin } from '../../lib/resetProDemo'
import { addMarketToPath, type Market } from '../../lib/market'
import type { DashboardOverview } from '../../lib/types'

interface ResetProDemoCommandCenterProps {
  market: Market
  overview: DashboardOverview
  origin?: ResetProDemoOrigin
}

function renderMetricValue(metric: ReturnType<typeof buildResetProDemoScript>['pressureMetrics'][number], market: Market) {
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
