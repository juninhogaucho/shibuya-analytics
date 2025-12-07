import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'motion/react'
import { AnimatedBeams } from '../../components/ui/AnimatedBeams'
import { DashboardPreview } from '../../components/ui/DashboardPreview'
import { TestimonialsSection } from '../../components/ui/TestimonialsSection'

export function HomePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  // Animation variants - using easeOut for silky smooth animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  }
  
  const slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  }
  
  const slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  }

  const handleExploreDemo = () => {
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard')
  }

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent('Dashboard Waitlist Signup')
    const body = encodeURIComponent(`New waitlist signup: ${email}\n\nInterested in the €250/mo live dashboard when it launches.`)
    window.open(`mailto:support@shibuya-analytics.com?subject=${subject}&body=${body}`, '_blank')
    setWaitlistSubmitted(true)
    setEmail('')
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Question from ${contactForm.name}`)
    const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`)
    window.location.href = `mailto:support@shibuya-analytics.com?subject=${subject}&body=${body}`
    setContactSubmitted(true)
    setContactForm({ name: '', email: '', message: '' })
  }

  const faqs = [
    {
      q: "What makes Shibuya different from Edgewonk or TraderVue?",
      a: "Those tools track what you do. We tell you what it costs you. They show you charts and stats. We show you: 'Your revenge trades cost you €847 last month. Here's when they happen and how to stop.' We quantify your emotions in euros, not just graphs."
    },
    {
      q: "Why would I pay for a report when I can journal for free?",
      a: "Because your journal doesn't run Monte Carlo simulations. It doesn't calculate your discipline tax. It doesn't know that your 'London FVG' setup makes money but your 'Asian breakout' has lost €1,640 in 3 months. We do the math you can't do yourself."
    },
    {
      q: "How do you calculate the 'discipline tax'?",
      a: "We analyze patterns in your trading data that correlate with emotional decisions: trades taken within minutes of a loss (revenge), position sizes that spike after wins (overconfidence), trading during hours that historically lose money for you. Then we calculate the actual P&L impact."
    },
    {
      q: "Is this for forex only?",
      a: "No. We work with any market where you have trade data: forex, futures, crypto, stocks. If you can export a CSV with entry/exit times, prices, and sizes, we can analyze it."
    },
    {
      q: "What if my trading is already profitable?",
      a: "Profitable traders still leave money on the table. We've seen traders making €5k/month who are losing €2k to discipline failures. Imagine keeping that €2k. The report shows you exactly where to tighten up."
    },
    {
      q: "How long until I get my report?",
      a: "Within 72 hours of sending your data. For the €149 Deep Dive, we schedule the first call within a week of delivering your report."
    },
  ]

  return (
    <div className="landing">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="landing-hero relative overflow-hidden min-h-screen flex items-center bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/50 to-[#020204] z-0" />
        <AnimatedBeams />
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-6 py-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.p 
              className="text-blue-400 text-sm font-medium mb-6 tracking-widest uppercase"
              variants={itemVariants}
            >
              For FX, Index CFDs, Metals & Crypto traders
            </motion.p>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
              variants={itemVariants}
            >
              You're not losing to the market.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">You're losing to yourself.</span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto"
              variants={itemVariants}
            >
              We calculate exactly how much money you're leaving on the table to{' '}
              <span className="text-red-400 font-medium">revenge trading</span>,{' '}
              <span className="text-yellow-400 font-medium">oversizing</span>, and{' '}
              <span className="text-orange-400 font-medium">overtrading</span>.
              <br />Then we show you how to stop.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
              <motion.a 
                href="#pricing" 
                className="landing-btn landing-btn--primary text-base px-8 py-3"
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                Get Your Report — €99
              </motion.a>
              <motion.button 
                onClick={handleExploreDemo}
                className="landing-btn landing-btn--secondary text-base px-8 py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Demo →
              </motion.button>
            </motion.div>
            <motion.div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500" variants={itemVariants}>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Delivered in 72 hours
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Written by humans, not AI
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> No subscription required
              </span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================
          PAIN POINTS - The Truth About Your Trading
          ============================================ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              The Truth About Your Trading
            </h2>
            <p className="text-lg text-gray-400">
              These numbers don't lie. And they're probably worse than you think.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { value: '€847', label: 'Average monthly loss to revenge trades alone', color: 'text-red-500' },
              { value: '3.2x', label: 'Average position size on losing trades vs winners', color: 'text-yellow-500' },
              { value: '47%', label: 'Of traders overtrade by 2x their own rules', color: 'text-orange-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.value}
                className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`text-5xl md:text-6xl font-bold ${stat.color} mb-4`}>{stat.value}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              You might be profitable. But you're still <span className="text-red-400 font-semibold">bleeding money</span>.
            </p>
            <p className="text-base text-gray-500">
              Most traders making €5k/month are losing €2k to discipline failures.
              <br />Imagine keeping that €2k. Every month. Forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          THE EQUATION - Our Methodology
          ============================================ */}
      <section className="py-24 relative bg-[#050508]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            className="text-4xl md:text-5xl font-bold mb-12 font-mono tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-green-400">PnL</span>
            <span className="text-gray-500"> = (</span>
            <span className="text-blue-400">Edge</span>
            <span className="text-gray-500"> + </span>
            <span className="text-purple-400">Luck</span>
            <span className="text-gray-500">) − </span>
            <span className="text-red-400">Behavior</span>
          </motion.div>
          
          <motion.div 
            className="space-y-4 text-left max-w-xl mx-auto mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: '→', text: 'We use robust regression to filter out the', highlight: 'Luck', color: 'text-purple-400' },
              { icon: '→', text: 'We isolate the', highlight: 'Behavior', color: 'text-red-400', suffix: "that's costing you money" },
              { icon: '→', text: 'What remains is your', highlight: 'True Edge', color: 'text-blue-400' },
            ].map((item, i) => (
              <motion.p key={i} className="text-lg text-gray-400 flex items-start gap-3" variants={itemVariants}>
                <span className="text-blue-500">{item.icon}</span>
                <span>{item.text} <span className={item.color + ' font-semibold'}>{item.highlight}</span>{item.suffix ? ` ${item.suffix}` : ''}.</span>
              </motion.p>
            ))}
          </motion.div>
          
          <motion.div 
            className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">€3,418</div>
            <p className="text-gray-400">The average "Discipline Tax" we find in new uploads</p>
            <p className="text-sm text-gray-500 mt-2">Money already earned, then given back to the market.</p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PROBLEM - Sound Familiar?
          ============================================ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>Sound familiar?</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>You know exactly what's killing your account.</motion.h2>
            <motion.p className="text-gray-400 max-w-xl mx-auto" variants={itemVariants}>
              You've read the books. You've backtested. You've journaled. But the same mistakes keep happening.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: '🔥', title: 'The revenge trade', desc: '"Just one more to get back to breakeven." That -€340 becomes -€890 before you close the laptop.' },
              { icon: '📏', title: 'The "I feel good" size-up', desc: 'Your rules say 0.5 lots. But this setup looks perfect, so you go 1.5. It loses. Of course it does.' },
              { icon: '⚡', title: 'The 11-trade Tuesday', desc: '3 trades max was the plan. 11 trades later, you\'re wondering what just happened. Again.' },
              { icon: '📉', title: 'The setup that stopped working', desc: 'That "London FVG" hasn\'t worked in months. But you keep taking it anyway, hoping it comes back.' },
            ].map((problem) => (
              <motion.div 
                key={problem.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-4">{problem.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{problem.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="text-center mt-16 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 mb-2">The problem isn't your strategy. It's the gap between what you know and what you do.</p>
            <p className="text-white font-semibold text-lg">We measure that gap. In euros.</p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS - 3 Steps
          ============================================ */}
      <section className="py-24 relative bg-[#050508]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>How it works</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>We put a number on your bad habits.</motion.h2>
            <motion.p className="text-gray-400 max-w-xl mx-auto" variants={itemVariants}>
              Send us your trades. We run them through the same behavioral analysis hedge funds use.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { step: '01', title: 'Export your trades', desc: 'MT4, MT5, cTrader, TradingView, any broker. Just export a CSV — takes 2 minutes.' },
              { step: '02', title: 'We analyze everything', desc: 'Behavioral patterns, emotional triggers, position sizing violations, overtrading windows. All of it.' },
              { step: '03', title: 'You get a diagnosis', desc: '"You lost €847 to revenge trades. They happen between 2-4pm after a loss. Here\'s how to stop."' },
            ].map((item) => (
              <motion.div key={item.step} className="relative" variants={slideInLeft}>
                <div className="text-6xl font-bold text-blue-500/20 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative pt-12 pl-4">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          WHAT YOU'LL LEARN - Benefits
          ============================================ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>What you'll learn</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold tracking-tight" variants={itemVariants}>The report that tells you what your journal can't</motion.h2>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: '💰', title: 'Your Discipline Tax', desc: 'The exact euro amount you lost to emotional mistakes last month. Broken down by type: revenge trades, oversizing, overtrading. No vague percentages — real money.' },
              { icon: '📊', title: 'Your Edge Portfolio', desc: 'Which of your setups are actually profitable (keep trading), which are break-even (review), and which are quietly bleeding you dry (stop immediately).' },
              { icon: '🩺', title: 'Your Trading Prescription', desc: 'Not "manage your emotions better." Real rules: "Don\'t trade GBP after a loss." "Max 3 trades before noon." "Never size up on Fridays." Specific to YOU.' },
              { icon: '⏰', title: 'Your Danger Zones', desc: 'The exact times, days, and conditions when you make your worst decisions. Once you see the pattern, you can\'t unsee it.' },
            ].map((benefit) => (
              <motion.div 
                key={benefit.title}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all"
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.1)" }}
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          DASHBOARD PREVIEW - Show, don't tell
          ============================================ */}
      <section className="py-24 relative bg-[#050508]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase">Inside The Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">See Exactly What You're Getting</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Real metrics from our demo dashboard. This is what your analysis looks like.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardPreview variant="discipline-tax" />
            <DashboardPreview variant="bql-score" />
            <DashboardPreview variant="edge-portfolio" />
            <DashboardPreview variant="alerts" />
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <button
              onClick={handleExploreDemo}
              className="landing-btn landing-btn--secondary text-base px-8 py-3"
            >
              Explore Full Demo Dashboard →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          DATA COMPARISON - Before/After
          ============================================ */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>Results</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>Data doesn't lie.</motion.h2>
            <motion.p className="text-gray-400" variants={itemVariants}>What happens when you finally see the cost of your emotions.</motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* VS Divider */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <span className="bg-[#020204] text-gray-500 font-bold px-4 py-2 rounded-full border border-white/10">VS</span>
            </div>
            
            {/* Before Card */}
            <motion.div 
              className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">Before Shibuya</span>
                <span className="text-2xl">📉</span>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Sortino Ratio</span>
                  <div className="text-3xl font-bold text-white">0.38</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Monthly P&L</span>
                  <div className="text-3xl font-bold text-white">+€1,200</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-sm text-gray-400">Discipline Tax</span>
                <div className="text-2xl font-bold text-red-400">−€3,418</div>
                <span className="text-xs text-gray-500">Lost to emotions</span>
              </div>
            </motion.div>

            {/* After Card */}
            <motion.div 
              className="p-8 rounded-2xl border border-green-500/20 bg-green-500/5"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">After 3 Months</span>
                <span className="text-2xl">📈</span>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Sortino Ratio</span>
                  <div className="text-3xl font-bold text-white">2.84 <span className="text-sm text-green-400">↑ 647%</span></div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Monthly P&L</span>
                  <div className="text-3xl font-bold text-white">+€4,100 <span className="text-sm text-green-400">↑ 242%</span></div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <span className="text-sm text-gray-400">Discipline Tax</span>
                <div className="text-2xl font-bold text-green-400">−€890</div>
                <span className="text-xs text-green-400">↓ €2,528 saved/month</span>
              </div>
            </motion.div>
          </div>

          {/* Impact Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-6 mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold text-blue-400">+€2,900</div>
              <div className="text-xs text-gray-500">Monthly improvement</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold text-blue-400">74%</div>
              <div className="text-xs text-gray-500">Less emotional trading</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold text-blue-400">3 months</div>
              <div className="text-xs text-gray-500">Time to transformation</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PRICING
          ============================================ */}
      <section className="py-24 relative bg-[#050508]" id="pricing">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>Get your report</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>Find out what you're really losing.</motion.h2>
            <motion.p className="text-gray-400 max-w-xl mx-auto" variants={itemVariants}>
              Most traders we analyze are losing €500-2,000/month to the same 2-3 mistakes.
              A €99 report pays for itself the first week you stop making them.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div 
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col"
              variants={slideInLeft}
              whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.2)" }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">The Reality Check</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">€99</span>
                  <span className="text-sm text-gray-500">one-time</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-8">
                A brutally honest diagnosis of your trading. We find the leaks you can't see yourself.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Your "discipline tax" in euros (not percentages)', 'Which setups actually make you money', 'Exactly when and why you overtrade', 'Personalized rules to stop the bleeding', 'Written by a human, delivered in 72 hours'].map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-blue-400 mt-0.5">✓</span> {perk}
                  </li>
                ))}
              </ul>
              <Link to="/checkout/steve" className="landing-btn landing-btn--secondary w-full py-3 text-center">
                Get The Reality Check
              </Link>
            </motion.div>

            <motion.div 
              className="p-8 rounded-2xl bg-white/[0.02] border border-blue-500/30 flex flex-col relative overflow-hidden"
              variants={slideInRight}
              whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                Recommended
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">The Deep Dive</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">€149</span>
                  <span className="text-sm text-gray-500">one-time</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-8">
                Everything above, plus two 1:1 calls to work through your patterns together.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in The Reality Check', 'Two 30-minute video calls with an analyst', 'Follow-up report after 30 days', 'Custom trading rules for YOUR patterns', 'Priority email support'].map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-blue-400 mt-0.5">✓</span> {perk}
                  </li>
                ))}
              </ul>
              <Link to="/checkout/steve-plus" className="landing-btn landing-btn--primary w-full py-3 text-center">
                Get The Deep Dive
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          COMING SOON - Real-time Dashboard
          ============================================ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>Coming Q1 2026</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>Real-time tracking is on the way</motion.h2>
            <motion.p className="text-gray-400 max-w-xl mx-auto" variants={itemVariants}>
              Launching as a €250/mo subscription for traders who want ongoing accountability, not just a one-time diagnosis.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: '🔄', title: 'Real-time sync', desc: 'Connect your broker. Trades auto-import. No more CSV uploads.' },
              { icon: '🚨', title: 'Live slump detection', desc: "We'll alert you when you're entering tilt BEFORE you blow up." },
              { icon: '📅', title: 'Weekly coaching alerts', desc: 'Sunday evening prep. Friday review. Stay accountable without hiring a coach.' },
              { icon: '📊', title: 'Live dashboard', desc: 'Your discipline tax updating in real-time. Your edge portfolio always current.' },
            ].map((feature) => (
              <motion.div 
                key={feature.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="mt-16 max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {waitlistSubmitted ? (
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
                <span className="text-green-400 text-2xl mb-2 block">✓</span>
                <p className="text-gray-300">You're on the list. We'll be in touch when the dashboard launches.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex gap-3">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <motion.button 
                  type="submit" 
                  className="landing-btn landing-btn--primary px-6 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Waitlist
                </motion.button>
              </form>
            )}
            <p className="text-xs text-gray-500 mt-4">No spam. Just one email when we launch.</p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <TestimonialsSection />

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="py-24 relative bg-[#050508]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>FAQ</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold tracking-tight" variants={itemVariants}>Questions you're probably asking</motion.h2>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                className={`border border-white/5 rounded-xl overflow-hidden transition-colors ${openFaq === index ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                variants={itemVariants}
              >
                <div className="flex justify-between items-center p-6 cursor-pointer">
                  <span className="font-medium text-gray-200 pr-4">{faq.q}</span>
                  <motion.span 
                    className="text-gray-500 text-xl flex-shrink-0"
                    animate={{ rotate: openFaq === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >+</motion.span>
                </div>
                {openFaq === index && (
                  <motion.div 
                    className="px-6 pb-6 text-gray-400 text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CONTACT FORM
          ============================================ */}
      <section className="py-24 relative">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase block" variants={itemVariants}>Get in touch</motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" variants={itemVariants}>Questions? Ideas? Just want to chat?</motion.h2>
            <motion.p className="text-gray-400" variants={itemVariants}>
              We're building this for traders like you. Your feedback shapes what we build next.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {contactSubmitted ? (
              <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                <span className="text-green-400 text-3xl mb-4 block">✓</span>
                <p className="text-gray-300">Message received. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <textarea
                  placeholder="Your message, question, or suggestion..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
                />
                <motion.button 
                  type="submit" 
                  className="landing-btn landing-btn--primary w-full py-3"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Send Message
                </motion.button>
                <p className="text-xs text-gray-500 text-center">Opens your email client. We reply within 24 hours.</p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <motion.section 
        className="py-24 text-center border-t border-white/5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >Stop guessing. Start knowing.</motion.h2>
          <motion.p
            className="text-gray-400 mb-10 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >Find out exactly what's costing you money — and get a plan to fix it.</motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.a 
              href="#pricing"
              className="landing-btn landing-btn--primary px-8 py-3 text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Your Report — €99
            </motion.a>
            <motion.button 
              className="landing-btn landing-btn--secondary px-8 py-3 text-base" 
              onClick={handleExploreDemo}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🎯 Explore Sample Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
