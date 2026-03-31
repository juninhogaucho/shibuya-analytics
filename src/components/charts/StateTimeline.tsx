type BQLState = 'DISCIPLINED' | 'HESITANT' | 'TILTED'

interface StateSegment {
  label: string
  state: BQLState
  width: number // percentage 0-100
}

interface StateTimelineProps {
  segments: StateSegment[]
  height?: number
}

const STATE_STYLES: Record<BQLState, { bg: string; text: string; label: string }> = {
  DISCIPLINED: { bg: 'bg-emerald-500/60', text: 'text-emerald-300', label: 'Disciplined' },
  HESITANT: { bg: 'bg-amber-500/60', text: 'text-amber-300', label: 'Hesitant' },
  TILTED: { bg: 'bg-rose-500/60', text: 'text-rose-300', label: 'Tilted' },
}

export function generateStateSegments(_bqlState: string, sessions: number): StateSegment[] {
  // Show the last N sessions with plausible state distribution
  const states: BQLState[] = ['DISCIPLINED', 'HESITANT', 'DISCIPLINED', 'TILTED', 'TILTED', 'HESITANT', 'TILTED']
  const labels = ['S-7', 'S-6', 'S-5', 'S-4', 'S-3', 'S-2', 'S-1']
  const count = Math.min(sessions, 7)
  const subset = states.slice(-count)
  const labelSubset = labels.slice(-count)

  return subset.map((state, i) => ({
    label: labelSubset[i],
    state,
    width: 100 / count,
  }))
}

export function StateTimeline({ segments, height = 48 }: StateTimelineProps) {
  return (
    <div style={{ height }} className="w-full">
      {/* Segments */}
      <div className="flex w-full h-8 rounded overflow-hidden gap-0.5">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ width: `${seg.width}%` }}
            className={`${STATE_STYLES[seg.state].bg} flex items-center justify-center cursor-default group relative`}
            title={`${seg.label}: ${STATE_STYLES[seg.state].label}`}
          >
            <span className="text-[7px] font-mono text-white/60 group-hover:text-white transition-colors">
              {seg.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        {(Object.keys(STATE_STYLES) as BQLState[]).map((state) => (
          <div key={state} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${STATE_STYLES[state].bg}`} />
            <span className={`text-[8px] font-mono ${STATE_STYLES[state].text}`}>
              {STATE_STYLES[state].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
