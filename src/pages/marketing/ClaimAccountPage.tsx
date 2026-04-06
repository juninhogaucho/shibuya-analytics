import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { bootstrapPassword, isAuthenticated, logTraderLifecycleEvent } from '../../lib/api'
import { addMarketToPath, resolveMarket } from '../../lib/market'

export default function ClaimAccountPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const navigate = useNavigate()

  if (!isAuthenticated()) {
    return <Navigate to={addMarketToPath('/activate', market)} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await bootstrapPassword(password)
      if (!response.success) {
        setError(response.error || 'Could not save your password. Please try again.')
        return
      }

      setSuccessMessage(response.message || 'Password saved. Redirecting to your setup flow.')
      await logTraderLifecycleEvent({
        event_name: 'claim_password_completed',
        market,
      })
      navigate(addMarketToPath('/dashboard/onboarding', market), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-12 px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Finish Setup</p>
          <h1 className="mt-3 text-2xl font-bold text-[var(--color-text)]">Create your return password</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Your live workspace is unlocked. Set the password you will use the next time you sign in.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Choose a strong password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving password...' : 'Save Password and Enter Workspace'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          Prefer to do this later?{' '}
          <Link to={addMarketToPath('/dashboard', market)} className="text-[var(--color-primary)] hover:underline">
            Enter the workspace now
          </Link>
        </p>
      </div>
    </section>
  )
}
