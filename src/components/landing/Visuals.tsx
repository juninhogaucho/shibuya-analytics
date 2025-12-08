import React from 'react';
import { motion } from 'framer-motion';

export const TokyoStreet: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
        </filter>
        <linearGradient id="neon-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
          <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="neon-pink" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#db2777" stopOpacity="0" />
          <stop offset="50%" stopColor="#db2777" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#db2777" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Abstract Vertical Neon Reflections */}
      <motion.rect
        x="20" y="0" width="15" height="100" fill="url(#neon-blue)" filter="url(#blur-heavy)"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        x="60" y="0" width="10" height="100" fill="url(#neon-pink)" filter="url(#blur-heavy)"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
       <motion.rect
        x="85" y="0" width="5" height="100" fill="url(#neon-blue)" filter="url(#blur-heavy)"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </svg>
    {/* Dark Gradient Overlay for depth */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]"></div>
  </div>
);

export const GridPattern: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>
  </div>
);

export const WavePattern: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute inset-0 overflow-hidden opacity-20 pointer-events-none ${className}`}>
    <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <motion.path
            fill="none"
            stroke="rgba(99, 102, 241, 0.3)"
            strokeWidth="2"
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
            fill="none"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
        />
    </svg>
  </div>
);

export const CircuitBoard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none opacity-[0.08] ${className}`} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M10,10 L30,10 L30,30" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="30" cy="30" r="3" fill="currentColor" />
      <path d="M60,60 L60,80 L90,80" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      <path d="M10,90 L40,90" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M90,10 L90,40" fill="none" stroke="currentColor" strokeWidth="2" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
  </svg>
);
