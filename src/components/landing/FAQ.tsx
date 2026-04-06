import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What exactly do I get after I pay?',
      a: 'You receive an order code, activate your live workspace, create your return password, upload your trade history, and get a decision-grade action board built around the leak, the stop, and the next-session mandate.',
    },
    {
      q: 'Why use this instead of ChatGPT or a normal journal?',
      a: 'Because generic AI gives you a conversation. Shibuya gives you a stored baseline, a repeatable standards layer, delivery-state tracking, comparison artifacts, and a next-session control loop built on your actual trading history.',
    },
    {
      q: "How do you calculate the 'discipline tax'?",
      a: 'We analyze patterns in your trading data that correlate with emotional decisions: trades taken after losses, size spikes, fatigue windows, and other execution breaks from your own edge. The point is to make the leak concrete, not philosophical.',
    },
    {
      q: 'Is this therapy or mindset coaching?',
      a: 'No. The standard here is professional execution. Shibuya treats tilt, overtrading, and size indiscipline as performance failures that should be measured, named, and corrected, not romanticized.',
    },
    {
      q: 'Is this only for losing traders?',
      a: 'No. The primary wedge is the trader who keeps leaking money for behavioral reasons, but profitable traders also use Shibuya to protect what actually pays them and stop self-sabotaging between good sessions.',
    },
    {
      q: 'Does this help with prop challenges and funded accounts?',
      a: 'Yes. The same loop is useful for direct traders and for traders trying to stop breaching prop rules. The product is built to surface repeat-breach behavior, size drift, revenge loops, and the setups worth protecting.',
    },
    {
      q: 'Do I need a live broker connection before I start?',
      a: 'No. If you can export timestamped history, you can start. The current product is built around upload-first activation so you can get value without waiting on deep integrations.',
    },
    {
      q: 'Do you offer one-time and monthly options?',
      a: 'Yes. You can buy a one-time reset window if you want a bounded intervention, or use the monthly live tiers if you want the workspace, uploads, and corrective loop to stay alive across sessions.',
    },
    {
      q: 'Do I need an automatic broker connection before I can get value?',
      a: 'No. The current India-first path is manual upload by design. If you can export timestamped trade history or contract notes, you can start now and get the same standards layer, reports, and next-session protocol without waiting on connectors.',
    },
  ]

  return (
    <section id="faq" className="py-32 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h2 className="text-4xl font-display font-bold text-white uppercase mb-4">Common Questions</h2>
          <p className="font-serif text-neutral-400 text-lg italic">Everything you need to know about activation, uploads, standards, and why this is not another trader toy.</p>
        </div>

        <div className="md:col-span-8 space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="border-b border-white/10 pb-4">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full py-4 text-left group"
              >
                <span className={`text-xl font-sans font-medium transition-colors ${openIndex === index ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                  {faq.q}
                </span>
                <span className={`ml-4 p-1 rounded-full border transition-all duration-300 ${openIndex === index ? 'bg-white border-white text-black rotate-180' : 'border-white/20 text-white group-hover:border-white'}`}>
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-8 text-lg font-serif text-neutral-400 leading-relaxed italic pr-12">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
