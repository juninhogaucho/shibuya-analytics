import { Link } from 'react-router-dom'
import type { JourneyState } from '../../lib/journeyState'

function statusStyles(status: JourneyState['steps'][number]['status']) {
  switch (status) {
    case 'complete':
      return {
        borderColor: 'rgba(16, 185, 129, 0.28)',
        background: 'rgba(16, 185, 129, 0.08)',
        label: 'DONE',
      }
    case 'current':
      return {
        borderColor: 'rgba(59, 130, 246, 0.28)',
        background: 'rgba(59, 130, 246, 0.08)',
        label: 'NOW',
      }
    case 'warning':
      return {
        borderColor: 'rgba(245, 158, 11, 0.28)',
        background: 'rgba(245, 158, 11, 0.08)',
        label: 'ATTN',
      }
    default:
      return {
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        label: 'NEXT',
      }
  }
}

export function JourneyProgressCard({ state }: { state: JourneyState }) {
  return (
    <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>{state.eyebrow}</p>
          <h3 style={{ marginBottom: '0.5rem' }}>{state.title}</h3>
          <p className="text-muted" style={{ maxWidth: '56rem' }}>{state.summary}</p>
        </div>
        {state.nextAction ? (
          <Link to={state.nextAction.to} className="btn btn-sm btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {state.nextAction.label}
          </Link>
        ) : null}
      </div>

      <div className="grid-responsive" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {state.steps.map((step, index) => {
          const styles = statusStyles(step.status)
          return (
            <article
              key={step.key}
              className="glass-panel"
              style={{
                background: styles.background,
                borderColor: styles.borderColor,
              }}
            >
              <div className="flex items-center justify-between gap-3" style={{ marginBottom: '0.5rem' }}>
                <strong>{index + 1}. {step.label}</strong>
                <span className="badge">{styles.label}</span>
              </div>
              <p className="text-muted" style={{ marginBottom: 0 }}>{step.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
