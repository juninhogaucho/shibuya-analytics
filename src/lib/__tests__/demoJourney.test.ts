import { describe, expect, test } from 'vitest'
import {
  SHIBUYA_DEMO_REPORT_ID,
  SHIBUYA_DEMO_SCENE_COUNT,
  SHIBUYA_DEMO_OPERATOR_RUNBOOK,
  buildAppendProofGateParams,
  buildDemoJourneyPaths,
  buildGuidedDemoParams,
  buildLockedInsightParams,
} from '../demoJourney'

describe('demo journey', () => {
  test('builds the canonical public story handoff packet', () => {
    expect(SHIBUYA_DEMO_REPORT_ID).toBe('sample-behavioral-leak-report')
    expect(SHIBUYA_DEMO_SCENE_COUNT).toBe(6)
    expect(buildGuidedDemoParams().toString()).toBe(
      'demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent',
    )
    expect(buildLockedInsightParams('locked_insight').toString()).toBe(
      'demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent',
    )
    expect(buildAppendProofGateParams().toString()).toBe(
      'demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&destination=append_proof',
    )
  })

  test('exports the canonical three-minute operator run sheet', () => {
    expect(SHIBUYA_DEMO_OPERATOR_RUNBOOK).toHaveLength(5)
    expect(SHIBUYA_DEMO_OPERATOR_RUNBOOK.map((beat) => beat.title)).toEqual([
      'Open with the wedge',
      'Name the mirror',
      'Make upload the evidence step',
      'Turn the answer into a locked question',
      'Close on Reset Pro, then append proof',
    ])
    expect(SHIBUYA_DEMO_OPERATOR_RUNBOOK[0].say).toContain('Every provider sells dashboards')
    expect(SHIBUYA_DEMO_OPERATOR_RUNBOOK[2].boundary).toContain('Sample packet proves demo continuity only')
    expect(SHIBUYA_DEMO_OPERATOR_RUNBOOK[4].boundary).toContain('No improvement claim')
  })

  test('builds stable launcher paths for a market', () => {
    expect(buildDemoJourneyPaths('global')).toMatchObject({
      storyPath: '/story?market=global',
      uploadPath:
        '/upload?demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
      reportPath:
        '/report/sample-behavioral-leak-report?demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
      lockedInsightPath:
        '/insight/edge-decay-map?demo_packet=launcher_sample&source=guided_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
      privateDemoPath:
        '/private-demo?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
      appendProofPath:
        '/private-demo?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&destination=append_proof&market=global',
      activationPath:
        '/activate?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    })
  })
})
