# Shibuya Product Progress

Last updated: 2026-06-22

Purpose: keep a durable record of what has actually moved toward the real-product path so agents do not repeat the same discovery, rebuild demo-only surfaces, or claim progress without proof.

North-star path:

`public StoryExperience -> upload/report -> locked insight -> paid/live activation boundary -> Reset Pro workspace -> append proof`

Non-negotiable truth boundary:

- Sample mode may demonstrate workflow only.
- Live mode requires backend-derived customer identity before workspace persistence.
- Public teaser reports may route the private question, but they do not prove live private conclusions.
- Append proof requires live activation, upload receipt persistence, generated backend artifacts, and durable append history.

## Update Protocol

Every meaningful slice should update this file before commit:

- `Status`: planned, in progress, validated, pushed, or blocked.
- `Files changed`: exact files, not broad areas.
- `Evidence`: commands/tests/runtime checks that prove the claim.
- `Commit`: hash after push.
- `Remaining gap`: what is still not proven.

Do not mark a slice complete because code exists. Mark it complete only when tests or runtime evidence cover the claim.

## Current Product State

### 1. Public Teaser Report Boundary

Status: pushed

Commit:

- `d7f597a Gate public reports on teaser readiness`

Files changed:

- `src/lib/api/publicReport.ts`
- `src/lib/api/__tests__/publicReport.test.ts`
- `src/pages/marketing/PublicUploadPage.tsx`
- `src/pages/marketing/__tests__/PublicJourneyPages.test.tsx`

Backend paired commit:

- Medallion `7f7cca86 Expose Shibuya teaser readiness contract`

What changed:

- Public upload now checks Medallion teaser readiness before creating a real report packet.
- 503 readiness payloads are consumed as blocked contracts instead of being collapsed into generic frontend errors.
- Sample history remains available as a non-product walkthrough, but cannot substitute for a persisted teaser receipt.

Evidence:

- Shibuya focused tests: `24 passed`
- Shibuya full Vitest: `240 passed`
- Shibuya `tsc -b`: passed
- Shibuya ESLint: passed
- Shibuya Vite build: passed
- Medallion teaser endpoint pytest: `9 passed`
- Medallion py_compile: passed

Remaining gap:

- Public frontend still needs deployed `VITE_API_BASE` pointing at a Medallion environment where `/v1/shibuya/teaser-report/readiness` and `/v1/shibuya/teaser-report` are live.

### 2. Live Append Readiness Boundary

Status: pushed

Commit:

- Shibuya `dcc96e6 Gate live append on Medallion readiness`
- Medallion `99107639 Expose Shibuya live append readiness`

Files changed:

- Medallion `app/main.py`
- Medallion `tests/test_shibuya_upload_artifact_receipts.py`
- Shibuya `src/lib/api/dashboard.ts`
- Shibuya `src/pages/dashboard/AppendTradesPage.tsx`
- Shibuya `src/lib/api/__tests__/dashboard.test.ts`
- Shibuya `src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`

What changed:

- Added authenticated Medallion `GET /v1/dashboard/upload/readiness`.
- Read-only reset windows, exhausted upload limits, missing customer identity, and storage contract gaps are exposed before submit.
- CSV and paste write flags now share the same backend `can_accept_live_append` decision.
- Shibuya live mode loads the append-readiness contract beside profile/overview context.
- Shibuya refuses paste submit or CSV upload when Medallion readiness is blocked.
- Sample mode returns a blocked readiness contract and cannot masquerade as live persistence.
- A successful upload still only becomes live proof if Medallion returns:
  - request id
  - generated artifact status
  - report snapshot id
  - durable append count

Current backend endpoint added:

- `GET /v1/dashboard/upload/readiness`

Current readiness contract:

- `status`
- `service`
- `customer_id`
- `accepts_csv_upload`
- `accepts_trade_paste_submit`
- `persists_upload_receipts`
- `generates_account_artifacts`
- `artifact_status_required`
- `append_count_required`
- `request_id_required`
- `report_snapshot_required`
- `read_only`
- `upload_count`
- `upload_limit`
- `uploads_remaining`
- `last_report_snapshot_id`
- `first_upload_receipt`
- `latest_upload_receipt`
- `blockers`

