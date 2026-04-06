import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../lib/api'
import { addMarketToPath, getMarketHomePath, resolveMarket } from '../../lib/market'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const navigate = useNavigate()
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Reset link is missing or invalid. Request a new password reset email.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const response = await resetPassword(token, password)
      if (!response.success) {
        setError(response.error || response.message || 'Could not reset password.')
        return
      }

      const successMessage = response.message || 'Password reset complete. Redirecting to sign in.'
      setMessage(successMessage)
      window.setTimeout(() => {
        navigate(addMarketToPath('/login?reset=success', market), { replace: true })
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] py-12 px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
        <div className="mb-6 text-center">
          <Link to={getMarketHomePath(market)} className="inline-flex items-center gap-2">
            <img src="/shibuya-logo.svg" alt="Shibuya" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-[var(--color-text)]">SHIBUYA</span>
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Return Access</p>
          <h1 className="mt-3 text-2xl font-bold text-[var(--color-text)]">Choose a new password</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Reset the password you use to return to your live workspace.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Choose a strong password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Saving password...' : 'Save new password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>
            Need a fresh link?{' '}
            <Link to={addMarketToPath('/forgot-password', market)} className="text-[var(--color-primary)] hover:underline">
              Request another reset email
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
