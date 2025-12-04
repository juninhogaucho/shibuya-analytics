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
          HERO - Direct, pain-focused, clear value
          ============================================ */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">For FX, Index CFDs, Metals & Crypto traders</p>
          <h1 className="landing-hero__headline">
            You're not losing to the market.<br />
            <span className="text-gradient">You're losing to yourself.</span>
          </h1>
          <p className="landing-hero__subhead">
            We analyze your trades and calculate exactly how much money you're leaving on the table 
            to revenge trading, oversizing, and overtrading. Then we show you how to stop.
          </p>
          <div className="landing-hero__cta">
            <a href="#pricing" className="landing-btn landing-btn--primary">
              Get Your Report — €99
            </a>
            <button className="landing-btn landing-btn--secondary" onClick={handleExploreDemo}>
              See a Sample Report
            </button>
          </div>
          <p className="landing-hero__trust">
            <span className="trust-check">✓</span> Written by humans, not AI
            <span className="trust-sep">•</span>
            <span className="trust-check">✓</span> Delivered in 72 hours
            <span className="trust-sep">•</span>
            <span className="trust-check">✓</span> No subscription, no login
          </p>
        </div>
        
        {/* Social Proof Strip - specific, believable */}
        <div className="landing-proof">
          <div className="landing-proof__item">
            <span className="landing-proof__number">€847</span>
            <span className="landing-proof__label">Average monthly loss to revenge trades alone</span>
          </div>
          <div className="landing-proof__divider"></div>
          <div className="landing-proof__item">
            <span className="landing-proof__number">3.2x</span>
            <span className="landing-proof__label">Average position size on losing trades vs winners</span>
          </div>
          <div className="landing-proof__divider"></div>
          <div className="landing-proof__item">
            <span className="landing-proof__number">47%</span>
            <span className="landing-proof__label">Of traders overtrade by 2x their own rules</span>
          </div>
        </div>
      </section>

      {/* ============================================
          PROBLEM - Articulate their pain (visceral)
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Sound familiar?</span>
          <h2>You know exactly what's killing your account.</h2>
          <p className="landing-section__subtitle">
            You've read the books. You've backtested. You've journaled. But the same mistakes keep happening.
            Here's the brutal part: you can see yourself doing it, and you still can't stop.
          </p>
        </div>
        
        <div className="landing-problems">
          <div className="landing-problem">
            <div className="landing-problem__icon">🔥</div>
            <h3>The revenge trade</h3>
            <p>"Just one more to get back to breakeven." That -€340 becomes -€890 before you close the laptop. We've all been there.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">📏</div>
            <h3>The "I feel good" size-up</h3>
            <p>Your rules say 0.5 lots. But this setup looks perfect, so you go 1.5. It loses. Of course it does.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">⚡</div>
            <h3>The 11-trade Tuesday</h3>
            <p>3 trades max was the plan. 11 trades later, you're wondering what just happened. Again.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">�</div>
            <h3>The setup that stopped working</h3>
            <p>That "London FVG" hasn't worked in months. But you keep taking it anyway, hoping it comes back.</p>
          </div>
        </div>
        
        <div className="landing-problem-cta">
          <p>The problem isn't your strategy. It's the gap between what you know and what you do.</p>
          <p><strong>We measure that gap. In euros.</strong></p>
        </div>
      </section>

      {/* ============================================
          WHAT WE ACTUALLY DO - Clear, simple
          ============================================ */}
      <section className="landing-section landing-section--accent">
        <div className="landing-section__header">
          <span className="landing-eyebrow">How it works</span>
          <h2>We put a number on your bad habits.</h2>
          <p className="landing-section__subtitle">
            Send us your trades. We run them through the same behavioral analysis hedge funds use.
            You get a PDF that tells you exactly what's costing you money — and how to stop.
          </p>
        </div>
        
        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature__number">01</div>
            <div className="landing-feature__content">
              <h3>Export your trades</h3>
              <p>MT4, MT5, cTrader, TradingView, any broker. Just export a CSV — takes 2 minutes.</p>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature__number">02</div>
            <div className="landing-feature__content">
              <h3>We analyze everything</h3>
              <p>Behavioral patterns, emotional triggers, position sizing violations, overtrading windows. All of it.</p>
            </div>
          </div>
          <div className="landing-feature">
            <div className="landing-feature__number">03</div>
            <div className="landing-feature__content">
              <h3>You get a diagnosis</h3>
              <p>"You lost €847 to revenge trades. They happen between 2-4pm after a loss. Here's how to stop."</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUE - What the report shows (concrete)
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">What you'll learn</span>
          <h2>The report that tells you what your journal can't</h2>
        </div>
        
        <div className="landing-benefits">
          <div className="landing-benefit">
            <h3>💰 Your Discipline Tax</h3>
            <p>The exact euro amount you lost to emotional mistakes last month. Broken down by type: revenge trades, oversizing, overtrading. No vague percentages — real money.</p>
          </div>
          <div className="landing-benefit">
            <h3>📊 Your Edge Portfolio</h3>
            <p>Which of your setups are actually profitable (keep trading), which are break-even (review), and which are quietly bleeding you dry (stop immediately).</p>
          </div>
          <div className="landing-benefit">
            <h3>🩺 Your Trading Prescription</h3>
            <p>Not "manage your emotions better." Real rules: "Don't trade GBP after a loss." "Max 3 trades before noon." "Never size up on Fridays." Specific to YOU.</p>
          </div>
          <div className="landing-benefit">
            <h3>⏰ Your Danger Zones</h3>
            <p>The exact times, days, and conditions when you make your worst decisions. Once you see the pattern, you can't unsee it.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING - Urgent, clear value
          ============================================ */}
      <section className="landing-section landing-section--dark" id="pricing">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Get your report</span>
          <h2>Find out what you're really losing.</h2>
          <p className="landing-section__subtitle">
            Most traders we analyze are losing €500-2,000/month to the same 2-3 mistakes.
            A €99 report pays for itself the first week you stop making them.
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
              A brutally honest diagnosis of your trading. We find the leaks you can't see yourself.
            </p>
            <ul className="landing-price-card__perks">
              <li>✓ Your "discipline tax" in euros (not percentages)</li>
              <li>✓ Which setups actually make you money</li>
              <li>✓ Exactly when and why you overtrade</li>
              <li>✓ Personalized rules to stop the bleeding</li>
              <li>✓ Written by a human, delivered in 72 hours</li>
            </ul>
            <Link to="/checkout/steve" className="landing-btn landing-btn--secondary landing-btn--full">
              Get The Reality Check
            </Link>
          </div>

          <div className="landing-price-card landing-price-card--featured">
            <div className="landing-price-card__badge">Most Popular</div>
            <div className="landing-price-card__header">
              <h3>The Deep Dive</h3>
              <div className="landing-price-card__price">
                <span className="landing-price-amount">€149</span>
                <span className="landing-price-type">one-time</span>
              </div>
            </div>
            <p className="landing-price-card__desc">
              Everything above, plus two 1:1 calls to work through your patterns together.
            </p>
            <ul className="landing-price-card__perks">
              <li>✓ Everything in The Reality Check</li>
              <li>✓ Two 30-minute video calls with an analyst</li>
              <li>✓ Follow-up report after 30 days</li>
              <li>✓ Custom trading rules for YOUR patterns</li>
              <li>✓ Priority email support</li>
            </ul>
            <Link to="/checkout/steve-plus" className="landing-btn landing-btn--primary landing-btn--full">
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
          FOOTER CTA - Drive to purchase
          ============================================ */}
      <section className="landing-final">
        <h2>Stop guessing. Start knowing.</h2>
        <p>Find out exactly what's costing you money — and get a plan to fix it.</p>
        <div className="landing-final__ctas">
          <a href="#pricing" className="landing-btn landing-btn--primary landing-btn--large">
            Get Your Report — €99
          </a>
          <button className="landing-btn landing-btn--ghost landing-btn--large" onClick={handleExploreDemo}>
            See Sample Dashboard First
          </button>
        </div>
      </section>
    </div>
  )
}
