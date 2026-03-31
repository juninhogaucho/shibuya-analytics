import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Building2, ChevronDown, Cpu, Layers, Scale, Zap } from 'lucide-react'
import { Dialog, DialogBody, DialogHeader } from '../ui/Dialog'
import { ENGINES, ENGINE_CATEGORIES } from '../../data/engineData'

interface EngineExplainerProps {
  engineId: string
  open: boolean
  onClose: () => void
}

export function EngineExplainer({ engineId, open, onClose }: EngineExplainerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('what')
  const engine = ENGINES.find((e) => e.id === engineId)

  if (!engine) return null

  const categoryConfig = ENGINE_CATEGORIES[engine.category]

  const toggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const sections = [
    {
      id: 'what',
      icon: <Zap className="w-4 h-4" />,
      title: 'What This Does For You',
      content: engine.whatItDoes,
      alwaysShow: true,
    },
    {
      id: 'why',
      icon: <Layers className="w-4 h-4" />,
      title: 'Why This Math, Not Something Simpler',
      content: engine.whyThisMath,
    },
    {
      id: 'formula',
      icon: <Scale className="w-4 h-4" />,
      title: 'The Formula',
      content: null, // special render
    },
    {
      id: 'institutional',
      icon: <Building2 className="w-4 h-4" />,
      title: 'What The Big Desks Use This For',
      content: engine.institutional,
    },
    {
      id: 'depth',
      icon: <Cpu className="w-4 h-4" />,
      title: "What Makes Ours Different",
      content: engine.realDepth,
    },
    {
      id: 'vs',
      icon: <Scale className="w-4 h-4" />,
      title: 'vs. What Others Offer',
      content: engine.vsOthers,
    },
    {
      id: 'reference',
      icon: <BookOpen className="w-4 h-4" />,
      title: 'Academic Foundation',
      content: engine.reference,
    },
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl">
      <DialogHeader>
        {/* Domain + category */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border"
            style={{
              color: engine.domainColor,
              borderColor: `${engine.domainColor}40`,
              background: `${engine.domainColor}10`,
            }}
          >
            {engine.domain}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
            {categoryConfig.label}
          </span>
        </div>

        {/* Name */}
        <div className="flex items-start justify-between pr-8">
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-1">
              {engine.name}
            </h2>
            <p className="text-sm font-mono text-neutral-500 uppercase tracking-wider">
              {engine.shortName}
            </p>
          </div>
        </div>

        {/* Pitch line */}
        <p className="mt-3 text-sm text-neutral-300 italic font-serif leading-relaxed">
          "{engine.pitchLine}"
        </p>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-1">
          {sections.map((section) => {
            const isOpen = expandedSection === section.id || section.alwaysShow

            return (
              <div key={section.id} className="border border-white/5 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-sm font-medium text-neutral-300">
                    <span className="text-neutral-500">{section.icon}</span>
                    {section.title}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4"
                  >
                    {section.id === 'formula' ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-black/40 rounded-lg border border-white/5 overflow-x-auto">
                          <pre className="font-mono text-sm text-indigo-300 whitespace-pre-wrap leading-relaxed">
                            {engine.formula}
                          </pre>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                          {engine.formulaExplain}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {section.content}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* For you — always visible at bottom */}
        <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
          <p className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
            What this means for your account
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {engine.forYou}
          </p>
        </div>
      </DialogBody>
    </Dialog>
  )
}
