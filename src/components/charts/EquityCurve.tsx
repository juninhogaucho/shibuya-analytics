import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

interface EquityCurvePoint {
  date: string
  actual: number
  potential: number
}

interface EquityCurveProps {
  data: EquityCurvePoint[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const actual = payload.find((p: any) => p.dataKey === 'actual')
  const potential = payload.find((p: any) => p.dataKey === 'potential')
  const gap = potential && actual ? potential.value - actual.value : 0

  return (
    <div className="bg-[#0E0E12] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-neutral-400 font-mono mb-2">{label}</p>
      {potential && (
        <p className="text-indigo-400 mb-1">
          Potential: <span className="text-white font-semibold">${potential.value.toLocaleString()}</span>
        </p>
      )}
      {actual && (
        <p className="text-emerald-400 mb-1">
          Actual: <span className="text-white font-semibold">${actual.value.toLocaleString()}</span>
        </p>
      )}
      {gap > 0 && (
        <p className="text-rose-400 border-t border-white/5 pt-1 mt-1">
          Gap: <span className="text-white font-semibold">-${gap.toLocaleString()}</span>
        </p>
      )}
    </div>
  )
}

// Generates mock equity data from summary stats when real data unavailable
export function generateEquityData(pnlGross: number, disciplineTax: number, tradeCount: number): EquityCurvePoint[] {
  const points: EquityCurvePoint[] = []
  const days = Math.min(30, Math.max(10, tradeCount))
  let actual = 0
  let potential = 0
  const dailyActual = pnlGross / days
  const dailyPotential = (pnlGross + disciplineTax) / days

  for (let i = 0; i <= days; i++) {
    // Add some noise
    const noise = (Math.random() - 0.5) * dailyActual * 0.4
    actual += dailyActual + noise
    potential += dailyPotential + noise * 0.5

    points.push({
      date: `Day ${i + 1}`,
      actual: Math.round(actual),
      potential: Math.round(potential),
    })
  }
  return points
}

export function EquityCurve({ data, height = 180 }: EquityCurveProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="potentialGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(99,102,241)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="rgb(99,102,241)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(16,185,129)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="rgb(16,185,129)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: '#525252', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: '#525252', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
        <Area
          type="monotone"
          dataKey="potential"
          stroke="rgb(99,102,241)"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          fill="url(#potentialGrad)"
          dot={false}
          name="potential"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="rgb(16,185,129)"
          strokeWidth={2}
          fill="url(#actualGrad)"
          dot={false}
          name="actual"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
