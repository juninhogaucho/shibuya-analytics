import { CHECKOUT_URLS, PRICING } from '../../lib/constants'
import { Section } from '../../components/ui/Section'
import { Link } from 'react-router-dom'

export function PricingPage() {
  return (
    <Section
      eyebrow="Pricing"
      title="One tier for every transformation point"
      description="Whether you want a one-time diagnosis or ongoing coaching, we have you covered."
    >
      <div className="pricing-grid">
        {Object.values(PRICING).map((plan) => (
          <article key={plan.id} className={`pricing-card ${'featured' in plan && plan.featured ? 'pricing-card--featured' : ''}`}>
            <div className="pricing-card__header">
              <p className="badge">{plan.name}</p>
              <div className="pricing-card__price">
                <span className="price-amount">${plan.price}</span>
                {plan.type === 'subscription' && <span className="price-interval">/mo</span>}
              </div>
            </div>
            <p className="text-muted">{plan.description}</p>
            <ul>
              {plan.perks.map((perk) => (
                <li key={perk}>✓ {perk}</li>
              ))}
            </ul>
            <Link 
              className="btn btn-secondary" 
              to={CHECKOUT_URLS[plan.id as keyof typeof CHECKOUT_URLS]}
            >
              {plan.type === 'subscription' ? 'Subscribe Now' : 'Get Started'}
            </Link>
          </article>
        ))}
      </div>
    </Section>
  )
}
