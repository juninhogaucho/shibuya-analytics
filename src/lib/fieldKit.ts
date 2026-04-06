import type { Market } from './market'
import type { PerformanceStory } from './performanceStory'
import type { CampaignMetrics, DashboardOverview, TraderProfileContext } from './types'
import { formatMoney, humanizeFocus, humanizeInstrument } from './display'

export interface FieldKitArtifact {
  id: string
  title: string
  badge: string
  summary: string
  filename: string
  body: string
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

function buildModeScript({
  overview,
  profile,
  story,
}: {
  overview: DashboardOverview
  profile: TraderProfileContext | null
  story: PerformanceStory
}): { title: string; sections: string[] } {
  const mode = overview.trader_mode ?? profile?.trader_mode ?? 'retail_fn0_struggler'
  const focus = profile
    ? `${humanizeFocus(profile.trader_focus)} on ${profile.primary_instruments.map(humanizeInstrument).join(', ')}`
    : 'Context still incomplete'

  if (mode === 'prop_eval_survival') {
    return {
      title: 'Rule-Survival Script',
      sections: [
        'CURRENT MODE',
        'You are in prop-eval survival mode. The rulebook is the first counterparty.',
        '',
        'NON-NEGOTIABLES',
        '- No reactive follow-up trade after a rule-threatening loss.',
        '- Size never expands because the clock is running.',
        '- If the session is compromised, survival wins over comeback fantasies.',
        '',
        'TODAY',
        `Focus: ${focus}`,
        `Enemy: ${story.currentEnemy}`,
        `Mission line: ${story.missionLine}`,
      ],
    }
  }

  if (mode === 'profitable_refiner') {
    return {
      title: 'Refinement Script',
      sections: [
        'CURRENT MODE',
        'You already have an edge. The mission is not to create more activity. The mission is to remove the execution leak.',
        '',
        'NON-NEGOTIABLES',
        '- Only A-plus setups count.',
        '- Any emotional push for extra size is drift, not opportunity.',
        '- End the session when quality drops, not only when the market closes.',
        '',
        'TODAY',
        `Focus: ${focus}`,
        `Enemy: ${story.currentEnemy}`,
        `Mission line: ${story.missionLine}`,
      ],
    }
  }

  return {
    title: 'Capital Protection Script',
    sections: [
      'CURRENT MODE',
      'You are in survival mode. The job is to stop paying tuition through repeated preventable mistakes.',
      '',
      'NON-NEGOTIABLES',
      '- No revenge trade after the first emotional hit.',
      '- No zero-to-hero sizing because one move looks fast.',
      '- If the gate is broken, the session is over.',
      '',
      'TODAY',
      `Focus: ${focus}`,
      `Enemy: ${story.currentEnemy}`,
      `Mission line: ${story.missionLine}`,
    ],
  }
}

export function buildFieldKitArtifacts({
  overview,
  profile,
  story,
  metrics,
  market,
  premiumAccess,
}: {
  overview: DashboardOverview
  profile: TraderProfileContext | null
  story: PerformanceStory
  metrics: CampaignMetrics
  market: Market
  premiumAccess: boolean
}): FieldKitArtifact[] {
  const filenameDate = sanitizeDate()
  const modeScript = buildModeScript({ overview, profile, story })
  const uploadsLine = overview.upload_limit != null
    ? `${overview.uploads_used ?? 0}/${overview.upload_limit} uploads used`
    : `${overview.upload_count ?? 0} uploads recorded in the live loop`

  const baseArtifacts: FieldKitArtifact[] = [
    {
      id: 'desk-card',
      title: 'Desk Card',
      badge: 'STATION CARD',
      summary: 'A one-page operating card for the next live session.',
      filename: `shibuya-desk-card-${filenameDate}.txt`,
      body: buildBody('Shibuya Desk Card', [
        'WHY THIS EXISTS',
        'A paid workspace should come with something you can keep next to the keyboard, not only screens to inspect.',
        '',
        'BEFORE FIRST ORDER',
        `Current enemy: ${story.currentEnemy}`,
        `Mission line: ${story.missionLine}`,
        `Command line: ${story.commandLine}`,
        '',
        'DO NOT PAY FOR',
        `Discipline leak in current window: ${formatMoney(overview.discipline_tax_30d, market)}`,
        `Recurring enemy: ${metrics.recurring_enemy}`,
        '',
        'TODAY',
        `Saved capital versus baseline: ${formatMoney(metrics.saved_capital_vs_baseline, market)}`,
        `Revenge-free streak: ${metrics.revenge_free_streak}`,
        `Size-discipline streak: ${metrics.size_discipline_streak}`,
      ]),
    },
    {
      id: 'kill-switch',
      title: 'Loss-of-Command Card',
      badge: 'EMERGENCY CARD',
      summary: 'What to do the moment the session stops being professional.',
      filename: `shibuya-loss-of-command-card-${filenameDate}.txt`,
      body: buildBody('Shibuya Loss-of-Command Card', [
        'TRIGGER CONDITIONS',
        '- Reactive follow-up after the first sloppy loss.',
        '- Size increase without a written plan.',
        '- Need to make it back today.',
        '',
        'KILL SWITCH',
        '1. Flatten exposure.',
        '2. Stop the platform for 20 minutes minimum.',
        '3. Log the lapse in the debrief before you reopen anything.',
        '4. If the same lapse happens again, session is finished.',
        '',
        'CURRENT CONTEXT',
        `Most dangerous session: ${metrics.most_dangerous_session}`,
        `Most broken standard: ${metrics.standards_broken_most_often}`,
        `Proof target: ${story.proofTarget}`,
      ]),
    },
    {
      id: 'mode-script',
      title: modeScript.title,
      badge: 'MODE SCRIPT',
      summary: 'A mode-specific playbook for the exact battle this trader is fighting.',
      filename: `shibuya-mode-script-${filenameDate}.txt`,
      body: buildBody(modeScript.title, modeScript.sections),
    },
    {
      id: 'seven-session-scorecard',
      title: 'Next 7 Sessions Scorecard',
      badge: 'SCORECARD',
      summary: 'A short private scorecard to track whether the next week is actually cleaner.',
      filename: `shibuya-next-7-sessions-scorecard-${filenameDate}.txt`,
      body: buildBody('Next 7 Sessions Scorecard', [
        'HOW TO USE THIS',
        'Do not rate profit. Rate composure, standards, and avoided stupidity.',
        '',
        'CURRENT BASELINE',
        `Clean sessions logged: ${metrics.clean_session_count}`,
        `Best controlled week: ${metrics.best_controlled_week}`,
        `Uploads / continuity: ${uploadsLine}`,
        '',
        'TRACK',
        '- Gate obeyed?',
        '- Revenge avoided?',
        '- Size respected?',
        '- Stopped correctly when needed?',
        '- One line for tomorrow written?',
        '',
        'TARGET',
        `Beat this line: ${metrics.last_real_improvement}`,
      ]),
    },
  ]

  if (!premiumAccess) {
    return baseArtifacts
  }

  return [
    ...baseArtifacts,
    {
      id: 'founder-review-prep',
      title: 'Founder Review Prep Packet',
      badge: 'PREMIUM',
      summary: 'A prep packet for guided review so the call sharpens the next action instead of rehashing the obvious.',
      filename: `shibuya-founder-review-prep-${filenameDate}.txt`,
      body: buildBody('Founder Review Prep Packet', [
        'SHOW UP WITH THIS',
        `Campaign chapter: ${story.campaignChapter}`,
        `Operator identity: ${story.operatorIdentity}`,
        `Current enemy: ${story.currentEnemy}`,
        `Mission line: ${story.missionLine}`,
        '',
        'WHAT CHANGED',
        `Saved capital vs baseline: ${formatMoney(metrics.saved_capital_vs_baseline, market)}`,
        `Standards held most often: ${metrics.standards_held_most_often}`,
        `Standards broken most often: ${metrics.standards_broken_most_often}`,
        '',
        'WHAT TO ASK',
        '- Which lapse is still killing the process fastest?',
        '- What one rule would remove the most future damage?',
        '- What gets cut immediately for the next seven sessions?',
        '',
        'NEXT ACTION',
        overview.next_action ?? 'Carry the stricter command into the next seven sessions.',
      ]),
    },
  ]
}

export function downloadFieldKitArtifact(artifact: FieldKitArtifact): void {
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
