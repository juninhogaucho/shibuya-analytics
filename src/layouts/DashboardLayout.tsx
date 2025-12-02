import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '../components/ui/ThemeToggle'

const NAV_ITEMS = [
  { label: '📊 Overview', to: '/dashboard' },
  { label: '📥 Append Trades', to: '/dashboard/append' },
  { label: '🔔 Alerts & Coach', to: '/dashboard/alerts' },
  { label: '🩹 Slump Prescription', to: '/dashboard/slump' },
  { label: '💎 Edge Portfolio', to: '/dashboard/edges' },
  { label: '🥊 Shadow Boxing', to: '/dashboard/shadow-boxing' },
]

// SuperAdmin secret key - change this in production
const SUPER_ADMIN_KEY = 'shibuya_super_admin_2025'

export function DashboardLayout() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [viewMode, setViewMode] = useState<'admin' | 'trader'>('trader')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check for superadmin and demo mode on mount
  useEffect(() => {
    const key = localStorage.getItem('shibuya_api_key')
    if (key === SUPER_ADMIN_KEY) {
      setIsSuperAdmin(true)
    }
    if (key === 'shibuya_demo_mode') {
      setIsDemoMode(true)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

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
          <span>Shibuya Dashboard</span>
          <p className="text-muted">Powered by Medallion Engine</p>
          <div style={{ marginTop: '0.75rem' }}>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="demo-mode-banner">
            <div className="demo-badge">▶ DEMO MODE</div>
            <p className="demo-hint">Exploring with sample data</p>
            <button className="btn btn-primary btn-sm" onClick={handleUpgrade}>
              Upgrade to Full Access
            </button>
          </div>
        )}
        
        {/* SuperAdmin Mode Indicator & Toggle */}
        {isSuperAdmin && (
          <div className="superadmin-toggle">
            <div className="superadmin-badge">👑 SUPER ADMIN</div>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'admin' ? 'active' : ''}`}
                onClick={() => setViewMode('admin')}
              >
                Admin View
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'trader' ? 'active' : ''}`}
                onClick={() => setViewMode('trader')}
              >
                Trader View
              </button>
            </div>
            <p className="toggle-hint">
              {viewMode === 'trader' 
                ? '👤 Seeing what traders see' 
                : '🔧 Admin controls visible'}
            </p>
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
          
          {/* Admin-only navigation items */}
          {isSuperAdmin && viewMode === 'admin' && (
            <>
              <div className="sidebar-divider" />
              <span className="sidebar-section">Admin Tools</span>
              <NavLink to="/dashboard/admin/users" className="sidebar-link">
                👥 All Users
              </NavLink>
              <NavLink to="/dashboard/admin/reports" className="sidebar-link">
                📑 Report Queue
              </NavLink>
              <NavLink to="/dashboard/admin/metrics" className="sidebar-link">
                📈 Platform Metrics
              </NavLink>
            </>
          )}
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
        {/* Admin banner when in admin mode */}
        {isSuperAdmin && viewMode === 'admin' && (
          <div className="admin-banner">
            ⚙️ Admin Mode Active — You're seeing the full system view
          </div>
        )}
        {/* Demo mode banner in content */}
        {isDemoMode && (
          <div className="demo-content-banner">
            <span>🎮 You're viewing sample data</span>
            <button onClick={handleUpgrade}>Get your personalized dashboard →</button>
          </div>
        )}
        <Outlet context={{ isSuperAdmin, viewMode, isDemoMode }} />
      </section>
    </div>
  )
}
