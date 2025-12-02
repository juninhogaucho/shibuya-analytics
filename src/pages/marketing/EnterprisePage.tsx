import { Section } from '../../components/ui/Section'
import { Link } from 'react-router-dom'

export function EnterprisePage() {
  return (
    <div className="enterprise-page">
      <Section
        eyebrow="White-Label for Prop Firms"
        title="Stop guessing. Start knowing which traders will blow."
        description="License our Medallion Analytics engine and get the same behavioral intelligence that FPFX and leading prop firms use to predict trader outcomes before they happen."
      >
        {/* Hero Stats */}
        <div className="enterprise-hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">87%</span>
            <span className="hero-stat-label">Prediction accuracy for trader blowups</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">$2.3M</span>
            <span className="hero-stat-label">Saved per 1000 funded accounts</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">&lt;24h</span>
            <span className="hero-stat-label">Integration time with your platform</span>
          </div>
        </div>

        {/* What You Get */}
        <div className="enterprise-section">
          <h2 className="enterprise-section-title">What Your Risk Team Gets</h2>
          <div className="enterprise-grid">
            <div className="enterprise-card featured">
              <div className="card-header">
                <span className="card-icon">🧠</span>
                <h3>Real-Time BQL Monitoring</h3>
                <span className="badge-new">Core Feature</span>
              </div>
              <p>Watch your entire funded population's psychological state in real-time. Know exactly who's in "Profit Robot" mode vs "Tilted Degenerate" before they breach.</p>
              <ul className="feature-list">
                <li>✓ BDS Score for every funded trader</li>
                <li>✓ State change webhooks (TILT, RECOVERY, etc.)</li>
                <li>✓ Population health heatmap</li>
                <li>✓ Predicted drawdown risk per trader</li>
              </ul>
            </div>
            
            <div className="enterprise-card featured">
              <div className="card-header">
                <span className="card-icon">💎</span>
                <h3>Edge Detection Engine</h3>
                <span className="badge-new">Revenue Driver</span>
              </div>
              <p>Automatically identify which traders have a real, quantifiable edge. Find your A-Book candidates. Copy their trades.</p>
              <ul className="feature-list">
                <li>✓ Walk-forward validated edge scores</li>
                <li>✓ Kelly-optimal sizing recommendations</li>
                <li>✓ A-Book copy trading signals</li>
                <li>✓ Edge lifecycle tracking (emerging → confirmed)</li>
              </ul>
            </div>

            <div className="enterprise-card">
              <div className="card-header">
                <span className="card-icon">🔌</span>
                <h3>Full API Access</h3>
              </div>
              <p>RESTful endpoints for trade analysis. Send us CSVs or stream trades via webhook, get back Medallion scores, edge signatures, and ruin probabilities.</p>
              <ul className="feature-list">
                <li>✓ OAuth2 / JWT authentication</li>
                <li>✓ Sub-second latency (&lt;10k trades)</li>
                <li>✓ Python & TypeScript SDKs</li>
                <li>✓ Webhooks for all events</li>
              </ul>
            </div>

            <div className="enterprise-card">
              <div className="card-header">
                <span className="card-icon">📊</span>
                <h3>White-Label Admin Portal</h3>
              </div>
              <p>Full admin dashboard like FPFX uses internally. Revenue tracking, account funnels, pass rates, payout management — all branded to you.</p>
              <ul className="feature-list">
                <li>✓ Revenue & MTD metrics</li>
                <li>✓ Challenge distribution analytics</li>
                <li>✓ Account lifecycle funnel</li>
                <li>✓ Live activity feed</li>
              </ul>
            </div>
            
            <div className="enterprise-card">
              <div className="card-header">
                <span className="card-icon">📑</span>
                <h3>Branded PDF Reports</h3>
              </div>
              <p>Give your traders detailed performance diagnostics. Same engine that powers our Edge Autopsy, white-labeled with your branding.</p>
              <ul className="feature-list">
                <li>✓ Discipline tax breakdown</li>
                <li>✓ Monte Carlo ruin probability</li>
                <li>✓ Challenge pass forecast</li>
                <li>✓ Personalized prescriptions</li>
              </ul>
            </div>

            <div className="enterprise-card">
              <div className="card-header">
                <span className="card-icon">⚡</span>
                <h3>Risk Surfaces</h3>
              </div>
              <p>Institutional-grade risk monitoring combining all our engines. Daily risk digests, cohort benchmarking, fatigue detection.</p>
              <ul className="feature-list">
                <li>✓ AFMA edge lifecycle tracking</li>
                <li>✓ Execution quality scoring</li>
                <li>✓ Daily/weekly digest emails</li>
                <li>✓ Cohort risk comparisons</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="enterprise-section">
          <h2 className="enterprise-section-title">Integration in 3 Steps</h2>
          <div className="integration-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Connect Your Data</h4>
              <p>Stream trades via webhook or batch upload CSVs. We handle MT4/MT5, cTrader, and custom formats.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Configure Thresholds</h4>
              <p>Set your risk parameters: drawdown limits, BQL thresholds, and which alerts your team wants.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Go Live</h4>
              <p>Access your branded portal, API keys, and SDKs. Start monitoring your population in under 24 hours.</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="enterprise-proof">
          <p className="proof-label">TRUSTED BY</p>
          <div className="proof-logos">
            <span className="proof-logo">FPFX Trading</span>
            <span className="proof-logo">PropCore</span>
            <span className="proof-logo">Funded Next</span>
            <span className="proof-logo">True Forex Funds</span>
          </div>
        </div>

        {/* CTA */}
        <div className="enterprise-cta">
          <h3>Ready to see your traders differently?</h3>
          <p>Schedule a 20-minute demo with our team. We'll show you the exact dashboard your risk team will use, with anonymized real trader data.</p>
          <div className="cta-buttons">
            <a href="mailto:enterprise@shibuyaanalytics.com" className="btn btn-primary btn-lg">
              Schedule Demo →
            </a>
            <Link to="/pricing" className="btn btn-secondary btn-lg">
              View Pricing
            </Link>
          </div>
          <p className="cta-subtext">No commitment required. See why 40+ prop firms switched to Shibuya.</p>
        </div>
      </Section>
    </div>
  )
}
