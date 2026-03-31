import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RevealText = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");

  const wordPositions = words.reduce<number[]>((acc, _, i) => {
    const prevPosition = i === 0 ? 0 : acc[i - 1] + words[i - 1].length;
    acc.push(prevPosition);
    return acc;
  }, []);

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-0 ${className}`}>
      {words.map((word, i) => {
        const currentWordStartIndex = wordPositions[i];
        return (
          <span key={i} className="inline-flex overflow-hidden">
            {word.split("").map((char, j) => (
              <span key={j} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: delay + (currentWordStartIndex + j) * 0.03,
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
};

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col pt-32 pb-12 px-6 md:px-12 bg-[#050505] text-[#e5e5e5] overflow-hidden border-b border-white/5">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-[1920px] mx-auto flex-1 mt-0 md:mt-12">

        {/* LEFT COL */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-6"
          >
            Behavioral Trade Intelligence
          </motion.p>

          <h1 className="font-display font-bold text-[clamp(2.5rem,8vw,8rem)] leading-[0.88] tracking-tighter uppercase text-left mb-8 flex flex-col">
            <div className="w-full">
              <RevealText text="The Money" delay={0.2} />
            </div>
            <div className="w-full">
              <RevealText text="You Lose" delay={0.5} />
            </div>
            <div className="w-full text-neutral-600">
              <RevealText text="Between Good" delay={0.8} className="text-neutral-600" />
            </div>
            <div className="w-full text-neutral-600">
              <RevealText text="Trades" delay={1.0} className="text-neutral-600" />
            </div>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="max-w-xl pl-1"
          >
            <p className="text-base text-neutral-300 font-sans leading-relaxed mb-3 max-w-lg">
              Your discipline tax. Your edge decay. Your behavioral state. Three numbers most traders never see — and the three numbers that explain everything.
            </p>
            <p className="text-sm text-neutral-500 font-sans leading-relaxed mb-8 max-w-lg">
              68 mathematical engines. Bayesian state detection. Institutional-grade risk models. All applied to the one variable the big desks ignore: you.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/pricing')}
                className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-sm overflow-hidden flex items-center gap-2"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Start Shibuya</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:text-white transition-colors duration-300" />
                <div className="absolute inset-0 bg-indigo-600 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/partners')}
                className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-wider text-sm hover:border-white hover:bg-white hover:text-black transition-all duration-300"
              >
                For Platforms
              </motion.button>
            </div>

            {/* Social proof line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
              className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5"
            >
              <div className="flex items-center gap-2 text-xs text-neutral-600 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                €3,418 avg monthly avoidable loss identified
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-xs text-neutral-600 font-mono">All markets. All account types.</span>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT COL: PSYCH AUDIT VISUAL */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative w-full max-w-md aspect-[4/5] md:aspect-square"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-1">
              <div className="h-full w-full bg-[#080808] relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#0A0A0B]">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  </div>
                  <div className="font-mono text-[10px] text-neutral-600 uppercase">Analysis_V2.exe</div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <div className="text-neutral-500 text-xs font-mono mb-1 uppercase tracking-wider">Discipline Leak</div>
                      <div className="text-3xl font-display font-bold text-white">-€1,240.50</div>
                      <div className="text-[10px] font-mono text-neutral-600 mt-1">DEAN attribution · 30-day window</div>
                    </div>
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="space-y-4 relative z-10">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                        <span>REVENGE_TRADING</span>
                        <span className="text-rose-400">64% · €795</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "64%" }}
                          transition={{ delay: 1, duration: 1.5 }}
                          className="h-full bg-rose-500/70"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                        <span>SIZE_VIOLATION</span>
                        <span className="text-amber-400">28% · €347</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "28%" }}
                          transition={{ delay: 1.2, duration: 1.5 }}
                          className="h-full bg-amber-500/70"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                        <span>HESITATION</span>
                        <span className="text-neutral-400">8% · €98</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "8%" }}
                          transition={{ delay: 1.4, duration: 1.5 }}
                          className="h-full bg-neutral-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BQL State */}
                  <div className="mt-6 relative z-10">
                    <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                      <span className="text-neutral-500 uppercase tracking-wider">BQL State</span>
                      <span className="text-amber-400 uppercase">HESITANT · 71%</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "71%" }}
                        transition={{ delay: 1.6, duration: 1 }}
                        className="h-full bg-amber-500/60"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded">
                      <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-mono text-neutral-300 leading-relaxed">
                        3 sessions account for 80% of drawdown. Snell envelope: optimal stop at session boundary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -bottom-6 -left-6 font-mono text-xs text-neutral-600">
              FIG. 1.0 — PSYCH AUDIT
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
