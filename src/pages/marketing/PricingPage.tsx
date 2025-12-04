import { CHECKOUT_URLS, PRICING } from '../../lib/constants'
import { Section } from '../../components/ui/Section'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function PricingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)

  const handleExploreDemo = () => {
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard')
  }

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Waitlist signup:', email)
    setWaitlistSubmitted(true)
    setEmail('')
  }

  return (
    <>
      <Section
        eyebrow="Pricing"
        title="One report can change everything"
        description="Most traders bleed €500-2000/month to the same emotional mistakes. A €99 report might be the best ROI you've ever made."
      >
        <div className="pricing-grid pricing-grid--two">
          {Object.values(PRICING).map((plan) => (
            <article key={plan.id} className={`pricing-card ${'featured' in plan && plan.featured ? 'pricing-card--featured' : ''}`}>
              {'featured' in plan && plan.featured && (
                <div className="pricing-card__badge">Recommended</div>
              )}
              <div className="pricing-card__header">
                <p className="badge">{plan.name}</p>
                <div className="pricing-card__price">
                  <span className="price-amount">€{plan.price}</span>
                  <span className="price-type">one-time</span>
                </div>
              </div>
              <p className="text-muted">{plan.description}</p>
              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}>✓ {perk}</li>
                ))}
              </ul>
              <Link 
                className={`btn ${('featured' in plan && plan.featured) ? 'btn-primary' : 'btn-secondary'}`}
                to={CHECKOUT_URLS[plan.id as keyof typeof CHECKOUT_URLS]}
              >
                Get {plan.name}
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* Demo Section */}
      <Section
        eyebrow="Not sure yet?"
        title="Explore the dashboard first"
        description="See what we show you on a real trader's data. No signup required."
      >
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-secondary btn-lg" onClick={handleExploreDemo}>
            Explore Demo Dashboard →
          </button>
        </div>
      </Section>

      {/* Waitlist Section */}
      <Section
        eyebrow="Coming soon"
        title="The full dashboard is on the way"
        description="Real-time tracking, automated slump detection, weekly coaching alerts. Leave your email and we'll let you know when it's ready."
      >
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
              <button type="submit" className="btn btn-primary">
                Join the Waitlist
              </button>
            </form>
          )}
        </div>
      </Section>
    </>
  )
}
