import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { verifyActivation } from '../../lib/api'
import { enterSampleMode } from '../../lib/runtime'

export function ActivationPage() {
  const [email, setEmail] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setStatusMessage(null)

    try {
      const response = await verifyActivation({ email, orderCode })

      if (response.status === 'ready' && response.activationToken) {
        setStatusMessage('Activation successful. Redirecting to your trader workspace.')
        navigate('/dashboard', { replace: true })
        return
      }

      if (response.status === 'pending') {
        setStatusMessage('Your payment is still processing. Check your confirmation email and try again in a few minutes.')
        return
      }

      setError(response.message || 'Activation failed. Please verify your order code and email.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSampleWorkspace = () => {
    enterSampleMode()
    navigate('/dashboard', { replace: true })
  }

  return (
    <section className="activation-terminal">
      <div className="terminal-background-grid"></div>
      <div className="terminal-container glass-panel">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="terminal-title">shibuya_activate.sh - bash - 80x24</span>
        </div>

        <div className="terminal-body">
          <div className="terminal-line">
            <span className="terminal-prompt">root@shibuya:~$</span>
            <span className="terminal-cmd">./activate_trader_workspace --live</span>
          </div>

          <div className="terminal-output">
            <p className="text-green-400">Live trader account activation: AVAILABLE</p>
            <p className="text-green-400">Sample workspace: AVAILABLE</p>
            <p>Shibuya Analytics trader runtime</p>
            <p className="terminal-muted">
              Use the email and order code from your confirmation email to unlock your live trader account.
              If you are still evaluating the product, open the sample workspace instead.
            </p>
          </div>

          {statusMessage && (
            <div className="terminal-success-block">
              <div className="terminal-status terminal-status-success">
                <span className="status-icon">OK</span>
                <div>
                  <p>ACTIVATION STATUS</p>
                  <p className="terminal-muted">{statusMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="terminal-status"
              style={{ borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.08)' }}
            >
              <span className="status-icon">ERR</span>
              <div>
                <p>ACTIVATION FAILED</p>
                <p className="terminal-muted">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="terminal-form">
            <p className="terminal-instruction">
              Enter the exact email and order code tied to your purchase or partner activation.
            </p>

            <div className="terminal-field">
              <label>
                <span className="field-label">EMAIL_ADDRESS</span>
                <div className="field-input-wrapper">
                  <span className="field-prefix">-&gt;</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="trader@example.com"
                  />
                </div>
              </label>
            </div>

            <div className="terminal-field">
              <label>
                <span className="field-label">ORDER_CODE</span>
                <div className="field-input-wrapper">
                  <span className="field-prefix">-&gt;</span>
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(event) => setOrderCode(event.target.value)}
                    required
                    placeholder="ord_abc123..."
                  />
                </div>
              </label>
            </div>

            <button className="terminal-btn terminal-btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'ACTIVATING...' : 'ACTIVATE LIVE ACCOUNT'}
            </button>
          </form>

          <div className="terminal-divider">
            <span>OR EXPLORE FIRST</span>
          </div>

          <button onClick={handleSampleWorkspace} className="terminal-btn terminal-btn-ghost">
            <span className="demo-icon">▶</span>
            OPEN SAMPLE WORKSPACE
          </button>

          <p className="terminal-hint">
            Sample workspace teaches the workflow. Live trader accounts persist uploads, history, alerts, and prescriptions.
          </p>

          <div className="terminal-footer">
            <p className="terminal-muted">
              Already activated? <Link to="/login" className="terminal-link">Sign in</Link>
            </p>
            <p className="terminal-muted">
              Need access first? <Link to="/pricing" className="terminal-link">Choose a plan</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
