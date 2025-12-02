import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="glass-panel">
        <p className="badge">404</p>
        <h2>We could not find that flow.</h2>
        <p className="text-muted">Maybe you tried to access a prop-firm page from the analytics app. Head back to safety.</p>
        <Link className="btn btn-secondary" to="/">
          Take me home
        </Link>
      </div>
    </section>
  )
}
