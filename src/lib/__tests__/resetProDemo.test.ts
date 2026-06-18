import { describe, expect, test } from 'vitest'
import { buildResetProDemoScript } from '../resetProDemo'
import { getSampleWorkspaceOverview } from '../sampleWorkspace'

describe('Reset Pro demo script', () => {
  test('turns reset pro sample overview into a founder demo path', () => {
    const script = buildResetProDemoScript(getSampleWorkspaceOverview('reset_pro'))

    expect(script.headline).toContain('Reset Pro')
    expect(script.demoThesis).toContain('behavioral operating system')
    expect(script.steps.map((step) => step.route)).toEqual([
      '/dashboard',
      '/dashboard/slump',
      '/dashboard/alerts',
      '/dashboard/edges',
      '/dashboard/shadow-boxing',
      '/dashboard/upload',
    ])
    expect(script.proofArtifacts).toContain('Reset Pro Review Packet')
    expect(script.truthBoundary).toContain('demo data only')
    expect(script.truthBoundary).toContain('payment')
    expect(script.truthBoundary).toContain('first meaningful upload')
  })

  test('surfaces pressure metrics without making live-account claims', () => {
    const script = buildResetProDemoScript(getSampleWorkspaceOverview('reset_pro'))

    expect(script.pressureMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Behavioral leak', kind: 'money' }),
        expect.objectContaining({ label: 'Ruin pressure', kind: 'percent' }),
        expect.objectContaining({ label: 'Review status', kind: 'text' }),
      ]),
    )
    expect(script.pressureMetrics.find((metric) => metric.label === 'Review status')?.detail).toContain('private preview')
  })
})
