import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, BarChart2, TrendingUp, Crosshair, Zap } from 'lucide-react';
import { GridPattern } from './Visuals';

const StatsGrid: React.FC = () => {
  const stats = [
    { 
      icon: <Flame className="w-6 h-6 text-rose-500" />,
      title: "Revenge Trading",
      value: "€847",
      metric: "The \"I'll make it back\"",
      desc: "Your strategy said 3 trades per day max. 11 trades and -847€ later, you realize why. We identify when you revenge trade, how much it costs you, what causes it, and the optimal break window for you. No need for FOMO. You won't miss out."
    },
    { 
      icon: <BarChart2 className="w-6 h-6 text-amber-500" />,
      title: "Risk Skew",
      value: "3.2x",
      metric: "The overconfidence",
      desc: "You size up when you're losing to 'make it back'. You size down when winning to 'protect profits'. But you don't know the exact amount it costs you, therefore it doesn't hurt you enough. We make sure it does."
    },
    { 
      icon: <Crosshair className="w-6 h-6 text-emerald-500" />,
      title: "The Setup Trap",
      value: "3 outdated strategies",
      metric: "Edge Decay Factor",
      desc: "Most traders have one 'favorite' setup that actually drains their account. We identify patterns and strategies that haven't been profitable for you anymore. Yes, we know that losing is part of trading. But losing your edge without you knowing, shouldn't be"
    },
    { 
      icon: <Zap className="w-6 h-6 text-cyan-500" />,
      title: "Shibuya Score",
      value: "69%",
      metric: "Confidence level",
      desc: "Our most important proprietary metric. We break down your performance into several components : risk management, process adherence, pure alpha, behavioral features, and a lot more. Ever wondered how trustworthy your trading is ? The Shibuya Score quantifies your true trading skill."
    },
  ];

  return (
    <section className="relative bg-[#050505] border-t border-white/5 py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <GridPattern />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24">
          <motion.span 
            className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-6 block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The Hidden Cost
          </motion.span>
          
          <motion.h2 
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 uppercase leading-[0.95]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Price of <span className="text-neutral-600">Being Human</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl font-serif text-neutral-400 italic max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Analysis of over 110,000 trades across all markets shows that humans are not as rational as they think. And too rational for their own good. Our analysis reveals the hidden taxes you pay to your own psychology.
          </motion.p>

          {/* Hero Stat */}
          <motion.div 
            className="inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-white leading-none">
              €3,418
            </div>
            <div className="flex items-center justify-center gap-3 text-red-400 mt-4">
              <TrendingUp className="w-5 h-5" />
              <span className="font-mono text-sm uppercase tracking-wider">Average Monthly Avoidable Loss</span>
            </div>
            <p className="text-sm font-sans text-neutral-500 mt-4 max-w-md mx-auto">
              The amount a profitable trader gives back purely due to behavioral errors and subsequent suboptimal execution/risk management. This loss is entirely avoidable, independent of strategy performance.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards Grid - 2x2 on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {stats.map((stat, index) => (
            <StatCard 
              key={index} 
              index={index} 
              icon={stat.icon} 
              title={stat.title} 
              value={stat.value} 
              metric={stat.metric} 
              desc={stat.desc} 
            />
          ))}
        </div>

      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  metric: string;
  desc: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, metric, desc, index }) => {
  return (
    <SpotlightCard index={index}>
      <div className="p-8 md:p-10 flex flex-col h-full">
        {/* Icon + Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
            {icon}
          </div>
          <h3 className="text-lg md:text-xl font-display font-bold text-white uppercase tracking-wide group-hover:text-indigo-200 transition-colors">
            {title}
          </h3>
        </div>

        {/* Big Value */}
        <div className="mb-2">
          <span className="text-5xl md:text-6xl font-mono font-medium text-white tracking-tight">
            {value}
          </span>
        </div>
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-6">
          {metric}
        </span>

        {/* Description */}
        <p className="font-serif text-base md:text-lg text-neutral-400 italic leading-relaxed mt-auto">
          {desc}
        </p>
      </div>
    </SpotlightCard>
  );
};

// --- Spotlight Component with hover effect ---
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = "", index = 0 }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-10%", once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl md:rounded-3xl border border-white/[0.08] bg-[#0A0A0B] overflow-hidden group transition-all duration-300 ${className}`}
    >
      {/* Spotlight gradient effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

export default StatsGrid;
