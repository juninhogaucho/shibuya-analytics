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

Status: validated, pending commit/push

Commit:

- Pending

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
- Commit and push are still pending for both repos.
