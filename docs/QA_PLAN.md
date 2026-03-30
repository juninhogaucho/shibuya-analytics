# Shibuya Analytics QA Plan

## Scope
- Marketing routes: `/`, `/pricing`, `/enterprise`, `/activate`, `/checkout`, `/login`.
- Trader runtime boundary: anonymous, sample workspace, live trader account.
- Dashboard shell: `/dashboard`, `/dashboard/upload`, `/dashboard/history`, `/dashboard/alerts`, `/dashboard/slump`, `/dashboard/edges`, `/dashboard/shadow-boxing`.
- Direct trader loop: activation, trade upload/append, trade history, overview refresh, prescriptions.

## Current Automation Truth
- `npm run lint`: active and required.
- `npm run test:run`: active and required for runtime and critical trader-loop regressions.
- `npm run build`: active and required.
- GitHub Actions CI: `.github/workflows/frontend-ci.yml` runs lint, test, and build on push and pull request.
- Current automated coverage is still intentionally narrow: runtime law, auth boundary, and append/upload truth. Wider page and e2e coverage is still needed.

## Test Matrix
| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Marketing navigation | Click each top-nav entry | Route transitions without reload; external CTA links open correctly |
| 2 | Sample workspace entry | Enter via `/activate`, `/checkout`, or navbar sample CTA | Runtime enters sample workspace and dashboard shell loads sample data |
| 3 | Live activation success | Submit valid email + order code | Activation succeeds and runtime switches to live trader account |
| 4 | Live activation failure | Submit invalid credentials/order code | Error panel shown; runtime does not enter live mode |
| 5 | Append trades parse | Paste sample trades and click parse | Row count, symbols, and issues render clearly |
| 6 | Sample append flow | Parse and confirm upload while in sample workspace | UI explains workflow, but does not imply persistence or live analytics |
| 7 | Live append flow | Upload CSV or confirm parsed trades in live mode | Success state reflects live account write and fetches Trade Paste Memory deltas when available |
| 8 | Trade history | Visit `/dashboard/history` after activation/upload | Real trade-history contract renders rows from backend when live, sample payload when in sample workspace |
| 9 | Overview refresh | Visit `/dashboard` after upload | Overview renders current metrics or empty state without sample/live ambiguity |
| 10 | Alert recovery | Simulate dashboard alert endpoint failure | Error panel renders with retry path |
| 11 | Responsive dashboard | Resize to 375px width | Sidebar/header remain usable and sections stack cleanly |
| 12 | Runtime helper regression | Run `npm run test:run` | Sample/live session helpers stay correct under localStorage mutations |
| 13 | Append flow regression | Run `npm run test:run` | Sample workspace never implies persistence; live append fetches Trade Paste Memory deltas |
| 14 | CI pipeline | Push branch or open PR | Lint, test, and build pass in GitHub Actions |

## Manual Gates Before Launch Claims
1. Confirm every trader-facing page shows truthful copy for sample vs live runtime.
2. Confirm no live-facing upload or history surface silently falls back to fabricated persistence.
3. Confirm activation, upload, and history routes work against a real Medallion environment.
4. Confirm build is green locally and in GitHub Actions on the same commit.

## Next QA Upgrades
1. Add broader Vitest + React Testing Library coverage for activation, trade history, and empty-state-to-next-action flows.
2. Add Playwright smoke coverage for activation, sample entry, upload, and history.
3. Add release checklist artifacts for sample-mode review, live-mode review, and backend-contract drift.
