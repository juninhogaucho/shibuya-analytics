# Shibuya Foundation Rebuild Map - 2026-06-17

## Current Truth

Shibuya is currently a React/Vite direct-trader workspace with a usable public shell, sample mode, activation/login surfaces, dashboard pages, and a broad API facade pointed at Medallion.

It is not yet a finished live company surface. The codebase still mixes four things that must be separated before scale:

- Public product story.
- Sample workspace demonstration.
- Live trader account runtime.
- Future analytical engine language.

The first foundation fix now exists in code: `src/lib/runtime.ts` exposes a runtime contract for `anonymous`, `sample`, and `live`. It states whether the current runtime may use sample data, persist trades, require a backend, and what proof boundary applies.

## Keep

- React/Vite app structure and route-level lazy loading.
- Public routes for `/`, `/pricing`, `/activate`, `/login`, `/signal`, and dashboard routes.
- The direct-trader loop: sample -> checkout -> activation -> context -> upload -> action board -> append sessions.
- `src/lib/runtime.ts` as the canonical runtime boundary.
- `src/lib/types.ts` as the current frontend/backend contract surface, while recognizing it needs pruning and schema validation.
- Upload page direction: CSV/paste first, broker connectors later.
- Sample workspace, only if every sample surface remains visibly non-persistent and non-live.

## Rewrite

- `src/lib/api.ts`: currently a large mixed facade containing HTTP client setup, demo data, product mocks, live API calls, ops API calls, support calls, and checkout calls. Split into:
  - `api/httpClient.ts`
  - `api/liveDashboard.ts`
  - `api/sampleWorkspace.ts`
  - `api/checkout.ts`
  - `api/ops.ts`
  - `api/support.ts`
- Dashboard analytics copy that claims specific models are running when the backend proof is not attached.
- Generated chart helpers using `Math.random()` for business-critical visuals. They can remain only inside explicit sample/demo modules.
- Engine presentation. The restored `src/data/engineData.ts` is a build-stabilizing contract, not final analytical proof.
- Premium route gating. `hasPremiumAccess()` currently checks only `reset_pro`; it should use offer/plan capabilities.
- Production environment gating. A production build without `VITE_API_BASE` should be treated as launch-blocking, not merely routed to an invalid host.

## Delete Or Quarantine

- Any dashboard copy that says a model "predicts", "isolates skill", or proves account-specific alpha unless the screen is backed by a generated artifact and backend evidence.
- Any sample data path that writes language implying durable account history.
- Any hidden product state where sample mode can look like paid/live mode.
- Any unsupported B2B/ops promise on the direct-trader site unless it points clearly to the correct PropOS/Decrypt surface.

## First Foundation Slice Completed

Files changed:

- `src/lib/runtime.ts`
- `src/lib/__tests__/runtime.test.ts`
- `src/pages/dashboard/AppendTradesPage.tsx`
- `src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`
- `src/data/engineData.ts`

Behavior now verified:

- Anonymous runtime: no sample data, no persistence, no backend requirement.
- Sample runtime: sample data allowed, no trade persistence, local-only, no backend requirement.
- Live runtime: sample data forbidden, trade persistence allowed, backend required.
- Upload page uses the runtime contract for its sample/live proof boundary.
- `engineData.ts` restored as a claim-bounded build dependency because deleting it broke production build.

Verification:

- `vitest run src/lib/__tests__/runtime.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`: 7 passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,827 modules transformed.

## Second Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/sampleWorkspace.ts`
- `docs/SHIBUYA_FOUNDATION_REBUILD_MAP_2026_06_17.md`

Behavior now verified:

- `src/lib/api.ts` no longer owns the large `DEMO_DATA` object.
- Sample dashboard, report, alert, edge, slump, shadow-boxing, trade-history, and profile responses now come from `src/lib/sampleWorkspace.ts`.
- Sample-mode strings that previously read like live account proof were rewritten as explicit sample scenarios.
- Live API calls still route through the Medallion HTTP client and do not get their data from the sample module unless `isSampleMode()` is true.

Verification:

- `vitest run src/lib/__tests__/runtime.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx src/app/__tests__/routes.test.tsx src/components/landing/__tests__/GuidedWalkthrough.test.tsx`: 13 passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,828 modules transformed.

## Third Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/httpClient.ts`
- `docs/SHIBUYA_FOUNDATION_REBUILD_MAP_2026_06_17.md`

Behavior now verified:

