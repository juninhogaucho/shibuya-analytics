# Shibuya Analytics Architecture

_Last updated: 2025-12-01_

## Personas & Journeys

### Steve – One-Time “Edge Autopsy” Buyer
- Discovers Shibuya via Odoo-hosted marketing/checkout.
- Pays for $99 / $149 pack **entirely inside Odoo** (handles Stripe, tax).
- Uploads CSV in Odoo form; backend receives webhook to create a "Steve order" work item.
- You deliver PDF + calls manually; no dashboard login, but we give him surprise extras (Shadow Boxing snapshot, Cohort teaser) via email/thank-you page fed by backend metadata.

### David – $250/mo Subscriber
- Visits same marketing flow but selects subscription tier in Odoo checkout.
- Post-payment, Odoo webhook provisions his trader profile + baseline upload link.
- Baseline CSV upload (or API key request) happens inside `shibuya_analytics` app, authenticated via magic-link (FastAPI) tied to Odoo order.
- Continues app experience: Append trades, view dashboards, receive alerts, download investor packet.

### Internal Team (You)
- Manage manual PDF generation + coaching deliverables outside this repo.
- Use backend admin endpoints to track Steve orders, David subscriptions, loyalty unlock cadence, and job queue health.

## High-Level Systems

```
Odoo Website/Checkout ──(webhooks)──▶ medallion_api (FastAPI)
                                       │
                                       ├── Celery Worker (Redis broker)
                                       ├── Postgres (EU region)
                                       └── Object Storage (EU S3) for uploads

shibuya_analytics (React 19 + Vite)
  ├── Marketing microsite (mirrors Odoo copy)
  └── Authenticated dashboard (David only)
```

- **Odoo remains source of truth for payment, tax, refunds.** FastAPI only consumes webhook payloads.
- **PDF generation** happens in your external tool; backend tracks status via manual toggle or a small callback endpoint if you later automate it.

## Frontend (shibuya_analytics)
- React 19 + Vite, TypeScript strict.
- Styling: Radix UI primitives + Tailwind (utility) + CSS variables to mimic neon-on-black aesthetic while keeping components minimalist.
- Routing via React Router 7 with two layout shells: `PublicLayout` (marketing), `DashboardLayout` (authenticated panels).
- State: TanStack Query for API data, Zustand for lightweight UI/app state (auth tokens, toasts, feature flags).

### Public Surfaces
1. Landing page inspired by `react_shibuya/shibuya_odoo_landing.xml` (headline, system tabs, proof sections).
2. Pricing page clarifying Steve vs David tiers and surprise bonuses.
3. Enterprise page to upsell B2B licensing.
4. CTA modals linking directly to Odoo checkout SKUs (deep links).
5. “Already purchased?” flow to capture order ID/email → calls `/v1/activations/start` API to issue dashboard invite or confirm PDF queue.

### Dashboard Modules (David)
- Overview: KPIs, BQL state, loyalty unlock countdown, latest alerts.
- Append Trades: paste parser, upload history timeline, Trade Paste Memory diff.
- Monte Carlo, Psychology, Edge Health, Edge Portfolio, Shadow Boxing, Cohort Benchmark, Slump Prescription, Rules, Fatigue, Execution, Sizing, Story, Capital-Ready Packet, Loyalty perks.
- Notifications drawer for Sunday Margin-of-Safety coach + Crucial Moment alerts.

## Backend Enhancements (medallion_api)
1. **Celery Worker** (Redis broker, Flower optional) to run:
   - Baseline ingestion parse/clean.
   - Incremental append pipeline (dedupe, validation, BQL/AFMA recalcs).
   - Shadow Boxing simulations (prop_risk_monitor logic reused per user dataset).
   - Weekly digest + loyalty unlock scheduler.
2. **Trader-Facing APIs** (all under `/v1/trader`):
   - `POST /activations/verify` – Odoo order → temporary token issuance.
   - `POST /baseline/upload` (async job) + `GET /baseline/status`.
   - `POST /trades/append`, `GET /trades/history`.
   - Analytics fetch endpoints per module (monte-carlo, bql, edge-health, etc.).
   - `POST /investor-packet` to trigger PDF/investor feed generation (records status only; external tooling handles actual PDF).
3. **Webhooks**:
   - `/webhooks/odoo/order-paid` – create Steve/David records, queue baseline invite.
   - `/webhooks/pdf/delivered` – optional callback when manual PDF ready (if automated later).
4. **Data Residency**:
   - Configure Postgres + Redis + S3 bucket in EU region.
   - Document data retention (automatic purge after X months on request).
   - Ensure uploads encrypted at rest, signed URLs for download, and restrict cross-region replication.
5. **Security**:
   - All trader APIs behind signed JWT derived from activation token + API key.
   - Rate limiting on append endpoint.
   - Audit logging for all ingest + analytics operations.

## Background Jobs
- Broker: Redis (managed) in same EU region.
- Worker tasks broken into queues: `ingest`, `analytics-heavy`, `notifications` to avoid starvation.
- Retries with exponential backoff; store failure context to surface in dashboard (e.g., "Your last upload failed – click to retry").

## Edge-Case Coverage (Sample of 100 to test)
1. Malformed CSV/paste (missing headers, localized decimal, duplicate trades).
2. Upload while previous job running → show pending state.
3. BQL state unavailable (insufficient trades) → fallback UI copy.
4. External PDF not delivered within SLA → escalate via Crucial alerts.
5. Odoo webhook retries/out-of-order; ensure idempotent order creation.
6. Trade data referencing unsupported symbols → highlight & skip gracefully.
7. Monte Carlo job exceeding time limit → partial results with warning banner.
8. Worker outage detection → degrade gracefully, notify team.
9. Loyalty unlock timeline misaligned after pause → recompute via cron.
10. Shadow Boxing uses outdated prop rules → version tagging per firm.
(...document full list in QA plan doc once modules implemented.)

## Next Steps
1. Land styling + component library implementation in frontend repo.
2. Build marketing + activation flows referencing Odoo deep links.
3. Implement backend activation + ingestion endpoints with Celery runner.
4. Flesh out dashboard modules incrementally, tying to new APIs.
5. Finalize QA matrix + automated tests (Vitest/unit, Playwright e2e, pytest backend).
