import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { forgotPassword } from '../../lib/api'
import { addMarketToPath, getMarketHomePath, resolveMarket } from '../../lib/market'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await forgotPassword(email.trim())
      setMessage(response.message || 'If an account exists for this email, a reset link is on the way.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset right now.')
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
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Account Recovery</p>
          <h1 className="mt-3 text-2xl font-bold text-[var(--color-text)]">Reset your return-access password</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Enter the email tied to your workspace. If the account exists, we will send a reset link shortly.
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
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="trader@example.com"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>
            Remembered it?{' '}
            <Link to={addMarketToPath('/login', market)} className="text-[var(--color-primary)] hover:underline">
              Back to sign in
            </Link>
          </p>
          <p className="mt-2">
            First purchase not activated yet?{' '}
            <Link to={addMarketToPath('/activate', market)} className="text-[var(--color-primary)] hover:underline">
              Activate workspace
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
