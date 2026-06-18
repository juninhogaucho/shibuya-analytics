import type { FingerprintScore } from '../../lib/storyExperience'

interface BehavioralFingerprintProps {
  scores: FingerprintScore[]
  className?: string
}

const CENTER = 120
const RADIUS = 86

function toPoint(index: number, total: number, radius: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  }
}

function polygonPoints(scores: FingerprintScore[]): string {
  return scores
    .map((axis, index) => {
      const point = toPoint(index, scores.length, RADIUS * (axis.score / 100))
      return `${point.x},${point.y}`
    })
    .join(' ')
}

export function BehavioralFingerprint({ scores, className = '' }: BehavioralFingerprintProps) {
  const rings = [0.33, 0.66, 1]

  return (
    <div className={`rounded-3xl border border-white/10 bg-black/30 p-5 ${className}`}>
      <svg viewBox="0 0 240 240" role="img" aria-label="Provisional behavioral fingerprint" className="h-auto w-full">
        <defs>
          <radialGradient id="fingerprintGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(129 140 248)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="rgb(129 140 248)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#fingerprintGlow)" />
        {rings.map((ring) => {
          const radius = RADIUS * ring
          const points = scores.map((_, index) => {
            const point = toPoint(index, scores.length, radius)
            return `${point.x},${point.y}`
          }).join(' ')

          return (
            <polygon
              key={ring}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          )
        })}
        {scores.map((axis, index) => {
          const outer = toPoint(index, scores.length, RADIUS)
          const label = toPoint(index, scores.length, RADIUS + 20)

          return (
            <g key={axis.id}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.11)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(229,229,229,0.72)"
                fontSize="8"
                fontFamily="monospace"
              >
                {axis.shortLabel}
              </text>
            </g>
          )
        })}
        <polygon
          points={polygonPoints(scores)}
          fill="rgba(129,140,248,0.26)"
          stroke="rgb(199 210 254)"
          strokeWidth="2"
        />
        {scores.map((axis, index) => {
          const point = toPoint(index, scores.length, RADIUS * (axis.score / 100))

          return (
            <circle
              key={`${axis.id}-point`}
              cx={point.x}
              cy={point.y}
              r="3.2"
              fill="rgb(199 210 254)"
            />
          )
        })}
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {scores.map((axis) => (
          <div key={axis.id} className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">{axis.shortLabel}</span>
              <span className="font-mono text-xs text-indigo-200">{axis.score}</span>
            </div>
            <p className="mt-1 text-xs leading-snug text-neutral-400">{axis.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
