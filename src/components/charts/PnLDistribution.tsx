import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import type { Market } from '../../lib/market'
import { formatSignedCompactMoney } from '../../lib/display'

interface DistributionBucket {
  range: string
  count: number
  isLoss: boolean
}

interface PnLDistributionProps {
  data: DistributionBucket[]
  height?: number
  market?: Market
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
      <p className="text-white">{payload[0].value} trades</p>
    </div>
  )
}

export function generateDistributionData(
  avgWin: number,
  avgLoss: number,
  winCount: number,
  lossCount: number,
  market: Market = 'india',
): DistributionBucket[] {
  const buckets: DistributionBucket[] = []

  // Loss side (5 buckets)
  const maxLoss = avgLoss * 2.5
  const lossBucketSize = maxLoss / 5
  for (let i = 4; i >= 0; i--) {
    const lo = -maxLoss + i * lossBucketSize
    const hi = lo + lossBucketSize
    const center = (lo + hi) / 2
    const dist = Math.exp(-0.5 * Math.pow((center + avgLoss) / (avgLoss * 0.6), 2))
    const count = Math.round(dist * lossCount * 0.5 * (1 + (Math.random() - 0.5) * 0.4))
    buckets.push({
      range: formatSignedCompactMoney(Math.round(lo), market),
      count: Math.max(1, count),
      isLoss: true,
    })
  }

  // Win side (5 buckets)
  const maxWin = avgWin * 2.5
  const winBucketSize = maxWin / 5
  for (let i = 0; i < 5; i++) {
    const lo = i * winBucketSize
    const hi = lo + winBucketSize
    const center = (lo + hi) / 2
    const dist = Math.exp(-0.5 * Math.pow((center - avgWin) / (avgWin * 0.6), 2))
    const count = Math.round(dist * winCount * 0.5 * (1 + (Math.random() - 0.5) * 0.4))
    buckets.push({
      range: formatSignedCompactMoney(Math.round(hi), market),
      count: Math.max(1, count),
      isLoss: false,
    })
  }

  return buckets
}

export function PnLDistribution({ data, height = 160 }: PnLDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="range"
          tick={{ fontSize: 8, fill: '#404040', fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={data[4]?.range} stroke="rgba(255,255,255,0.1)" />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.isLoss ? 'rgba(244,63,94,0.6)' : 'rgba(16,185,129,0.6)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