- HTTP client construction, auth header injection, 401 handling, friendly API errors, and retry behavior now live in `src/lib/api/httpClient.ts`.
- `src/lib/api.ts` no longer owns Axios setup or retry infrastructure.
- Existing page imports from `src/lib/api.ts` still work; this is an internal foundation split, not a routing/API-surface break.
- `ApiError` is re-exported from `src/lib/api.ts` for compatibility while the facade is being decomposed.

Verification:

- `vitest run src/lib/__tests__/runtime.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx src/app/__tests__/routes.test.tsx src/components/landing/__tests__/GuidedWalkthrough.test.tsx`: 13 passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,829 modules transformed.

## Fourth Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/auth.ts`
- `src/lib/api/checkout.ts`
- `docs/SHIBUYA_FOUNDATION_REBUILD_MAP_2026_06_17.md`

Behavior now verified:

- Auth, activation, password bootstrap/reset/change, session status, logout, and local session clearing now live in `src/lib/api/auth.ts`.
- Checkout session creation, checkout session lookup, and affiliate click tracking now live in `src/lib/api/checkout.ts`.
- `src/lib/api.ts` re-exports those functions and types so existing pages keep compiling while callers are migrated deliberately.
- `src/lib/api.ts` no longer directly imports affiliate attribution, login/session token setters, or checkout session types.

Verification:

- `vitest run src/lib/__tests__/runtime.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx src/app/__tests__/routes.test.tsx src/components/landing/__tests__/GuidedWalkthrough.test.tsx`: 13 passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,831 modules transformed.

## Fifth Foundation Slice Completed

Files changed:

- `src/components/AuthGuard.tsx`
- `src/components/__tests__/AuthGuard.test.tsx`
- `src/features/activation/useActivation.ts`
- `src/pages/checkout/CheckoutPage.tsx`
- `src/pages/checkout/CheckoutSuccessPage.tsx`
- `src/pages/marketing/ActivationPage.tsx`
- `src/pages/marketing/ClaimAccountPage.tsx`
- `src/pages/marketing/ForgotPasswordPage.tsx`
- `src/pages/marketing/HomePage.tsx`
- `src/pages/marketing/LoginPage.tsx`
- `src/pages/marketing/PricingPage.tsx`
- `src/pages/marketing/ResetPasswordPage.tsx`
- `docs/SHIBUYA_FOUNDATION_REBUILD_MAP_2026_06_17.md`

Behavior now verified:

- Auth-only callers import from `src/lib/api/auth`.
- Checkout and affiliate-click callers import from `src/lib/api/checkout`.
- Mixed lifecycle pages now split imports: lifecycle events still come from the compatibility facade while activation/password/session calls come from `api/auth`.
- `AuthGuard` no longer depends on the broad API facade.
- The compatibility exports remain in `src/lib/api.ts` only to avoid breaking untouched callers during the ongoing split.

Verification:

- `vitest run src/components/__tests__/AuthGuard.test.tsx src/lib/__tests__/runtime.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx src/app/__tests__/routes.test.tsx src/components/landing/__tests__/GuidedWalkthrough.test.tsx`: 15 passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,831 modules transformed.

## Remaining Foundation Slices

`src/lib/api.ts` is now a compatibility export surface only. Dashboard, auth, checkout, trader loop, support/appointments, ops/admin, and site contact all live behind dedicated API modules.

## Sixth Foundation Slice Completed

Files changed:

- `src/lib/constants.ts`
- `src/lib/api.ts`
- `src/lib/api/dashboard.ts`
- `src/lib/api/__tests__/dashboard.test.ts`
- Dashboard route/page imports that consume dashboard data, reports, trade history, alerts, edge portfolio, slump, shadow boxing, and upload APIs.
- `src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`

Behavior now verified:

- Dashboard data, report history, trade history, premium dashboard surfaces, and upload calls now live in `src/lib/api/dashboard.ts`.
- `src/lib/api.ts` keeps compatibility re-exports but no longer owns dashboard/sample branching or upload implementation.
- Dashboard pages import dashboard capabilities from `api/dashboard` directly.
- Sample mode still returns explicit sample workspace data.
- Live dashboard/upload calls now fail locally with a clear `VITE_API_BASE is missing` boundary when a production-style backend URL is impossible, instead of making the UI look like live data can load truthfully.

Verification:

- `vitest run src/lib/api/__tests__/dashboard.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`: passed.
- `tsc -b`: passed.

## Seventh Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/trader.ts`
- `src/lib/api/__tests__/trader.test.ts`
- Trader-loop consumers in dashboard, marketing activation, claim-account, and daily command components.
- `src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`

Behavior now verified:

