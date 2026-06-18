import { describe, expect, test } from 'vitest'
import { buildResetProDemoScript } from '../resetProDemo'
import { getSampleWorkspaceOverview } from '../sampleWorkspace'

describe('Reset Pro demo script', () => {
  test('turns reset pro sample overview into a founder demo path', () => {
    const script = buildResetProDemoScript(getSampleWorkspaceOverview('reset_pro'))

    expect(script.headline).toContain('Reset Pro')
    expect(script.demoThesis).toContain('behavioral operating system')
    expect(script.showSequence.map((moment) => moment.timebox)).toEqual([
      '0:00-0:30',
      '0:30-1:15',
      '1:15-2:10',
      '2:10-3:00',
    ])
    expect(script.showSequence[0].title).toBe('Start from the public recognition moment')
    expect(script.showSequence[3].show).toContain('Append proof flow')
    expect(script.unlockReceipt).toMatchObject({
      statusLabel: 'DIRECT DEMO RECEIPT',
      headline: 'Reset Pro opened without public context; frame this as a cold sample workspace.',
      nextAction: 'Run Mission HQ first, inspect one intervention surface, then close on append proof.',
    })
    expect(script.unlockReceipt.facts).toContain('Report carried: none')
    expect(script.unlockReceipt.facts).toContain('Evidence packet: direct demo only')
    expect(script.unlockReceipt.boundary).toContain('does not prove live activation')
    expect(script.proofLadder).toEqual([
      expect.objectContaining({
        label: 'Public recognition',
        status: 'warning',
        boundary: 'Recognition routes the walkthrough. It is not account evidence.',
      }),
      expect.objectContaining({
        label: 'Report handoff packet',
        status: 'warning',
      }),
      expect.objectContaining({
        label: 'Locked private question',
        status: 'warning',
      }),
      expect.objectContaining({
        label: 'Sample command center',
        status: 'ready',
      }),
      expect.objectContaining({
        label: 'Append-proof exit',
        status: 'locked',
      }),
    ])
    expect(script.readinessChecklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Public context carried',
          status: 'warning',
        }),
        expect.objectContaining({
          label: 'Sample boundary visible',
          status: 'ready',
        }),
        expect.objectContaining({
          label: 'Append-proof exit',
          status: 'ready',
        }),
      ]),
    )
    expect(script.steps.map((step) => step.route)).toEqual([
      '/dashboard',
      '/dashboard/slump',
      '/dashboard/alerts',
      '/dashboard/edges',
      '/dashboard/shadow-boxing',
      '/dashboard/upload',
    ])
    expect(script.presenterRoute.map((step) => step.phaseLabel)).toEqual([
      'START HERE',
      'SHOW NEXT',
      'SHOW NEXT',
      'SHOW NEXT',
      'SHOW NEXT',
      'CLOSE HERE',
    ])
    expect(script.presenterRoute[0]).toMatchObject({
      label: '1. Mission HQ',
      routeLabel: 'Start Mission HQ',
      boundary: 'Direct demo entry only; call out that no public report handoff is attached.',
    })
    expect(script.presenterRoute[5]).toMatchObject({
      label: '6. Append proof',
      routeLabel: 'Close On Append Proof',
      boundary: 'End on append-proof. Live improvement claims require account activation and repeated uploads.',
    })
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
      storySource: 'guided',
      selectedPainAxisLabels: ['Drawdown Pressure'],
      visitedSceneCount: 4,
      signalMarkerLabels: ['Mirror selected', 'Pain axis tapped', 'Evidence intent'],
      lockedSectionId: 'highest-cost-state',
      lockedSectionTitle: 'Highest-cost state',
      bridgeDecisionQuestion: 'Does the trader become a different operator near the drawdown line?',
    })

    expect(script.originCard?.title).toBe('Carried in from the public report')
    expect(script.originCard?.facts).toContain('Origin report: free-report-123')
    expect(script.originCard?.facts).toContain('Public archetype: Priya: Prop evaluation survivor')
    expect(script.originCard?.facts).toContain('Predicted axis: Drawdown Pressure')
    expect(script.originCard?.facts).toContain('Public packet source: sample')
    expect(script.originCard?.facts).toContain('Handoff evidence: Sample history packet')
    expect(script.originCard?.facts).toContain('Validation note: Demo packet accepted. This proves the public journey transition, not live analytics.')
    expect(script.originCard?.facts).toContain('Public signal markers: Mirror selected, Pain axis tapped, Evidence intent')
    expect(script.originCard?.facts).toContain('Requested private insight: Highest-cost state')
    expect(script.originCard?.body).toContain('not proof')
    expect(script.unlockReceipt.statusLabel).toBe('UNLOCK RECEIPT')
    expect(script.unlockReceipt.headline).toBe('Reset Pro received the public question; the sample workspace can only show the operating loop.')
    expect(script.unlockReceipt.facts).toContain('Report carried: free-report-123')
    expect(script.unlockReceipt.facts).toContain('Locked question: Highest-cost state')
    expect(script.unlockReceipt.facts).toContain('Story route: guided; scenes 4')
    expect(script.unlockReceipt.facts).toContain('Evidence packet: Sample history packet')
    expect(script.unlockReceipt.facts).toContain('Public markers: Mirror selected, Pain axis tapped, Evidence intent')
    expect(script.showSequence[0].title).toBe('Connect the public pain to the private module')
    expect(script.showSequence[0].say).toContain('Does the trader become a different operator near the drawdown line?')
    expect(script.showSequence[0].boundary).toContain('not proof')
    expect(script.readinessChecklist.find((item) => item.label === 'Public context carried')?.status).toBe('ready')
    expect(script.readinessChecklist.find((item) => item.label === 'Public context carried')?.detail).toContain('Report, archetype, axis')
    expect(script.presenterRoute[0].boundary).toBe('Use carried public context as the opening brief, not as account proof.')
    expect(script.presenterRoute[1].boundary).toBe('Show the surface as sample workflow answering the carried private question.')
    expect(script.proofLadder).toEqual([
      expect.objectContaining({
        label: 'Public recognition',
        status: 'ready',
        evidence: 'Story handoff: guided; scenes 4; axes Drawdown Pressure.',
      }),
      expect.objectContaining({
        label: 'Report handoff packet',
        status: 'ready',
        evidence: 'Sample history packet from sample.',
      }),
      expect.objectContaining({
        label: 'Locked private question',
        status: 'ready',
        evidence: 'Does the trader become a different operator near the drawdown line?',
      }),
      expect.objectContaining({
        label: 'Sample command center',
        status: 'ready',
      }),
      expect.objectContaining({
        label: 'Append-proof exit',
        status: 'locked',
      }),
    ])
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
