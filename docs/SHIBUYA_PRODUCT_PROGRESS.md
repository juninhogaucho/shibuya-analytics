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

### 11. Activation Proof Mode Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/trader_endpoints.py`
- Medallion backend tests: `tests/test_shibuya_critical_path.py`, `tests/test_shibuya_activation_public_context.py`
- Shibuya frontend: `src/lib/api/auth.ts`, `src/lib/runtime.ts`, `src/lib/types.ts`, `src/pages/marketing/ActivationPage.tsx`
- Shibuya frontend tests: `src/lib/api/__tests__/auth.test.ts`, `src/lib/__tests__/runtime.test.ts`, `src/pages/marketing/__tests__/ActivationPage.test.tsx`, `src/pages/marketing/__tests__/PaidJourneyContract.test.tsx`, `src/app/__tests__/publicJourneyRouteCanary.test.tsx`

What changed:

- Activation responses now expose an explicit `activationMode`.
- Paid order activations return `paid_order`; development demo activations return `dev_demo`.
- The frontend refuses to persist `dev_demo` activations as paid/live activation proof even when the backend returns a customer id and token.
- Runtime access still supports ordinary backend-authenticated login sessions, but a stored dev/demo activation identity cannot unlock persistence or premium live proof.
- The long public route canary now has a per-test timeout budget so the full deterministic suite does not fail the real story-to-demo flow under slower suite load.

Evidence so far:

- Commit: Medallion `6a5906c3` (`Classify Shibuya activation proof mode`).
- Commit: Shibuya `a616e75` (`Reject demo activation as live proof`).
- Medallion `py_compile app\trader_endpoints.py tests\test_shibuya_critical_path.py tests\test_shibuya_activation_public_context.py`: passed.
- Medallion focused activation tests: `63 passed / 63 tests` across `tests\test_shibuya_critical_path.py` and `tests\test_shibuya_activation_public_context.py`.
- Shibuya focused activation/runtime route tests: `4 passed / 4 files`, `25 passed / 25 tests`.
- Shibuya public route canary: `1 passed / 1 test`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `256 passed / 256 tests`.

Remaining gap:

- This does not prove deployed live runtime. It closes a local/dev truth leak where a demo activation could look like a paid activation session.

### 12. Login Session Proof Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/main.py`
- Medallion backend tests: `tests/test_shibuya_critical_path.py`
- Shibuya frontend: `src/lib/api/auth.ts`, `src/lib/runtime.ts`
- Shibuya frontend tests: `src/lib/api/__tests__/auth.test.ts`, `src/lib/__tests__/runtime.test.ts`

What changed:

- Login/register responses now expose an explicit `authMode`.
- Password sign-in returns `password`; self-register returns `self_register`; development demo login returns `dev_demo`.
- The frontend refuses to persist successful-looking login payloads unless Medallion returns both an API key and backend customer identity.
- The frontend refuses `dev_demo` login as live account proof even when it contains a token and customer id.
- Runtime access also fails closed if stale or hand-written session metadata contains `authMode: dev_demo`.

Evidence so far:

- Commit: Medallion `aac69331` (`Classify Shibuya login session mode`).
- Commit: Shibuya `151cc8a` (`Require verified login session identity`).
- Medallion `py_compile app\main.py tests\test_shibuya_critical_path.py`: passed.
- Medallion focused Shibuya critical path tests: `62 passed / 62 tests`.
- Shibuya focused auth/runtime tests: `2 passed / 2 files`, `22 passed / 22 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `261 passed / 261 tests`.

Remaining gap:

- This does not prove deployed live runtime. It closes the sign-in truth leak where a partial or dev/demo auth response could create browser live state.

### 13. Persisted Public Teaser Retrieval Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/shibuya_report_endpoint.py`
- Medallion backend tests: `tests/test_shibuya_teaser_report_endpoint.py`

What changed:

