import { Link } from 'react-router-dom'
import { formatMoney } from '../../lib/display'
import type { CampaignMetrics, TradingReportComparisonResponse } from '../../lib/types'
import type { PerformanceStory } from '../../lib/performanceStory'
import type { Market } from '../../lib/market'

export function CampaignProofCard({
  metrics,
  story,
  market,
  comparison,
}: {
  metrics: CampaignMetrics
  story: PerformanceStory
  market: Market
  comparison?: TradingReportComparisonResponse | null
}) {
  return (
    <section className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'rgba(245, 158, 11, 0.18)', background: 'rgba(245, 158, 11, 0.05)' }}>
      <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge" style={{ marginBottom: '0.5rem' }}>CAMPAIGN PROOF</p>
          <h3 style={{ marginBottom: '0.5rem' }}>Private proof that the standard is actually moving.</h3>
          <p className="text-muted" style={{ marginBottom: 0, maxWidth: '60rem' }}>
            The product has to beat journaling and free AI on memory and proof. This is that layer: what you reclaimed, what still drags, and whether the same enemy keeps showing up.
          </p>
        </div>
        <Link to="/dashboard/campaign-review" className="btn btn-sm btn-primary">
          Open campaign review
        </Link>
      </div>

      <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Saved capital</h4>
          <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
            {formatMoney(metrics.saved_capital_vs_baseline, market)}
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {comparison?.has_comparison
              ? 'Measured versus baseline leak.'
              : 'Will harden as soon as the comparison trail is longer.'}
          </p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Recurring enemy</h4>
          <p style={{ marginBottom: '0.35rem', fontSize: '1.15rem', fontWeight: 700 }}>
            {metrics.recurring_enemy}
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {story.currentEnemy}
          </p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Best controlled week</h4>
          <p style={{ marginBottom: '0.35rem', fontSize: '1.4rem', fontWeight: 700 }}>
            {metrics.best_controlled_week} clean session{metrics.best_controlled_week === 1 ? '' : 's'}
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {metrics.clean_session_count} fully clean session{metrics.clean_session_count === 1 ? '' : 's'} logged so far.
          </p>
        </article>
      </div>

      <div className="grid-responsive three" style={{ marginTop: '1rem' }}>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Revenge-free streak</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {metrics.revenge_free_streak} day{metrics.revenge_free_streak === 1 ? '' : 's'} without logging revenge-trading failure.
          </p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Size discipline streak</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {metrics.size_discipline_streak} day{metrics.size_discipline_streak === 1 ? '' : 's'} without logging size indiscipline.
          </p>
        </article>
        <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Last real improvement</h4>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            {metrics.last_real_improvement}
          </p>
        </article>
      </div>
    </section>
  )
}
