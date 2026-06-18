import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What exactly do I get after I pay?',
      a: 'You receive an order code, activate with your email and code, create return access, set trader context, upload trade history, and open a live action board with next-session decisions and report artifacts where your plan includes them.',
    },
    {
      q: 'What is the difference between sample and live?',
      a: 'Sample workspace uses sample data and does not persist your trading history. A live trader account starts after activation and is where uploads, history, alerts, prescriptions, reports, and guided-review status belong.',
    },
    {
      q: 'Is this a PDF report?',
      a: 'No. Reports can exist as artifacts, but the product is the live workspace: activation, context, upload, action board, append-after-session loop, and proof trail.',
    },
    {
      q: 'Is this therapy or mindset coaching?',
      a: 'No. Shibuya is a trader performance operating system. It is not medical advice, investment advice, or a promise of profitability.',
    },
    {
      q: 'What does guided review mean?',
      a: 'Reset Pro includes one guided review checkpoint in the first billing cycle after the first meaningful upload. The call reviews the board, the mandate, and the reset plan; it does not replace the workspace.',
    },
    {
      q: 'Does this help with prop challenges and funded accounts?',
      a: 'Yes, but this page is Shibuya Direct. Traders can use the upload and action-board loop whether or not their firm uses PropOS. Partner and embedded prop-firm infrastructure belongs on the Decrypt/PropOS side.',
    },
    {
      q: 'Do I need a live broker connection before I start?',
      a: 'No. The current path is universal ingestion first: CSV, statement upload, or paste parser. MT4, MT5, cTrader, Match-Trader, DXtrade, partner endpoints, and embedded paths are the connector ladder, not the first requirement.',
    },
    {
      q: 'What should I not assume yet?',
      a: 'Do not treat Shibuya as proven at broad paid scale, a guaranteed performance fix, or a fully embedded broker/prop integration. The public claim is the direct-trader workflow and the activation-to-upload loop.',
    },
    {
      q: 'Why use this instead of ChatGPT or a normal journal?',
      a: 'Generic AI gives you a conversation. Shibuya gives you runtime state, activation, uploads, history, action boards, artifacts, append proof, and a repeatable loop built around your trading record.',
    },
    {
      q: 'Is Shibuya claiming magic AI detection?',
      a: 'No. The product story is calculation discipline, trader context, process inference, and proof over repeated uploads. Any advanced model claim has to be backed by generated backend artifacts before the UI treats it as live.',
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
