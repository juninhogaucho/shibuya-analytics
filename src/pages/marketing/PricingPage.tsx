import React from 'react';
import { Check, Star, Users, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

const PricingPage: React.FC = () => {
  return (
    <section className="min-h-screen pt-32 pb-20 relative bg-[#020203] overflow-hidden">

      {/* Background Texture - Metal */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2940&auto=format&fit=crop"
            alt="Metallic Texture"
            className="w-full h-full object-cover opacity-[0.07] mix-blend-color-dodge"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <span className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-4 block">Select Your Audit</span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-tight mb-6">
                Investment Plans
            </h1>
            <p className="text-neutral-400 font-serif italic text-xl max-w-2xl mx-auto">
                "The cost of the report is likely less than the cost of your next revenge trade."
            </p>
        </motion.div>

        {/* PRICING CARDS */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch mb-24 max-w-5xl mx-auto">

          {/* Standard Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10 }}
            className="p-8 md:p-10 rounded-3xl border border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-md flex flex-col transition-all duration-300 group hover:border-white/20"
          >
            <h3 className="text-lg font-medium mb-2 text-white group-hover:text-indigo-200 transition-colors">The Reality Check</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-bold tracking-tight text-white font-mono">€99</span>
              <span className="text-neutral-500 text-sm">/ report</span>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {[
                'Discipline Tax Calculation',
                'Setup Efficiency Analysis',
                'Overtrading Heatmaps',
                '72hr Delivery'
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  <Check className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0 group-hover:text-indigo-400 transition-colors" />
                  {item}
                </div>
              ))}
            </div>

            <MotionLink
              to="/checkout/basic"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl border border-white/10 text-center text-sm font-semibold text-white hover:bg-white hover:text-black hover:border-transparent transition-colors duration-300 block cursor-pointer"
            >
              Get Basic Report
            </MotionLink>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -10 }}
            className="relative p-8 md:p-10 rounded-3xl border border-indigo-500/30 bg-[#0A0A0B]/90 backdrop-blur-md shadow-2xl shadow-indigo-900/20 flex flex-col group overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50"></div>

            <div className="flex justify-between items-start mb-2 relative z-20">
               <h3 className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">The Deep Dive</h3>
               <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold tracking-wider text-indigo-300 uppercase flex items-center gap-1">
                 <Star className="w-3 h-3 fill-indigo-300" />
                 Popular
               </div>
            </div>

            <div className="flex items-baseline gap-1 mb-6 relative z-20">
              <span className="text-5xl font-bold tracking-tight text-white font-mono group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all">€149</span>
              <span className="text-neutral-500 text-sm">/ report</span>
            </div>

            <div className="space-y-4 mb-10 flex-grow relative z-20">
              {[
                'Everything in Reality Check',
                '2x 30min Analyst Calls',
                'Personalized Rulebook',
                '30-Day Follow-up Analysis',
                'Priority Processing'
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/40">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <MotionLink
              to="/checkout/premium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-20 w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-center text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all block cursor-pointer"
            >
              Get Deep Dive
            </MotionLink>
          </motion.div>
        </div>

        {/* WHAT YOU GET - FIRST MONTH FREE */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="border-t border-white/10 pt-20 mb-20"
        >
            <div className="text-center mb-12">
               <h2 className="text-2xl font-display font-bold uppercase text-white mb-4">Your trust goes a long way. First month is free.</h2>
               <p className="text-neutral-400 font-serif italic">Our dashboard will be released to the public on January 1st. Purchase a report before our launch, and your first month of membership is on us. The future of trading analytics. For free.</p>
            </div>
        </motion.div>
        
        {/* REFERRAL PROGRAM SECTION */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="border-t border-white/10 pt-20 mb-20"
        >
            <div className="text-center mb-12">
               <h2 className="text-2xl font-display font-bold uppercase text-white mb-4">Referral Rewards</h2>
               <p className="text-neutral-400 font-serif italic">Trading is a solo game. But improvement doesn't have to be. Grow your edge together. Be rewarded for it.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* 99 Tier */}
                <div className="bg-[#080809] border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-20 h-20 text-white" />
                    </div>
                    <h3 className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-6 relative z-10">Reality Check (€99)</h3>
                    <ul className="space-y-6 relative z-10">
                        <li className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 border border-white/5 font-mono text-white text-sm">2</div>
                            <div>
                                <p className="text-white font-bold text-sm">Refer 2 Friends</p>
                                <p className="text-neutral-400 text-sm leading-snug mt-1">We <span className="text-indigo-300">upgrade you to Deep Dive</span> automatically (save €50).</p>
                            </div>
                        </li>
                         <li className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-500/20 font-mono text-emerald-300 text-sm">3</div>
                            <div>
                                <p className="text-white font-bold text-sm">Refer 3 Friends</p>
                                <p className="text-neutral-400 text-sm leading-snug mt-1">Your entire purchase becomes <span className="text-emerald-400">100% FREE</span>.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* 149 Tier */}
                <div className="bg-gradient-to-br from-[#0f0f12] to-[#080809] border border-indigo-500/20 p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Gift className="w-20 h-20 text-indigo-400" />
                    </div>
                    <h3 className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-6 relative z-10">Deep Dive (€149)</h3>
                    <ul className="space-y-6 relative z-10">
                        <li className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-500/20 font-mono text-indigo-300 text-sm">2</div>
                            <div>
                                <p className="text-white font-bold text-sm">Refer 2 Friends</p>
                                <div className="text-neutral-400 text-sm leading-snug mt-1">
                                    <p className="mb-1">You get <span className="text-white">2 Months for the price of 1</span> (buy now, get 2 months immediately).</p>
                                    <p className="text-xs text-indigo-300">= 4 Reports + 4 Analyst Calls</p>
                                </div>
                            </div>
                        </li>
                         <li className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-500/20 font-mono text-emerald-300 text-sm">3</div>
                            <div>
                                <p className="text-white font-bold text-sm">Refer 3 Friends</p>
                                <div className="text-neutral-400 text-sm leading-snug mt-1">
                                    <p className="mb-1"><span className="text-emerald-400">Both months are completely free</span>.</p>
                                    <p className="text-xs text-indigo-300">= 4 Reports + 4 Analyst Calls at no cost</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </motion.div>

        {/* HOW REFERRALS WORK */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="border-t border-white/10 pt-20"
        >
            <div className="text-center mb-12">
               <h2 className="text-2xl font-display font-bold uppercase text-white mb-4">How It Works</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#080809] border border-white/5 p-6 rounded-xl flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">1</div>
                <div>
                  <p className="text-white font-semibold mb-1">You Complete Payment</p>
                  <p className="text-neutral-400 text-sm">After we confirm your payment, you'll receive your referral code via email (before your report).</p>
                </div>
              </div>

              <div className="bg-[#080809] border border-white/5 p-6 rounded-xl flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">2</div>
                <div>
                  <p className="text-white font-semibold mb-1">Share Your Code</p>
                  <p className="text-neutral-400 text-sm">Send your unique referral code to your trading friends. When they buy using your code, it counts toward your rewards.</p>
                </div>
              </div>

              <div className="bg-[#080809] border border-white/5 p-6 rounded-xl flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">3</div>
                <div>
                  <p className="text-white font-semibold mb-1">Unlock Rewards Automatically</p>
                  <p className="text-neutral-400 text-sm">Hit 2 or 3 referrals? Your upgrade or free month is applied instantly. No forms. No waiting.</p>
                </div>
              </div>
            </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PricingPage;