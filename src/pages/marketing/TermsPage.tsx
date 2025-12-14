import { Section } from '../../components/ui/Section'

export function TermsPage() {
  return (
    <Section
      eyebrow="Legal"
      title="Terms & Conditions"
      description="Last updated: December 2025"
    >
      <div className="legal-content glass-panel">
        <h3>1. Service Description</h3>
        <p>
          Shibuya Analytics provides trading performance analysis reports and dashboard subscriptions 
          based on trade data you provide. We analyze your trading history to identify behavioral patterns, 
          calculate discipline-related costs, and provide actionable recommendations.
        </p>

        <h3>2. Payment Terms</h3>
        <p>
          <strong>One-time Reports:</strong> All report purchases are one-time payments processed securely through Stripe. 
          Prices are displayed in Euros (EUR). Payment is required before report delivery.
        </p>
        <p>
          <strong>Dashboard Subscription:</strong> The Dashboard is billed monthly at €250/month. 
          You may cancel at any time; access continues until the end of your billing period.
        </p>

        <h3>3. Refund Policy</h3>
        <p>
          <strong>Reports:</strong> All sales are final. Due to the nature of our service (personalized 
          analysis and reports), we do not offer refunds once work has begun on your report. 
          Please ensure you understand what you're purchasing before completing payment.
        </p>
        <p>
          <strong>Dashboard:</strong> No refunds for partial months. Cancel anytime; you retain access until billing period ends.
        </p>

        <h3>4. Delivery</h3>
        <p>
          Reports are delivered within 72 hours of receiving your complete trade data. 
          For The Deep Dive package, video calls are scheduled at mutually convenient times 
          within 14 days of purchase. Dashboard access is activated immediately upon payment confirmation.
        </p>

        <h3>5. Referral Program</h3>
        <p>
          Referral codes are provided after purchase. When friends purchase using your code:
        </p>
        <ul>
          <li>2 referrals: Upgrade to Deep Dive (Reality Check buyers) or 2-for-1 months (Deep Dive buyers)</li>
          <li>3 referrals: Full refund or free months applied</li>
        </ul>
        <p>
          Referral rewards are applied automatically and cannot be combined with other promotions.
        </p>

        <h3>6. Promo Codes</h3>
        <p>
          Promo codes may provide extended dashboard access or other benefits. 
          Codes cannot be combined. One code per purchase. 
          We reserve the right to void codes obtained through fraud or abuse.
        </p>

        <h3>7. Data Usage</h3>
        <p>
          Your trade data is used solely for generating your personalized report or powering your Dashboard. 
          We do not share, sell, or use your data for any other purpose. 
          See our Privacy Policy for details.
        </p>

        <h3>8. Disclaimer</h3>
        <p>
          Shibuya Analytics provides educational analysis only. We are not financial advisors. 
          Our reports and recommendations do not constitute investment advice. 
          Trading involves significant risk of loss. Past performance does not guarantee future results.
        </p>

        <h3>9. Intellectual Property</h3>
        <p>
          Reports generated for you are for your personal use only. 
          You may not redistribute, resell, or publish our reports without written permission.
        </p>

        <h3>10. Contact</h3>
        <p>
          For questions about these terms, contact us at support@shibuya-analytics.com
        </p>
      </div>
    </Section>
  )
}
