interface HeatmapCell {
  hour: number
  day: number
  value: number // normalized -1 to 1
  label: string
}

interface PerformanceHeatmapProps {
  data: HeatmapCell[][]
  height?: number
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm']

function cellColor(value: number): string {
  if (value > 0.5) return 'rgba(16,185,129,0.8)'
  if (value > 0.2) return 'rgba(16,185,129,0.4)'
  if (value > -0.2) return 'rgba(255,255,255,0.06)'
  if (value > -0.5) return 'rgba(244,63,94,0.4)'
  return 'rgba(244,63,94,0.8)'
}

export function generateHeatmapData(): HeatmapCell[][] {
  return DAYS.map((day, d) =>
    HOURS.map((hour, h) => {
      // Simulate some patterns: Tuesday afternoon is bad, Monday morning is good
      let base = (Math.random() - 0.5) * 1.2
      if (d === 1 && h >= 4) base -= 0.4 // Tue afternoon
      if (d === 0 && h <= 2) base += 0.3 // Mon morning
      if (h >= 6) base -= 0.2 // late evening worse
      return {
        hour: h,
        day: d,
        value: Math.max(-1, Math.min(1, base)),
        label: `${day} ${hour}`,
      }
    })
  )
}

export function PerformanceHeatmap({ data, height = 140 }: PerformanceHeatmapProps) {
  const cellH = Math.floor((height - 20) / DAYS.length)
  const cellW = `${100 / HOURS.length}%`

  return (
    <div style={{ height }} className="w-full">
      {/* Hour labels */}
      <div className="flex ml-8 mb-1">
        {HOURS.map((h) => (
          <div key={h} style={{ width: cellW }} className="text-center">
            <span className="text-[8px] font-mono text-neutral-600">{h}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {data.map((row, d) => (
        <div key={d} className="flex items-center mb-0.5">
          <div className="w-8 shrink-0">
            <span className="text-[8px] font-mono text-neutral-600">{DAYS[d]}</span>
          </div>
          {row.map((cell, h) => (
            <div
              key={h}
              style={{ width: cellW, height: cellH, background: cellColor(cell.value) }}
              className="rounded-sm mr-0.5 cursor-default transition-opacity hover:opacity-80 group relative"
              title={`${cell.label}: ${cell.value > 0 ? '+' : ''}${(cell.value * 100).toFixed(0)}%`}
            />
          ))}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 ml-8">
        <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(244,63,94,0.8)' }} />
        <span className="text-[8px] font-mono text-neutral-600">Weak</span>
        <div className="w-3 h-2 rounded-sm ml-2" style={{ background: 'rgba(16,185,129,0.8)' }} />
        <span className="text-[8px] font-mono text-neutral-600">Strong</span>
      </div>
    </div>
  )
}
