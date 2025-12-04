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
          HERO - High Status, Philosophical, Value-First
          ============================================ */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">Manual entry is for clerks</p>
          <h1 className="landing-hero__headline">
            We quantify your edge,<br />
            <span className="text-gradient">and your emotions.</span>
          </h1>
          <p className="landing-hero__subhead">
            If you didn't know how much they cost you, now you do.
            Then we show you exactly how to stop the bleeding.
          </p>
          <div className="landing-hero__cta">
            <a href="#system" className="landing-btn landing-btn--primary">
              See The System
            </a>
            <button className="landing-btn landing-btn--secondary" onClick={handleExploreDemo}>
              View Sample Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ============================================
          THE EQUATION - Intellectual Hook
          ============================================ */}
      <section className="landing-section landing-section--dark">
        <div className="landing-section__header">
          <div className="equation-display" style={{ fontFamily: 'monospace', fontSize: 'clamp(1.2rem, 4vw, 2.5rem)', marginBottom: '2rem', color: '#a1a1b5' }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>PnL</span> = 
            (<span style={{ color: '#3b82f6' }}>Edge</span> + <span style={{ color: '#a855f7' }}>Luck</span>) - 
            <span style={{ color: '#ef4444', textDecoration: 'line-through', marginLeft: '10px' }}>Behavior</span>
          </div>
          <p className="landing-section__subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            We use robust regression to filter out the <span style={{ color: '#a855f7' }}>Luck</span>.<br/>
            We use Markov Chains to eliminate the <span style={{ color: '#ef4444' }}>Behavior</span>.<br/>
            What remains is <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Pure Alpha</span>.
          </p>
        </div>
      </section>

      {/* ============================================
          THE PROBLEM - "You already know what's wrong"
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">The Discipline Tax</span>
          <h2>You already know what's wrong.</h2>
          <p className="landing-section__subtitle">
            Every journaling platform says "follow your rules." No one tells you, in dollars, what breaking them costs you. We do.
          </p>
        </div>
        
        <div className="landing-problems">
          <div className="landing-problem">
            <div className="landing-problem__icon">🔥</div>
            <h3>Revenge Trading</h3>
            <p>You take a loss. Within 10 minutes you're back in. No setup, no edge, pure emotion. You know it's wrong while you're doing it.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">📏</div>
            <h3>Size Inconsistency</h3>
            <p>Your plan says 1 lot. But this setup "feels different" so you go 3x. Then it stops you out. Nice risk management.</p>
          </div>
          <div className="landing-problem">
            <div className="landing-problem__icon">🎢</div>
            <h3>The Tilt Cycle</h3>
            <p>Every tick in your direction feels like a victory. Every tick against you feels like a stab. You watch PnL, not price.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          THE SYSTEM - 5 Phases
          ============================================ */}
      <section className="landing-section landing-section--accent" id="system">
        <div className="landing-section__header">
          <span className="landing-eyebrow">The Methodology</span>
          <h2>The System</h2>
          <p className="landing-section__subtitle">
            How we deconstruct your behavior and rebuild your trading.
          </p>
        </div>
        
        <div className="system-grid">
          <div className="system-card">
            <div className="system-card__phase">Phase 01</div>
            <h3>The Mirror</h3>
            <p>You can't fix what you refuse to look at. We force you to stare at your own reflection. Automated pattern recognition that ignores your excuses.</p>
          </div>
          <div className="system-card">
            <div className="system-card__phase">Phase 02</div>
            <h3>The Diagnosis</h3>
            <p>Mistakes are expensive. We make them obvious. We calculate your "Discipline Tax" — the exact dollar amount your emotions cost you.</p>
          </div>
          <div className="system-card">
            <div className="system-card__phase">Phase 03</div>
            <h3>The Simulator</h3>
            <p>Perfect your execution. Test your process without the financial bleeding. Prove your edge exists in a controlled environment.</p>
          </div>
          <div className="system-card">
            <div className="system-card__phase">Phase 04</div>
            <h3>The Instructor</h3>
            <p>We act as both the doctor and the pharmacist. We don't just find the disease; we prescribe the specific rules to cure it.</p>
          </div>
          <div className="system-card">
            <div className="system-card__phase">Phase 05</div>
            <h3>The License</h3>
            <p>Earn the right to size up. We suggest global risk limits based on your current Shibuya Score™. Protect your capital from yourself.</p>
          </div>
        </div>
      </section>

      {/* ============================================
          DATA DOESN'T LIE - Social Proof
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Results</span>
          <h2>Data Doesn't Lie.</h2>
          <p className="landing-section__subtitle">
            What happens when you finally see the cost of your emotions.
          </p>
        </div>

        <div className="data-comparison">
          <div className="data-card data-card--before">
            <div className="data-card__badge">Before Shibuya</div>
            <div className="data-row">
              <span>Sortino Ratio</span>
              <span className="data-val negative">0.38</span>
            </div>
            <div className="data-row">
              <span>Monthly P&L</span>
              <span className="data-val neutral">+$1,200</span>
            </div>
            <div className="data-highlight negative">
              <span>Discipline Tax</span>
              <strong>-$3,418</strong>
            </div>
            <p className="data-quote">"I thought I was disciplined. The data proved I wasn't."</p>
          </div>

          <div className="data-card data-card--after">
            <div className="data-card__badge">After 3 Months</div>
            <div className="data-row">
              <span>Sortino Ratio</span>
              <span className="data-val positive">2.84</span>
            </div>
            <div className="data-row">
              <span>Monthly P&L</span>
              <span className="data-val positive">+$4,100</span>
            </div>
            <div className="data-highlight positive">
              <span>Discipline Tax</span>
              <strong>-$890</strong>
            </div>
            <p className="data-quote">"Seeing the number made me fix it. It wasn't my strategy, it was me."</p>
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING - Moved Down
          ============================================ */}
      <section className="landing-section landing-section--dark" id="pricing">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Get Started</span>
          <h2>One tier. Everything you need.</h2>
          <p className="landing-section__subtitle">
            Stop guessing. Start knowing.
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
              <li>✓ Your "discipline tax" in euros</li>
              <li>✓ Which setups actually make you money</li>
              <li>✓ Exactly when and why you overtrade</li>
              <li>✓ Personalized rules to stop the bleeding</li>
              <li>✓ Delivered in 72 hours</li>
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
            Launching as a €250/mo subscription for traders who want ongoing accountability.
          </p>
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
          <p className="landing-waitlist__note">Opens your email client to confirm subscription.</p>
        </div>
      </section>

      {/* ============================================
          FAQ
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
          CONTACT FORM
          ============================================ */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Get in touch</span>
          <h2>Questions? Ideas?</h2>
          <p className="landing-section__subtitle">
            We're building this for traders like you.
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
                placeholder="Your message..."
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
    </div>
  )
}
