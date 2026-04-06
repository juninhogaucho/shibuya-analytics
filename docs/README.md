# Shibuya Docs

Updated: 2026-04-02

This folder is the canonical documentation surface for `shibuya-analytics`.

Older launch notes and one-off execution plans still exist under `docs/history/`, but they are not current product truth.

As of 2026-04-02:
- the primary public Shibuya surface is direct-trader only
- B2B / props / brokers / tech providers belong on `Decrypt / PropOS`
- India now owns the root homepage, while `/global` or `/intl` preserve the non-India route
- the public Shibuya offer is now recurring-first, not one-time-report-first
- the live product now includes trader-context onboarding so intervention can adapt to Indian retail F&O vs prop-eval reality

## Canonical Now

1. [PRODUCT_THESIS.md](PRODUCT_THESIS.md)
2. [SHIBUYA_INDIA_POSITIONING.md](SHIBUYA_INDIA_POSITIONING.md)
3. [SHIBUYA_SELL_AND_FULFILL.md](SHIBUYA_SELL_AND_FULFILL.md)
4. [OFFER_AND_CONNECTOR_STRATEGY.md](OFFER_AND_CONNECTOR_STRATEGY.md)
5. [ARCHITECTURE.md](ARCHITECTURE.md)
6. [TRADER_RUNTIME_CONTRACT.md](TRADER_RUNTIME_CONTRACT.md)
7. [LAUNCH_READINESS_CHECKLIST.md](LAUNCH_READINESS_CHECKLIST.md)
8. [QA_PLAN.md](QA_PLAN.md)
9. [FILE_DICTIONARY.md](FILE_DICTIONARY.md)

## What To Read First

- `PRODUCT_THESIS.md`
  What Shibuya actually is and what it must do for traders.

- `SHIBUYA_INDIA_POSITIONING.md`
  Why India matters, how the direct offer is being reframed, and why India now owns the public root.

- `SHIBUYA_SELL_AND_FULFILL.md`
  The exact commercial contract, what happens after payment, and what still requires human launch steps.

- `OFFER_AND_CONNECTOR_STRATEGY.md`
  How Shibuya reaches traders directly and how the same intelligence later embeds inside PropOS.

- `ARCHITECTURE.md`
  How the product should be structured technically.

- `TRADER_RUNTIME_CONTRACT.md`
  What the trader product is allowed to do in sample state versus live account state.

- `LAUNCH_READINESS_CHECKLIST.md`
  The minimum proof and engineering gates required before public launch claims.

## Documentation Rules

1. If a document is not in `Canonical Now`, do not treat it as current product truth.
2. If a claim is not backed by repo or runtime evidence, it is not canonical.
3. Do not position Shibuya as a generic report business.
4. Do not use the Shibuya public surface to sell props, brokers, or platforms; route those buyers to Decrypt.
5. Public funnel copy should lead with edge-vs-behavior diagnosis, real-money leak visibility, and next-session action.
6. India is the first-class direct-trader route and now owns the public root, but aggressive acquisition still waits on live payment and activation canaries.
7. Every new doc should improve launch clarity, trader value clarity, or engineering execution.
8. Do not overstate local verification. Current Shibuya local truth must be backed by the latest green typecheck, lint, test, and build runs.
