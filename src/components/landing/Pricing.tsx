import React from 'react';
import { Check, Star, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-32 relative bg-[#020203] overflow-hidden">
      {/* Background Ambience */}
      <motion.div
         animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"
      ></motion.div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.h2
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-3xl md:text-5xl font-semibold text-center mb-6 tracking-tight text-white"
        >
           Choose Your Path
        </motion.h2>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          <div className="flex -space-x-2">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border-2 border-[#020203] flex items-center justify-center">
                <Users className="w-3 h-3 text-neutral-400" />
              </div>
            ))}
          </div>
          <span className="text-sm text-neutral-400">
            <span className="text-white font-medium">127 traders</span> analyzed this month
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">

          {/* Standard Plan */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -10, borderColor: "rgba(255,255,255,0.2)", scale: 1.02 }}
            className="p-8 md:p-10 rounded-3xl border border-white/[0.06] bg-[#0A0A0B] flex flex-col transition-all duration-300 group"
          >
            <h3 className="text-lg font-medium mb-2 text-white group-hover:text-indigo-200 transition-colors">The Reality Check</h3>
            <p className="text-sm text-neutral-500 mb-4">Perfect for your first analysis</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold tracking-tight text-white font-mono">€99</span>
              <span className="text-neutral-500 text-sm">/ one-time</span>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              {[
                'Complete Discipline Tax breakdown',
                'Setup efficiency analysis',
                'Overtrading heatmaps',
                'Written by a real analyst',
                '72-hour delivery',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  <Check className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0 group-hover:text-indigo-400 transition-colors" />
                  {item}
                </div>
              ))}
            </div>

            <Link
              to="/checkout/steve"
              className="w-full py-4 rounded-xl border border-white/10 text-center text-sm font-semibold text-white hover:bg-white hover:text-black hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Your Report
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Premium Plan - THE MAIN OFFER */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -10, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)" }}
            className="relative p-8 md:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-[#121218] to-[#0A0A0E] shadow-2xl shadow-indigo-500/10 flex flex-col group overflow-hidden transition-all duration-300"
          >
            {/* Metallic Shine Animation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Best Value Badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="px-4 py-1.5 rounded-b-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-bold tracking-wider text-white uppercase flex items-center gap-1.5 shadow-lg">
                <Star className="w-3 h-3 fill-white" />
                Most Popular
              </div>
            </div>
            
            <div className="mt-4 relative z-10">
              <h3 className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">The Deep Dive</h3>
              <p className="text-sm text-indigo-300/80 mb-4">Complete transformation package</p>
            </div>

            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 font-mono group-hover:from-white group-hover:to-white transition-all">€149</span>
              <span className="text-neutral-500 text-sm">/ one-time</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                Save €100+ vs coaching
              </span>
            </div>

            <div className="space-y-4 mb-8 flex-grow relative z-10">
              {[
                { text: 'Everything in Reality Check', highlight: false },
                { text: '2x 30-min video calls with analyst', highlight: true },
                { text: 'Personalized trading rules for YOU', highlight: true },
                { text: '30-day follow-up analysis', highlight: true },
                { text: 'Priority email support', highlight: false },
              ].map(({ text, highlight }) => (
                <div key={text} className={`flex items-start gap-3 text-sm ${highlight ? 'text-white' : 'text-neutral-300'}`}>
                  <div className={`w-4 h-4 rounded-full ${highlight ? 'bg-indigo-500' : 'bg-neutral-700'} flex items-center justify-center shrink-0 shadow-lg ${highlight ? 'shadow-indigo-500/40' : ''} group-hover:shadow-indigo-400/60 transition-all`}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  {text}
                  {highlight && <span className="ml-auto text-[10px] text-indigo-400 font-medium">NEW</span>}
                </div>
              ))}
            </div>

            <Link
              to="/checkout/steve-plus"
              className="relative z-10 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-center text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.7)] transition-all flex items-center justify-center gap-2"
            >
              Start Deep Dive
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            {/* Risk-free guarantee */}
            <p className="text-center text-[11px] text-neutral-500 mt-4 relative z-10">
              💬 Not happy? We'll refund within 7 days, no questions asked.
            </p>
          </motion.div>

        </div>

        {/* Bottom FAQ-style clarification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-neutral-400 font-serif italic text-base leading-relaxed max-w-2xl mx-auto">
            "I can just journal for free." — Yes, but your spreadsheet doesn't run Monte Carlo simulations.
            It doesn't calculate your discipline tax. It doesn't know which setups actually make you money.
            <span className="text-indigo-300 not-italic font-sans font-medium mt-2 block">
              Free journals track history. We sell clarity.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
