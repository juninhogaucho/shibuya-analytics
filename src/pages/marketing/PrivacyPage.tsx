import { Section } from '../../components/ui/Section'

export function PrivacyPage() {
  return (
    <Section
      eyebrow="Legal"
      title="Privacy Policy"
      description="Last updated: April 2026"
    >
      <div className="legal-content glass-panel">
        <h3>1. What We Collect</h3>
        <p>
          We collect the following information when you use our service:
        </p>
        <ul>
          <li><strong>Contact information:</strong> Email address and name for account, billing, and support communication</li>
          <li><strong>Payment information:</strong> Processed securely by Stripe; we do not store your full card details</li>
          <li><strong>Trade data:</strong> The exports, CSVs, and trade history you upload into the workspace</li>
          <li><strong>Profile context:</strong> Information such as capital band, monthly income band, trader focus, broker or platform, and instrument focus</li>
          <li><strong>Referral and campaign data:</strong> Affiliate codes, referral codes, and campaign parameters used for attribution</li>
        </ul>

        <h3>2. How We Use Your Data</h3>
        <p>
          Your data is used exclusively for:
        </p>
        <ul>
          <li>Activating and operating your Shibuya workspace</li>
          <li>Generating analytical outputs such as edge-vs-behavior splits, discipline tax, alerts, and next-session mandates</li>
          <li>Adapting the product to the context you provide during onboarding</li>
          <li>Communicating with you about billing, activation, support, and guided reviews where included</li>
          <li>Tracking referral rewards, affiliate commissions, and campaign performance</li>
        </ul>

        <h3>3. Workspace Data</h3>
        <p>
          If you activate a paid Shibuya workspace:
        </p>
        <ul>
          <li>Your trade data is stored to power the live analytical workspace you purchased</li>
          <li>We calculate behavioral and performance metrics such as discipline tax, trader state, and edge concentration</li>
          <li>We may record lifecycle events such as activation, onboarding completion, and first upload to improve reliability and understand retention</li>
          <li>You can request deletion of your data at any time, subject to legal or billing retention requirements</li>
          <li>Data is retained for the duration of your active access window or subscription, plus a limited post-access retention window unless you request earlier deletion and no legal hold applies</li>
        </ul>

        <h3>4. Data Storage</h3>
        <p>
          Your data is stored on infrastructure operated by us or our service providers. We do not currently market
          India data residency or institution-grade regulated hosting on the public Shibuya site unless explicitly
          stated elsewhere in writing. Trade data is transmitted over encrypted connections.
        </p>

        <h3>5. Data Sharing</h3>
        <p>
          We do not sell your personal trading data. We only share data with third parties when needed to operate
          the service, such as:
        </p>
        <ul>
          <li><strong>Stripe:</strong> for payment processing, one-time purchases, and subscription events</li>
          <li><strong>Email providers:</strong> for transactional emails only</li>
          <li><strong>Infrastructure providers:</strong> for secure hosting, storage, and service delivery</li>
        </ul>

        <h3>6. Your Rights</h3>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, delete, object to certain
          processing, or receive a portable copy of your data. Contact us if you want to exercise those rights.
        </p>

        <h3>7. Cookies And Local Storage</h3>
        <p>
          We use essential browser storage or cookies for site functionality, authentication, and attribution
          continuity. We do not sell behavioral browsing data to third parties.
        </p>

        <h3>8. Contact</h3>
        <p>
          For privacy-related inquiries or to exercise your rights, contact us at support@shibuya-analytics.com
        </p>
      </div>
    </Section>
  )
}