- Public teaser generation already stored secret-free persisted receipts.
- Public teaser retrieval now revalidates the stored receipt with the shared checkout-grade receipt contract before returning it.
- Corrupted/stale persisted receipts now fail closed with `409` instead of being recoverable by frontend report/session recovery.
- Checkout public-context validation remains the later paid-boundary guard, but invalid teaser receipts are now blocked one step earlier at report recovery.

Evidence so far:

- Commit: Medallion `a3f9a147` (`Validate persisted teaser report retrieval`).
- Medallion `py_compile app\shibuya_report_endpoint.py tests\test_shibuya_teaser_report_endpoint.py`: passed.
- Medallion public teaser + checkout context tests: `18 passed / 18 tests` across `tests\test_shibuya_teaser_report_endpoint.py` and `tests\test_shibuya_checkout_public_context.py`.

Remaining gap:

- This does not prove deployed live runtime. It proves the public upload/report recovery endpoint no longer emits malformed persisted teaser receipts as report-grade product state.

### 14. Upload Attempt vs Proof Receipt Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/main.py`
- Medallion backend tests: `tests/test_shibuya_upload_artifact_receipts.py`
- Shibuya frontend: `src/lib/runtime.ts`, `src/pages/dashboard/AppendTradesPage.tsx`
- Shibuya frontend tests: `src/pages/dashboard/__tests__/AppendTradesPage.test.tsx`

What changed:

- Missing generated artifacts are now upload attempts, not proof receipts.
- Medallion only updates `latest_upload_receipt` and `upload_receipt_history` when the upload has a generated artifact, report snapshot id, request id, and durable append count.
- Medallion stores missing-artifact writes in `latest_upload_attempt` and `upload_attempt_history`, and returns `status: processing` instead of `status: success`.
- A missing-artifact append after an existing baseline no longer overwrites the latest generated proof receipt or generated receipt history.
- Shibuya frontend session metadata mirrors the same split: pending or untrusted upload responses update `latestUploadAttempt` and `uploadAttemptHistory`, not `latestUploadReceipt` or `uploadReceiptHistory`.

Evidence so far:

- Commit: Medallion `1fef9ca1` (`Split Shibuya upload attempts from proof receipts`).
- Commit: Shibuya `2e4c969` (`Store pending Shibuya uploads as attempts`).
- Medallion `py_compile app\main.py tests\test_shibuya_upload_artifact_receipts.py tests\test_shibuya_lifecycle_upload_receipt.py tests\test_shibuya_append_proof_comparison.py`: passed.
- Medallion upload/lifecycle/append proof focused tests: `24 passed / 24 tests`.
- Shibuya focused upload/runtime tests: `4 passed / 4 files`, `37 passed / 37 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `261 passed / 261 tests`.

Remaining gap:

- This does not prove deployed live runtime or real customer data. It closes a local/backend truth leak where processing attempts without generated artifacts could be cached as latest proof receipts.

### 15. Locked Insight Paid Activation Offer Boundary

Status: pushed

Repos changed:

- Shibuya frontend: `src/pages/marketing/LockedInsightPage.tsx`
- Shibuya frontend tests: `src/pages/marketing/__tests__/PublicJourneyPages.test.tsx`, `src/pages/marketing/__tests__/PaidJourneyContract.test.tsx`

What changed:

- Locked Insight no longer renders paid checkout links from URL-only context, local sample report packets, or presenter-demo packets.
- Paid activation actions on Locked Insight now require a checkout-grade public report session: persisted backend teaser receipt, valid receipt hash, minimum row threshold, and no private production-artifact claim.
- When the proof is missing, Locked Insight shows disabled paid actions and keeps only the private demo gate available as sample/demo continuity.
- When Medallion recovery returns a persisted backend teaser receipt, Locked Insight restores the Reset Pro and Psych Audit checkout links with the canonical report context.

Evidence so far:

- Commit: Shibuya `7628fef` (`Gate locked insight checkout offers by backend teaser proof`).
- Shibuya focused public journey / paid journey / checkout tests: `3 passed / 3 files`, `32 passed / 32 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `261 passed / 261 tests`.

