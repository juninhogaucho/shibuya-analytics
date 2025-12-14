import { motion } from 'motion/react';
import { useSyncExternalStore } from 'react';

// Simple store to track if component is mounted (SSR-safe)
const mountedStore = {
  getSnapshot: () => true,
  getServerSnapshot: () => false,
  subscribe: () => () => {},
};

export const AnimatedBeams = () => {
  const mounted = useSyncExternalStore(
    mountedStore.subscribe,
    mountedStore.getSnapshot,
    mountedStore.getServerSnapshot
  );

  if (!mounted) return null;

  // Create grid pattern with animated beams
  const beams = Array.from({ length: 8 }, (_, i) => i);
  const verticalLines = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      
      {/* Animated scanning beams */}
      {beams.map((i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          style={{
            top: `${10 + i * 12}%`,
            left: 0,
            right: 0,
            opacity: 0.3,
          }}
          animate={{
            x: ['-100%', '200%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'linear',
          }}
        />
      ))}

      {/* Vertical grid lines with pulse */}
      {verticalLines.map((i) => (
        <motion.div
          key={`vline-${i}`}
          className="absolute w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
          style={{
            left: `${i * 5}%`,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          top: '10%',
          right: '10%',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          bottom: '20%',
          left: '5%',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
};

// Separate component for the dot pattern
export const DotPattern = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dot-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(59, 130, 246, 0.3)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dot-pattern)" />
  </svg>
);
