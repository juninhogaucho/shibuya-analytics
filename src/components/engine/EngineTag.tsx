import { useState } from 'react'
import { Cpu } from 'lucide-react'
import { ENGINES } from '../../data/engineData'
import { EngineExplainer } from './EngineExplainer'

interface EngineTagProps {
  engineId: string
  /** Optional custom label — defaults to "Powered by {shortName}" */
  label?: string
  /** If true, shows a compact icon-only version */
  compact?: boolean
  className?: string
}

export function EngineTag({ engineId, label, compact = false, className = '' }: EngineTagProps) {
  const [open, setOpen] = useState(false)
  const engine = ENGINES.find((e) => e.id === engineId)

  if (!engine) return null

  const displayLabel = label ?? `Powered by ${engine.shortName}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Click to learn about ${engine.name}`}
        className={`
          inline-flex items-center gap-1.5
          font-mono text-[10px] uppercase tracking-wider
          text-neutral-500 hover:text-neutral-300
          border border-transparent hover:border-white/10
          rounded px-1.5 py-0.5
          transition-all duration-200 cursor-pointer
          ${className}
        `}
      >
        <Cpu className="w-2.5 h-2.5 shrink-0" />
        {!compact && <span>{displayLabel}</span>}
      </button>

      <EngineExplainer
        engineId={engineId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
