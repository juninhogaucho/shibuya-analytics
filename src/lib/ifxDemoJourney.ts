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

export interface IfxDemoOperatorBeat {
  beat: string
  timebox: string
  title: string
  say: string
  show: string
  boundary: string
}

export const IFX_DEMO_OPERATOR_RUNBOOK: IfxDemoOperatorBeat[] = [
  {
    beat: '01',
    timebox: '0:00-0:30',
    title: 'Open with the wedge',
    say: 'Every provider sells dashboards. Shibuya starts with the trader state that keeps repeating before the result.',
    show: 'Public story headline, journey spine, and Marco / Edge Decay demo packet.',
    boundary: 'This is recognition, not account analysis.',
  },
  {
    beat: '02',
    timebox: '0:30-1:10',
    title: 'Name the mirror',
    say: 'The uncomfortable question is not whether Marco needs another metric. It is whether his edge is decaying while his confidence stays high.',
    show: 'Story scene, public fingerprint, pressure index, and selected pain axis.',
    boundary: 'The website can route this hypothesis only. Upload has to test it.',
  },
  {
    beat: '03',
    timebox: '1:10-1:55',
    title: 'Make upload the evidence step',
    say: 'Shibuya does not ask for belief. The sample upload shows what survives when the story becomes a report packet.',
    show: 'Guided upload, sample report, report handoff receipt, and locked insight.',
    boundary: 'Sample packet proves demo continuity only; live proof needs backend activation and real history.',
  },
  {
    beat: '04',
    timebox: '1:55-2:35',
    title: 'Turn the answer into a locked question',
    say: 'The private layer should not reveal magic. It should preserve the question the live workspace must answer.',
    show: 'Locked insight, private gate checksum, engagement receipt, and founder boundary.',
    boundary: 'Private demo can show workflow relevance only.',
  },
  {
    beat: '05',
    timebox: '2:35-3:00',
    title: 'Close on Reset Pro, then append proof',
    say: 'The moat is not a pretty dashboard. It is the loop: mirror, proof, mandate, append, then repeat.',
    show: 'Reset Pro sample workspace and append-proof close.',
    boundary: 'No improvement claim until repeated live uploads and generated artifacts exist.',
  },
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
