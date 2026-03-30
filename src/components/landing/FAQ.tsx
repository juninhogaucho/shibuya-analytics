import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: "How do you calculate the 'discipline tax'?",
      a: "We analyze patterns in your trading data that correlate with emotional decisions: trades taken within minutes of a loss, position sizes that spike after wins, and sessions where your behavior breaks from your own edge.",
    },
    {
      q: 'How quickly can I start using Shibuya?',
      a: 'Immediately after payment settles. You receive an order code, activate your live trader account, then upload your trade history inside the workspace.',
    },
    {
      q: 'What if my trading is already profitable?',
      a: 'Profitable traders still leave money on the table. Shibuya is for traders who want to keep more of their edge, cut avoidable losses, and make better decisions between good trades.',
    },
    {
      q: 'Is this for forex only?',
      a: 'No. We support any market with timestamped trade data: crypto, futures, stocks, indices. If you can export a CSV, the workspace can work with it.',
    },
    {
      q: 'Do I need to upload data before I pay?',
      a: 'No. Payment unlocks your live trader account. Upload and append your trade history inside the workspace once you are activated.',
    },
  ]

  return (
    <section id="faq" className="py-32 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h2 className="text-4xl font-display font-bold text-white uppercase mb-4">Common Questions</h2>
          <p className="font-serif text-neutral-400 text-lg italic">Everything you need to know about activation, uploads, and the trader workspace.</p>
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
