import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

interface TaxPoint {
  date: string
  cost: number
}

interface DisciplineTaxTrendProps {
  data: TaxPoint[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0E0E12] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-neutral-400 font-mono mb-1">{label}</p>
      <p className="text-rose-400">
        Behavioral cost: <span className="text-white font-semibold">${payload[0].value.toLocaleString()}</span>
      </p>
    </div>
  )
}

export function generateTaxTrendData(totalTax: number, days = 30): TaxPoint[] {
  const points: TaxPoint[] = []
  const avgDaily = totalTax / days
  for (let i = 0; i < days; i++) {
    const noise = (Math.random() - 0.3) * avgDaily * 1.5
    const trend = i > days * 0.7 ? 1.2 : 0.8 // recent sessions cost more
    points.push({
      date: `D${i + 1}`,
      cost: Math.max(0, Math.round((avgDaily + noise) * trend)),
    })
  }
  return points
}

export function DisciplineTaxTrend({ data, height = 120 }: DisciplineTaxTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(244,63,94)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="rgb(244,63,94)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 8, fill: '#404040', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="rgb(244,63,94)"
          strokeWidth={1.5}
          fill="url(#taxGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
