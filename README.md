# Shibuya Analytics

`shibuya-analytics` is the trader-facing frontend for the Shibuya product line.

As of 2026-03-28, the truthful description is:

- the mission is trader performance improvement, not static report generation
- the repo still contains meaningful dashboard and activation work, but it is not yet a finished trader operating system
- the direct-trader product, connector strategy, and partner strategy now have canonical docs in `docs/`
- broad production claims should not be made from this repo alone

## What This Repo Is For

- direct trader acquisition and activation
- trader-facing performance dashboards and interventions
- proving Shibuya value independently of PropOS
- acting as the future embedded intelligence surface for partner-supported traders

## What This Repo Is Not

- not proof that every connector exists
- not proof that embedded partner flows are fully shipped
- not a generic "AI trader report" microsite
- not a substitute for the backend truth in `medallion`

## Read These First

- [docs/README.md](docs/README.md)
- [docs/PRODUCT_THESIS.md](docs/PRODUCT_THESIS.md)
- [docs/OFFER_AND_CONNECTOR_STRATEGY.md](docs/OFFER_AND_CONNECTOR_STRATEGY.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/TRADER_RUNTIME_CONTRACT.md](docs/TRADER_RUNTIME_CONTRACT.md)
- [docs/LAUNCH_READINESS_CHECKLIST.md](docs/LAUNCH_READINESS_CHECKLIST.md)

## Current Truth

- CSV and manual ingestion are still important because they are the universal entry path.
- Connector support should be built as a ladder, not as one custom endpoint per prop firm.
- The product should help traders make better next-session decisions, not just inspect historical damage.
- Shibuya should be sellable directly to traders and embeddable into partner environments.
- The trader-facing runtime should be framed as `sample workspace` before real data and `live trader account` after activation, not as a vague demo product.

## Local Commands

```bash
npm install
npm run lint
npm run test:run
npm run build
```

## Strategic Rule

If a feature does not improve trader decisions, partner distribution, or proof of behavioral value, it should not outrank launch-critical work.