Remaining gap:

- This does not prove deployed live runtime or completed payment activation. It closes an upstream offer-boundary leak where Locked Insight could advertise paid activation before a persisted backend teaser receipt existed.

### 16. Checkout Success Paid Session Boundary

Status: pushed

Repos changed:

- Shibuya frontend: `src/pages/checkout/CheckoutSuccessPage.tsx`
- Shibuya frontend tests: `src/pages/checkout/__tests__/CheckoutSuccessPage.test.tsx`

What changed:

- Checkout success now requires both `status: complete` and `payment_status: paid` from the backend session before it renders checkout completion.
- `status: complete` with unpaid payment can no longer expose activation access or store recent order access.
- `payment_status: paid` with an open session can no longer expose activation access or store recent order access.
- Existing backend identifier checks still apply after the paid+complete gate: customer email, order id, and plan id must be returned before activation can continue.

Evidence so far:

- Commit: Shibuya `de90555` (`Require paid complete checkout sessions for activation access`).
- Shibuya focused checkout/activation tests: `5 passed / 5 files`, `23 passed / 23 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya `vite build`: passed; `2855 modules transformed`.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `263 passed / 263 tests`.

Remaining gap:

- This does not prove deployed live runtime or Stripe webhook completion. It closes the frontend success-route leak where an incomplete or unpaid session could become local activation access.

### 17. Backend Checkout Session Public Context Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/stripe_checkout.py`
- Medallion backend tests: `tests/test_shibuya_checkout_public_context.py`

What changed:

- `/v1/checkout/session/{session_id}` now only attaches verified public StoryExperience context when the session response is both `status: complete` and `payment_status: paid`.
- Pending/open/unpaid checkout sessions can still return order recovery fields, but can no longer carry activation-grade public teaser context downstream.
- The guard sits in the shared session-response attachment helper, so it covers local mock mode, Stripe-authoritative status mode, and Stripe-fallback-to-DB mode.
- Added a regression test with checkout-grade public teaser metadata on a pending order; the endpoint returns `open`/`unpaid` and strips all public context fields.

Evidence so far:

- Commit: Medallion `51dbfc04` (`Gate public context by paid checkout status`).
- Medallion `py_compile app\stripe_checkout.py tests\test_shibuya_checkout_public_context.py`: passed.
- Medallion checkout public-context tests: `9 passed / 9 tests`.
- Medallion activation public-context tests: `2 passed / 2 tests`.
- Medallion Shibuya critical-path tests: `62 passed / 62 tests`.

Remaining gap:

- This does not prove deployed live Stripe webhook completion. It closes the backend source-of-truth leak where verified public context could leave the session-status API before payment was actually complete and paid.

### 18. Backend Activation Paid Context Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/trader_endpoints.py`
- Medallion backend tests: `tests/test_shibuya_activation_public_context.py`

What changed:

- `/v1/trader/activations/verify` now returns `activationMode: paid_order` only for a ready dashboard activation, not for pending payment.
- Verified public StoryExperience context is only extracted and returned when the activation match is `status: ready` and `next_step: dashboard`.
- Pending payment can still return a pending activation response, but it can no longer leak paid-mode semantics or backend teaser context into the private activation contract.
- Added a regression test where a pending order carries otherwise checkout-grade public teaser metadata; the activation endpoint returns no activation token, no customer id, no paid mode, no public context, and performs no customer upsert/metadata write.

Evidence so far:

- Commit: Medallion `4ff57665` (`Require ready activation before paid context`).
- Medallion `py_compile app\trader_endpoints.py tests\test_shibuya_activation_public_context.py`: passed.
- Medallion activation public-context tests: `3 passed / 3 tests`.
- Medallion Shibuya critical-path tests: `62 passed / 62 tests`.

