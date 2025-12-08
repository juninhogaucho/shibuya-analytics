import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, ArrowUpRight, Brain, Flame, Target, Shield } from 'lucide-react';

// Using the actual dashboard metric card styles
const MetricPreview = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendLabel,
  variant = 'default' 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
  variant?: 'default' | 'danger' | 'success' | 'primary';
}) => {
  const variantStyles = {
    default: 'border-white/5 hover:border-white/20',
    danger: 'border-red-500/20 hover:border-red-500/40',
    success: 'border-emerald-500/20 hover:border-emerald-500/40',
    primary: 'border-indigo-500/20 hover:border-indigo-500/40 bg-gradient-to-br from-indigo-600/10 to-violet-600/5',
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-5 bg-[#0A0A0F] border rounded-2xl transition-all duration-300 ${variantStyles[variant]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className="w-4 h-4 text-white/60" />
        </div>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white font-mono tracking-tight mb-2">{value}</div>
      {trendLabel && (
        <div className={`flex items-center gap-1.5 text-xs ${trend === 'down' ? 'text-red-400' : 'text-emerald-400'}`}>
          {trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
};

const DashboardPreview: React.FC = () => {
  return (
    <section className="py-32 bg-[#020203] relative overflow-hidden">
      
      {/* Background - Neural network / trading brain image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020203] via-transparent to-[#020203] z-10"></div>
        <div className="absolute inset-0 bg-[#020203]/60"></div>
        {/* Neural pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="neural-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.5" fill="rgba(99, 102, 241, 0.5)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural-grid)" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold tracking-widest text-indigo-400 uppercase">Inside the Engine</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold uppercase text-white mb-4"
          >
            Data you can't unsee.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto"
          >
            Your trading psychology quantified. Every pattern. Every mistake. Every opportunity to improve.
          </motion.p>
        </div>

        {/* Main Dashboard Preview Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
          className="rounded-[2rem] bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Dashboard Header Bar */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs font-mono text-neutral-500">shibuya-analytics.com/dashboard</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricPreview 
                icon={Flame} 
                label="Discipline Tax" 
                value="-€847" 
                trend="down" 
                trendLabel="+12% vs last month"
                variant="danger"
              />
              <MetricPreview 
                icon={Target} 
                label="Edge Score" 
                value="72/100" 
                trend="up" 
                trendLabel="Top 15%"
                variant="success"
              />
              <MetricPreview 
                icon={Shield} 
                label="Ruin Probability" 
                value="4.2%" 
                trend="down" 
                trendLabel="Low risk"
                variant="default"
              />
              <MetricPreview 
                icon={Brain} 
                label="BQL Score" 
                value="68" 
                trendLabel="Stable"
                variant="primary"
              />
            </div>

            {/* Main Content Area */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Equity Curve Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="md:col-span-2 p-6 bg-[#080809] border border-white/5 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-white font-medium mb-1">Potential Equity (Without Mistakes)</h4>
                    <p className="text-sm text-neutral-500">What your account would look like</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">+€2,528</span>
                    <span className="text-xs text-neutral-500 block">unrealized</span>
                  </div>
                </div>
                
                {/* Equity Chart Visualization */}
                <div className="relative h-32">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    {/* Actual equity (lower) */}
                    <motion.path
                      d="M0,80 Q50,75 100,60 T200,55 T300,65 T400,50"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                    {/* Potential equity (higher) */}
                    <motion.path
                      d="M0,70 Q50,55 100,40 T200,30 T300,25 T400,15"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                    />
                    {/* Fill area between */}
                    <motion.path
                      d="M0,80 Q50,75 100,60 T200,55 T300,65 T400,50 L400,15 Q350,25 300,25 T200,30 T100,40 Q50,55 0,70 Z"
                      fill="url(#gradient-fill)"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-neutral-600 font-mono">
                    <span>30d ago</span>
                    <span>Today</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-white/30"></span>
                      <span className="text-neutral-500">Actual</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-indigo-500"></span>
                      <span className="text-neutral-500">Without errors</span>
                    </span>
                  </div>
                  <span className="text-xs text-indigo-400 font-medium">+18% difference</span>
                </div>
              </motion.div>

              {/* Psychological Score Ring */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 bg-[#080809] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center"
              >
                <div className="relative w-28 h-28 mb-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="#1a1a2e" strokeWidth="8" fill="none" />
                    <motion.circle
                      initial={{ strokeDashoffset: 314 }}
                      whileInView={{ strokeDashoffset: 88 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                      cx="56" cy="56" r="50" stroke="#6366f1" strokeWidth="8" fill="none" 
                      strokeDasharray="314" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-3xl font-bold text-white"
                    >
                      72
                    </motion.span>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Good</span>
                  </div>
                </div>
                <h4 className="text-white font-medium text-sm mb-1">Psych Score</h4>
                <p className="text-neutral-500 text-xs">Top 15% of users</p>
                <div className="mt-3 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                  ↑ 8 pts from last month
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
        
        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-neutral-500 text-sm mt-8 font-serif italic"
        >
          Actual dashboard preview. Your data. Your patterns. Your path to improvement.
        </motion.p>
      </div>
    </section>
  );
};

export default DashboardPreview;
