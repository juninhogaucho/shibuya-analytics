import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("INITIALIZING SHIBUYA...");

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 10;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 150);

    // Text sequence
    const textTimers = [
      setTimeout(() => setText("LOADING ASSETS..."), 800),
      setTimeout(() => setText("CONNECTING TO ANALYTICS ENGINE..."), 1600),
      setTimeout(() => setText("ESTABLISHING SECURE CONNECTION..."), 2400),
    setTimeout(() => setText("READY? WE ARE."), 3200),
    ];

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(timer);
      textTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-[#000000] flex flex-col items-center justify-center font-mono"
    >
      <div className="w-64">
        <div className="flex justify-between text-xs text-neutral-500 mb-2 uppercase tracking-widest">
            <span>System Boot</span>
            <span>{Math.min(100, Math.floor(progress))}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[2px] bg-neutral-900 rounded-full overflow-hidden mb-4">
            <motion.div
                className="h-full bg-white"
                style={{ width: `${progress}%` }}
            />
        </div>

        <div className="h-6 overflow-hidden">
             <motion.p
                key={text}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-[10px] text-indigo-400 text-center uppercase tracking-widest"
             >
                {text}
             </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