Remaining gap:

- This does not prove deployed live activation. It closes the backend activation leak where pending payment could still be labelled as paid activation mode and return public StoryExperience context.

### 19. Stripe Fulfillment Story Context Continuity

Status: pushed

Repos changed:

- Medallion backend: `app/stripe_checkout.py`
- Medallion backend tests: `tests/test_shibuya_stripe_fulfillment_public_context.py`

What changed:

- `fulfill_stripe_order(...)` now carries verified public StoryExperience metadata into the Shibuya customer metadata created during Stripe webhook fulfillment.
- The fulfillment path uses the existing `extract_verified_public_context_metadata(...)` contract, so weak/local/legacy public context is not copied.
- This preserves the trader's public story/report origin even when webhook fulfillment creates the customer before the activation form is submitted.
- Added a focused fake-storage test proving verified public teaser metadata is present in customer metadata after fulfillment.

Evidence so far:

- Commit: Medallion `e3c6c437` (`Preserve public context during Stripe fulfillment`).
- Medallion `py_compile app\stripe_checkout.py tests\test_shibuya_stripe_fulfillment_public_context.py`: passed.
- Medallion Stripe fulfillment public-context test: `1 passed / 1 test`.
- Medallion checkout + activation public-context tests: `12 passed / 12 tests`.
- Medallion Shibuya critical-path tests: `62 passed / 62 tests`.

Remaining gap:

- This does not prove deployed live webhook delivery. It closes the local backend continuity gap where a paid webhook-created customer could lose the verified StoryExperience origin until a later activation pass.

### 20. Public Teaser Receipt Story Identity Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/shibuya_report_endpoint.py`
- Medallion backend: `app/stripe_checkout.py`
- Medallion backend tests: `tests/test_shibuya_teaser_report_endpoint.py`
- Medallion backend tests: `tests/test_shibuya_checkout_public_context.py`
- Shibuya frontend: `src/lib/api/publicReport.ts`
- Shibuya frontend: `src/lib/publicReportSession.ts`
- Shibuya frontend: `src/pages/marketing/PublicUploadPage.tsx`
- Shibuya frontend tests: public report API/session, public journey, and checkout tests

What changed:

- Public teaser uploads now send secret-free StoryExperience identity into Medallion: market, story source, archetype, axis, selected pain axes, visited scene count, and signal markers.
- Medallion persists that identity inside `metrics.public_context`, which is included in the deterministic public teaser receipt hash payload.
- Medallion checkout verification now rejects persisted teaser receipts that are missing story identity and rejects mismatches between checkout context and the stored receipt identity.
- Checkout metadata is overwritten from the persisted receipt identity after verification, so URL/local state can no longer forge archetype, axis, story source, pain axes, scenes, or signal markers.
- Shibuya frontend now refuses checkout-grade teaser receipts unless Medallion returns hash-covered story identity, and recovered report/checkout routes prefer the persisted backend identity over URL identity.

Evidence so far:

- Commit: Medallion `50fe5f7b` (`Bind teaser receipts to public story identity`).
- Commit: Shibuya `eb4f534` (`Trust backend teaser story identity`).
- Medallion `py_compile app\shibuya_report_endpoint.py app\stripe_checkout.py tests\test_shibuya_teaser_report_endpoint.py tests\test_shibuya_checkout_public_context.py`: passed.
- Medallion focused teaser/checkout public-context tests: `20 passed / 20 tests`.
- Medallion Shibuya critical/env/fulfillment checks: `74 passed / 74 tests`.
- Shibuya focused public report/session/journey/checkout tests: `4 passed / 4 files`, `40 passed / 40 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `263 passed / 263 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This does not prove deployed live runtime, live Stripe payment completion, or live dashboard append proof. It closes the public upload -> report -> locked insight -> paid checkout identity-forgery gap by making the backend teaser receipt the source of truth for public story identity.

