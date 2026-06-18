import { Link } from 'react-router-dom'
import { addMarketToPath } from '../../lib/market'
import type { ShibuyaSessionMeta } from '../../lib/runtime'
import { getFingerprintAxis, getPublicStorySignalMarkers, getTraderArchetype } from '../../lib/storyExperience'

interface ResetProDemoContextStripProps {
  sessionMeta: ShibuyaSessionMeta
}

export function ResetProDemoContextStrip({ sessionMeta }: ResetProDemoContextStripProps) {
  const market = sessionMeta.market ?? 'india'
  const archetypeLabel = sessionMeta.demoArchetypeId
    ? `${getTraderArchetype(sessionMeta.demoArchetypeId).name}: ${getTraderArchetype(sessionMeta.demoArchetypeId).title}`
    : 'not attached'
  const axisLabel = sessionMeta.demoAxisId ? getFingerprintAxis(sessionMeta.demoAxisId).label : 'not attached'
  const markerLabels = getPublicStorySignalMarkers(sessionMeta.demoSignalMarkerIds).map((marker) => marker.label)
  const continuityRows = [
    {
      label: 'Origin',
      value: sessionMeta.demoSource ?? 'direct_private_demo',
      body: sessionMeta.demoReportId
        ? `Report ${sessionMeta.demoReportId}; module ${sessionMeta.demoLockedSectionTitle ?? sessionMeta.demoLockedSectionId ?? 'not attached'}.`
        : 'No report id is attached. Treat this as a cold sample workspace.',
    },
    {
      label: 'Public context',
      value: `${archetypeLabel} / ${axisLabel}`,
      body: sessionMeta.demoStorySource
        ? `Story ${sessionMeta.demoStorySource}; scenes ${sessionMeta.demoVisitedSceneCount ?? 0}; markers ${markerLabels.length ? markerLabels.join(', ') : 'none'}.`
        : 'No guided story context is attached.',
    },
    {
      label: 'Private gate checksum',
      value: sessionMeta.demoPrivateGateChecksum ?? 'not attached',
      body: sessionMeta.demoPrivateGateChecksum
        ? 'Use this to verify the same locked question survived route changes inside the workspace.'
        : 'No checksum was stored; do not claim a completed locked-insight handoff.',
    },
    {
      label: 'Claim boundary',
      value: 'sample route, not live answer',
      body: sessionMeta.demoUnlockBoundary
        ?? 'Founder demo context can show workflow only; live proof still requires activation, upload, generated artifacts, and append history.',
    },
  ]

  return (
    <section
      className="glass-panel"
      style={{
        marginBottom: '1.25rem',
        borderColor: 'rgba(217, 70, 239, 0.24)',
        background: 'linear-gradient(135deg, rgba(217,70,239,0.1), rgba(59,130,246,0.07), rgba(255,255,255,0.025))',
      }}
    >
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>RESET PRO DEMO CONTEXT STRIP</p>
          <h3 style={{ marginBottom: '0.5rem' }}>Keep the public-to-private handoff visible across every workspace surface.</h3>
          <p className="text-muted" style={{ marginBottom: 0, maxWidth: '62rem' }}>
            This strip follows the founder-gated Reset Pro sample session after unlock. It preserves route continuity
            without converting demo data into live proof.
          </p>
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to={addMarketToPath('/dashboard', market)} className="btn btn-sm btn-secondary">
            Mission HQ
          </Link>
          <Link to={addMarketToPath('/dashboard/upload', market)} className="btn btn-sm btn-primary">
            Append Proof
          </Link>
        </div>
      </div>

      <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {continuityRows.map((row) => (
          <article key={row.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.16)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>{row.label}</p>
            <h4 style={{ marginBottom: '0.5rem' }}>{row.value}</h4>
            <p className="text-muted" style={{ marginBottom: 0 }}>{row.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
