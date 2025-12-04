import { Section } from '../../components/ui/Section'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export function EnterprisePage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    traders: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to backend
    console.log('Enterprise inquiry:', formData)
    setSubmitted(true)
  }

  return (
    <div className="enterprise-page">
      <Section
        eyebrow="For Prop Firms & Institutions"
        title="White-Label Behavioral Analytics"
        description="License the same Medallion Analytics engine that powers Shibuya for your own funded traders. Know which traders will blow before they blow."
      >
        {/* Key Benefits - Condensed */}
        <div className="enterprise-benefits">
          <div className="benefit-card">
            <span className="benefit-icon">🧠</span>
            <h3>BQL Monitoring</h3>
            <p>Real-time psychological state tracking for your entire funded population.</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">💎</span>
            <h3>Edge Detection</h3>
            <p>Identify traders with quantifiable edges. Find your A-Book candidates.</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">📊</span>
            <h3>Full API Access</h3>
            <p>RESTful endpoints, webhooks, and SDKs for seamless integration.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="enterprise-contact glass-panel">
          {submitted ? (
            <div className="contact-success">
              <span className="success-icon">✅</span>
              <h3>Thank you for your interest!</h3>
              <p>We'll reach out within 24 hours to schedule a demo.</p>
              <Link to="/" className="btn btn-primary">
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <h2>Request a Demo</h2>
              <p className="text-muted">Tell us about your prop firm and we'll show you exactly how Shibuya can help.</p>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <label>
                    Your Name
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@propfirm.com"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Company Name
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Prop Firm"
                    />
                  </label>
                  <label>
                    Active Traders
                    <select
                      required
                      value={formData.traders}
                      onChange={(e) => setFormData({ ...formData, traders: e.target.value })}
                    >
                      <option value="">Select range...</option>
                      <option value="1-100">1-100</option>
                      <option value="100-500">100-500</option>
                      <option value="500-2000">500-2,000</option>
                      <option value="2000+">2,000+</option>
                    </select>
                  </label>
                </div>
                <label>
                  Tell us about your needs (optional)
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="What challenges are you facing with trader behavior and risk management?"
                    rows={4}
                  />
                </label>
                <button type="submit" className="btn btn-primary btn-lg">
                  Request Demo →
                </button>
              </form>
            </>
          )}
        </div>

        {/* Simple footer */}
        <p className="enterprise-footer text-muted">
          Questions? Email us at <a href="mailto:enterprise@shibuyaanalytics.com">enterprise@shibuyaanalytics.com</a>
        </p>
      </Section>
    </div>
  )
}
