import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { Market } from '../../lib/market'
import { formatSignedCompactMoney, formatCompactMoney } from '../../lib/display'

interface EdgeDataPoint {
  name: string
  pnl: number
  status: 'PRIME' | 'STABLE' | 'DECAYED'
}

interface EdgeComparisonChartProps {
  data: EdgeDataPoint[]
  height?: number
  market?: Market
}

const STATUS_COLORS = {
  PRIME: 'rgba(16,185,129,0.7)',
  STABLE: 'rgba(245,158,11,0.7)',
  DECAYED: 'rgba(244,63,94,0.7)',
}

interface ChartTooltipItem {
  value: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipItem[]
  label?: string
  market?: Market
}

const CustomTooltip = ({ active, payload, label, market = 'india' }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-[#0E0E12] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-neutral-400 font-mono mb-1">{label}</p>
      <p className={val >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
        {formatSignedCompactMoney(val, market)}
      </p>
    </div>
  )
}

export function EdgeComparisonChart({ data, height = 160, market = 'india' }: EdgeComparisonChartProps) {
  const sorted = [...data].sort((a, b) => b.pnl - a.pnl)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fontSize: 9, fill: '#404040', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactMoney(v, market)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 9, fill: '#888', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip market={market} />} />
        <ReferenceLine x={0} stroke="rgba(255,255,255,0.1)" />
        <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, index) => (
            <Cell
              key={index}
              fill={STATUS_COLORS[entry.status]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
