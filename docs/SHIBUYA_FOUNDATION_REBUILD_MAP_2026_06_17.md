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

## Next Foundation Slice

Continue splitting `src/lib/api.ts` into capability-specific API modules. Dashboard, profile/lifecycle, support/appointments, ops, and site-contact code still share the broad facade.

Success condition:

- `api.ts` becomes either a temporary compatibility barrel or disappears.
- Dashboard pages import dashboard functions from a dashboard API module.
- Ops pages import ops functions from an ops API module.
- Auth and checkout pages migrate from compatibility imports to their capability modules once the facade is thin enough.
- Live dashboard functions fail loudly on missing backend/session instead of silently looking usable.
- Dashboard pages render a visible proof boundary whenever data source is sample or estimated.
