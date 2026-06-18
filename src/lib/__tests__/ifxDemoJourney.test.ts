import { describe, expect, test } from 'vitest'
import {
  IFX_DEMO_REPORT_ID,
  IFX_DEMO_SCENE_COUNT,
  buildIfxAppendProofGateParams,
  buildIfxDemoJourneyPaths,
  buildIfxGuidedDemoParams,
  buildIfxLockedInsightParams,
} from '../ifxDemoJourney'

describe('ifx demo journey', () => {
  test('builds the canonical public story handoff packet', () => {
    expect(IFX_DEMO_REPORT_ID).toBe('sample-behavioral-leak-report')
    expect(IFX_DEMO_SCENE_COUNT).toBe(6)
    expect(buildIfxGuidedDemoParams().toString()).toBe(
      'demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent',
    )
    expect(buildIfxLockedInsightParams('locked_insight').toString()).toBe(
      'demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent',
    )
    expect(buildIfxAppendProofGateParams().toString()).toBe(
      'demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&destination=append_proof',
    )
  })

  test('builds stable launcher paths for a market', () => {
    expect(buildIfxDemoJourneyPaths('global')).toMatchObject({
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
