import { type FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function ActivationPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Try to send via API first
      const response = await fetch(`${import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8001'}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'activation_page',
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('API not available')
      }
    } catch {
      // Fallback: Send mailto notification
      const subject = encodeURIComponent('🚀 New Waitlist Signup')
      const body = encodeURIComponent(
        `NEW WAITLIST SIGNUP\n` +
        `==================\n\n` +
        `Email: ${email}\n` +
        `Source: Activation Page\n` +
        `Time: ${new Date().toISOString()}`
      )
      window.open(`mailto:support@shibuya-analytics.com?subject=${subject}&body=${body}`, '_blank')
    }
    
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleDemo = () => {
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard', { replace: true })
  }

  return (
    <section className="activation-terminal">
      <div className="terminal-background-grid"></div>
      <div className="terminal-container glass-panel">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="terminal-title">shibuya_waitlist.sh - bash - 80x24</span>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body">
          <div className="terminal-line">
            <span className="terminal-prompt">root@shibuya:~$</span>
            <span className="terminal-cmd">./check_status --dashboard</span>
          </div>
          
          <div className="terminal-output">
            <p className="text-yellow-400">⚠ Dashboard access: COMING SOON</p>
            <p className="text-green-400">✓ Report service: OPERATIONAL</p>
            <p>Shibuya Analytics v2.0 [Beta]</p>
            <p className="terminal-muted">The full dashboard is being built. Join the waitlist to get early access.</p>
          </div>

          {submitted ? (
            <div className="terminal-success-block">
              <div className="terminal-status terminal-status-success">
                <span className="status-icon">✓</span>
                <div>
                  <p>REGISTRATION COMPLETE</p>
                  <p className="terminal-muted">We'll email you when the dashboard launches.</p>
                </div>
              </div>
              
              <div className="terminal-divider">
                <span>MEANWHILE</span>
              </div>
              
              <p className="terminal-hint" style={{ marginBottom: '1rem' }}>
                Want to see what we're building? Explore the demo.
              </p>
              
              <button onClick={handleDemo} className="terminal-btn terminal-btn-primary">
                <span className="demo-icon">▶</span>
                EXPLORE DEMO DASHBOARD
              </button>
              
              <p className="terminal-hint" style={{ marginTop: '1rem' }}>
                Or <Link to="/pricing" className="terminal-link">get a personalized report</Link> now.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="terminal-form">
              <p className="terminal-instruction">
                Drop your email below. No spam, just one email when we launch.
              </p>
              
              <div className="terminal-field">
                <label>
                  <span className="field-label">EMAIL_ADDRESS</span>
                  <div className="field-input-wrapper">
                    <span className="field-prefix">→</span>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="trader@example.com"
                    />
                  </div>
                </label>
              </div>

              <button className="terminal-btn terminal-btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    PROCESSING...
                  </>
                ) : (
                  '→ JOIN WAITLIST'
                )}
              </button>
            </form>
          )}

          {!submitted && (
            <>
              {/* Divider */}
              <div className="terminal-divider">
                <span>OR EXPLORE NOW</span>
              </div>

              {/* Demo Mode */}
              <button onClick={handleDemo} className="terminal-btn terminal-btn-ghost">
                <span className="demo-icon">▶</span>
                RUN DEMO SIMULATION
              </button>

              <p className="terminal-hint">
                See the dashboard in action with sample trader data.
              </p>

              {/* Get a report now */}
              <div className="terminal-footer">
                <p className="terminal-muted">
                  Don't want to wait? <Link to="/pricing" className="terminal-link">Get a personalized report now →</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
