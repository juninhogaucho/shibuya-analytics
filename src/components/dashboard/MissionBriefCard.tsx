import type { PerformanceStory } from '../../lib/performanceStory'

export function MissionBriefCard({ story }: { story: PerformanceStory }) {
  return (
    <section className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.09), rgba(255,255,255,0.02))' }}>
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>MISSION HQ</p>
          <h3 style={{ marginBottom: '0.5rem' }}>{story.campaignChapter}</h3>
          <p className="text-muted" style={{ maxWidth: '60rem', marginBottom: 0 }}>{story.reasonToStay}</p>
        </div>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="badge">{story.operatorIdentity}</span>
          <span className="badge">PRIVATE BY DESIGN</span>
        </div>
      </div>

      <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Operator identity</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.operatorIdentity}</p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Current enemy</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.currentEnemy}</p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Command line</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.commandLine}</p>
        </article>
      </div>

      <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Mission line</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.missionLine}</p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Proof target</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.proofTarget}</p>
        </article>
      </div>

      <div className="grid-responsive two" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Momentum line</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.momentumLine}</p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Why you are here</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>{story.reasonToStay}</p>
        </article>
      </div>
    </section>
  )
}
