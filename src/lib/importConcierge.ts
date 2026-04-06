import type { TraderProfileContext } from './types'
import type { UploadPlaybook } from './uploadPlaybook'
import { humanizeTraderMode } from './traderMode'

export interface ImportConciergeArtifact {
  id: string
  title: string
  summary: string
  filename: string
  body: string
}

export interface ImportConcierge {
  readinessScore: number
  readinessLabel: string
  firstMove: string
  rescueSteps: string[]
  hiddenGift: string
  artifacts: ImportConciergeArtifact[]
}

function sanitizeDate(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function buildBody(title: string, sections: string[]): string {
  return [
    title.toUpperCase(),
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '',
    ...sections,
  ].join('\n')
}

function getReadiness(profile: TraderProfileContext | null, playbook: UploadPlaybook): { score: number; label: string } {
  let score = 40

  if (profile?.completed) {
    score += 25
  }
  if (profile?.broker_platform.trim()) {
    score += 15
  }
  if ((profile?.primary_instruments.length ?? 0) > 0) {
    score += 10
  }
  if (playbook.sourceLabel.toLowerCase().includes('zerodha') || playbook.sourceLabel.toLowerCase().includes('trade history')) {
    score += 10
  }

  if (score >= 85) {
    return { score, label: 'Ready to upload cleanly' }
  }
  if (score >= 65) {
    return { score, label: 'Likely clean with light cleanup' }
  }
  return { score, label: 'Needs rescue path first' }
}

export function buildImportConcierge({
  profile,
  playbook,
  premiumAccess,
}: {
  profile: TraderProfileContext | null
  playbook: UploadPlaybook
  premiumAccess: boolean
}): ImportConcierge {
  const readiness = getReadiness(profile, playbook)
  const modeLabel = humanizeTraderMode(profile?.trader_mode ?? 'retail_fn0_struggler')
  const dateSuffix = sanitizeDate()
  const firstMove = profile?.completed
    ? `Start with ${playbook.sourceLabel}. Use the smallest honest recent block that exposes the real leak.`
    : 'Complete trader context first, then upload the smallest honest recent block you can cleanly explain.'
  const rescueSteps = [
    'Strip deposits, withdrawals, charges, and any ledger noise that is not a closed trade.',
    'Keep one row per closed trade and preserve timestamps in the original order.',
    'If the native export is ugly, move only the last 20-40 meaningful trades into the template and upload that first.',
    'If the parser still fights you, paste the clean subset manually before you waste time chasing perfect ingestion.',
  ]

  const artifacts: ImportConciergeArtifact[] = [
    {
      id: 'cleanup-checklist',
      title: 'Broker Cleanup Checklist',
      summary: 'The fastest way to turn a messy export into something Shibuya can use.',
      filename: `shibuya-broker-cleanup-checklist-${dateSuffix}.txt`,
      body: buildBody('Broker Cleanup Checklist', [
        'BEST SOURCE',
        playbook.sourceLabel,
        '',
        'CLEAN FIRST',
        ...playbook.steps.map((step) => `- ${step}`),
        '',
        'WATCHOUTS',
        ...playbook.watchouts.map((step) => `- ${step}`),
        '',
        'FALLBACK',
        playbook.fallbackSource,
      ]),
    },
    {
      id: 'contract-note-rescue',
      title: 'Contract Note Rescue Sheet',
      summary: 'How to survive V1 even if your broker only gives you ugly contract notes.',
      filename: `shibuya-contract-note-rescue-${dateSuffix}.txt`,
      body: buildBody('Contract Note Rescue Sheet', [
        'USE THIS WHEN',
        'Your broker export is unusable or you only have emailed contract notes.',
        '',
        'MOVE INTO THE TEMPLATE',
        '- Entry timestamp',
        '- Exit timestamp',
        '- Symbol',
        '- Size in lots / quantity',
        '- Realized PnL',
        '',
        'DO NOT WAIT FOR PERFECTION',
        'The first baseline only has to be honest enough to expose the leak. Clean beats comprehensive.',
      ]),
    },
    {
      id: 'first-block-selector',
      title: 'First Block Selector',
      summary: 'A small internal note for choosing the first upload window instead of dumping everything.',
      filename: `shibuya-first-block-selector-${dateSuffix}.txt`,
      body: buildBody('First Block Selector', [
        'START HERE',
        firstMove,
        '',
        'GOOD FIRST WINDOWS',
        '- The last session where you clearly tilted',
        '- A recent expiry-day cluster',
        '- A prop-rule scare sequence',
        '- The cleanest recent week if you are refining an existing edge',
        '',
        'CURRENT MODE',
        modeLabel,
      ]),
    },
  ]

  if (premiumAccess) {
    artifacts.push({
      id: 'upload-doctor-note',
      title: 'Upload Doctor Note',
      summary: 'Premium-only prep note so the first founder checkpoint starts from clean evidence.',
      filename: `shibuya-upload-doctor-note-${dateSuffix}.txt`,
      body: buildBody('Upload Doctor Note', [
        'PREMIUM EXPECTATION',
        'Do not bring a chaotic data pile into guided review. Bring the smallest clean evidence set that proves the problem.',
        '',
        'BRING',
        '- One recent behavior block',
        '- One clean block if you have it',
        '- The exact export source',
        '- The one question you need answered most',
        '',
        'WHY',
        'Premium means tighter interpretation, not more confusion.',
      ]),
    })
  }

  return {
    readinessScore: readiness.score,
    readinessLabel: readiness.label,
    firstMove,
    rescueSteps,
    hiddenGift: premiumAccess
      ? 'Hidden premium extra: the upload doctor note helps you arrive at guided review with a cleaner evidence set than most traders ever prepare.'
      : 'Hidden extra: the first-block selector exists to stop you from ruining the baseline with a giant messy dump.',
    artifacts,
  }
}

export function downloadImportConciergeArtifact(artifact: ImportConciergeArtifact): void {
  const blob = new Blob([artifact.body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = artifact.filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