- Trader profile context, lifecycle event logging, onboarding context save, daily briefing, and daily debrief calls now live in `src/lib/api/trader.ts`.
- Dashboard and marketing consumers import trader/customer-loop capabilities directly from `api/trader`.
- `src/lib/api.ts` keeps compatibility re-exports but no longer owns trader profile, lifecycle, or daily-practice implementations.
- Sample mode still returns explicit local/sample-shaped trader state without claiming durable backend persistence.

Verification:

- `vitest run src/lib/api/__tests__/trader.test.ts src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`: 2 files / 6 tests passed.
- `vitest run`: 30 files / 79 tests passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,834 modules transformed.

## Eighth Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/support.ts`
- `src/lib/api/__tests__/support.test.ts`
- `src/pages/dashboard/AccessPage.tsx`

Behavior now verified:

- Appointment slots, appointment booking/history/cancel, support ticket list/detail/create/reply calls now live in `src/lib/api/support.ts`.
- `AccessPage` imports support and appointment capabilities directly from `api/support`.
- `AccessPage` imports password change directly from `api/auth`.
- `src/lib/api.ts` keeps compatibility re-exports but no longer owns support or appointment implementation.
- Sample support and appointment paths remain explicitly sample-shaped and local.

Verification:

- `vitest run src/lib/api/__tests__/support.test.ts`: 1 file / 2 tests passed.
- `vitest run`: 31 files / 81 tests passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,835 modules transformed.

## Ninth Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/ops.ts`
- `src/lib/api/__tests__/ops.test.ts`
- `src/pages/dashboard/OpsPage.tsx`

Behavior now verified:

- Shibuya ops case list/detail/update, reminder sends, and affiliate report calls now live in `src/lib/api/ops.ts`.
- `OpsPage` imports internal/admin capabilities directly from `api/ops`.
- `src/lib/api.ts` keeps compatibility re-exports but no longer owns ops/admin implementation.
- Ops tests verify the exact Medallion admin endpoints without requiring a backend.

Verification:

- `vitest run src/lib/api/__tests__/ops.test.ts`: 1 file / 2 tests passed.
- `vitest run`: 32 files / 83 tests passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,835 modules transformed.

## Tenth Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/site.ts`
- `src/lib/api/__tests__/site.test.ts`
- `src/components/landing/Footer.tsx`

Behavior now verified:

- Public contact form submission now lives in `src/lib/api/site.ts`.
- `Footer` uses the site API boundary instead of raw `fetch` against `API_BASE_URL`.
- Mailto fallback remains when the site API fails.
- `src/lib/api.ts` no longer owns implementation code; it is a temporary compatibility export surface.
- Site tests cover sample-mode local queue behavior and live endpoint routing.

Verification:

- `vitest run src/lib/api/__tests__/site.test.ts`: 1 file / 2 tests passed.
- `vitest run`: 33 files / 85 tests passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,836 modules transformed.

## Eleventh Foundation Slice Completed

Files changed:

- `src/lib/api.ts`
- `src/lib/api/checkout.ts`
- `src/lib/api/__tests__/checkout.test.ts`
- `src/pages/checkout/CheckoutPage.tsx`

Behavior now verified:

- Promo-code validation now lives in `src/lib/api/checkout.ts`.
- `CheckoutPage` no longer performs raw `fetch` against `API_BASE_URL` for promo validation.
- Backend promo rejection is normalized into a user-safe invalid promo result.
- Network failure still lets the checkout page record the promo code for post-checkout verification, preserving the previous customer-flow fallback.

Verification:

- `vitest run src/lib/api/__tests__/checkout.test.ts`: 1 file / 3 tests passed.
- `vitest run`: 34 files / 88 tests passed.
- `tsc -b`: passed.
- `vite build`: passed, 2,836 modules transformed.

Success condition:

- `api.ts` becomes either a temporary compatibility barrel or disappears. It is now a compatibility barrel.
- Dashboard pages import dashboard functions from a dashboard API module. Done for current dashboard data/upload consumers.
- Trader pages import profile/lifecycle/daily-practice functions from a trader API module. Done for current trader-loop consumers.
- Support/access page imports appointment and ticket functions from a support API module. Done for current access-center consumers.
- Ops pages import ops functions from an ops API module. Done for current ops consumers.
- Auth and checkout pages migrate from compatibility imports to their capability modules once the facade is thin enough.
- Live dashboard functions fail loudly on missing backend/session instead of silently looking usable.
- Dashboard pages render a visible proof boundary whenever data source is sample or estimated.
