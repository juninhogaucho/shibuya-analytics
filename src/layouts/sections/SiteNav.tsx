import { Link } from 'react-router-dom'

export function SiteNav() {
  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link to="/" className="site-logo">
          <span className="site-logo__symbol">Δ</span>
          <span>SHIBUYA</span>
        </Link>
        <nav>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/enterprise" className="nav-link">Enterprise</Link>
        </nav>
        <div className="site-nav__cta">
          <Link to="/pricing" className="btn btn-primary">
            Get Your Report
          </Link>
        </div>
      </div>
    </header>
  )
}
