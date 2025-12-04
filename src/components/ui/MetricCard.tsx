import { InfoTooltip } from './Tooltip'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  delta?: string
  tone?: 'primary' | 'danger' | 'success'
  caption?: ReactNode
  tooltip?: ReactNode
}

export function MetricCard({ label, value, delta, tone = 'primary', caption, tooltip }: MetricCardProps) {
  return (
    <div className="metric-card glass-panel">
      <p className="text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </p>
      <h3 className="metric-value">{value}</h3>
      {delta && <p className={`metric-delta metric-delta--${tone}`}>{delta}</p>}
      {caption && <p className="text-muted" style={{ marginTop: '0.5rem' }}>{caption}</p>}
    </div>
  )
}
