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

  test('carries public report origin into the private demo script without treating it as proof', () => {
    const script = buildResetProDemoScript(getSampleWorkspaceOverview('reset_pro'), {
      source: 'free_report',
      reportId: 'free-report-123',
      archetypeLabel: 'Priya: Prop evaluation survivor',
      axisLabel: 'Drawdown Pressure',
      reportSource: 'sample',
      evidenceLabel: 'Sample history packet',
      validationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
      lockedSectionId: 'highest-cost-state',
      lockedSectionTitle: 'Highest-cost state',
    })

    expect(script.originCard?.title).toBe('Carried in from the public report')
    expect(script.originCard?.facts).toContain('Origin report: free-report-123')
    expect(script.originCard?.facts).toContain('Public archetype: Priya: Prop evaluation survivor')
    expect(script.originCard?.facts).toContain('Predicted axis: Drawdown Pressure')
    expect(script.originCard?.facts).toContain('Public packet source: sample')
    expect(script.originCard?.facts).toContain('Handoff evidence: Sample history packet')
    expect(script.originCard?.facts).toContain('Validation note: Demo packet accepted. This proves the public journey transition, not live analytics.')
    expect(script.originCard?.facts).toContain('Requested private insight: Highest-cost state')
    expect(script.originCard?.body).toContain('not proof')
  })

  test('labels locked-insight origins distinctly from generic free-report origins', () => {
    const script = buildResetProDemoScript(getSampleWorkspaceOverview('reset_pro'), {
      source: 'locked_insight',
      reportId: 'free-report-123',
      lockedSectionId: 'edge-decay-map',
      lockedSectionTitle: 'Edge decay map',
    })

    expect(script.originCard?.title).toBe('Carried in from locked private insight')
    expect(script.originCard?.facts).toContain('Requested private insight: Edge decay map')
  })
})
