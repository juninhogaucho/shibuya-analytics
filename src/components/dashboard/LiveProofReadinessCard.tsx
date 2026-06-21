import { buildLiveProofReadinessContract } from '../../lib/liveProofReadiness'
import type { BuildLiveProofPhaseOptions } from '../../lib/liveProofPhase'

interface LiveProofReadinessCardProps extends BuildLiveProofPhaseOptions {
  title?: string
  apiBaseUrl?: string
  backendConfigured?: boolean
}

const STATUS_LABELS = {
  ready: 'READY',
  blocked: 'BLOCKED',
  required: 'REQUIRED',
} as const

export function LiveProofReadinessCard({
  title = 'Live proof readiness contract',
  apiBaseUrl,
  backendConfigured,
  overview,
  sessionMeta,
  profileCompleted,
  market,
  mode,
}: LiveProofReadinessCardProps) {
  const contract = buildLiveProofReadinessContract({
    apiBaseUrl,
    backendConfigured,
    overview,
    sessionMeta,
    profileCompleted,
    market,
    mode,
  })

  return (
    <section
      className="glass-panel"
      aria-label="LIVE PROOF READINESS"
      data-proof-rows="Backend target; Activation; First meaningful upload; Append history"
      style={{
        marginBottom: '1.5rem',
        borderColor: contract.statusLabel === 'LIVE BACKEND BLOCKED' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.24)',
        background: contract.statusLabel === 'LIVE BACKEND BLOCKED'
          ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(255,255,255,0.025))'
          : 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))',
      }}
    >
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>LIVE PROOF READINESS</p>
          <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
          <p className="text-muted" style={{ marginBottom: 0 }}>{contract.headline}</p>
          <p className="text-muted" style={{ marginTop: '0.5rem', marginBottom: 0 }}>{contract.body}</p>
        </div>
        <span className="badge">{contract.statusLabel}</span>
      </div>

      <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {contract.rows.map((row) => (
          <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>{STATUS_LABELS[row.status]}</p>
            <h4 style={{ marginBottom: '0.5rem' }}>{row.label}</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>{row.detail}</p>
          </article>
        ))}
      </div>

      <p className="text-muted" style={{ margin: '1rem 0 0', fontSize: '0.85rem' }}>
        <strong className="text-amber-100">Boundary:</strong> {contract.boundary}
      </p>
    </section>
  )
}
