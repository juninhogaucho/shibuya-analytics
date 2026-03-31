import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRICING, PLAN_KEYS } from '../../lib/constants'
import { Section } from '../../components/ui/Section'
import { enterSampleMode } from '../../lib/runtime'
import { createCheckoutSession } from '../../lib/api'

// Map frontend plan IDs to backend Stripe price keys
const BACKEND_PLAN_IDS: Record<string, string> = {
  basic: 'shibuya_single',
  premium: 'shibuya_transform',
}

export function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [tradingPlatform, setTradingPlatform] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const planKey = planId ? PLAN_KEYS[planId] : undefined
  const plan = planKey ? PRICING[planKey] : undefined

  if (!plan) {
    return (
      <Section
        eyebrow="Error"
        title="Plan not found"
        description="The plan you're looking for doesn't exist."
      >
        <Link to="/#pricing" className="btn btn-secondary">
          View Plans
        </Link>
      </Section>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be under 10MB')
        return
      }
      setCsvFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !name) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const backendPlanId = BACKEND_PLAN_IDS[plan.id] || plan.id
      const result = await createCheckoutSession({
        plan_id: backendPlanId,
        email,
        name,
        success_url: `${window.location.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/${planId}`,
      })

      // Store order locally for activation page reference
      localStorage.setItem('shibuya_order', JSON.stringify({
        email,
        name,
        plan: plan.id,
        order_id: result.order_id,
        session_id: result.session_id,
        platform: tradingPlatform,
        timestamp: new Date().toISOString(),
      }))

      // Redirect to Stripe Checkout
      window.location.href = result.checkout_url
    } catch (err: any) {
      setSubmitting(false)
      const msg = err?.response?.data?.detail || err?.message || 'Payment setup failed. Please try again.'
      setError(msg)
    }
  }

  const isValidEmail = email.includes('@') && email.includes('.')

  return (
    <Section
      eyebrow="Get Your Report"
      title={plan.name}
      description={plan.description}
    >
      <div className="checkout-container">
        <div className="checkout-card glass-panel">
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>{plan.name}</span>
              <span className="price-amount">&euro;{plan.price}</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              One-time payment. Instant dashboard access after payment.
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
            <div className="summary-row" style={{ fontWeight: 600 }}>
              <span>Total</span>
              <span>&euro;{plan.price}</span>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3>Your Details</h3>

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
              <span className="field-hint" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>We'll send your activation details here</span>
            </div>

            <div className="form-field">
              <label htmlFor="checkout-platform">Trading Platform</label>
              <select
                id="checkout-platform"
                value={tradingPlatform}
                onChange={(e) => setTradingPlatform(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(8,8,12,0.8)',
                  color: '#fff'
                }}
              >
                <option value="">Select your platform...</option>
                <option value="mt4">MetaTrader 4</option>
                <option value="mt5">MetaTrader 5</option>
                <option value="ctrader">cTrader</option>
                <option value="tradingview">TradingView</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* CSV Upload */}
            <div className="form-field csv-upload-section">
              <label>Upload Your Trades (Optional)</label>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Attach now or upload inside your dashboard after activation.
              </p>
              <div
                className={`csv-dropzone ${csvFile ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {csvFile ? (
                  <div className="csv-file-info">
                    <span className="csv-icon">CSV</span>
                    <span className="csv-name">{csvFile.name}</span>
                    <button
                      type="button"
                      className="csv-remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCsvFile(null)
                      }}
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <div className="csv-placeholder">
                    <span>Click to upload CSV</span>
                    <span className="csv-hint">MT4, MT5, cTrader exports</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{
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
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={!email || !name || !isValidEmail || submitting}
            >
              {submitting ? 'Setting up payment...' : `Pay \u20AC${plan.price} Securely`}
            </button>

            <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
              Secure payment via Stripe. You'll be redirected to complete payment.
            </p>
          </form>
        </div>

        <div className="checkout-perks glass-panel">
          <h4>What you get:</h4>
          <ul>
            {plan.perks.map((perk) => (
              <li key={perk}>&#10003; {perk}</li>
            ))}
          </ul>

          <div style={{ marginTop: '1.5rem' }}>
            <h4>How it works:</h4>
            <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>Fill in your details</li>
              <li style={{ marginBottom: '0.5rem' }}>Pay securely via Stripe</li>
              <li style={{ marginBottom: '0.5rem' }}>Activate your dashboard</li>
              <li>Upload trades and get your analysis</li>
            </ol>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Not sure?</strong>{' '}
              <Link
                to="/dashboard"
                onClick={enterSampleMode}
                style={{ color: 'var(--color-primary)' }}
              >
                Explore the sample workspace
              </Link>{' '}
              first.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
