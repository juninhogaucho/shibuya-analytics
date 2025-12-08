import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

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
    <header className="site-nav sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="site-nav__inner container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="site-logo flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="site-logo__symbol text-[var(--color-primary)]">Δ</span>
          <span className="text-[var(--color-text)]">SHIBUYA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/solutions" className="nav-link text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Solutions</Link>
          <a href="#pricing" onClick={handlePricingClick} className="nav-link text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Pricing</a>
          <Link to="/dashboard" className="nav-link text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors" onClick={() => localStorage.setItem('shibuya_api_key', 'shibuya_demo_mode')}>
            Demo
          </Link>
        </nav>
        <div className="site-nav__cta flex items-center gap-4">
          <ThemeToggle />
          <a href="#pricing" onClick={handlePricingClick} className="btn btn-primary bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Get Your Report
          </a>
        </div>
      </div>
    </header>
  )
}

