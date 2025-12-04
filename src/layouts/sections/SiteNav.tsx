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
          <a href="/#pricing" className="nav-link">Pricing</a>
          <Link to="/dashboard" className="nav-link" onClick={() => localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')}>
            Demo
          </Link>
        </nav>
        <div className="site-nav__cta">
          <a href="/#pricing" className="btn btn-primary">
            Get Your Report
          </a>
        </div>
      </div>
    </header>
  )
}
