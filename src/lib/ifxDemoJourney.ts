import { addMarketToPath, type Market } from './market'
import {
  DEMO_LAUNCHER_SAMPLE_PACKET_PARAM,
  DEMO_LAUNCHER_SAMPLE_PACKET_VALUE,
} from './publicReportSession'

export const IFX_DEMO_REPORT_ID = 'sample-behavioral-leak-report'
export const IFX_DEMO_ARCHETYPE_ID = 'marco'
export const IFX_DEMO_AXIS_ID = 'edge_decay'
export const IFX_DEMO_LOCKED_SECTION_ID = 'edge-decay-map'
export const IFX_DEMO_SCENE_COUNT = 6
export const IFX_DEMO_SIGNAL_MARKERS = 'mirror_selected,pain_axis_selected,scene_depth_light,upload_intent'
export const IFX_DEMO_STORY_SCENE_IDS = [
  'cold-open',
  'pnl-lie',
  'vaep',
  'archetypes',
  'predicted-reveal',
  'upload-moment',
] as const

export function buildIfxGuidedDemoParams(): URLSearchParams {
  return new URLSearchParams({
    [DEMO_LAUNCHER_SAMPLE_PACKET_PARAM]: DEMO_LAUNCHER_SAMPLE_PACKET_VALUE,
    archetype: IFX_DEMO_ARCHETYPE_ID,
    axis: IFX_DEMO_AXIS_ID,
    story: 'guided',
    scene_count: String(IFX_DEMO_SCENE_COUNT),
    pain_axes: IFX_DEMO_AXIS_ID,
    signals: IFX_DEMO_SIGNAL_MARKERS,
  })
}

export function buildIfxDemoReportParams(): URLSearchParams {
  return new URLSearchParams({
    [DEMO_LAUNCHER_SAMPLE_PACKET_PARAM]: DEMO_LAUNCHER_SAMPLE_PACKET_VALUE,
    archetype: IFX_DEMO_ARCHETYPE_ID,
    axis: IFX_DEMO_AXIS_ID,
    story: 'guided',
    scene_count: String(IFX_DEMO_SCENE_COUNT),
    pain_axes: IFX_DEMO_AXIS_ID,
    signals: IFX_DEMO_SIGNAL_MARKERS,
  })
}

export function buildIfxLockedInsightParams(source: 'guided_report' | 'locked_insight'): URLSearchParams {
  const params = new URLSearchParams({
    [DEMO_LAUNCHER_SAMPLE_PACKET_PARAM]: DEMO_LAUNCHER_SAMPLE_PACKET_VALUE,
    source,
    report: IFX_DEMO_REPORT_ID,
    archetype: IFX_DEMO_ARCHETYPE_ID,
    axis: IFX_DEMO_AXIS_ID,
  })

  if (source === 'locked_insight') {
    params.set('section', IFX_DEMO_LOCKED_SECTION_ID)
  }

  params.set('story', 'guided')
  params.set('scene_count', String(IFX_DEMO_SCENE_COUNT))
  params.set('pain_axes', IFX_DEMO_AXIS_ID)
  params.set('signals', IFX_DEMO_SIGNAL_MARKERS)

  return params
}

export function buildIfxAppendProofGateParams(): URLSearchParams {
  const params = buildIfxLockedInsightParams('locked_insight')
  params.set('destination', 'append_proof')
  return params
}

export function buildIfxDemoJourneyPaths(market: Market) {
  return {
    storyPath: addMarketToPath('/story', market),
    uploadPath: addMarketToPath(`/upload?${buildIfxGuidedDemoParams().toString()}`, market),
    reportPath: addMarketToPath(`/report/${IFX_DEMO_REPORT_ID}?${buildIfxDemoReportParams().toString()}`, market),
    lockedInsightPath: addMarketToPath(
      `/insight/${IFX_DEMO_LOCKED_SECTION_ID}?${buildIfxLockedInsightParams('guided_report').toString()}`,
      market,
    ),
    privateDemoPath: addMarketToPath(`/private-demo?${buildIfxLockedInsightParams('locked_insight').toString()}`, market),
    appendProofPath: addMarketToPath(`/private-demo?${buildIfxAppendProofGateParams().toString()}`, market),
    activationPath: addMarketToPath(`/activate?${buildIfxLockedInsightParams('locked_insight').toString()}`, market),
  }
}
