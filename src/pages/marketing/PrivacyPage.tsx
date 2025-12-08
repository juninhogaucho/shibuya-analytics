import { Section } from '../../components/ui/Section'

export function PrivacyPage() {
  return (
    <Section
      eyebrow="Legal"
      title="Privacy Policy"
      description="Last updated: December 2025"
    >
      <div className="legal-content glass-panel">
        <h3>1. What We Collect</h3>
        <p>
          We collect the following information when you use our service:
        </p>
        <ul>
          <li><strong>Contact information:</strong> Email address and name for communication and report delivery</li>
          <li><strong>Payment information:</strong> Processed securely by Stripe (we never see your card details)</li>
          <li><strong>Trade data:</strong> The CSV or trade history you provide for analysis</li>
        </ul>

        <h3>2. How We Use Your Data</h3>
        <p>
          Your data is used exclusively for:
        </p>
        <ul>
          <li>Generating your personalized trading analysis report</li>
          <li>Communicating with you about your order</li>
          <li>Scheduling and conducting video calls (Deep Dive package)</li>
        </ul>

        <h3>3. Data Storage</h3>
        <p>
          All data is stored on EU-based servers. Your trade data is encrypted at rest and in transit. 
          We retain your data for 90 days after report delivery, then permanently delete it unless 
          you request earlier deletion.
        </p>

        <h3>4. Data Sharing</h3>
        <p>
          We do not sell, share, or transfer your data to third parties, except:
        </p>
        <ul>
          <li><strong>Stripe:</strong> For payment processing</li>
          <li><strong>Email providers:</strong> For transactional emails only</li>
        </ul>

        <h3>5. Your Rights</h3>
        <p>
          Under GDPR, you have the right to:
        </p>
        <ul>
          <li>Access your data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing</li>
          <li>Data portability</li>
        </ul>

        <h3>6. Cookies</h3>
        <p>
          We use essential cookies only for site functionality. 
          We do not use tracking cookies or third-party analytics.
        </p>

        <h3>7. Contact</h3>
        <p>
          For privacy-related inquiries or to exercise your rights, contact us at support@shibuya-analytics.com
        </p>
      </div>
    </Section>
  )
}
