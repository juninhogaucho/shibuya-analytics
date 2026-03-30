import type { AlertItem, DashboardOverview, SlumpPrescription } from './types'

export interface TradingMandate {
  tone: 'protect' | 'focus' | 'press'
  headline: string
  summary: string
  doNow: string[]
  stopNow: string[]
  reviewNext: string[]
  cta: {
    label: string
    to: string
  }
}

function humanizeState(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function listEdges(names: string[]): string {
  if (names.length === 0) return 'your decayed setups'
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, 2).join(', ')}, and ${names.length - 2} more`
}

export function buildTradingMandate(overview: DashboardOverview): TradingMandate {
  const primeEdges = overview.edge_portfolio.filter((edge) => edge.status === 'PRIME')
  const decayedEdges = overview.edge_portfolio.filter((edge) => edge.status === 'DECAYED').map((edge) => edge.name)
  const topPrime = primeEdges[0]
  const recentErrors = overview.recent_errors ?? []
  const elevatedState = overview.bql_score >= 0.65 || /(trainwreck|tilt|panic|emotional)/i.test(overview.bql_state)
  const cautiousState = overview.bql_score >= 0.45 || decayedEdges.length > 0
  const commonReview = recentErrors.length > 0
    ? recentErrors.slice(0, 2).map((item) => `Revisit ${item.pair}: ${item.error}`)
    : ['Write down what changed before your last avoidable mistake.']

  if (elevatedState) {
    return {
      tone: 'protect',
      headline: 'Protect capital before the next order',
      summary: `${humanizeState(overview.bql_state)} is in control right now. With ${(overview.bql_score * 100).toFixed(0)}% emotional influence, this session is about damage control, not heroics.`,
      doNow: [
        topPrime
          ? `If you trade at all, trade only ${topPrime.name}.`
          : 'If you trade at all, take only your cleanest repeatable setup.',
        'Cut size until your state normalizes and upload the next batch before increasing risk.',
        'Open the slump protocol before the next session.',
      ],
      stopNow: [
        decayedEdges.length > 0
          ? `Bench ${listEdges(decayedEdges)} immediately.`
          : 'Do not add new setups or discretionary size while your state is elevated.',
        'Stop trying to make the day back in one session.',
      ],
      reviewNext: commonReview,
      cta: {
        label: 'Open slump remediation',
        to: '/dashboard/slump',
      },
    }
  }

  if (cautiousState) {
    return {
      tone: 'focus',
      headline: 'Trade less, trade cleaner',
      summary: `Your current edge mix is leaking money through avoidable noise. The goal now is to press what is stable and cut what is decayed before the next drawdown compounds.`,
      doNow: [
        topPrime
          ? `Build the next session around ${topPrime.name}.`
          : 'Build the next session around your clearest repeatable setup.',
        'Use the edge portfolio to decide what deserves more size and what deserves less.',
        'Upload the next batch quickly so the next recommendation reflects current behavior.',
      ],
      stopNow: [
        decayedEdges.length > 0
          ? `Stop trading ${listEdges(decayedEdges)} until the data changes.`
          : 'Stop setup hopping just because one trade felt bad.',
        'Do not treat break-even setups like proven edge.',
      ],
      reviewNext: commonReview,
      cta: {
        label: 'Review edge portfolio',
        to: '/dashboard/edges',
      },
    }
  }

  return {
    tone: 'press',
    headline: 'Press what already works',
    summary: `Your state is stable enough to focus on execution quality. The edge is not in doing more. It is in repeating what already pays you.`,
    doNow: [
      topPrime
        ? `Lean into ${topPrime.name}; that is where your cleanest money is coming from.`
        : 'Lean into your most repeatable setup and keep the process boring.',
      'Keep uploads current so the account stays honest about what is improving.',
      'Use the weekly digest to decide what to refine, not to invent a new identity.',
    ],
    stopNow: [
      'Do not widen your playbook just because things feel good.',
      'Do not let one green day turn into oversized confidence.',
    ],
    reviewNext: commonReview,
    cta: {
      label: 'Inspect the full edge map',
      to: '/dashboard/edges',
    },
  }
}

export function getAlertAction(alert: AlertItem): { label: string; to: string } {
  switch (alert.type) {
    case 'slump_warning':
      return { label: 'Open slump protocol', to: '/dashboard/slump' }
    case 'margin_of_safety':
      return { label: 'Review trade history', to: '/dashboard/history' }
    case 'crucial_moment':
      return { label: 'Inspect edge portfolio', to: '/dashboard/edges' }
    default:
      return { label: 'Open overview', to: '/dashboard' }
  }
}

export function buildSlumpExecutionChecklist(data: SlumpPrescription): string[] {
  if (!data.is_slump || !data.prescription) return []

  const checklist = [
    `Hard cap the next session at ${data.prescription.max_trades_per_session} trade${data.prescription.max_trades_per_session === 1 ? '' : 's'}.`,
    `Trade at ${data.prescription.position_cap_pct}% of normal size until the protocol is cleared.`,
    `Wait ${data.prescription.cooldown_hours} hour${data.prescription.cooldown_hours === 1 ? '' : 's'} between sessions.`,
    'Write the setup, invalidation, and emotional state down before every order.',
  ]

  if (data.prescription.banned_assets.length > 0) {
    checklist.push(`Do not trade ${listEdges(data.prescription.banned_assets)} during this protocol.`)
  }

  if (data.prescription.recovery_criteria && data.prescription.recovery_criteria.length > 0) {
    checklist.push(`Do not exit the protocol until one recovery criterion is hit: ${data.prescription.recovery_criteria[0]}`)
  }

  return checklist
}
