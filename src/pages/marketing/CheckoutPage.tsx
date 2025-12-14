import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRICING, PLAN_KEYS, STRIPE_PAYMENT_LINKS } from '../../lib/constants'
import { Section } from '../../components/ui/Section'

export function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [tradingPlatform, setTradingPlatform] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Map URL params to pricing keys
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

    // Store order details locally
    const orderData = {
      email,
      name,
      plan: plan.id,
      planName: plan.name,
      price: plan.price,
      platform: tradingPlatform,
      csvAttached: !!csvFile,
      csvName: csvFile?.name || null,
      timestamp: new Date().toISOString(),
    }
    
    localStorage.setItem('shibuya_order', JSON.stringify(orderData))

    // Try to send via API first
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8001'}/checkout/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        throw new Error('API not available')
      }
    } catch {
      // Fallback: Open mailto to notify about the order
      const subject = encodeURIComponent(`🎯 New Order: ${plan.name} - ${name}`)
      const body = encodeURIComponent(
        `NEW ORDER RECEIVED\n` +
        `==================\n\n` +
        `Plan: ${plan.name} (€${plan.price})\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Platform: ${tradingPlatform || 'Not specified'}\n` +
        `CSV: ${csvFile ? `Yes (${csvFile.name})` : 'Will send via email'}\n\n` +
        `---\n` +
        `Next: Customer will pay via Stripe Payment Link.\n` +
        `After payment, send them CSV upload instructions.`
      )
      
      const mailtoLink = `mailto:support@shibuya-analytics.com?subject=${subject}&body=${body}`
      window.open(mailtoLink, '_blank')
    }
    
    setSubmitted(true)
  }

  const stripeLink = STRIPE_PAYMENT_LINKS[plan.id]
  const isValidEmail = email.includes('@') && email.includes('.')

  // After form submission - show payment link
  if (submitted) {
    return (
      <Section
        eyebrow="Almost there!"
        title="Complete your payment"
        description={`Click below to pay €${plan.price} securely via Stripe.`}
      >
        <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '1rem' }}>
            Great! We've got your details. Complete payment to get started:
          </p>
          
          <a 
            href={stripeLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-block', padding: '1rem 2.5rem', fontSize: '1.1rem' }}
          >
            Pay €{plan.price} Securely →
          </a>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              <strong>After payment:</strong> Reply to your confirmation email with your trade CSV.
              We'll have your report ready within 72 hours.
            </p>
          </div>
          
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Questions? <a href="mailto:hello@shibuya.trade" style={{ color: 'var(--color-primary)' }}>hello@shibuya.trade</a>
            </p>
          </div>
        </div>
      </Section>
    )
  }

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
              <span className="price-amount">€{plan.price}</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              One-time payment. Report delivered within 72 hours.
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
            <div className="summary-row" style={{ fontWeight: 600 }}>
              <span>Total</span>
              <span>€{plan.price}</span>
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
              <span className="field-hint" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>We'll send your report here</span>
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
                Attach now or email us after payment.
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
                    <span className="csv-icon">📄</span>
                    <span className="csv-name">{csvFile.name}</span>
                    <button 
                      type="button"
                      className="csv-remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCsvFile(null)
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="csv-placeholder">
                    <span className="csv-icon">📁</span>
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
              disabled={!email || !name || !isValidEmail}
            >
              Continue to Payment →
            </button>
            
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
              🔒 You'll pay securely via Stripe
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
          
          <div style={{ marginTop: '1.5rem' }}>
            <h4>How it works:</h4>
            <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>Fill in your details</li>
              <li style={{ marginBottom: '0.5rem' }}>Pay via Stripe</li>
              <li style={{ marginBottom: '0.5rem' }}>Email us your trades CSV</li>
              <li>Get your report within 72h</li>
            </ol>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Not sure?</strong>{' '}
              <Link 
                to="/dashboard" 
                onClick={() => localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')} 
                style={{ color: 'var(--color-primary)' }}
              >
                Explore the demo
              </Link>{' '}
              first.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
