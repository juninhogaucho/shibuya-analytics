import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Filter, Brain, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Methodology: React.FC = () => {
  return (
    <section id="methodology" className="py-32 border-y border-white/[0.05] bg-[#030304]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
           <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-4 block"
            >
              The Methodology
           </motion.span>
           <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-display font-bold text-white uppercase mb-12"
            >
              Logic Over Luck
           </motion.h2>

           <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            animate={{ y: [0, -8, 0] }}
            transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.5 },
                opacity: { duration: 0.5 }
            }}
            whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.2)", boxShadow: "0 0 30px rgba(99, 102, 241, 0.1)" }}
            className="inline-block p-6 md:p-10 rounded-full border border-white/10 bg-[#080808] relative cursor-default shadow-lg shadow-black/50"
          >
              <div className="font-mono text-lg md:text-3xl text-neutral-400 tracking-tight whitespace-nowrap overflow-x-auto">
                 <span className="text-emerald-400 font-bold">PnL</span> = (<span className="text-indigo-400">Edge</span> + <span className="text-purple-400">Luck</span>) − <span className="text-white border-b-2 border-red-500">Behavior</span>
              </div>
           </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {/* Step 1 */}
          <BentoItem
            icon={<Filter className="w-6 h-6 text-purple-400" />}
            title="Remove Luck"
            desc="We use robust regression (Monte Carlo simulation) to filter out market noise and luck from your results."
            delay={0.1}
          />

          {/* Step 2 */}
          <BentoItem
            icon={<Brain className="w-6 h-6 text-white" />}
            title="Isolate Behavior"
            desc="We identify patterns correlated with emotion: timestamps after losses, sizing spikes, and session fatigue."
            delay={0.2}
          />

          {/* Step 3 */}
          <BentoItem
            icon={<TrendingUp className="w-6 h-6 text-indigo-400" />}
            title="Reveal Edge"
            desc="What remains is your True Edge. The exact amount of money you would make if you were a machine."
            delay={0.3}
          />
        </div>

        {/* COMPARISON BLOCK - LINKED & ENHANCED */}
        <Link to="/dashboard" className="block transform group">
            <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.3)" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
            className="p-10 md:p-14 rounded-3xl bg-[#0A0A0B] border border-white/5 relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-indigo-500/10"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute top-4 right-6 text-xs font-mono text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                See Live Demo <ArrowRight className="w-3 h-3" />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h3 className="text-2xl font-display font-bold uppercase mb-4 text-white group-hover:text-indigo-100 transition-colors">Different by Design</h3>
                    <p className="font-serif text-lg text-neutral-400 italic mb-6">"What makes this different from Edgewonk or TraderVue?"</p>
                    <p className="text-neutral-300 leading-relaxed mb-6">
                        Those tools track <span className="text-white font-semibold">what you do</span>. We tell you <span className="text-white font-semibold">what it costs you</span>.
                        They show you charts and stats. We show you: "Your revenge trades cost you €847 last month."
                        We quantify your emotions in euros, not just graphs.
                    </p>
                </div>
                <div className="h-full min-h-[200px] border border-white/10 rounded-xl bg-black/50 p-6 flex flex-col justify-center shadow-xl group-hover:border-indigo-500/30 transition-colors">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-1">
                               <span>Traditional</span>
                               <span>Surface Level</span>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                               <div className="h-full bg-neutral-600 w-1/3"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] text-indigo-300 uppercase tracking-widest font-mono mb-1">
                               <span>Shibuya Audit</span>
                               <span>Deep Dive</span>
                            </div>
                            <div className="h-1.5 w-full bg-indigo-900/30 rounded-full overflow-hidden relative">
                               <motion.div
                                 initial={{ width: 0 }}
                                 whileInView={{ width: "75%" }}
                                 transition={{ delay: 0.5, duration: 1 }}
                                 className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                               />
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            </motion.div>
        </Link>
      </div>
    </section>
  );
};

const BentoItem = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 30 }}
         whileInView={{ opacity: 1, y: 0 }}
         whileHover={{ y: -10, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "#0F0F10", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
         viewport={{ once: true, margin: "-10%" }}
         transition={{ delay: delay, duration: 0.5 }}
         className="p-8 rounded-3xl bg-[#0A0A0B] border border-white/5 cursor-default transition-all duration-300 group shadow-lg shadow-black/40"
      >
         <div className="mb-6 p-3 w-fit rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            {icon}
         </div>
         <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">{title}</h3>
         <p className="text-neutral-400 leading-relaxed text-sm group-hover:text-neutral-300 transition-colors">
            {desc}
         </p>
      </motion.div>
   )
}

export default Methodology;
