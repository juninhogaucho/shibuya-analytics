# Shibuya Analytics

`shibuya-analytics` is the direct-trader frontend for the Shibuya product line.

As of 2026-04-02, the truthful description is:

- the mission is trader performance improvement, not static report generation
- the public surface is now trader-only; props, brokers, and platform buyers belong on Decrypt / PropOS
- the root public surface is now India-first, while `/global` or `/intl` hold the legacy non-India route
- the India-first direct offer is now recurring, activation-first, and shaped around Psych Audit / Reset Pro rather than one-off report SKUs
- the live product now includes a trader-context setup layer so the action board can adapt to Indian retail F&O vs prop-eval intent
- the current local tree is green on typecheck, lint, tests, and production build, but live proof is still pending
- the direct-trader product, runtime contract, and India pivot now have canonical docs in `docs/`
- broad production claims should not be made from this repo alone

## What This Repo Is For

- direct trader acquisition and activation
- India-direct acquisition and pricing experiments
- trader-facing performance dashboards and interventions
- proving Shibuya value independently of PropOS
- proving the same intelligence layer that later gets embedded inside PropOS

## What This Repo Is Not

- not proof that every connector exists
- not the B2B sales surface for props, brokers, or tech providers
- not a generic "AI trader report" microsite
- not a substitute for the backend truth in `medallion`

## Read These First

- [docs/README.md](docs/README.md)
- [docs/PRODUCT_THESIS.md](docs/PRODUCT_THESIS.md)
- [docs/OFFER_AND_CONNECTOR_STRATEGY.md](docs/OFFER_AND_CONNECTOR_STRATEGY.md)
- [docs/SHIBUYA_INDIA_POSITIONING.md](docs/SHIBUYA_INDIA_POSITIONING.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/TRADER_RUNTIME_CONTRACT.md](docs/TRADER_RUNTIME_CONTRACT.md)
- [docs/LAUNCH_READINESS_CHECKLIST.md](docs/LAUNCH_READINESS_CHECKLIST.md)

## Current Truth

- CSV and manual ingestion are still important because they are the universal entry path.
- Connector support should be built as a ladder, not as one custom endpoint per prop firm.
- The product should help traders make better next-session decisions, not just inspect historical damage.
- Public sales messaging should lead with edge-vs-behavior diagnosis, real-money leak visibility, and next-session action rather than generic analytics language.
- Shibuya should be sellable directly to traders on its own site and embedded inside PropOS on the Decrypt side.
- The trader-facing runtime should be framed as `sample workspace` before real data and `live trader account` after activation, not as a vague demo product.
- India is now the first serious direct-growth route and now owns the root public surface, while global stays available on `/global` or `/intl`.
- The remaining gap before aggressive marketing is still one paid canary that proves checkout, success, activation, live workspace access, and first upload on the deployed environment.

## Local Commands

```bash
npm install
npm run lint
npm run test:run
npm run build
```

Current local verification on the edited tree:

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run test:run`: `13/13` passed
- `npm run build`: passed
- `python -m py_compile` on touched Medallion files: passed

## Strategic Rule

If a feature does not improve trader decisions, partner distribution, or proof of behavioral value, it should not outrank launch-critical work.
