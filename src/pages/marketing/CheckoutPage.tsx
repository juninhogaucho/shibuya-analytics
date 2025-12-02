import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRICING } from '../../lib/constants'
import { Section } from '../../components/ui/Section'
import { createCheckoutSession, ApiError } from '../../lib/api'

export function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Map URL params to pricing keys
  const planKey = planId === 'steve-plus' ? 'stevePlus' : planId as keyof typeof PRICING
  const plan = PRICING[planKey]

  if (!plan) {
    return (
      <Section
        eyebrow="Error"
        title="Plan not found"
        description="The plan you're looking for doesn't exist."
      >
        <Link to="/pricing" className="btn btn-secondary">
          View All Plans
        </Link>
      </Section>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      setError('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Use centralized API client with error handling
      const { checkout_url } = await createCheckoutSession({
        plan_id: plan.id,
        email,
        success_url: `${window.location.origin}/activate?checkout=success`,
        cancel_url: `${window.location.origin}/checkout/${planId}?canceled=true`,
      })
      
      // Redirect to Stripe Checkout
      window.location.href = checkout_url
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setIsLoading(false)
    }
  }

  const isValidEmail = email.includes('@') && email.includes('.')

  return (
    <Section
      eyebrow="Checkout"
      title={`Get ${plan.name}`}
      description={plan.description}
    >
      <div className="checkout-container">
        <div className="checkout-card glass-panel">
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>{plan.name}</span>
              <span className="price-amount">${plan.price}</span>
            </div>
            {plan.type === 'subscription' && (
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Billed monthly. Cancel anytime.
              </p>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
            <div className="summary-row" style={{ fontWeight: 600 }}>
              <span>Total</span>
              <span>${plan.price}{plan.type === 'subscription' ? '/mo' : ''}</span>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleCheckout}>
            <h3>Your Details</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              🔒 Secure checkout powered by Stripe
            </p>
            
            <div className="form-field">
              <label htmlFor="checkout-email">Email</label>
              <input 
                id="checkout-email"
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="checkout-name">Full Name</label>
              <input 
                id="checkout-name"
                type="text" 
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                minLength={2}
              />
            </div>
            
            {error && (
              <div className="checkout-error" style={{ 
                color: '#ef4444', 
                background: 'rgba(239, 68, 68, 0.1)', 
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1.5rem' }} 
              disabled={isLoading || !email || !name || !isValidEmail}
            >
              {isLoading ? (
                <>
                  <span className="spinner" style={{ marginRight: '0.5rem' }}></span>
                  Processing...
                </>
              ) : (
                plan.type === 'subscription' ? `Subscribe | $${plan.price}/mo` : `Pay $${plan.price}`
              )}
            </button>
            
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
              You'll be redirected to Stripe to complete payment securely.
            </p>
          </form>
        </div>

        <div className="checkout-perks glass-panel">
          <h4>What you get:</h4>
          <ul>
            {plan.perks.map((perk) => (
              <li key={perk}>✓ {perk}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
