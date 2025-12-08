import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RevealText = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-0 ${className}`}>
      {words.map((word, i) => {
        const currentWordStartIndex = globalCharIndex;
        globalCharIndex += word.length;

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
   <section className="relative min-h-screen flex flex-col pt-6 md:pt-12 pb-12 px-6 md:px-12 bg-[#050505] text-[#e5e5e5] overflow-hidden border-b border-white/5">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none"></div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-[1920px] mx-auto flex-1 mt-0 md:mt-12">

        {/* LEFT COL: MASSIVE HEADLINE + COPY */}
        <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-display font-bold text-[clamp(2.5rem,9vw,9rem)] leading-[0.85] tracking-tighter uppercase text-left mb-8 flex flex-col">
              <div className="w-full">
                <RevealText text="Your Psychology" delay={0.2} />
              </div>
              <div className="w-full text-neutral-600">
                <RevealText text="Is A Balance Sheet" delay={0.6} className="text-neutral-600" />
              </div>
            </h1>

            <div className="max-w-xl pl-1">
               <p className="text-xl md:text-2xl font-serif italic font-light text-neutral-300 leading-relaxed mb-8">
                 
               </p>
               <p className="text-base text-neutral-400 font-sans leading-relaxed mb-8 max-w-md">
                 We quantify the exact euro value of your hesitation, tilt, and oversizing. Turn your trading journal into a weapon.
               </p>

               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/pricing')}
                  className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-sm overflow-hidden"
                >
                   <span className="relative z-10 group-hover:text-white transition-colors duration-300">Start Audit</span>
                   <div className="absolute inset-0 bg-indigo-600 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                </motion.button>
            </div>
        </div>

        {/* RIGHT COL: VISUALIZATION */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4, duration: 1 }}
               className="relative w-full max-w-md aspect-[4/5] md:aspect-square"
            >
               {/* Abstract "Audit Interface" Visual */}
               <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-1">
                  <div className="h-full w-full bg-[#080808] relative overflow-hidden flex flex-col">
                     {/* Header */}
                     <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#0A0A0B]">
                        <div className="flex gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                           <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                           <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="font-mono text-[10px] text-neutral-600 uppercase">Analysis_V2.exe</div>
                     </div>

                     {/* Content */}
                     <div className="p-6 flex-1 flex flex-col relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                           <div>
                              <div className="text-neutral-500 text-xs font-mono mb-1 uppercase tracking-wider">Discipline Leak</div>
                              <div className="text-3xl font-display font-bold text-white">-€1,240.50</div>
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
                                 <span>64%</span>
                              </div>
                              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "64%" }}
                                    transition={{ delay: 1, duration: 1.5 }}
                                    className="h-full bg-neutral-200"
                                 ></motion.div>
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                                 <span>SIZE_VIOLATION</span>
                                 <span>28%</span>
                              </div>
                              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "28%" }}
                                    transition={{ delay: 1.2, duration: 1.5 }}
                                    className="h-full bg-neutral-400"
                                 ></motion.div>
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                                 <span>HESITATION</span>
                                 <span>8%</span>
                              </div>
                              <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "8%" }}
                                    transition={{ delay: 1.4, duration: 1.5 }}
                                    className="h-full bg-neutral-600"
                                 ></motion.div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 relative z-10">
                           <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded">
                              <AlertCircle className="w-4 h-4 text-neutral-400" />
                              <p className="text-[10px] font-mono text-neutral-300">
                                 CRITICAL: 3 sessions account for 80% of drawdown.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Decorative Elements */}
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
