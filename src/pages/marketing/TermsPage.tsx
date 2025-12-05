import { Section } from '../../components/ui/Section'

export function TermsPage() {
  return (
    <Section
      eyebrow="Legal"
      title="Terms & Conditions"
      description="Last updated: December 2024"
    >
      <div className="legal-content glass-panel">
        <h3>1. Service Description</h3>
        <p>
          Shibuya Analytics provides trading performance analysis reports based on trade data 
          you provide. We analyze your trading history to identify behavioral patterns, 
          calculate discipline-related costs, and provide actionable recommendations.
        </p>

        <h3>2. Payment Terms</h3>
        <p>
          All purchases are one-time payments processed securely through Stripe. 
          Prices are displayed in Euros (EUR). Payment is required before report delivery.
        </p>

        <h3>3. Refund Policy</h3>
        <p>
          <strong>All sales are final.</strong> Due to the nature of our service (personalized 
          analysis and reports), we do not offer refunds once work has begun on your report. 
          Please ensure you understand what you're purchasing before completing payment.
        </p>

        <h3>4. Delivery</h3>
        <p>
          Reports are delivered within 72 hours of receiving your complete trade data. 
          For The Deep Dive package, video calls are scheduled at mutually convenient times 
          within 14 days of purchase.
        </p>

        <h3>5. Data Usage</h3>
        <p>
          Your trade data is used solely for generating your personalized report. 
          We do not share, sell, or use your data for any other purpose. 
          See our Privacy Policy for details.
        </p>

        <h3>6. Disclaimer</h3>
        <p>
          Shibuya Analytics provides educational analysis only. We are not financial advisors. 
          Our reports and recommendations do not constitute investment advice. 
          Trading involves significant risk of loss. Past performance does not guarantee future results.
        </p>

        <h3>7. Intellectual Property</h3>
        <p>
          Reports generated for you are for your personal use only. 
          You may not redistribute, resell, or publish our reports without written permission.
        </p>

        <h3>8. Contact</h3>
        <p>
          For questions about these terms, contact us at support@shibuya-analytics.com
        </p>
      </div>
    </Section>
  )
}
