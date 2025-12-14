import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="fixed top-0 w-full z-50 bg-[#030304]/80 backdrop-blur-lg border-b border-white/5 text-white py-4 md:py-6"
    >
      <div className="w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/shibuya-logo.svg"
            alt="Shibuya Analytics"
            className="h-8 w-auto"
          />
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="font-display font-bold text-lg tracking-tight text-white uppercase group-hover:text-indigo-400 transition-colors duration-300 hidden sm:inline"
          >
            SHIBUYA
          </motion.span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8 text-sm font-medium tracking-wide">
             <motion.button
                onClick={() => {
                  navigate('/dashboard');
                  localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode');
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative group uppercase text-xs py-1"
             >
                <span className={`transition-colors duration-300 ${location.pathname.startsWith('/dashboard') ? 'text-indigo-400' : 'text-white group-hover:text-indigo-300'}`}>Demo</span>
                <span className={`absolute -bottom-0 left-0 h-[1px] bg-indigo-400 transition-all duration-300 ${location.pathname.startsWith('/dashboard') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
             </motion.button>
             
             <motion.button
                onClick={() => navigate('/login')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="relative group uppercase text-xs py-1"
             >
                <span className={`transition-colors duration-300 ${location.pathname === '/login' ? 'text-indigo-400' : 'text-white group-hover:text-indigo-300'}`}>Login</span>
                <span className={`absolute -bottom-0 left-0 h-[1px] bg-indigo-400 transition-all duration-300 ${location.pathname === '/login' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
             </motion.button>
             
             <motion.button
                onClick={() => navigate('/pricing')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative group uppercase text-xs py-1"
             >
                <span className={`transition-colors duration-300 ${location.pathname === '/pricing' ? 'text-indigo-400' : 'text-white group-hover:text-indigo-300'}`}>Pricing</span>
                <span className={`absolute -bottom-0 left-0 h-[1px] bg-indigo-400 transition-all duration-300 ${location.pathname === '/pricing' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
             </motion.button>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#000000" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/pricing')}
          className="text-xs font-bold uppercase tracking-wider px-6 py-2 border border-white/30 hover:border-white transition-all duration-300 bg-transparent"
        >
          Get Report
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
