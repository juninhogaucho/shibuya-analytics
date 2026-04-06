import React from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { addMarketToPath, getMarketHomePath, persistMarket, resolveMarket } from '../../lib/market'
import { enterSampleMode } from '../../lib/runtime'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  const goHome = () => {
    persistMarket(market)
    navigate(getMarketHomePath(market))
  }

  const goHowItWorks = () => {
    persistMarket(market)
    window.location.assign(`${getMarketHomePath(market)}#how-it-works`)
  }

  const openSample = () => {
    enterSampleMode()
    navigate('/dashboard')
  }

  const goPricing = () => {
    persistMarket(market)
    navigate(addMarketToPath('/pricing', market))
  }

  const goLogin = () => {
    persistMarket(market)
    navigate(addMarketToPath('/login', market))
  }

  const goPrimary = () => {
    persistMarket(market)
    navigate(addMarketToPath('/pricing', market))
  }

  const switchMarket = () => {
    const nextMarket = market === 'india' ? 'global' : 'india'
    persistMarket(nextMarket)
    navigate(getMarketHomePath(nextMarket))
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#030304]/80 py-4 text-white backdrop-blur-lg md:py-6"
    >
      <div className="flex w-full items-center justify-between gap-4 px-6">
        <button type="button" className="group flex items-center gap-2" onClick={goHome}>
          <motion.img whileHover={{ scale: 1.05 }} src="/shibuya-logo.svg" alt="Shibuya Analytics" className="h-8 w-auto" />
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="hidden font-display text-lg font-bold uppercase tracking-tight text-white transition-colors duration-300 group-hover:text-indigo-400 sm:inline"
          >
            SHIBUYA
          </motion.span>
        </button>

        <div className="hidden items-center gap-6 text-sm font-medium tracking-wide md:flex">
          {[
            { label: 'How It Works', active: location.hash === '#how-it-works', onClick: goHowItWorks },
            { label: 'Pricing', active: location.pathname === '/pricing', onClick: goPricing },
            { label: 'Sample', active: location.pathname.startsWith('/dashboard'), onClick: openSample },
            { label: 'Sign In', active: location.pathname === '/login', onClick: goLogin },
          ].map((item, index) => (
            <motion.button
              key={item.label}
              type="button"
              onClick={item.onClick}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="group relative py-1 text-xs uppercase"
            >
              <span className={`transition-colors duration-300 ${item.active ? 'text-indigo-400' : 'text-white group-hover:text-indigo-300'}`}>
                {item.label}
              </span>
              <span className={`absolute bottom-0 left-0 h-[1px] bg-indigo-400 transition-all duration-300 ${item.active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={switchMarket}
            className="hidden rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-300 transition-all hover:border-white/20 hover:text-white md:inline-flex"
          >
            {market === 'india' ? 'Global' : 'India'}
          </button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: '#000000' }}
            whileTap={{ scale: 0.95 }}
            onClick={goPrimary}
            className="border border-white/30 bg-transparent px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:border-white"
          >
            {market === 'india' ? 'Get My Audit' : 'View Plans'}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
