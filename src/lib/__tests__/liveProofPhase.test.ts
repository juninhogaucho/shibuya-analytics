import { describe, expect, test } from 'vitest'
import { buildLiveProofPhase } from '../liveProofPhase'

const generatedReceipt = {
  upload_transport: 'paste',
  trades_uploaded: 18,
  report_snapshot_id: 'snap_live_018',
  report_id: 'report_live_018',
  artifact_status: 'generated',
  append_count: 1,
  request_id: 'req_live_018',
}

const backendAppendProof = {
  status: 'comparison_ready',
  upload_count: 2,
  baseline_snapshot_id: 'snap_live_018',
  latest_snapshot_id: 'snap_live_019',
  baseline_report_id: 'report_live_018',
  latest_report_id: 'report_live_019',
  latest_append_count: 2,
  latest_request_id: 'req_live_019',
  latest_artifact_status: 'generated',
  latest_upload_completed_at: '2026-06-21T10:00:00Z',
  latest_trades_uploaded: 21,
  activation_source: 'locked_insight',
  activation_report_id: 'free_report_123',
  activation_locked_section_id: 'edge-decay-map',
  activation_teaser_request_id: 'teaser_req_123',
  activation_teaser_trades_analyzed: 42,
  activation_teaser_worst_pattern: 'Edge decay',
  activation_teaser_verified: 'true',
  activation_teaser_verification_status: 'verified',
  activation_teaser_receipt_hash: 'a'.repeat(64),
  activation_teaser_verified_at: '2026-06-21T09:00:00Z',
  proof_boundary: 'Two durable generated upload snapshots are required before append proof can be claimed.',
}

