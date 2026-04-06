import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DrawdownPoint {
  date: string
  drawdown: number // negative values
}

interface DrawdownCurveProps {
  data: DrawdownPoint[]
  maxDrawdown?: number
  height?: number
}

interface ChartTooltipItem {
  value: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0E0E12] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-neutral-400 font-mono mb-1">{label}</p>
      <p className="text-rose-400">
        Drawdown: <span className="text-white font-semibold">{payload[0].value.toFixed(1)}%</span>
      </p>
    </div>
  )
}

export function generateDrawdownData(maxDrawdownPct: number, trades: number): DrawdownPoint[] {
  const points: DrawdownPoint[] = []
  const days = Math.min(30, Math.max(10, trades))
  let dd = 0
  const peakDay = Math.floor(days * 0.6)

  for (let i = 0; i <= days; i++) {
    const progress = i / peakDay
    if (i < peakDay) {
      dd = -maxDrawdownPct * Math.sin(progress * Math.PI / 2) * (1 + (Math.random() - 0.5) * 0.3)
    } else {
      // Recovery
      const recovery = (i - peakDay) / (days - peakDay)
      dd = -maxDrawdownPct * (1 - recovery * 0.6) * (1 + (Math.random() - 0.5) * 0.2)
    }
    points.push({ date: `D${i + 1}`, drawdown: Math.min(0, dd) })
  }
  return points
}

export function DrawdownCurve({ data, maxDrawdown, height = 160 }: DrawdownCurveProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(244,63,94)" stopOpacity={0} />
            <stop offset="95%" stopColor="rgb(244,63,94)" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: '#404040', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: '#404040', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v.toFixed(0)}%`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
        {maxDrawdown && (
          <ReferenceLine
            y={-maxDrawdown}
            stroke="rgba(244,63,94,0.4)"
            strokeDasharray="4 2"
            label={{ value: 'Limit', position: 'right', fontSize: 8, fill: '#f43f5e' }}
          />
        )}
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="rgb(244,63,94)"
          strokeWidth={2}
          fill="url(#ddGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
