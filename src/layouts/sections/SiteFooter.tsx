import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Enterprise', to: '/enterprise' },
  { label: 'Activate', to: '/activate' },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <p className="badge">Determined Quant Stack</p>
          <h3>We quantify your edge and your emotions.</h3>
          <p className="text-muted">
            Manual entry is for clerks. Shibuya ingests every trade, eliminates luck, exposes
            behavior, and prescribes the exact fix.
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
          <p className="footer-heading">Compliance</p>
          <p className="text-muted">EU data residency • 30-day money-back guarantee • Human coaching</p>
        </div>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} Shibuya Analytics</span>
        <span>Backed by the Medallion engine</span>
      </div>
    </footer>
  )
}
