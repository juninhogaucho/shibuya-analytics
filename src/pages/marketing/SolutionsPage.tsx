import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function SolutionsPage() {
  const solutions = [
    {
      title: "One-Time Reports",
      price: "€99 - €149",
      description: "Perfect for traders who want a deep dive into their current performance",
      features: [
        "Discipline Tax calculation",
        "Edge Portfolio analysis",
        "BQL Score & behavioral insights",
        "Delivered in 72 hours",
        "No subscription required"
      ],
      cta: "Get Your Report",
      link: "/checkout/reality-check",
      badge: "Most Popular"
    },
    {
      title: "Live Dashboard",
      price: "€250/month",
      description: "Real-time monitoring for serious traders and prop firm participants",
      features: [
        "Real-time BDS tracking",
        "Live alerts during trading",
        "Slump detection & recovery",
        "Weekly automated reports",
        "Historical trend analysis"
      ],
      cta: "Join Waitlist",
      link: "/activate",
      badge: "Coming Soon"
    },
    {
      title: "Prop Firm White-Label",
      price: "Custom",
      description: "Full platform for prop firms to monitor their traders",
      features: [
        "Multi-tenant architecture",
        "Custom branding",
        "Auto account freezing",
        "Payout management",
        "KYC integration"
      ],
      cta: "Contact Sales",
      link: "#contact",
      badge: "Enterprise"
    }
  ];

  return (
    <div className="landing bg-[#020204] text-white selection:bg-blue-500/30 min-h-screen">
      {/* Hero */}
      <section className="landing-section py-24 relative overflow-hidden bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/50 to-[#020204] z-0 pointer-events-none" />
        <div className="landing-container max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-blue-400 text-xs font-bold mb-4 tracking-[0.2em] uppercase">
              Our Solutions
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white">
              Choose Your Path
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Whether you need a one-time analysis or continuous monitoring,
              we've got the solution for your trading journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="landing-section pb-24">
        <div className="landing-container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, i) => (
              <motion.div
                key={solution.title}
                className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all relative bg-[#0A0A0F]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)' }}
              >
                {solution.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      solution.badge === 'Most Popular'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : solution.badge === 'Coming Soon'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    }`}>
                      {solution.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8 mt-4">
                  <h3 className="text-xl font-bold mb-2 text-white">{solution.title}</h3>
                  <div className="text-3xl font-bold text-white mb-4">{solution.price}</div>
                  <p className="text-gray-400 text-sm leading-relaxed">{solution.description}</p>
                </div>

                <ul className="space-y-4 mb-8 border-t border-white/5 pt-8">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={solution.link}
                  className={`block w-full text-center py-3 rounded-full font-medium transition-all ${
                    solution.badge === 'Most Popular'
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {solution.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For? */}
      <section className="landing-section py-24 bg-[#050508]">
        <div className="landing-container max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 tracking-tight text-white">Who Is This For?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="p-8 rounded-2xl bg-green-500/5 border border-green-500/10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Perfect for you if:
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>You're profitable but feel like you're leaving money on the table</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>You struggle with revenge trading after losses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Your position sizes are inconsistent</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>You want to pass a prop firm challenge</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>You're tired of journaling without actionable insights</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-6 text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Not for you if:
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>You're looking for trading signals or strategies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>You don't keep any record of your trades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>You're brand new with less than 50 trades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>You expect instant fixes without self-awareness</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>You think your losses are always the market's fault</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section py-24 text-center">
        <div className="landing-container max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to stop guessing?</h2>
          <p className="text-gray-400 mb-8">
            Join hundreds of traders who have transformed their performance with Shibuya.
          </p>
          <Link to="/checkout/reality-check" className="landing-btn landing-btn--primary px-8 py-3">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
