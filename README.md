# Shibuya Analytics Frontend

React 19 + Vite app that powers the trader-facing experience described in `docs/ARCHITECTURE.md`.

The latest feature brief lives in `../medallion_api/docs/SHIBUYA_ANALYTICS_FEATURES.md`. Read it first—every component in this frontend maps to one of those promises.

## Key Concepts

- **Public marketing shell** mirrors the Odoo landing page, clarifies Steve vs David offers, and links directly to Odoo checkout.
- **Activation flow** lets customers who already paid in Odoo verify their order and receive baseline/dashboard instructions.
- **David dashboard** implements the append trades workflow, overview metrics, and alert surfaces that connect to the Medallion engine APIs.

## Feature Modules

| Surface | What Steve sees (public/teaser) | What David unlocks (dashboard) |
|---------|---------------------------------|---------------------------------|
| Landing CTA | Shadow Boxing preview, cohort sanity check, Trade Paste Memory delta on limited data | Full narrative of prop-challenge readiness with multi-rulebook toggles |
| Weekly Coaching | Email sign-up with sample Margin of Safety memo | Margin of Safety Coach widget + inbox history |
| Analytics | Minimal stats after CSV paste | Edge Autopsy, Edge Portfolio, Slump Prescription, Capital-Ready Bundle, Loyalty Unlocks |

Each module must degrade gracefully when APIs are unavailable and should clearly communicate when more data is required.

## Getting Started

```bash
npm install
npm run dev
```

Environment variables:

```
VITE_API_BASE=https://api.medallion.studio
```

## Commands

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint (config TBD) |

## Architecture Notes

- Routing defined in `src/app/routes.tsx`.
- Layouts split between `PublicLayout` (marketing) and `DashboardLayout` (authenticated shell).
- Shared constants + API helpers live under `src/lib`.
- React Query handles async data; Zustand will be introduced for UI state when needed.

See `docs/ARCHITECTURE.md` for personas, system context, and backend integration plan. QA scope lives in `docs/QA_PLAN.md`.
