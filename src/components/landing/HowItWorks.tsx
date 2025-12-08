import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="py-20 md:py-40 px-6 max-w-7xl mx-auto">
      <div className="mb-20 text-center md:text-left">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-display font-bold uppercase mb-4 text-white"
        >
          The easiest 3-step process. Benefits for a lifetime.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-serif text-xl italic text-neutral-400"
        >
          No need to tell us anything. Just upload your trade history. And we'll take your trading to where it needs to be.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        className="grid md:grid-cols-3 gap-8 mb-24"
      >
        <Step
           title="Export History"
           desc="Download your trade history CSV from MT4, MT5, cTrader, or TradingView. It takes 30 seconds."
        />
        <Step
           title="Upload Securely"
           desc="Drag and drop your file. We parse execution times, prices, and volumes. No funds access required."
        />
        <Step
           title="Get The Report"
           desc="Receive a 10-page PDF deep dive into your metrics, psychology states, and more. Get actionable insights and a clear plan to save your capital."
        />
      </motion.div>

      {/* COMPATIBILITY BAR */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="pt-12 border-t border-white/5"
      >
        <p className="text-center text-xs font-mono text-neutral-500 uppercase tracking-widest mb-8">Works seamlessly with exports from</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView', 'NinjaTrader'].map((platform, i) => (
              <motion.span
                 key={platform}
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 + (i * 0.1) }}
                 className="text-lg font-display font-bold text-white tracking-wide cursor-default hover:text-indigo-300 transition-colors"
              >
                 {platform}
              </motion.span>
           ))}
        </div>
      </motion.div>
    </section>
  );
};

const Step = ({ title, desc }: { title: string, desc: string }) => {
   return (
      <motion.div
         variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
         }}
         whileHover={{ y: -10, backgroundColor: "#0A0A0B", borderColor: "rgba(255,255,255,0.1)" }}
         className="p-8 rounded-3xl border border-transparent hover:border-white/5 transition-all duration-300 group cursor-default"
      >
         <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">{title}</h3>
         <p className="font-serif text-lg text-neutral-400 italic leading-relaxed group-hover:text-neutral-300 transition-colors">{desc}</p>
      </motion.div>
   )
}

export default HowItWorks;
