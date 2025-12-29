import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { WelcomeModal } from '../components/ui/WelcomeModal'

const NAV_ITEMS = [
  { label: '📊 Overview', to: '/dashboard' },
  { label: '📜 Trade History', to: '/dashboard/history' },
  { label: '🔔 Alerts', to: '/dashboard/alerts' },
  { label: '🩹 Slump Rx', to: '/dashboard/slump' },
  { label: '💎 Edge Portfolio', to: '/dashboard/edges' },
  { label: '🥊 Shadow Boxing', to: '/dashboard/shadow-boxing' },
  { label: '📤 Upload Trades', to: '/dashboard/upload' },
]

export function DashboardLayout() {
  // Lazy initialization - check demo mode only once
  const [isDemoMode] = useState(() => {
    const key = localStorage.getItem('shibuya_api_key')
    return key === 'shibuya_demo_mode'
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Mobile menu state derived from location - resets on every navigation
  const [mobileMenuOpenFor, setMobileMenuOpenFor] = useState<string | null>(null)
  const isMobileMenuOpen = mobileMenuOpenFor === location.key
  const setIsMobileMenuOpen = (open: boolean) => {
    setMobileMenuOpenFor(open ? location.key : null)
  }

  const handleSignOut = () => {
    localStorage.removeItem('shibuya_api_key')
    navigate('/')
  }

  const handleUpgrade = () => {
    localStorage.removeItem('shibuya_api_key')
    navigate('/pricing')
  }

  return (
    <div className="dashboard-layout">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal />
      
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <span className="brand-text">Shibuya</span>
          <span className="brand-badge">BETA</span>
        </div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span>Shibuya</span>
          <span className="brand-badge">BETA</span>
        </div>
        
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="demo-mode-banner">
            <div className="demo-badge">▶ DEMO MODE</div>
            <p className="demo-hint">Viewing sample trader data</p>
          </div>
        )}
        
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
              end={item.to === '/dashboard'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleSignOut}
          >
            {isDemoMode ? 'Exit Demo' : 'Sign Out'}
          </button>
        </div>
      </aside>
      
      <section className="dashboard-content" id="main-content">
        {isDemoMode && (
          <div className="demo-top-banner" role="status">
            <div className="demo-top-banner__text">
              <span className="disclaimer-icon">🚧</span>
              <div>
                <strong>Demo Data</strong>
                <p>This is sample data so you can see the experience. Your real report will be built from your own trades.</p>
              </div>
            </div>
            <button 
              className="disclaimer-cta"
              onClick={handleUpgrade}
            >
              Get Your Report →
            </button>
          </div>
        )}
        <Outlet context={{ isDemoMode }} />
      </section>
    </div>
  )
}
