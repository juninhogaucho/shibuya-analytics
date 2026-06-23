# Shibuya Product Progress

Last updated: 2026-06-23

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

Status: pushed

Commit:

- Shibuya `f160482 Gate activation access on verified checkout`
- Shibuya `1f6872d Require backend checkout identifiers for activation access`

Files changed:

- `src/pages/checkout/CheckoutPage.tsx`
- `src/pages/checkout/__tests__/CheckoutPage.test.tsx`
- `src/pages/checkout/__tests__/CheckoutSuccessPage.test.tsx`

What changed:

- Checkout creation still stores a temporary `shibuya_order` handoff for the success route.
- Checkout creation no longer writes `shibuya_recent_order_access`.
- Activation/Login/Workspace recent order prefill now comes only from the verified checkout success path after the backend session reports paid/complete.
- Checkout success now fails closed if a paid/complete backend session does not return its own customer email, order id, and plan id.
- Customer email, order code, and plan id no longer fall back to local `shibuya_order` when creating activation-access memory.

Evidence:

- Shibuya focused checkout tests: `2 passed / 11 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya ESLint: passed.
- Shibuya Vite build: passed, `2855 modules transformed`.
- Shibuya full Vitest deterministic run: `66 passed / 246 tests`.

Remaining gap:

- This still does not prove deployed live Stripe checkout. It proves the browser cannot prefill activation/login/workspace recent order access until checkout success has verified a paid/complete backend session with backend-sourced customer email, order id, and plan id.

### 5. Live Upload Artifact Proof Boundary

Status: pushed

Commit:

- Shibuya `bd96c97 Gate live upload proof on generated artifacts`

Files changed:

- `src/lib/api/dashboard.ts`
- `src/lib/api/__tests__/dashboard.test.ts`
- `src/pages/dashboard/AppendTradesPage.tsx`
- `src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`
- `src/lib/types.ts`

What changed:

- Generated live upload proof is now a shared dashboard API contract, not a page-local predicate.
- Baseline proof now requires `status: success`, at least one uploaded trade, `artifact_status: generated`, a report snapshot id, a backend request id, and append count >= 1.
- Malformed upload responses that carry generated-looking IDs are kept in processing state and persisted as `artifact_status: unverified` with a `proof_validation_error`.
- Sample responses and incomplete live responses still cannot create first-upload proof or append proof.

Evidence so far:

- Shibuya focused dashboard/upload tests: `2 passed / 14 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya ESLint: passed.
- Shibuya Vite build: passed, `2855 modules transformed`.
- Shibuya full Vitest deterministic run: `66 passed / 247 tests`.

Remaining gap:

- This still does not prove deployed live upload. It proves the frontend cannot turn malformed, sample, or incomplete live upload responses into baseline/append proof in local code and tests.

### 6. Live Proof Phase Receipt Boundary

Status: pushed

Files changed:

- `src/lib/liveProofPhase.ts`
- `src/lib/__tests__/liveProofPhase.test.ts`

What changed:

- Workspace live-proof phase now rejects generated-looking upload receipts that carry `proof_validation_error`.
- Workspace live-proof phase now requires `trades_uploaded >= 1` before a receipt can count as generated baseline or append proof.
- This aligns dashboard phase/readiness claims with the stricter upload response contract from slice 5.

Evidence so far:

- Commit: Shibuya `ef275d9` (`Gate live proof phase on verified receipts`).
- Shibuya focused live-proof tests: `4 passed / 21 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `66 passed / 66 files`, `248 passed / 248 tests`.

Remaining gap:

- This does not prove deployed live runtime. It proves the workspace phase/readiness layer cannot promote generated-looking receipts with proof validation errors or zero uploaded trades into baseline/append proof in local code and tests.

### 7. Canonical Public Teaser Identity Boundary

Status: pushed

Files changed:

- `src/lib/publicReportSession.ts`
- `src/lib/publicReportRecovery.ts`
- `src/pages/marketing/FreeReportPage.tsx`
- `src/pages/marketing/LockedInsightPage.tsx`
- `src/pages/checkout/CheckoutPage.tsx`
- `src/lib/__tests__/publicReportSession.test.ts`
- `src/pages/marketing/__tests__/PublicJourneyPages.test.tsx`
- `src/pages/checkout/__tests__/CheckoutPage.test.tsx`

What changed:

- Recovered public teaser sessions are now persisted under the canonical backend `report_id` and lookup aliases such as the original URL id and `TEASER-*` request id.
- Free report and locked insight pages now switch downstream links to the canonical backend report id once recovery proves a persisted backend teaser receipt.
- Checkout now sends the canonical backend report id in paid public-context metadata after request-id recovery, while still carrying the backend teaser request id separately.
- Sample/demo packets and URL-only routes remain non-checkout-grade and cannot use alias recovery to create paid live context.

Evidence so far:

- Commit: Shibuya `04ff3ea` (`Canonicalize recovered public teaser identity`).
- Shibuya focused canonical identity tests: `3 passed / 39 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `66 passed / 66 files`, `251 passed / 251 tests`.
- Backend source contract inspected: Medallion `get_public_teaser_report` currently retrieves persisted teaser receipts by public report id or request id and returns the canonical stored `report_id`.

