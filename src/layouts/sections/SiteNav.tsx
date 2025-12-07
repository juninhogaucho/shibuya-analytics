import { Link, useLocation, useNavigate } from 'react-router-dom'

export function SiteNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/#pricing')
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById('pricing')
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const element = document.getElementById('pricing')
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link to="/" className="site-logo">
          <span className="site-logo__symbol">Δ</span>
          <span>SHIBUYA</span>
        </Link>
        <nav>
          <Link to="/solutions" className="nav-link">Solutions</Link>
          <a href="#pricing" onClick={handlePricingClick} className="nav-link">Pricing</a>
          <Link to="/dashboard" className="nav-link" onClick={() => localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')}>
            Demo
          </Link>
        </nav>
        <div className="site-nav__cta">
          <a href="#pricing" onClick={handlePricingClick} className="btn btn-primary">
            Get Your Report
          </a>
        </div>
      </div>
    </header>
  )
}

