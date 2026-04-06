import { Download } from 'lucide-react'
import { buildImportConcierge, downloadImportConciergeArtifact } from '../../lib/importConcierge'
import type { TraderProfileContext } from '../../lib/types'
import type { UploadPlaybook } from '../../lib/uploadPlaybook'

export function ImportConciergeCard({
  profile,
  playbook,
  premiumAccess,
}: {
  profile: TraderProfileContext | null
  playbook: UploadPlaybook
  premiumAccess: boolean
}) {
  const concierge = buildImportConcierge({
    profile,
    playbook,
    premiumAccess,
  })

  return (
    <section className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(59, 130, 246, 0.16)' }}>
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>IMPORT CONCIERGE</p>
          <h4 style={{ marginBottom: '0.5rem' }}>A rescue layer for the ugly-export reality.</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Paid users should not discover formatting pain and then wonder what to do. This layer gives them the fastest honest path, the rescue path, and the quiet extras.
          </p>
        </div>
        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', minWidth: '9rem', textAlign: 'center' }}>
          <p className="badge" style={{ marginBottom: '0.35rem' }}>UPLOAD READINESS</p>
          <p style={{ marginBottom: '0.25rem', fontSize: '1.35rem', fontWeight: 700 }}>{concierge.readinessScore}/100</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>{concierge.readinessLabel}</p>
        </div>
      </div>

      <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Best first move</h4>
          <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{concierge.firstMove}</p>
          <h4 style={{ marginBottom: '0.5rem' }}>If the export is ugly</h4>
          <ul className="notes-list">
            {concierge.rescueSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Hidden extra</h4>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>{concierge.hiddenGift}</p>
          <div className="grid-responsive two">
            {concierge.artifacts.map((artifact) => (
              <article key={artifact.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h5 style={{ marginBottom: '0.35rem' }}>{artifact.title}</h5>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>{artifact.summary}</p>
                <button className="btn btn-sm btn-secondary" onClick={() => downloadImportConciergeArtifact(artifact)}>
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
