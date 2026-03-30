# Shibuya Launch Readiness Checklist

Updated: 2026-03-28

Use this file before any public claim that the direct trader product is live.

## Launch Gate

All items below must be true on the same commit and same environment.

### Product Truth
- Sample workspace and live trader account are the only supported trader runtime states.
- Sample workspace never implies persistence, live account state, or fabricated account history.
- Activation flow clearly distinguishes exploration from live account access.
- Upload, history, overview, alerts, slump prescription, edge portfolio, and shadow boxing use real backend contracts in live mode or fail honestly.

### Trader Loop
- A trader can activate a live account.
- A trader can upload or append trades successfully.
- Uploaded trades appear in trade history.
- Overview updates off live backend data.
- Alerts and prescriptions load off live backend data.
- The product gives the trader at least one clear next action after upload, not just passive reporting.

### Engineering Discipline
- `npm run lint` passes.
- `npm run test:run` passes.
- `npm run build` passes.
- `.github/workflows/frontend-ci.yml` is green on the release commit.
- No launch-critical page depends on dead routes or stale docs for operator understanding.

### Evidence
- One live trader activation proof exists.
- One live upload proof exists.
- One trade-history proof exists.
- One screenshot bundle exists for overview, alerts, slump, edge portfolio, and shadow boxing in live mode.
- Any marketing or investor claim about Shibuya matches those proof artifacts.

## Do Not Claim Yet

Do not claim any of the following unless separately evidenced:

- full connector coverage across brokers and prop firms
- institutional-grade model validation for every engine
- embedded partner workflows are fully shipped
- broad production scale or reliability beyond observed proof

## Current Direction

The repo is moving toward a truthful direct trader operating system. It is not allowed to drift back into generic report language or sample/live ambiguity.
