import { describe, expect, test } from 'vitest'
import { buildLiveProofReadinessContract } from '../liveProofReadiness'

const generatedReceipt = {
  upload_transport: 'paste',
  trades_uploaded: 18,
  report_snapshot_id: 'snap_live_018',
  report_id: 'report_live_018',
  artifact_status: 'generated',
  append_count: 1,
  request_id: 'req_live_018',
}

describe('live proof readiness', () => {
  test('blocks live proof claims when the production API target is missing', () => {
    const contract = buildLiveProofReadinessContract({
      apiBaseUrl: 'https://api-not-configured.invalid',
      backendConfigured: false,
    })

    expect(contract.statusLabel).toBe('LIVE BACKEND BLOCKED')
    expect(contract.headline).toBe('Live proof is blocked before the first real upload.')
    expect(contract.rows).toMatchObject([
      {
        label: 'Backend target',
        status: 'blocked',
      },
      {
        label: 'Activation',
        status: 'required',
      },
      {
        label: 'First meaningful upload',
        status: 'required',
      },
      {
        label: 'Append history',
        status: 'required',
      },
    ])
    expect(contract.rows[0].detail).toContain('VITE_API_BASE is missing')
    expect(contract.boundary).toContain('Sample routes, URL context, and presenter codes')
  })

  test('still requires evidence when a backend target is configured', () => {
    const contract = buildLiveProofReadinessContract({
      apiBaseUrl: 'https://api.shibuya.test',
      backendConfigured: true,
    })

    expect(contract.statusLabel).toBe('BACKEND TARGET PRESENT')
    expect(contract.headline).toBe('Live proof has a backend target, but still needs evidence.')
    expect(contract.rows[0]).toMatchObject({
      label: 'Backend target',
      status: 'ready',
    })
    expect(contract.rows.map((row) => row.label)).toEqual([
      'Backend target',
      'Activation',
      'First meaningful upload',
      'Append history',
    ])
    expect(contract.boundary).toContain('They cannot prove payment')
  })

  test('marks live activation ready without treating it as upload proof', () => {
    const contract = buildLiveProofReadinessContract({
      apiBaseUrl: 'https://api.shibuya.test',
      backendConfigured: true,
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'awaiting_upload',
      },
      profileCompleted: true,
    })

    expect(contract.statusLabel).toBe('LIVE ACTIVATION READY')
    expect(contract.headline).toBe('Activation opened the live workspace. Upload proof is still missing.')
    expect(contract.rows).toMatchObject([
      {
        label: 'Backend target',
        status: 'ready',
      },
      {
        label: 'Activation',
        status: 'ready',
      },
      {
        label: 'First meaningful upload',
        status: 'required',
      },
      {
        label: 'Append history',
        status: 'required',
      },
    ])
  })

  test('blocks sample receipts from satisfying live proof stages', () => {
    const contract = buildLiveProofReadinessContract({
      apiBaseUrl: 'https://api.shibuya.test',
      backendConfigured: true,
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

    expect(contract.statusLabel).toBe('SAMPLE ONLY')
    expect(contract.headline).toBe('Sample receipts cannot become live proof.')
    expect(contract.rows).toMatchObject([
      {
        label: 'Backend target',
        status: 'ready',
      },
      {
        label: 'Activation',
        status: 'blocked',
      },
      {
        label: 'First meaningful upload',
        status: 'blocked',
      },
      {
        label: 'Append history',
        status: 'blocked',
      },
    ])
    expect(contract.rows[1].detail).toContain('Sample or presenter-gated access')
    expect(contract.rows[2].detail).toContain('cannot create a live baseline artifact')
    expect(contract.rows[3].detail).toContain('route continuity only')
  })

  test('promotes generated live receipts through baseline and append proof only', () => {
    const baselineContract = buildLiveProofReadinessContract({
      apiBaseUrl: 'https://api.shibuya.test',
      backendConfigured: true,
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

    expect(baselineContract.statusLabel).toBe('BASELINE PROOF READY')
    expect(baselineContract.rows.map((row) => [row.label, row.status])).toEqual([
      ['Backend target', 'ready'],
      ['Activation', 'ready'],
      ['First meaningful upload', 'ready'],
      ['Append history', 'required'],
    ])
    expect(baselineContract.rows[2].detail).toContain('snap_live_018')
    expect(baselineContract.rows[2].detail).toContain('req_live_018')

    const appendContract = buildLiveProofReadinessContract({
      apiBaseUrl: 'https://api.shibuya.test',
      backendConfigured: true,
      mode: 'live',
      sessionMeta: {
        market: 'global',
        tier: 'reset_pro',
        offerKind: 'reset_pro_live',
        caseStatus: 'baseline_ready',
        uploadReceiptHistory: [
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

    expect(appendContract.statusLabel).toBe('APPEND PROOF READY')
    expect(appendContract.rows.map((row) => [row.label, row.status])).toEqual([
      ['Backend target', 'ready'],
      ['Activation', 'ready'],
      ['First meaningful upload', 'ready'],
      ['Append history', 'ready'],
    ])
    expect(appendContract.rows[3].detail).toContain('2 generated receipt')
  })
})
