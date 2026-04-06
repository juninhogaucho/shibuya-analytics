import { Download } from 'lucide-react'
import { buildFieldKitArtifacts, downloadFieldKitArtifact } from '../../lib/fieldKit'
import type { Market } from '../../lib/market'
import type { PerformanceStory } from '../../lib/performanceStory'
import type { CampaignMetrics, DashboardOverview, TraderProfileContext } from '../../lib/types'

export function FieldKitCard({
  overview,
  profile,
  story,
  metrics,
  market,
  premiumAccess,
}: {
  overview: DashboardOverview
  profile: TraderProfileContext | null
  story: PerformanceStory
  metrics: CampaignMetrics
  market: Market
  premiumAccess: boolean
}) {
  const artifacts = buildFieldKitArtifacts({
    overview,
    profile,
    story,
    metrics,
    market,
    premiumAccess,
  })

  return (
    <section className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.14)', background: 'rgba(99, 102, 241, 0.04)' }}>
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>FIELD KIT</p>
          <h3 style={{ marginBottom: '0.5rem' }}>Unadvertised extras inside your paid workspace.</h3>
          <p className="text-muted" style={{ maxWidth: '60rem', marginBottom: 0 }}>
            These do not exist on the marketing site. They are here because paying users should walk into the market with more than dashboards: station cards, kill switches, review prep, and mode-specific scripts.
          </p>
        </div>
        <span className="badge">{premiumAccess ? 'PREMIUM KIT' : 'CORE KIT'}</span>
      </div>

      <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
        {artifacts.map((artifact) => (
          <article key={artifact.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <span className="badge">{artifact.badge}</span>
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>{artifact.title}</h4>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>{artifact.summary}</p>
            <button className="btn btn-sm btn-secondary" onClick={() => downloadFieldKitArtifact(artifact)}>
              <Download className="w-4 h-4" />
              Download
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