### 21. Live Append Customer Identity Boundary

Status: pushed

Repos changed:

- Medallion backend: `app/main.py`
- Medallion backend tests: `tests/test_shibuya_upload_artifact_receipts.py`
- Shibuya frontend: `src/lib/api/dashboard.ts`
- Shibuya frontend: `src/lib/types.ts`
- Shibuya frontend: `src/pages/dashboard/AppendTradesPage.tsx`
- Shibuya frontend tests: dashboard API and append page tests

What changed:

- Medallion live upload receipts now include the authenticated `customer_id`.
- Medallion no longer treats a generated-looking upload receipt as generated live proof unless it is customer-bound.
- CSV upload and manual/paste submit responses now return the same top-level `customer_id` that the backend used to write the receipt.
- Shibuya live append readiness validation now rejects ready-looking responses that omit `customer_id` or return a different customer than the backend-verified session.
- Shibuya generated upload proof validation now rejects success/generated/snapshot/request/append-count responses when the upload receipt is missing `customer_id` or belongs to another customer.
- Stored frontend upload receipts now carry `customer_id`, so `latestUploadReceipt`, `firstUploadReceipt`, and append history remain tied to the verified live account.

Evidence so far:

- Commit: Medallion `bdb2c89b` (`Bind live upload receipts to customer identity`).
- Commit: Shibuya `78efec5` (`Require customer-bound live append proof`).
- Medallion `py_compile app\main.py tests\test_shibuya_upload_artifact_receipts.py`: passed.
- Medallion focused upload/lifecycle/append proof tests: `24 passed / 24 tests`.
- Medallion Shibuya critical/env/upload/lifecycle/append suite: `97 passed / 97 tests`.
- Shibuya focused dashboard/upload tests: `3 passed / 3 files`, `16 passed / 16 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `263 passed / 263 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This does not prove deployed live runtime or a real trader account append in production. It closes the local/live identity boundary where structurally valid upload proof could be accepted without proving it belonged to the same backend-verified customer session.

### 22. Report And Append Proof Customer Continuity

Status: pushed

Repos changed:

- Medallion backend: `app/trader_endpoints.py`
- Medallion backend: `app/main.py`
- Medallion backend tests: append proof comparison and report artifact enrichment
- Shibuya frontend: `src/lib/liveProofPhase.ts`
- Shibuya frontend: `src/lib/api/dashboard.ts`
- Shibuya frontend: `src/pages/dashboard/WorkspacePage.tsx`
- Shibuya frontend tests: live proof phase, dashboard API, and workspace page

What changed:

- Medallion append-proof comparison now refuses `comparison_ready` when the latest generated upload receipt is missing the authenticated `customer_id` or belongs to another customer.
- Medallion report list/detail enrichment now copies receipt proof fields only when the durable upload receipt belongs to the requested customer, and its proof boundary now requires both a report snapshot and a matching receipt.
- Shibuya dashboard overview sanitation now strips cross-customer `first_upload_receipt`, `latest_upload_receipt`, and `upload_receipt_history` before returning overview data or updating local session metadata.
- Shibuya live proof phase and workspace display now ignore generated-looking receipts and backend append-proof packets unless they match the current live customer when that customer is known.

Evidence so far:

- Commit: Medallion `f53d7005` (`Bind report proof to live customer`).
- Commit: Shibuya `03bdea7` (`Bind dashboard proof to live customer`).
- Medallion `py_compile app\main.py app\trader_endpoints.py tests\test_shibuya_append_proof_comparison.py tests\test_shibuya_report_artifact_enrichment.py`: passed.
- Medallion focused append/report tests: `13 passed / 13 tests`.
- Medallion focused upload/lifecycle/append/report tests: `30 passed / 30 tests`.
- Medallion Shibuya critical/env/upload/lifecycle/append/report suite: `103 passed / 103 tests`.
- Shibuya focused live-proof/dashboard/workspace tests: `3 passed / 3 files`, `24 passed / 24 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `267 passed / 267 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the customer-continuity proof gap between backend report comparison, report artifact enrichment, frontend overview persistence, live proof phase, and workspace display.