Evidence:

- Medallion py_compile: `app/main.py` and `tests/test_shibuya_upload_artifact_receipts.py` passed.
- Medallion focused pytest: `tests/test_shibuya_upload_artifact_receipts.py` passed `11 passed`.
- Shibuya focused tests: `dashboard.test.ts` and `AppendTradesPage.test.tsx` passed `13 passed`.
- Shibuya `tsc -b`: passed.
- Shibuya ESLint: passed.
- Shibuya Vite build: passed.
- Shibuya full Vitest, deterministic fallback command: `66 passed / 242 tests`.

Roadblock pattern captured:

- Parallel/default full Vitest stopped producing output after launch.
- Better fallback: rerun with `--reporter=default --reporter=hanging-process --no-file-parallelism --maxWorkers=1 --testTimeout=10000 --hookTimeout=10000`.
- The fallback is slower but provides per-file progress and completed with exit code 0.

Remaining gap:

- This does not itself prove deployed runtime readiness. It proves the local code contract and test boundary.
- Deployed runtime proof is still pending: the public Shibuya app needs a live `VITE_API_BASE`, authenticated account activation, readiness response, upload submit, generated artifact receipt, report snapshot id, and durable append count observed against the deployed stack.

### 3. Activation Session Identity Boundary

Status: pushed

Commit:

- Shibuya `2e38e29 Require backend identity for activation sessions`
- Medallion `d3c1579c Return customer identity for Shibuya demo activation`

Files changed:

- Medallion `app/trader_endpoints.py`
- Medallion `tests/test_shibuya_critical_path.py`
- Shibuya `src/lib/api/auth.ts`
- Shibuya `src/lib/api/__tests__/auth.test.ts`
- Shibuya `src/pages/marketing/ActivationPage.tsx`
- Shibuya `src/pages/marketing/__tests__/ActivationPage.test.tsx`
- Shibuya `src/pages/marketing/LoginPage.tsx`

What changed:

- `verifyActivation` is now transport-only; it does not write browser live state by itself.
- Added explicit `persistVerifiedActivationSession(...)` and `getActivationSessionProofError(...)`.
- Live activation persistence now requires both a backend activation token and backend customer identity.
- ActivationPage blocks malformed `ready` responses before navigation, before lifecycle logging, and before local live-token storage.
- LoginPage first-time activation uses the same persistence boundary.
- Medallion dev/demo activation now returns the demo `customerId` so it respects the same contract as production activation.

Evidence so far:

- Shibuya focused tests: `auth.test.ts` and `ActivationPage.test.tsx` passed `10 passed`.
- Shibuya paid/checkout focused tests: `PaidJourneyContract.test.tsx`, `CheckoutPage.test.tsx`, and `CheckoutSuccessPage.test.tsx` passed `11 passed`.
- Shibuya `tsc -b`: passed.
- Shibuya ESLint: passed.
- Shibuya Vite build: passed.
- Shibuya full Vitest deterministic run: `66 passed / 245 tests`.
- Medallion `TestActivationModels`: passed `6 passed`.
- Medallion full Shibuya critical path test file: `61 passed`.
- Medallion py_compile: `app/trader_endpoints.py` and `tests/test_shibuya_critical_path.py` passed.

Remaining gap:

- This still does not prove a deployed live activation; it proves that the browser cannot create a live workspace session from an incomplete activation response.

### 4. Checkout Activation Access Boundary

Status: validated

Files changed:

- `src/pages/checkout/CheckoutPage.tsx`
- `src/pages/checkout/__tests__/CheckoutPage.test.tsx`
- `src/pages/checkout/__tests__/CheckoutSuccessPage.test.tsx`

What changed:

- Checkout creation still stores a temporary `shibuya_order` handoff for the success route.
- Checkout creation no longer writes `shibuya_recent_order_access`.
- Activation/Login/Workspace recent order prefill now comes only from the verified checkout success path after the backend session reports paid/complete.

Evidence:

- Shibuya focused checkout tests: `2 passed / 10 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya ESLint: passed.
- Shibuya Vite build: passed, `2855 modules transformed`.
- Shibuya full Vitest deterministic run: `66 passed / 245 tests`.

Remaining gap:

- Needs pushed commit proof.
