import React from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'

type BadgeVariant = 'prime' | 'stable' | 'decayed' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant: BadgeVariant
  label: string
  size?: BadgeSize
  icon?: boolean
  className?: string
}

const VARIANT_CONFIG: Record<BadgeVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  prime: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: <TrendingUp className="w-3 h-3" />,
  },
  stable: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: <Minus className="w-3 h-3" />,
  },
  decayed: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    icon: <TrendingDown className="w-3 h-3" />,
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  danger: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    icon: <XCircle className="w-3 h-3" />,
  },
  neutral: {
    bg: 'bg-neutral-500/10',
    border: 'border-neutral-500/30',
    text: 'text-neutral-400',
    icon: <Clock className="w-3 h-3" />,
  },
  info: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    icon: <Zap className="w-3 h-3" />,
  },
}

export function Badge({ variant, label, size = 'sm', icon = true, className = '' }: BadgeProps) {
  const config = VARIANT_CONFIG[variant]
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5'

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase tracking-wider rounded border ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      {icon && config.icon}
      {label}
    </span>
  )
}

// Status-specific helpers
export const EdgeBadge = ({ status }: { status: 'PRIME' | 'STABLE' | 'DECAYED' }) => (
  <Badge
    variant={status === 'PRIME' ? 'prime' : status === 'STABLE' ? 'stable' : 'decayed'}
    label={status}
  />
)

export const ToneBadge = ({ tone }: { tone: 'protect' | 'focus' | 'press' }) => (
  <Badge
    variant={tone === 'protect' ? 'danger' : tone === 'focus' ? 'warning' : 'success'}
    label={tone.toUpperCase()}
  />
)
