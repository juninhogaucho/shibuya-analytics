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
})
