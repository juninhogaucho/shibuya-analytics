import { Section } from '../../components/ui/Section'

export function TermsPage() {
  return (
    <Section
      eyebrow="Legal"
      title="Terms & Conditions"
      description="Last updated: April 2026"
    >
      <div className="legal-content glass-panel">
        <h3>1. Service Description</h3>
        <p>
          Shibuya Analytics is a direct-trader performance operating system. After purchase and activation,
          you receive access to a live workspace where you can upload trade history, review behavioral and
          edge-related outputs, and carry a corrective process forward session by session.
        </p>

        <h3>2. Payment Terms</h3>
        <p>
          Public Shibuya offers may be one-time reset packages or recurring live-workspace subscriptions,
          processed securely through Stripe. Prices are displayed in the currency shown on the relevant market
          route, including INR on India-facing offers and EUR on global offers.
        </p>
        <p>
          Access begins only after successful payment and activation. One-time reset packages unlock a bounded
          live workspace window and may later move to read-only status. Subscription access continues until the
          end of the already-paid billing period unless a different rule is required by law.
        </p>

        <h3>3. Refund Policy</h3>
        <p>
          Because Shibuya grants immediate digital access to a live analytical workspace, refunds are generally
          not provided once access has been activated, except where mandatory consumer law requires otherwise.
        </p>

        <h3>4. Delivery And Access</h3>
        <p>
          Successful checkout leads to an order confirmation, activation flow, and claim-account step for durable
          login access. Where a paid offer explicitly includes a guided review call, that review is scheduled
          separately and scoped to the offer description shown at purchase.
        </p>

        <h3>5. Referral And Affiliate Tracking</h3>
        <p>
          Shibuya may use referral codes, affiliate links, and campaign parameters to attribute traffic,
          purchases, renewals, and partner performance. Referral or affiliate incentives are governed by the
          applicable promotion or partnership terms and may be changed prospectively.
        </p>

        <h3>6. Promo Codes</h3>
        <p>
          Promo codes may provide discounts or other access benefits. Codes cannot be combined unless we
          explicitly say otherwise. We may void codes obtained through fraud, abuse, or unauthorized distribution.
        </p>

        <h3>7. Data Usage</h3>
        <p>
          Your trade data is used to power your workspace, generate analytical outputs, and improve the accuracy
          of the product you purchased. We do not sell your personal trade data. See the Privacy Policy for
          fuller detail.
        </p>

        <h3>8. Disclaimer</h3>
        <p>
          Shibuya Analytics provides educational and analytical tooling only. We do not provide financial advice,
          investment recommendations, or guarantees of profitability. Trading and investing carry significant risk
          of loss.
        </p>

        <h3>9. Intellectual Property</h3>
        <p>
          The product, interfaces, models, outputs, and related materials remain our intellectual property except
          for the personal data and trade history you submit. You may not redistribute, resell, or publish paid
          Shibuya materials as a product or service without written permission.
        </p>

        <h3>10. Contact</h3>
        <p>
          For questions about these terms, contact us at support@shibuya-analytics.com
        </p>
      </div>
    </Section>
  )
}
