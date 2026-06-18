import { describe, expect, test } from 'vitest'
import {
  buildPredictedFingerprint,
  buildBehavioralPressureIndex,
  buildFreeReportPreview,
  buildLockedInsightPreview,
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
      expect(`${scene.title}${scene.body}${scene.proof}${scene.visualCue}`).toMatch(/^[\x00-\x7F]*$/)
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
