import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Enterprise', to: '/enterprise' },
]

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="badge">Quant-Level Trading Analysis</p>
          <h3>We quantify your edge and your emotions.</h3>
          <p className="text-muted">
            Shibuya ingests every trade, eliminates luck, exposes behavior, and prescribes the exact fix.
          </p>
        </div>
        <div>
          <p className="footer-heading">Navigate</p>
          <div className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="footer-heading">Legal</p>
          <div className="footer-links">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
            EU data residency • All sales final
          </p>
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} Shibuya Analytics</span>
      </div>
    </footer>
  )
}
