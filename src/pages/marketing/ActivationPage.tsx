import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logTraderLifecycleEvent, verifyActivation } from '../../lib/api'
import { addMarketToPath, getPlanByPlanId, persistMarket, resolveMarket } from '../../lib/market'
import { enterSampleMode, setLiveApiKey } from '../../lib/runtime'
import { readRecentOrderAccess } from '../../lib/recentAccess'

export function ActivationPage() {
  const recentAccess = readRecentOrderAccess()
  const recentPlan = getPlanByPlanId(recentAccess?.planId)
  const [email, setEmail] = useState(recentAccess?.email ?? '')
  const [orderCode, setOrderCode] = useState(recentAccess?.orderCode ?? '')
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setStatusMessage(null)

    try {
      const response = await verifyActivation({ email, orderCode })

      if (response.status === 'ready' && response.activationToken) {
        // Store the activation token BEFORE redirect so AuthGuard recognises the session.
        setLiveApiKey(response.activationToken, {
          customerId: response.customerId ?? undefined,
          tier: response.tier ?? undefined,
          planId: response.planId ?? undefined,
          market: (response.market as 'global' | 'india') ?? market,
          offerKind: response.offerKind ?? undefined,
          caseStatus: response.caseStatus ?? undefined,
          accessExpiresAt: response.accessExpiresAt ?? undefined,
          dataSource: response.dataSource ?? undefined,
          orderId: orderCode,
        })

        await logTraderLifecycleEvent({
          event_name: 'workspace_activated',
          market: response.market ?? market,
          tier: response.tier,
          metadata: {
            orderCode,
            passwordRequired: response.passwordRequired ?? false,
          },
        }).catch(() => undefined)

        setStatusMessage(
          response.passwordRequired
            ? 'Activation successful. Redirecting you to create a return-access password.'
            : 'Activation successful. Redirecting to your trader workspace.',
        )
        navigate(addMarketToPath(response.passwordRequired ? '/claim-account' : '/dashboard', response.market ?? market), { replace: true })
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
    persistMarket(market)
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
            <span className="terminal-cmd">./activate_trader_workspace --live-loop</span>
          </div>

          <div className="terminal-output">
            <p className="text-green-400">Live trader workspace: AVAILABLE</p>
            <p className="text-green-400">Sample workspace: AVAILABLE</p>
            <p>Shibuya Analytics trader runtime</p>
            <p className="terminal-muted">
              Use the exact email and order code from payment to unlock the live workspace.
              On your first live activation, you will also create the password you use for return access.
            </p>
            {recentAccess?.email && recentAccess?.orderCode ? (
              <p className="terminal-muted">
                Last checkout detected for {recentAccess.email}. The form is already filled so you can keep moving.
              </p>
            ) : null}
            {recentPlan?.guidedReviewIncluded ? (
              <p className="terminal-muted">
                This offer includes a guided review checkpoint after your first meaningful upload. Activation is step one, not the finish line.
              </p>
            ) : null}
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
              Enter the exact email and order code tied to your purchase. This is what turns evaluation into a persistent live workspace.
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
              {isSubmitting ? 'ACTIVATING...' : 'UNLOCK LIVE WORKSPACE'}
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
            Sample is for evaluation. Live is where uploads, history, alerts, next-session mandates, and your return access persist.
          </p>

          <div className="terminal-footer">
            <p className="terminal-muted">
              Already activated? <Link to={addMarketToPath('/login', market)} className="terminal-link">Sign in</Link>
            </p>
            <p className="terminal-muted">
              Need access first? <Link to={addMarketToPath('/pricing', market)} className="terminal-link">Choose your starting point</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
