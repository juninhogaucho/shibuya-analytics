import { describe, expect, test } from 'vitest'
import {
  buildPredictedFingerprint,
  buildBehavioralPressureIndex,
  buildFreeReportPreview,
  buildLockedInsightPreview,
  buildPublicStoryDemoScript,
  createInitialStorySignal,
  getBehavioralPressureBand,
  getDominantFingerprintAxis,
  recordPricingInterest,
  recordSceneView,
  recordUploadIntent,
  selectArchetype,
  STORY_SCENES,
  togglePainAxis,
} from '../storyExperience'

describe('story experience signal model', () => {
  test('keeps public story scene copy ASCII-safe for demo surfaces and logs', () => {
    for (const scene of STORY_SCENES) {
      expect([...`${scene.title}${scene.body}${scene.proof}${scene.visualCue}`].every((character) => character.charCodeAt(0) <= 0x7f)).toBe(true)
    }
  })

  test('starts as a provisional neutral fingerprint', () => {
    const fingerprint = buildPredictedFingerprint(createInitialStorySignal())

    expect(fingerprint).toHaveLength(8)
    expect(fingerprint.every((axis) => axis.score === 34)).toBe(true)
  })

  test('raises axes based on archetype, pain taps, pricing curiosity, and upload intent', () => {
    let signal = createInitialStorySignal()
    signal = selectArchetype(signal, 'priya')
    signal = togglePainAxis(signal, 'drawdown_pressure')
    signal = recordPricingInterest(signal)
    signal = recordUploadIntent(signal)
    signal = recordSceneView(signal, 'cold-open')
    signal = recordSceneView(signal, 'archetypes')

    const fingerprint = buildPredictedFingerprint(signal)
    const dominant = getDominantFingerprintAxis(fingerprint)

    expect(dominant.id).toBe('drawdown_pressure')
    expect(dominant.score).toBeGreaterThan(70)
    expect(fingerprint.find((axis) => axis.id === 'revenge_reentry')?.score).toBeGreaterThan(40)
  })

  test('computes a bounded website-level behavioral pressure index', () => {
    let signal = createInitialStorySignal()
    signal = selectArchetype(signal, 'priya')
    signal = togglePainAxis(signal, 'drawdown_pressure')
    signal = togglePainAxis(signal, 'revenge_reentry')
    signal = recordUploadIntent(signal)

    const pressureIndex = buildBehavioralPressureIndex(buildPredictedFingerprint(signal))
    const band = getBehavioralPressureBand(pressureIndex)

    expect(pressureIndex).toBeGreaterThanOrEqual(52)
    expect(pressureIndex).toBeLessThanOrEqual(92)
    expect(['pressure_building', 'intervention_candidate']).toContain(band.id)
  })

  test('builds a public story demo script with truthful claim boundaries', () => {
    let signal = createInitialStorySignal()
    signal = selectArchetype(signal, 'marco')
    signal = togglePainAxis(signal, 'edge_decay')
    signal = recordUploadIntent(signal)
    signal = recordSceneView(signal, 'cold-open')
    signal = recordSceneView(signal, 'archetypes')

    const script = buildPublicStoryDemoScript(signal)

    expect(script.headline).toBe('Run the public story as a proof handoff, not a feature tour.')
    expect(script.operatorBrief).toContain('Marco: Profitable refiner')
    expect(script.operatorBrief).toContain('leading axis: Edge Decay')
    expect(script.moments.map((moment) => moment.title)).toEqual([
      'Recognition',
      'Fingerprint',
      'Evidence Ask',
      'Private Question',
    ])
    expect(script.moments[1].say).toContain('Edge Decay')
    expect(script.allowedClaims).toContain('This public story builds a website-level hypothesis.')
    expect(script.allowedClaims).toContain('The locked private insight carries a question into the paid or presenter-gated workspace.')
    expect(script.forbiddenClaims).toContain('Do not say Shibuya analyzed the visitor account from the story page.')
    expect(script.forbiddenClaims).toContain('Do not promise profit, challenge pass rates, or drawdown reduction.')
    expect(script.nextAction).toContain('locked private question')
  })

  test('builds the free report preview with unlocked and locked sections', () => {
    const report = buildFreeReportPreview({
      reportId: 'sample-report',
      archetypeId: 'marco',
      axisId: 'edge_decay',
    })

    expect(report.reportId).toBe('sample-report')
    expect(report.archetype.id).toBe('marco')
    expect(report.dominantAxis.id).toBe('edge_decay')
    expect(report.pressureIndex).toBeGreaterThan(0)
    expect(report.pressureBand.label).toBeTruthy()
    expect(report.recommendedPath.cta).toBeTruthy()
    expect(report.unlocked).toHaveLength(6)
    expect(report.locked.map((section) => section.title)).toContain('Next-session state warning')
    expect(report.privateInsightGate.headline).toContain('edge decay')
    expect(report.privateInsightGate.evidenceRequired).toContain(
      'A next-session mandate linked to the detected state, not to a buy/sell recommendation.',
    )
    expect(report.privateInsightGate.refusesToClaim).toContain('No guaranteed profit uplift.')
    expect(report.resetProBridge.headline).toContain('edge decay')
    expect(report.resetProBridge.decisionQuestion).toContain('setup')
    expect(report.resetProBridge.liveWorkspaceMustProve).toContain(
      'Enough repeated setup history to mark stable, watchlist, or decayed behavior.',
    )
    expect(report.resetProBridge.privatePreviewShows).toContain(
      'The exact boundary between demo structure and live account evidence.',
    )
    expect(report.conversionLine).toContain('live workspace')
  })

  test('carries guided story handoff into the free report fingerprint', () => {
    const report = buildFreeReportPreview({
      reportId: 'guided-report',
      archetypeId: 'priya',
      axisId: 'drawdown_pressure',
      storySource: 'guided',
      selectedPainAxisIds: ['drawdown_pressure', 'revenge_reentry', 'not-real', 'drawdown_pressure'],
      visitedSceneCount: 9,
    })

    expect(report.storyHandoff).toMatchObject({
      source: 'guided',
      visitedSceneCount: 9,
      summary: 'Guided StoryExperience signal: 9 scenes viewed; public pain axes: Drawdown Pressure, Revenge Re-entry.',
    })
    expect(report.storyHandoff.selectedPainAxes.map((axis) => axis.id)).toEqual(['drawdown_pressure', 'revenge_reentry'])
    expect(report.scores.find((axis) => axis.id === 'revenge_reentry')?.score).toBeGreaterThan(60)
    expect(report.storyHandoff.boundary).toContain('website-level handoff')
    expect(report.resetProBridge.headline).toContain('pressure changes the account')
    expect(report.resetProBridge.decisionQuestion).toContain('drawdown line')
  })

  test('builds module-specific locked insight previews', () => {
    const report = buildFreeReportPreview({
      reportId: 'sample-report',
      archetypeId: 'marco',
      axisId: 'edge_decay',
    })
    const preview = buildLockedInsightPreview(report, 'edge-decay-map')

    expect(preview.sectionTitle).toBe('Edge decay map')
    expect(preview.thesis).toContain('separates real edge decay from ordinary variance')
    expect(preview.liveWorkspaceShows).toContain('Setup clusters marked stable, watchlist, or decayed.')
    expect(preview.demoMayPreview).toContain('Sample edge portfolio structure.')
    expect(preview.proofRequired).toContain('Enough historical trades to compare setup behavior across windows.')
  })
})
