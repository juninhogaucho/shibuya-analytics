import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'

export function HomePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleExploreDemo = () => {
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard')
  }

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mailto for waitlist - you'll collect these manually
    const subject = encodeURIComponent('Dashboard Waitlist Signup')
    const body = encodeURIComponent(`New waitlist signup: ${email}\n\nInterested in the €250/mo live dashboard when it launches.`)
    window.open(`mailto:waitlist@shibuya.trade?subject=${subject}&body=${body}`, '_blank')
    setWaitlistSubmitted(true)
    setEmail('')
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open mailto with pre-filled content
    const subject = encodeURIComponent(`Question from ${contactForm.name}`)
    const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`)
    window.location.href = `mailto:hello@shibuya.trade?subject=${subject}&body=${body}`
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
          HERO - Human, direct, no bullshit
          ============================================ */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__headline">
            We rebuild the trader, not just the trades.
          </h1>
          <p className="landing-hero__subhead">
            Shibuya is a behavior lab for spot traders in FX, index CFDs, metals, and majors.
            We quantify your discipline tax, map your actual edges, stress test your risk, and prep you
            for funded capital so you can trade with intention.
          </p>
          <div className="landing-hero__cta">
            <Link to="/pricing" className="landing-btn landing-btn--primary">
              See What's Costing You Money
            </Link>
            <button className="landing-btn landing-btn--secondary" onClick={handleExploreDemo}>
              Explore Demo Dashboard
            </button>
          </div>
        </div>
        
        {/* Social Proof Strip - more human */}
        <div className="landing-proof">
          <div className="landing-proof__item">
            <span className="landing-proof__number">€1,200+</span>
            <span className="landing-proof__label">Average discipline tax we find per trader</span>
          </div>
          <div className="landing-proof__divider"></div>
          <div className="landing-proof__item">
            <span className="landing-proof__number">72hrs</span>
            <span className="landing-proof__label">From trades to your personalized report</span>
          </div>
          <div className="landing-proof__divider"></div>
          <div className="landing-proof__item">
            <span className="landing-proof__number">Real humans</span>
            <span className="landing-proof__label">Spot FX • Index CFDs • Metals • Majors</span>
          </div>
        </div>
      </section>

      {/* ============================================
          PROBLEM - Articulate their pain (more human)
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Let's be honest</span>
          <h2>You already know what you're doing wrong.</h2>
          <p className="landing-section__subtitle">
            The strategy isn't the problem. You've backtested it. You've journaled it. 
            But somehow, you keep giving money back to the market. The same mistakes. Again and again.
          </p>
        </div>
        
        <div className="landing-problems">
          <div className="landing-problem">
            <div className="landing-problem__icon">🔥</div>
            <h3>The revenge trade</h3>
            <p>"Just one more to get back to breakeven." That -€340 becomes -€890 before you close the laptop.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">📏</div>
            <h3>The "I feel good" size-up</h3>
            <p>Your rules say 0.5 lots. But this setup looks perfect, so you go 1.5. It wasn't perfect.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">⚡</div>
            <h3>The 11-trade day</h3>
            <p>3 trades max was the plan. 11 trades later, you're wondering what just happened.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">🎰</div>
            <h3>The dead setup you keep trading</h3>
            <p>That "London breakout" hasn't worked in months. But you keep taking it anyway, hoping it comes back.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          WHAT WE ACTUALLY DO
          ============================================ */}
      <section className="landing-section landing-section--accent">
        <div className="landing-section__header">
          <span className="landing-eyebrow">What we do</span>
          <h2>We calculate your discipline tax.</h2>
          <p className="landing-section__subtitle">
            This isn't another journal that tells you to "manage emotions better."
            We run your actual trades through quant-level analysis and show you, 
            in euros, exactly what each mistake costs you.
          </p>
        </div>
        
        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature__number">01</div>
            <div className="landing-feature__content">
              <h3>Send us your trades</h3>
              <p>Export from MT4, MT5, cTrader, or any broker. Just a CSV, we handle the rest.</p>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature__number">02</div>
            <div className="landing-feature__content">
              <h3>We do the math</h3>
              <p>Our engine runs behavioral analysis, Monte Carlo simulations, and edge validation. The same tools hedge funds use.</p>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature__number">03</div>
            <div className="landing-feature__content">
              <h3>You get a real diagnosis</h3>
              <p>Not vague percentages. Real numbers: "You lost €847 to revenge trades last month. Here's exactly when and how."</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BEYOND COST CUTTING - Platform scope
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">More than a PDF</span>
          <h2>The Shibuya operating system</h2>
          <p className="landing-section__subtitle">
            Traders send us raw spot data. We return a full diagnosis: behavioral biometrics, edge governance,
            Monte Carlo forecasting, and capital readiness. This is how we help you grow into the trader you keep
            writing about in your journal.
          </p>
        </div>
        <div className="landing-benefits landing-benefits--grid">
          <div className="landing-benefit">
            <h3>🧠 Behavioral forensics</h3>
            <p>We fingerprint your emotional tells (revenge, boredom, fatigue) and tie them to exact timestamps so you can engineer better habits.</p>
          </div>
          <div className="landing-benefit">
            <h3>🛰 Edge lab</h3>
            <p>Each setup is treated like its own desk with expectancy, DD, and upgrade/downgrade notes. It's portfolio management for your strategies.</p>
          </div>
          <div className="landing-benefit">
            <h3>🏁 Capital readiness</h3>
            <p>We run prop-style Monte Carlo stress, ruin probability, and capital efficiency modeling so you know when you're ready for funding.</p>
          </div>
          <div className="landing-benefit">
            <h3>🌐 Spot-only coverage</h3>
            <p>FX majors, index CFDs (NAS100, SPX500), spot metals, and the top crypto pairs. Want equities or futures? Tell us and we add it next.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUE - What the report shows
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Your report includes</span>
          <h2>Everything you need to stop the bleeding</h2>
        </div>
        
        <div className="landing-benefits">
          <div className="landing-benefit">
            <h3>💰 Your Discipline Tax</h3>
            <p>The exact euro amount you lost to emotional mistakes. Broken down by type: revenge trades, overtrading, size violations.</p>
          </div>
          <div className="landing-benefit">
            <h3>📊 Your Edge Portfolio</h3>
            <p>Which of your setups are actually profitable (PRIME), which are break-even (STABLE), and which are quietly killing your account (DECAYED).</p>
          </div>
          <div className="landing-benefit">
            <h3>🩺 Your Prescription</h3>
            <p>Not "manage your emotions." Real rules: "Stop trading GBP after a loss." "Max 3 trades until you cool down." Specific, actionable, yours.</p>
          </div>
          <div className="landing-benefit">
            <h3>🧑 Written by a Human</h3>
            <p>Your report is written and analyzed by a real person, not AI. We read your trades, understand your patterns, and write specifically for you.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING - Two tiers, simple
          ============================================ */}
      <section className="landing-section landing-section--dark" id="pricing">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Pricing</span>
          <h2>One report can change everything</h2>
          <p className="landing-section__subtitle">
            Most traders bleed €500-2000/month to the same mistakes. 
            A €99 report might be the best ROI you've ever made.
          </p>
        </div>
        
        <div className="landing-pricing landing-pricing--two">
          <div className="landing-price-card">
            <div className="landing-price-card__header">
              <h3>The Reality Check</h3>
              <div className="landing-price-card__price">
                <span className="landing-price-amount">€99</span>
                <span className="landing-price-type">one-time</span>
              </div>
            </div>
            <p className="landing-price-card__desc">
              A brutally honest PDF diagnosis. We show you exactly where you're bleeding money, and it's probably not where you think.
            </p>
            <ul className="landing-price-card__perks">
              <li>Complete discipline tax breakdown</li>
              <li>Edge portfolio analysis</li>
              <li>Written by a real human, not AI</li>
              <li>Delivered within 72 hours</li>
            </ul>
            <Link to="/checkout/steve" className="landing-btn landing-btn--secondary">
              Get Your Report
            </Link>
          </div>

          <div className="landing-price-card landing-price-card--featured">
            <div className="landing-price-card__badge">Recommended</div>
            <div className="landing-price-card__header">
              <h3>The Deep Dive</h3>
              <div className="landing-price-card__price">
                <span className="landing-price-amount">€149</span>
                <span className="landing-price-type">one-time</span>
              </div>
            </div>
            <p className="landing-price-card__desc">
              Two reports + two 1:1 video calls. We don't just show you the problem, we work through solutions together.
            </p>
            <ul className="landing-price-card__perks">
              <li>Everything in The Reality Check</li>
              <li>Two PDF reports (initial + 30-day follow-up)</li>
              <li>Two 30-min video calls with a real human</li>
              <li>Personalized trading rules based on YOUR patterns</li>
              <li>Priority email support</li>
            </ul>
            <Link to="/checkout/steve-plus" className="landing-btn landing-btn--primary">
              Get The Deep Dive
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          COMING SOON - Real-time Dashboard
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Coming Q1 2026</span>
          <h2>Real-time tracking is on the way</h2>
          <p className="landing-section__subtitle">
            Launching as a €250/mo subscription for traders who want ongoing accountability, not just a one-time diagnosis.
          </p>
        </div>
        
        <div className="landing-roadmap">
          <div className="roadmap-item">
            <div className="roadmap-icon">🔄</div>
            <h3>Real-time sync</h3>
            <p>Connect your broker. Trades auto-import. No more CSV uploads.</p>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-icon">🚨</div>
            <h3>Live slump detection</h3>
            <p>We'll alert you when you're entering tilt BEFORE you blow up.</p>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-icon">📅</div>
            <h3>Weekly coaching alerts</h3>
            <p>Sunday evening prep. Friday review. Stay accountable without hiring a coach.</p>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-icon">📊</div>
            <h3>Live dashboard</h3>
            <p>Your discipline tax updating in real-time. Your edge portfolio always current.</p>
          </div>
        </div>
        
        <div className="landing-waitlist">
          {waitlistSubmitted ? (
            <div className="landing-waitlist__success">
              <span className="success-icon">✓</span>
              <p>You're on the list. We'll be in touch when the dashboard launches.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="landing-waitlist__form">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="landing-waitlist__input"
              />
              <button type="submit" className="landing-btn landing-btn--primary">
                Join the Waitlist
              </button>
            </form>
          )}
          <p className="landing-waitlist__note">No spam. Just one email when we launch.</p>
        </div>
      </section>

      {/* ============================================
          FAQ - Address objections
          ============================================ */}
      <section className="landing-section landing-section--dark">
        <div className="landing-section__header">
          <span className="landing-eyebrow">FAQ</span>
          <h2>Questions you're probably asking</h2>
        </div>
        
        <div className="landing-faq">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
              </div>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          CONTACT FORM - Questions/Suggestions
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Get in touch</span>
          <h2>Questions? Ideas? Just want to chat?</h2>
          <p className="landing-section__subtitle">
            We're building this for traders like you. Your feedback shapes what we build next.
          </p>
        </div>
        
        <div className="landing-contact">
          {contactSubmitted ? (
            <div className="landing-waitlist__success">
              <span className="success-icon">✓</span>
              <p>Message received. We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="landing-waitlist__input"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="landing-waitlist__input"
                />
              </div>
              <textarea
                placeholder="Your message, question, or suggestion..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                className="landing-waitlist__input contact-textarea"
                rows={4}
              />
              <button type="submit" className="landing-btn landing-btn--primary">
                Send Message
              </button>
              <p className="contact-routing-hint">Opens your email client. We reply within 24 hours.</p>
            </form>
          )}
        </div>
      </section>

      {/* ============================================
          FOOTER CTA - Final conversion point
          ============================================ */}
      <section className="landing-final">
        <h2>Ready to see what's really going on?</h2>
        <p>Explore real trader data. No signup required.</p>
        <button className="landing-btn landing-btn--primary landing-btn--large" onClick={handleExploreDemo}>
          Explore Demo Dashboard
        </button>
      </section>
    </div>
  )
}
