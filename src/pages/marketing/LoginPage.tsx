import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { login, verifyActivation } from '../../lib/api'
import { addMarketToPath, getMarketHomePath, persistMarket, resolveMarket } from '../../lib/market'
import { enterSampleMode } from '../../lib/runtime'
import { readRecentOrderAccess } from '../../lib/recentAccess'

type LoginMode = 'login' | 'activate'

export function LoginPage() {
  const recentAccess = readRecentOrderAccess()
  const [mode, setMode] = useState<LoginMode>('login')
  const [email, setEmail] = useState(recentAccess?.email ?? '')
  const [password, setPassword] = useState('')
  const [orderCode, setOrderCode] = useState(recentAccess?.orderCode ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const searchParams = new URLSearchParams(location.search)
  const sessionExpired = searchParams.get('session') === 'expired'
  const resetSuccess = searchParams.get('reset') === 'success'
  const navigate = useNavigate()

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await login({ email, password })
      
      if (response.success && response.api_key) {
        navigate(addMarketToPath('/dashboard', market), { replace: true })
      } else {
        setError(response.error || 'Invalid email or password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleActivation = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await verifyActivation({ email, orderCode })
      
      if (response.status === 'ready' && response.activationToken) {
        navigate(addMarketToPath(response.passwordRequired ? '/claim-account' : '/dashboard', response.market ?? market), { replace: true })
      } else if (response.status === 'pending') {
        setError('Your payment is still processing. Please check your email for confirmation.')
      } else {
        setError(response.message || 'Activation failed. Please check your order code.')
      }
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
    <section className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={getMarketHomePath(market)} className="inline-flex items-center gap-2">
            <img src="/shibuya-logo.svg" alt="Shibuya" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-[var(--color-text)]">SHIBUYA</span>
          </Link>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Access your live workspace, or finish first-time setup after payment
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-[var(--color-surface)] rounded-lg">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('activate')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'activate'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            First Time? Activate
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-lg">
          {sessionExpired && !error && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
              Your session expired. Sign in again to continue the live workspace.
            </div>
          )}

          {resetSuccess && !error && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
              Password updated. Sign in with the new password.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="trader@example.com"
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                <div className="mt-2 text-right">
                  <Link to={addMarketToPath('/forgot-password', market)} className="text-xs text-[var(--color-primary)] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleActivation} className="space-y-4">
              <div className="text-sm text-[var(--color-text-muted)] mb-4">
                <p>Just purchased? Enter your email and order code from your confirmation email. If this is your first live access, you will create your return password next.</p>
                {recentAccess?.email && recentAccess?.orderCode ? (
                  <p className="mt-2">We already filled the last purchase we saw on this browser so you can keep moving.</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="act-email" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Email
                </label>
                <input
                  id="act-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="trader@example.com"
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="orderCode" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Order Code
                </label>
                <input
                  id="orderCode"
                  type="text"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  required
                  placeholder="ord_abc123..."
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Activating...' : 'Activate Account'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-muted)]">or</span>
            </div>
          </div>

          {/* Sample workspace */}
          <button
            type="button"
            onClick={handleSampleWorkspace}
            className="w-full py-3 px-4 border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-bg)] transition-colors"
          >
            Explore Sample Workspace
          </button>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            <p>
              Don't have an account?{' '}
              <Link to={addMarketToPath('/pricing', market)} className="text-[var(--color-primary)] hover:underline">
                Get started
              </Link>
            </p>
            <p className="mt-2">
              First live unlock still missing?{' '}
              <Link to={addMarketToPath('/activate', market)} className="text-[var(--color-primary)] hover:underline">
                Activate with your order code
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
