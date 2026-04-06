import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="glass-panel">
        <p className="badge">404</p>
        <h2>We could not find that flow.</h2>
        <p className="text-muted">That route does not exist on the direct-trader surface. Head back to the live or sample workspace entry points.</p>
        <Link className="btn btn-secondary" to="/">
          Take me home
        </Link>
      </div>
    </section>
  )
}
