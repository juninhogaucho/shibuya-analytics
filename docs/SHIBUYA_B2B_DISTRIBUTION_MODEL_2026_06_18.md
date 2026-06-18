# Shibuya B2B Distribution Model - 2026-06-18

## Strategic Shift

IFX showed that generic prop-firm tech is entering a race to the bottom. The Shibuya moat is not another platform shell. The moat is trader-behavior intelligence: turning trade history into a truthful view of edge, sabotage, risk, retention, and next-session intervention.

The working thesis is:

- Decrypt / PropOS-style tooling can be sold, licensed, or partnered into tech-provider distribution.
- Shibuya should remain the retained analytics and behavior layer.
- Tech providers, marketing agencies, brokers, prop firms, and financial platforms become distribution partners for Shibuya rather than substitutes for it.

## Offer Architecture

### 1. Platform Intelligence Layer

For prop firms, brokers, and financial platforms that already have users, accounts, challenges, or funded traders.

Commercial model:

- Base fee per active account, funded account, challenge, or trader-month.
- Initial target range: USD 10-15 per account/month or per qualifying challenge/account sold.
- Scope must define which accounts receive Shibuya services and which surfaces are included.

What Shibuya provides:

- Trader behavior diagnostics.
- Edge versus behavior separation.
- Account-level leak analysis.
- Retention and risk signals.
- Next-session guidance surfaces.
- Executive and ops reporting for the firm.

### 2. TVA Upside Layer

Inspired by the CastroPRO PDF model.

Source model extracted from `C:\Users\luisp\Downloads\Documento sem nome.pdf`:

- TVA means "Total de Valor Adicionado" / total value added.
- It annualizes value created from several measurable categories.
- Example categories in the PDF: hours saved, operating cost savings, profit or margin increases, new revenue, and agreed advanced metrics.
- The source FAQ values executive/manager/owner hours at EUR 15/hour and other employee hours at EUR 7/hour for illustrative TVA math.
- The source example annualizes monthly time savings, cost reduction, and added revenue into one TVA figure.
- One path charges an upfront intervention fee: EUR 250/week for 10 weeks in the source offer.
- Another path lowers or removes upfront payment in exchange for active participation/resource contribution.
- The source offer sets a target of at least EUR 4,000 in annualized TVA and charges 25% of annualized TVA above EUR 5,000 for the paid intervention path.
- A merit/new-client path charges 10% of annualized TVA after a free 10-week intervention.

Shibuya adaptation:

- TVA should not be claimed unless baseline, attribution window, eligible accounts, and measurement method are defined before launch.
- TVA can include only partner-approved, auditable deltas such as:
  - incremental challenge conversion attributable to Shibuya-assisted flows,
  - incremental renewal or subscription retention,
  - reduction in avoidable support or review burden,
  - reduction in preventable abuse/risk losses,
  - uplift in paid add-on attach rate,
  - incremental trading-cohort revenue that survives agreed controls.
- TVA cannot include broad market growth, partner marketing improvements, pricing changes, or unrelated operational changes unless explicitly isolated.

Practical commercial model:

- Base platform fee stays simple.
- TVA share is optional and only activates above a pre-agreed threshold.
- Suggested range for discussion: 10-25% of verified annualized value added, depending on upfront fee, exclusivity, partner data access, and implementation burden.

### 3. Partner Revenue Share Layer

This is separate from TVA.

Revenue share pays the distribution partner for selling, bundling, or embedding Shibuya into their installed base. TVA pays Shibuya for measurable value created after deployment.

Default partner-channel structure:

- Shibuya subscription or account fee is collected either by Shibuya or the partner.
- Partner receives a channel share only on net collected Shibuya revenue from its referred or embedded accounts.
- Default discussion range: 20-35% partner share, depending on who owns billing, support, refunds, taxes, and first-line account management.
- Shibuya should avoid giving away both a high partner revenue share and a high TVA share unless the partner provides serious distribution, data access, and implementation leverage.

Recommended default for a tech-provider partner:

```text
partner_revenue_share = net_collected_shibuya_revenue * partner_share_rate
shibuya_base_revenue = net_collected_shibuya_revenue - partner_revenue_share
shibuya_success_fee = verified_eligible_tva * tva_share_rate
```

Commercial interpretation:

- The partner gets paid for reach.
- Shibuya gets paid for the intelligence layer.
- Shibuya gets extra upside only when the agreed measurement says the product created additional value.

### 4. Deal Shapes

These are commercial shapes, not public guarantees.

#### Base Distribution