Remaining gap:

- Medallion focused pytest was attempted with system Python and bundled Codex Python, but both environments lacked `pytest`; no backend test pass is claimed for this slice.
- This does not prove deployed live runtime. It proves the frontend stops treating request-id URL text as the paid/live report identity after backend recovery returns canonical persisted teaser evidence.

### 8. Checkout Success Activation Handoff Boundary

Status: pushed

Files changed:

- `src/lib/recentAccess.ts`
- `src/lib/__tests__/recentAccess.test.ts`
- `src/pages/checkout/CheckoutSuccessPage.tsx`
- `src/pages/checkout/__tests__/CheckoutSuccessPage.test.tsx`
- `src/pages/marketing/ActivationPage.tsx`
- `src/pages/marketing/__tests__/ActivationPage.test.tsx`

What changed:

- Verified checkout success now stores a minimized, secret-free activation handoff in recent order access when the backend checkout session returns verified public teaser context.
- Activation reads that handoff only when the current activation route matches the verified report id and locked section.
- Activation can preview the checkout-verified public question even when local report engagement/session state is absent.
- The handoff remains preview/routing context only. Live workspace metadata still comes only from the activation backend response.

Evidence so far:

- Commit: Shibuya `308483e` (`Carry verified checkout context into activation preview`).
- Shibuya focused checkout-success/activation handoff tests: `4 passed / 14 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `253 passed / 253 tests`.

Remaining gap:

- This does not prove deployed live runtime. It proves the frontend preserves a backend-verified checkout-success public-context handoff into activation preview without letting that local handoff become live activation proof.

### 9. Dashboard Activation-Origin Sync Boundary

Status: pushed

Files changed:

- `src/lib/activationOrigin.ts`
- `src/lib/runtime.ts`
- `src/lib/api/dashboard.ts`
- `src/pages/dashboard/AppendTradesPage.tsx`
- `src/pages/dashboard/OverviewPage.tsx`
- `src/lib/api/__tests__/dashboard.test.ts`
- `src/lib/api/__tests__/auth.test.ts`
- `src/lib/__tests__/runtime.test.ts`
- `src/pages/dashboard/__tests__/OverviewPage.test.tsx`

What changed:

- Live activation-origin metadata now carries an explicit sync status: order verified, dashboard verified, dashboard missing, or dashboard rejected.
- Dashboard overview remains authoritative: verified dashboard metadata hydrates live origin; weak or omitted dashboard metadata clears stale activation-origin details.
- Missing or rejected dashboard origin now leaves a visible, fail-closed explanation in Mission HQ instead of silently disappearing.
- Append preflight uses the same dashboard-origin sync boundary before first live upload.

Evidence so far:

- Commit: Shibuya `116512b` (`Expose dashboard activation origin sync state`).
- Shibuya focused activation-origin sync tests: `5 passed / 5 files`, `34 passed / 34 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `254 passed / 254 tests`.

Remaining gap:

- This does not prove deployed live runtime or backend dashboard origin persistence. It proves the frontend now fails closed with an auditable sync reason when the dashboard endpoint omits or rejects activation-origin metadata.

### 10. Live Append Write Readiness Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/main.py`
- Medallion backend tests: `tests/test_shibuya_upload_artifact_receipts.py`

What changed:

- Medallion live upload writes now enforce the same `/v1/dashboard/upload/readiness` contract before mutating upload state.
- CSV upload and trade-paste submit now block before processing when the account is read only, over its upload limit, missing customer identity, or missing required storage capabilities.
- Trade-paste submit now rejects raw text that cannot produce any valid live trades instead of returning `status: success` with `trades_uploaded: 0`.
- Frontend proof validation already rejected zero-trade/no-artifact responses; the backend now prevents that fake-success response at the source.

Evidence so far:

- Commit: Medallion `33206644` (`Enforce Shibuya live append write readiness`).
- Medallion `py_compile app\main.py tests\test_shibuya_upload_artifact_receipts.py`: passed.
- Medallion focused upload receipt tests: `14 passed / 14 tests`.
- Medallion adjacent Shibuya backend tests: `71 passed / 71 tests` across `tests\test_shibuya_critical_path.py`, `tests\test_shibuya_lifecycle_upload_receipt.py`, and `tests\test_shibuya_append_proof_comparison.py`.

Remaining gap:

- This does not prove deployed live runtime. It proves the backend write layer no longer accepts a live append unless readiness is currently true, and it no longer emits a zero-trade live append success response.
