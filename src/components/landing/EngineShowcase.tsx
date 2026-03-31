import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { ENGINES, ENGINE_CATEGORIES } from '../../data/engineData'
import { EngineExplainer } from '../engine/EngineExplainer'

// The 12 showcase engines — one per category, chosen for impact
const SHOWCASE_IDS = [
  'bql',          // state
  'hddm',         // state
  'quantum',      // state
  'dean',         // attribution
  'counterfactual', // attribution
  'afma',         // decay
  'lyapunov',     // decay
  'evt',          // risk
  'cox',          // risk
  'copula',       // risk
  'dml',          // action
  'snell',        // action
]

const SHOWCASE_ENGINES = ENGINES.filter((e) => SHOWCASE_IDS.includes(e.id))

const CATEGORY_ORDER = ['state', 'attribution', 'decay', 'risk', 'action', 'trust'] as const

export function EngineShowcase() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? SHOWCASE_ENGINES.filter((e) => e.category === activeCategory)
    : SHOWCASE_ENGINES

  const categories = CATEGORY_ORDER.filter((cat) =>
    SHOWCASE_ENGINES.some((e) => e.category === cat)
  )

  return (
    <>
      <section className="py-32 bg-[#020203] border-y border-white/5 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-4 block"
            >
              The Mathematics
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold text-white uppercase leading-[0.92] mb-6"
            >
              Other tools run 15 formulas.<br />
              <span className="text-neutral-600">We run 68 engines.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-base leading-relaxed max-w-2xl"
            >
              Built on the same mathematics used by Goldman Sachs, Two Sigma, and Basel III.
              Applied to the one variable the big desks ignore: you. The formulas below are all textbook.
              How we chain them together is not.
            </motion.p>
          </div>

          {/* Category filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider border transition-all duration-200 ${
                activeCategory === null
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-300'
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const config = ENGINE_CATEGORIES[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider border transition-all duration-200 ${
                    activeCategory === cat
                      ? 'text-white'
                      : 'border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-300'
                  }`}
                  style={activeCategory === cat ? {
                    background: `${config.color}18`,
                    borderColor: `${config.color}40`,
                    color: config.color,
                  } : {}}
                >
                  {config.label}
                </button>
              )
            })}
          </motion.div>

          {/* Engine cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((engine, i) => {
              return (
                <motion.button
                  key={engine.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-5%' }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.15)' }}
                  onClick={() => setSelectedId(engine.id)}
                  className="text-left p-5 rounded-xl border border-white/[0.07] bg-[#0A0A0E] hover:bg-[#0D0D12] transition-all duration-200 group cursor-pointer"
                >
                  {/* Domain + category */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border"
                      style={{
                        color: engine.domainColor,
                        borderColor: `${engine.domainColor}35`,
                        background: `${engine.domainColor}0D`,
                      }}
                    >
                      {engine.category}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                  </div>

                  {/* Name */}
                  <div className="mb-2">
                    <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
                      {engine.shortName}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-0.5 group-hover:text-indigo-200 transition-colors leading-tight">
                      {engine.name}
                    </h3>
                  </div>

                  {/* Formula */}
                  <div className="mb-3 p-2 bg-black/30 rounded border border-white/5 overflow-hidden">
                    <pre className="font-mono text-[9px] text-indigo-300/80 whitespace-pre-wrap leading-relaxed line-clamp-2">
                      {engine.formula}
                    </pre>
                  </div>

                  {/* Pitch line */}
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {engine.pitchLine}
                  </p>
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-white/5 text-center"
          >
            <p className="text-sm text-neutral-600 font-mono">
              These are 12 of 68 engines. The formulas are textbook.
              <span className="text-neutral-500"> How we chain them together is not.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Engine explainer modal */}
      {selectedId && (
        <EngineExplainer
          engineId={selectedId}
          open={selectedId !== null}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  )
}

export default EngineShowcase