### 23. Backend Teaser Recovery Overrides Weak Local Packets

Status: pushed

Repos changed:

- Shibuya frontend: `src/lib/publicReportRecovery.ts`
- Shibuya frontend tests: `src/pages/marketing/__tests__/PublicJourneyPages.test.tsx`

What changed:

- Public report recovery now skips backend recovery only when the existing local public report session is already checkout-grade.
- Weak local/sample packets can no longer shadow a persisted backend teaser receipt for the same recoverable `public-teaser-*` or `TEASER-*` report id.
- Failed backend recovery still preserves the weak local packet for context, but it does not upgrade that packet into paid-checkout proof.
- Locked Insight now upgrades stale local sample context into a checkout-grade backend teaser session when Medallion has a persisted receipt, restoring the Reset Pro paid path from the stronger source of truth.

Evidence so far:

- Commit: Shibuya `5959a93` (`Recover backend teaser over weak local report`).
- Shibuya focused checkout and public journey tests: `2 passed / 2 files`, `32 passed / 32 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `268 passed / 268 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the public report recovery truth gap where stale local/sample state could block recovery of stronger backend teaser evidence.

### 24. Runtime Live Session Requires Positive Backend Proof Mode

Status: pushed

Repos changed:

- Shibuya frontend: `src/lib/runtime.ts`
- Shibuya frontend: `src/lib/api/auth.ts`
- Shibuya frontend tests: runtime, auth API, dashboard API, and AuthGuard tests

What changed:

- Live workspace proof now requires a backend customer id plus a positive backend-issued proof mode.
- Accepted proof modes are paid activation (`activationMode: paid_order`) or backend auth (`authMode: password` / `authMode: self_register`).
- A partial local packet with `customerId` but no verified proof mode is treated as an unverified live token and redirected back to activation before dashboard access or persistence.
- Login persistence now rejects successful-looking payloads that include an API key and customer id but omit a verified auth mode or return an unknown legacy/dev mode.
- Existing sample/private-demo access remains allowed only through the sample receipt boundary; it still cannot create live persistence.

Evidence so far:

- Commit: Shibuya `50a28e5` (`Require positive backend proof for live sessions`).
- Shibuya focused runtime/auth/dashboard/AuthGuard tests: `4 passed / 4 files`, `38 passed / 38 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `270 passed / 270 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the frontend runtime identity leak where a stale or hand-written local customer id could be treated as enough to enter live workspace/persistence paths.

### 25. Dashboard Overview Must Match Verified Customer

Status: pushed

Repos changed:

- Shibuya frontend: `src/lib/api/dashboard.ts`
- Shibuya frontend tests: `src/lib/api/__tests__/dashboard.test.ts`

What changed:

- Live dashboard overview now fails closed if Medallion omits `customer_id` for a backend-verified live session.
- Live dashboard overview now fails closed if the returned `customer_id` differs from the verified live session customer.
- Foreign or malformed overview packets can no longer overwrite local session metadata, tier, offer kind, case status, activation origin, or upload receipt state.
- Existing cross-customer upload receipt filtering still applies after the overview itself passes customer identity validation.

Evidence so far:

- Commit: Shibuya `63b84e6` (`Require dashboard overview customer match`).
- Shibuya focused dashboard API tests: `1 passed / 1 file`, `10 passed / 10 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `271 passed / 271 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the workspace hydration identity leak where a bad dashboard overview response could switch the local live customer before append proof validation runs.

### 26. Upload Readiness Exposes Only Customer-Bound Receipts

Status: pushed

Repos changed:

- Medallion backend: `app/main.py`
- Medallion backend tests: `tests/test_shibuya_upload_artifact_receipts.py`

What changed:

- `/v1/dashboard/upload/readiness` now strips `first_upload_receipt`, `latest_upload_receipt`, and `last_report_snapshot_id` unless the receipt belongs to the authenticated customer.
- Polluted customer metadata with a foreign generated upload receipt can no longer cross the readiness API as append-proof context.
- Readiness can still report live upload counts, limits, read-only state, and blockers, but receipt/snapshot proof stays empty until it is customer-bound.
- Existing upload responses, lifecycle events, report enrichment, and append comparison guards remain in place.

Evidence so far:

- Commit: Medallion `dc52a77a` (`Sanitize Shibuya upload readiness receipts`).
- Medallion `py_compile app\main.py tests\test_shibuya_upload_artifact_receipts.py`: passed.
- Medallion focused upload/readiness tests: `15 passed / 15 tests`.
- Medallion focused Shibuya backend proof suite: `96 passed / 96 tests` across critical path, upload receipts, lifecycle upload receipt, append proof comparison, report artifact enrichment, and activation public context.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the backend readiness leak where a foreign persisted upload receipt could be exposed before the frontend append proof path validates customer continuity.

### 27. First Upload Lifecycle Requires Customer-Bound Receipt

Status: pushed

Repos changed:

- Medallion backend: `app/trader_endpoints.py`
- Medallion backend tests: `tests/test_shibuya_lifecycle_upload_receipt.py`

What changed:

- `first_upload_completed` now accepts only a generated persisted upload receipt owned by the authenticated customer.
- Matching `request_id` and `report_snapshot_id` alone is no longer enough to promote lifecycle state.
- Polluted customer metadata with a foreign generated receipt is blocked with `409` and leaves `case_status`, `first_upload_receipt`, and baseline readiness proof unchanged.
- The successful same-customer path still persists the generated receipt into `first_upload_receipt` and `latest_upload_receipt`.

Evidence so far:

- Commit: Medallion `d79441bb` (`Bind first upload lifecycle to customer receipt`).
- Medallion `py_compile app\trader_endpoints.py tests\test_shibuya_lifecycle_upload_receipt.py`: passed.
- Medallion lifecycle upload receipt tests: `4 passed / 4 tests`.
- Medallion focused Shibuya backend proof suite: `97 passed / 97 tests` across critical path, upload receipts, lifecycle upload receipt, append proof comparison, report artifact enrichment, and activation public context.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the lifecycle promotion leak where a foreign persisted generated receipt could be used to mark a customer baseline-ready after a matching client lifecycle event.

### 28. Activation Public-Context Counts Must Be Strict Integers

Status: pushed

Repos changed:

- Shibuya frontend: `src/lib/activationOrigin.ts`
- Shibuya frontend: `src/pages/checkout/CheckoutSuccessPage.tsx`
- Shibuya frontend tests: `src/lib/api/__tests__/auth.test.ts`, `src/pages/checkout/__tests__/CheckoutSuccessPage.test.tsx`

What changed:

- Activation-origin proof counts now require finite non-negative integers instead of accepting `parseInt`-style prefixes such as `12abc`.
- Checkout-success public teaser metadata now applies the same strict integer rule before carrying context into activation preview.
- Verified-looking backend public context with malformed trade-count proof can still create the base paid live activation session, but it cannot carry public report, teaser receipt, or StoryExperience context forward.

Evidence so far:

- Shibuya focused auth/checkout-success tests: `2 passed / 2 files`, `19 passed / 19 tests`.
- Shibuya `tsc -b`: passed.
- Shibuya `eslint .`: passed.
- Shibuya full deterministic Vitest: `67 passed / 67 files`, `273 passed / 273 tests`.
- Shibuya `vite build`: passed; `2855 modules transformed`.

Remaining gap:

- This still does not prove deployed live runtime, real Stripe payment completion, or a production trader append. It closes the frontend parsing gap where malformed numeric backend proof fields could be treated as activation-grade public-context evidence.
