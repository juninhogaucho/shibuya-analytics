import { type FormEvent, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useActivation } from '../../features/activation/useActivation'
import { isAuthenticated } from '../../lib/api'

export function ActivationPage() {
  const [email, setEmail] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [shake, setShake] = useState(false)
  const mutation = useActivation()
  const navigate = useNavigate()

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Redirect to dashboard after successful activation with token
  useEffect(() => {
    if (mutation.data?.activationToken) {
      navigate('/dashboard', { replace: true })
    }
  }, [mutation.data?.activationToken, navigate])

  // Shake animation on error
  useEffect(() => {
    if (mutation.isError) {
      setShake(true)
      const timeout = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [mutation.isError])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate({ email, orderCode })
  }

  const handleDemo = () => {
    // Set demo token and navigate
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard', { replace: true })
  }

  return (
    <section className="activation-terminal">
      <div className="terminal-container">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="terminal-title">shibuya_activation.sh</span>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body">
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <span className="terminal-cmd">./shibuya --activate</span>
          </div>
          
          <div className="terminal-output">
            <p>Margin of Safety Analytics v2.0</p>
            <p className="terminal-muted">Enter your purchase credentials to unlock the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className={`terminal-form ${shake ? 'shake' : ''}`}>
            <div className="terminal-field">
              <label>
                <span className="field-label">EMAIL</span>
                <div className="field-input-wrapper">
                  <span className="field-prefix">→</span>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="steve@edge.com"
                    className={mutation.isError ? 'input-error' : ''}
                  />
                </div>
              </label>
            </div>

            <div className="terminal-field">
              <label>
                <span className="field-label">ORDER CODE</span>
                <div className="field-input-wrapper">
                  <span className="field-prefix">→</span>
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    required
                    placeholder="SH2025-00137"
                    className={mutation.isError ? 'input-error' : ''}
                  />
                </div>
              </label>
            </div>

            <button className="terminal-btn terminal-btn-primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <span className="spinner"></span>
                  VERIFYING...
                </>
              ) : (
                '→ ACTIVATE'
              )}
            </button>

            {/* Status Messages */}
            {mutation.data && !mutation.data.activationToken && (
              <div className="terminal-status terminal-status-success">
                <span className="status-icon">✓</span>
                <div>
                  <p>{mutation.data.message}</p>
                  {mutation.data.nextStep === 'baseline' && <p className="terminal-muted">Check your inbox for the baseline upload link.</p>}
                  {mutation.data.nextStep === 'dashboard' && <p className="terminal-muted">Magic link sent. Check your email.</p>}
                </div>
              </div>
            )}

            {mutation.isError && (
              <div className="terminal-status terminal-status-error">
                <span className="status-icon">✗</span>
                <div>
                  <p>Authentication failed</p>
                  <p className="terminal-muted">Double-check your email and order code.</p>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="terminal-divider">
            <span>OR</span>
          </div>

          {/* Demo Mode */}
          <button onClick={handleDemo} className="terminal-btn terminal-btn-ghost">
            <span className="demo-icon">▶</span>
            DEMO MODE
          </button>

          <p className="terminal-hint">
            Explore the dashboard with sample data. No account required.
          </p>

          {/* No account yet? */}
          <div className="terminal-footer">
            <p className="terminal-muted">
              Don't have an account? <Link to="/pricing" className="terminal-link">View pricing →</Link>
            </p>
            <p className="terminal-muted" style={{ marginTop: '0.5rem' }}>
              Lost your key? <a href="mailto:support@shibuya.inc?subject=Lost%20Key%20Recovery" className="terminal-link">Recover access</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
