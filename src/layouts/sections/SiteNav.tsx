import { Link, useNavigate } from 'react-router-dom'

export function SiteNav() {
  const navigate = useNavigate()
  
  const handleTryDemo = () => {
    localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')
    navigate('/dashboard')
  }

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link to="/" className="site-logo">
          <span className="site-logo__symbol">Δ</span>
          <span>SHIBUYA</span>
        </Link>
        <nav>
          <Link to="/#pricing" className="nav-link">Pricing</Link>
          <Link to="/activate" className="nav-link">Login</Link>
        </nav>
        <div className="site-nav__cta">
          <button className="btn btn-demo" onClick={handleTryDemo}>
            Try Demo
          </button>
        </div>
      </div>
    </header>
  )
}
