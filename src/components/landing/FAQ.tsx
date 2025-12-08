import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Removed relocated questions:
  // "What makes Shibuya different from Edgewonk...?" -> Moved to Methodology
  // "Why would I pay for a report...?" -> Moved to Pricing
  const faqs = [
    {
      q: "How do you calculate the 'discipline tax'?",
      a: "We analyze patterns in your trading data that correlate with emotional decisions: trades taken within minutes of a loss (revenge), position sizes that spike after wins (overconfidence), trading during hours that historically lose money for you. Then we calculate the actual P&L impact."
    },
    {
      q: "How long until I get my report?",
      a: "Within 72 hours of sending your data. For the €149 Deep Dive, we schedule the first call within a week of delivering your report."
    },
    {
      q: "What if my trading is already profitable?",
      a: "Profitable traders still leave money on the table. We've seen traders making €5k/month who are losing €2k to discipline failures. Imagine keeping that €2k. The report shows you exactly where to tighten up."
    },
    {
        q: "Is this for forex only?",
        a: "No. We support any market with timestamped trade data: Crypto, Futures, Stocks, Indices. If you can export a CSV, we can analyze your psychology."
    }
  ];

  return (
    <section id="faq" className="py-32 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
            <h2 className="text-4xl font-display font-bold text-white uppercase mb-4">Common Questions</h2>
            <p className="font-serif text-neutral-400 text-lg italic">Everything you need to know about the audit process.</p>
        </div>

        <div className="md:col-span-8 space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full py-4 text-left group"
              >
                <span className={`text-xl font-sans font-medium transition-colors ${openIndex === i ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                  {faq.q}
                </span>
                <span className={`ml-4 p-1 rounded-full border transition-all duration-300 ${openIndex === i ? 'bg-white border-white text-black rotate-180' : 'border-white/20 text-white group-hover:border-white'}`}>
                  {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
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
  );
};

export default FAQ;
