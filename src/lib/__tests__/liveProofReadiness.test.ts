import { describe, expect, test } from 'vitest'
import { buildLiveProofReadinessContract } from '../liveProofReadiness'

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
    expect(contract.boundary).toContain('Sample routes, URL context, and founder codes')
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
})