- Partner pays or collects a simple access fee.
- Default discussion range: USD 10-15 per eligible account, challenge, funded account, or trader-month.
- No TVA share unless the partner wants a value-based overlay.
- Best for fast resale, marketplace listing, broker/prop add-on, or tech-provider installed-base distribution.

#### Partner-Subsidized Pilot

- Shibuya reduces or delays setup/base economics for a defined proof cohort.
- Partner must provide usable data access, cohort definition, decision-maker access, and distribution commitment.
- TVA share can be 10-15% of eligible annualized TVA if the partner wants low upfront cost.
- Best for proving a first live cohort without creating a fake "free forever" expectation.

#### High-Touch Transformation / Zero-Upfront Path

- Upfront cash can be very low or zero only when the partner provides serious implementation leverage.
- Required contribution can include data access, introductions, operating staff time, co-marketing, and permission to publish an approved case study.
- TVA share can be 20-25% of eligible annualized TVA above an agreed floor.
- Best for strategic partners where the upside and proof value justify heavier Shibuya involvement.

### 5. TVA Formula

Use this structure before any TVA deal is signed:

```text
gross_tva =
  verified_incremental_revenue
  + verified_retention_value
  + verified_cost_reduction
  + verified_risk_loss_reduction
  + verified_operating_load_removed

eligible_tva = max(0, gross_tva - agreed_floor)

success_fee = eligible_tva * tva_share_rate
```

Required contract inputs:

- baseline period and baseline metric definitions,
- eligible accounts/cohorts,
- attribution window,
- excluded causes,
- minimum data quality standard,
- payout timing,
- cap, if any,
- dispute process,
- whether TVA is calculated on gross or net uplift.

Recommended default:

- Calculate TVA on verified annualized net uplift, not gross vanity metrics.
- Pay success fee quarterly or at the end of the pilot period after reconciliation.
- Keep partner rev share separate from TVA. Rev share pays for distribution; TVA pays for measured incremental value.

### 6. Prop / Tech-Provider Example

Illustrative only. Do not present this as a guarantee.

Assume a tech provider introduces Shibuya to one prop firm cohort:

- 1,000 eligible active accounts.
- USD 12/account/month Shibuya access fee.
- Partner share: 30% of net collected Shibuya revenue.
- Six-month pilot.
- TVA share: 15% of verified annualized net uplift above a USD 25,000 floor.

Base economics:

```text
gross_monthly_shibuya_revenue = 1,000 * 12 = 12,000
partner_monthly_share = 12,000 * 30% = 3,600
shibuya_monthly_base_revenue = 8,400
six_month_shibuya_base_revenue = 50,400
```

TVA example:

```text
verified_incremental_revenue = 42,000
verified_retention_value = 18,000
verified_support_load_removed = 6,000
verified_risk_loss_reduction = 14,000

gross_tva = 80,000
eligible_tva = 80,000 - 25,000 = 55,000
success_fee = 55,000 * 15% = 8,250
```

What this proves commercially:

- A partner can make immediate channel revenue without rebuilding their stack.
- Shibuya can keep a clean base SaaS/account model.
- Upside economics remain tied to measured business outcomes, not vague "AI value."
- The model scales better than custom consulting because TVA is a measurement overlay, not the main fulfillment mechanism.

What must be locked before signing:

- whether account count is active accounts, funded accounts, challenges sold, or trader-months,
- whether partner share applies before or after payment fees, refunds, taxes, and chargebacks,
- whether TVA is measured on gross uplift or net uplift after costs,
- what events prove attribution,
- whether the partner can veto publication of case-study claims,
- who owns trader relationship, support, and data-processing obligations.

## Claim Boundaries

Do not claim Shibuya has proven live partner uplift until evidence exists.

Allowed language:

- "Designed to measure..."
- "Can be deployed as..."
- "TVA share activates only when baseline and attribution are agreed."
- "Trader intelligence layer for firms that already own distribution."

Avoid:

- "Guaranteed revenue uplift."
- "Proven to increase pass rates."
- "AI predicts trader success."
- "We replace all prop tech."

## Page Requirements

The public B2B page should make these points clear:

- Shibuya is not another tech-provider stand.
- Shibuya sits above/beside existing tech as the behavioral intelligence layer.
- Partners can distribute Shibuya through prop firms, brokers, fintechs, and trading communities.
- Pricing is base access plus optional TVA share.
- Decrypt/PropOS-style risk/ops tooling is separable from Shibuya intelligence.
- The retained asset is the Shibuya analytics, behavior model, and math-driven trader truth layer.
