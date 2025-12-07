import { motion } from 'motion/react';

interface DashboardPreviewProps {
  variant?: 'discipline-tax' | 'bql-score' | 'edge-portfolio' | 'alerts';
}

export const DashboardPreview = ({ variant = 'discipline-tax' }: DashboardPreviewProps) => {
  const previews = {
    'discipline-tax': {
      title: 'Discipline Tax',
      value: '€2,847',
      delta: '-23% vs last month',
      tone: 'success' as const,
      description: 'Money lost to emotional decisions',
      chart: (
        <svg className="w-full h-24" viewBox="0 0 200 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-dt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path
            d="M0,60 L20,55 L40,50 L60,45 L80,42 L100,38 L120,35 L140,32 L160,28 L180,25 L200,22"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <path
            d="M0,60 L20,55 L40,50 L60,45 L80,42 L100,38 L120,35 L140,32 L160,28 L180,25 L200,22 L200,80 L0,80 Z"
            fill="url(#grad-dt)"
          />
        </svg>
      ),
    },
    'bql-score': {
      title: 'BQL Score',
      value: '67/100',
      delta: '+8 points this week',
      tone: 'success' as const,
      description: 'Behavioral Quality Level',
      chart: (
        <div className="flex items-center justify-center h-24">
          <svg className="w-32 h-32" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(59, 130, 246, 0.1)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 * (1 - 0.67) }}
              transition={{ duration: 2, ease: 'easeOut' }}
              transform="rotate(-90 50 50)"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dy="0.3em"
              className="text-xl font-bold fill-white"
            >
              67
            </text>
          </svg>
        </div>
      ),
    },
    'edge-portfolio': {
      title: 'Active Edges',
      value: '5 PRIME',
      delta: '2 DECAYED',
      tone: 'warning' as const,
      description: 'Trading strategy performance',
      chart: (
        <div className="space-y-2 py-2">
          {['London FVG', 'Asian Breakout', 'NY Session'].map((edge, i) => (
            <div key={edge} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-400">{edge}</span>
              <span className="ml-auto text-xs font-mono text-gray-300">
                {i === 0 ? '+€847' : i === 1 ? '+€234' : '-€127'}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    'alerts': {
      title: 'Real-Time Alerts',
      value: '3 Active',
      delta: 'Slump detected',
      tone: 'danger' as const,
      description: 'Live trading monitoring',
      chart: (
        <div className="space-y-2 py-2">
          <div className="flex items-start gap-2 text-xs">
            <span className="text-red-500">⚠️</span>
            <span className="text-gray-400">Revenge trade pattern detected at 14:32</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <span className="text-yellow-500">⚡</span>
            <span className="text-gray-400">Position size 2.3x your average</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <span className="text-blue-500">💡</span>
            <span className="text-gray-400">Take a break - 3 losses in 15min</span>
          </div>
        </div>
      ),
    },
  };

  const preview = previews[variant];

  return (
    <motion.div
      className="glass-panel p-6 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{preview.title}</p>
          <h3 className="text-3xl font-bold text-white">{preview.value}</h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            preview.tone === 'success'
              ? 'bg-green-500/10 text-green-500'
              : preview.tone === 'danger'
              ? 'bg-red-500/10 text-red-500'
              : 'bg-yellow-500/10 text-yellow-500'
          }`}
        >
          {preview.delta}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">{preview.description}</p>
      {preview.chart}
    </motion.div>
  );
};
