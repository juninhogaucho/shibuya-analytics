export type PublicJourneyStage = 'story' | 'upload' | 'report' | 'insight' | 'demo' | 'append'

export type PublicJourneyStageState = 'complete' | 'active' | 'locked'

export interface PublicJourneyContractStage {
  id: PublicJourneyStage
  label: string
  title: string
  boundary: string
  userJob: string
  proofContract: string
}

export const PUBLIC_JOURNEY_CONTRACT_MODE =
  'public StoryExperience -> locked upload/report/private insight -> private Reset Pro workspace demo'

export const PUBLIC_JOURNEY_CONTRACT: readonly PublicJourneyContractStage[] = [
  {
    id: 'story',
    label: '01',
    title: 'Public story',
    boundary: 'Website-level recognition only.',
    userJob: 'Recognize the state problem before upload.',
    proofContract: 'May carry public interaction context; cannot claim account-specific evidence.',
  },
  {
    id: 'upload',
    label: '02',
    title: 'Upload packet',
    boundary: 'Local handoff or live normalization.',
    userJob: 'Confirm or reject the provisional fingerprint with evidence.',
    proofContract: 'Must label sample/local packets separately from live backend-normalized uploads.',
  },
  {
    id: 'report',
    label: '03',
    title: 'Free baseline',
    boundary: 'One sharp preview, private proof still locked.',
    userJob: 'See one painful baseline and the private question it creates.',
    proofContract: 'May show unlocked recognition; locked causal maps stay behind live proof or sample-only demo boundaries.',
  },
  {
    id: 'insight',
    label: '04',
    title: 'Private insight lock',
    boundary: 'Shows what evidence must exist first.',
    userJob: 'Name the exact private question before checkout or demo access.',
    proofContract: 'Must carry the report, section, public handoff, and evidence status without pretending to answer the question.',
  },
  {
    id: 'demo',
    label: '05',
    title: 'Reset Pro demo',
    boundary: 'Presenter-gated sample workspace.',
    userJob: 'Inspect the operating loop that would test the private question.',
    proofContract: 'Must show sample/private-demo receipt state and refuse production-auth, payment, upload, or improvement claims.',
  },
  {
    id: 'append',
    label: '06',
    title: 'Append proof close',
    boundary: 'Demo ends where live evidence must begin.',
    userJob: 'End on the first follow-up proof action, not dashboard wandering.',
    proofContract: 'Must make first meaningful upload and repeat append history the live proof target.',
  },
] as const

export function getPublicJourneyStageIndex(stage: PublicJourneyStage): number {
  return PUBLIC_JOURNEY_CONTRACT.findIndex((candidate) => candidate.id === stage)
}

export function getPublicJourneyStage(stage: PublicJourneyStage): PublicJourneyContractStage {
  return PUBLIC_JOURNEY_CONTRACT[getPublicJourneyStageIndex(stage)]
}

export function getPublicJourneyStageState(
  stage: PublicJourneyStage,
  activeStage: PublicJourneyStage,
): PublicJourneyStageState {
  const stageIndex = getPublicJourneyStageIndex(stage)
  const activeIndex = getPublicJourneyStageIndex(activeStage)

  if (stageIndex < activeIndex) {
    return 'complete'
  }

  if (stageIndex === activeIndex) {
    return 'active'
  }

  return 'locked'
}