describe('live proof phase', () => {
  test('keeps public visitors outside live proof states', () => {
    const phase = buildLiveProofPhase({ mode: 'anonymous', market: 'global' })

    expect(phase.phase).toBe('anonymous')
    expect(phase.canClaimLiveActivation).toBe(false)
    expect(phase.canClaimBaselineProof).toBe(false)
    expect(phase.canClaimAppendProof).toBe(false)
    expect(phase.nextAction.to).toBe('/upload?market=global')
  })

  test('keeps private sample receipts out of live proof states', () => {
    const phase = buildLiveProofPhase({
      mode: 'sample',
      sessionMeta: {
        market: 'global',
        samplePreview: 'reset_pro',
        demoSource: 'locked_insight',
        demoReportId: 'sample-report',
        demoPrivateGateChecksum: 'sample gate checksum',
        demoUnlockReceiptId: 'reset-pro-demo:sample-report',
        demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only.',
      },
    })

    expect(phase.phase).toBe('sample_preview')
    expect(phase.statusLabel).toBe('SAMPLE GATE RECEIPT')
    expect(phase.canClaimLiveActivation).toBe(false)
    expect(phase.canClaimBaselineProof).toBe(false)
    expect(phase.canClaimAppendProof).toBe(false)
    expect(phase.evidenceSource).toBe('sample')
  })

  test('separates live activation from first upload proof', () => {
    const phase = buildLiveProofPhase({
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
      },
      profileCompleted: true,
    })

    expect(phase.phase).toBe('activated_awaiting_upload')
    expect(phase.canClaimLiveActivation).toBe(true)
    expect(phase.canClaimBaselineProof).toBe(false)
    expect(phase.canClaimAppendProof).toBe(false)
    expect(phase.nextAction.to).toBe('/dashboard/upload')
  })

  test('requires generated artifact receipts before claiming baseline proof', () => {
    const phase = buildLiveProofPhase({
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'baseline_ready',
        latestUploadReceipt: {
          ...generatedReceipt,
          artifact_status: 'missing',
          report_snapshot_id: undefined,
        },
      },
      profileCompleted: true,
    })

    expect(phase.phase).toBe('activated_awaiting_upload')
    expect(phase.canClaimBaselineProof).toBe(false)
    expect(phase.generatedUploadReceiptCount).toBe(0)
  })

  test('rejects generated-looking receipts with proof validation errors or no uploaded trades', () => {
    const unverifiedPhase = buildLiveProofPhase({
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'baseline_ready',
        latestUploadReceipt: {
          ...generatedReceipt,
          proof_validation_error: 'Live upload proof requires a successful Medallion upload response.',
        },
      },
      profileCompleted: true,
    })

    expect(unverifiedPhase.phase).toBe('activated_awaiting_upload')
    expect(unverifiedPhase.canClaimBaselineProof).toBe(false)
    expect(unverifiedPhase.generatedUploadReceiptCount).toBe(0)

    const emptyUploadPhase = buildLiveProofPhase({
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'baseline_ready',
        latestUploadReceipt: {
          ...generatedReceipt,
          trades_uploaded: 0,
        },
      },
      profileCompleted: true,
    })

    expect(emptyUploadPhase.phase).toBe('activated_awaiting_upload')
    expect(emptyUploadPhase.canClaimBaselineProof).toBe(false)
    expect(emptyUploadPhase.generatedUploadReceiptCount).toBe(0)
  })

  test('promotes a generated upload receipt to baseline proof only', () => {
    const phase = buildLiveProofPhase({
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'baseline_ready',
        latestUploadReceipt: generatedReceipt,
      },
      profileCompleted: true,
    })

    expect(phase.phase).toBe('baseline_artifact_ready')
    expect(phase.canClaimLiveActivation).toBe(true)
    expect(phase.canClaimBaselineProof).toBe(true)
    expect(phase.canClaimAppendProof).toBe(false)
    expect(phase.evidenceSource).toBe('session')
    expect(phase.latestGeneratedReceipt?.request_id).toBe('req_live_018')
  })

  test('promotes repeated generated receipts to append proof', () => {
    const phase = buildLiveProofPhase({
      mode: 'live',
      overview: {
        bql_state: 'in_control',
        bql_score: 0.45,
        monte_carlo_drift: 0.12,
        ruin_probability: 0.04,
        discipline_tax_30d: 180,
        sharpe_scenario: 1.2,
        edge_portfolio: [],
        loyalty_unlock: null,
        next_coach_date: '2026-06-21',
        access_tier: 'reset_pro',
        offer_kind: 'reset_pro_live',
        case_status: 'baseline_ready',
        upload_receipt_history: [
          generatedReceipt,
          {
            ...generatedReceipt,
            report_snapshot_id: 'snap_live_019',
            report_id: 'report_live_019',
            append_count: 2,
            request_id: 'req_live_019',
          },
        ],
      },
      profileCompleted: true,
    })

    expect(phase.phase).toBe('append_proof_ready')
    expect(phase.canClaimAppendProof).toBe(true)
    expect(phase.evidenceSource).toBe('overview')
    expect(phase.generatedUploadReceiptCount).toBe(2)
    expect(phase.latestGeneratedReceipt?.request_id).toBe('req_live_019')
  })

  test('promotes backend append proof packets even when local receipt history is absent', () => {
    const phase = buildLiveProofPhase({
      mode: 'live',
      appendProof: backendAppendProof,
      profileCompleted: true,
    })

    expect(phase.phase).toBe('append_proof_ready')
    expect(phase.canClaimBaselineProof).toBe(true)
    expect(phase.canClaimAppendProof).toBe(true)
    expect(phase.evidenceSource).toBe('append_proof')
    expect(phase.generatedUploadReceiptCount).toBe(2)
    expect(phase.latestGeneratedReceipt).toMatchObject({
      artifact_status: 'generated',
      report_snapshot_id: 'snap_live_019',
      report_id: 'report_live_019',
      append_count: 2,
      request_id: 'req_live_019',
      activation_teaser_request_id: 'teaser_req_123',
      activation_teaser_verification_status: 'verified',
    })
  })

  test('does not promote incomplete backend append proof packets', () => {
    const phase = buildLiveProofPhase({
      mode: 'live',
      appendProof: {
        ...backendAppendProof,
        latest_artifact_status: 'pending',
      },
      profileCompleted: true,
    })

    expect(phase.phase).toBe('activated_awaiting_upload')
    expect(phase.canClaimBaselineProof).toBe(false)
    expect(phase.canClaimAppendProof).toBe(false)
    expect(phase.evidenceSource).toBe('none')
  })

  test('keeps backend-looking append proof out of sample mode', () => {
    const phase = buildLiveProofPhase({
      mode: 'sample',
      appendProof: backendAppendProof,
      sessionMeta: {
        market: 'global',
        samplePreview: 'reset_pro',
        demoSource: 'locked_insight',
        demoReportId: 'sample-report',
        demoPrivateGateChecksum: 'sample gate checksum',
        demoUnlockReceiptId: 'reset-pro-demo:sample-report',
        demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only.',
      },
    })

    expect(phase.phase).toBe('sample_preview')
    expect(phase.canClaimBaselineProof).toBe(false)
    expect(phase.canClaimAppendProof).toBe(false)
    expect(phase.evidenceSource).toBe('sample')
  })
})
