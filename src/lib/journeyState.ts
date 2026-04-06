import type { DashboardOverview, TraderProfileContext } from './types'
import type { Market } from './market'
import type { ShibuyaSessionMeta } from './runtime'
import { formatMoney } from './display'

type JourneyKey = 'activate' | 'context' | 'upload' | 'brief' | 'continuity'
export type JourneyStepStatus = 'complete' | 'current' | 'upcoming' | 'warning'

export interface JourneyStep {
  key: JourneyKey
  label: string
  description: string
  status: JourneyStepStatus
}

export interface JourneyState {
  eyebrow: string
  title: string
  summary: string
  steps: JourneyStep[]
  nextAction?: {
    label: string
    to: string
  }
}

function daysRemaining(accessExpiresAt?: string | null): number | null {
  if (!accessExpiresAt) {
    return null
  }

  const expiry = new Date(accessExpiresAt)
  if (Number.isNaN(expiry.getTime())) {
    return null
  }

  const diff = expiry.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

function buildBaseSteps(): JourneyStep[] {
  return [
    {
      key: 'activate',
      label: 'Activation',
      description: 'Payment becomes a live workspace, not a dead order.',
      status: 'upcoming',
    },
    {
      key: 'context',
      label: 'Trader context',
      description: 'Tell Shibuya who you are so the board stops guessing.',
      status: 'upcoming',
    },
    {
      key: 'upload',
      label: 'First upload',
      description: 'Feed the first export so the baseline becomes real.',
      status: 'upcoming',
    },
    {
      key: 'brief',
      label: 'Baseline brief',
      description: 'Get the next-session mandate and report artifact.',
      status: 'upcoming',
    },
    {
      key: 'continuity',
      label: 'Carry it forward',
      description: 'Either work the reset window hard or keep the monthly loop alive.',
      status: 'upcoming',
    },
  ]
}

function updateStep(steps: JourneyStep[], key: JourneyKey, status: JourneyStepStatus): JourneyStep[] {
  return steps.map((step) => (step.key === key ? { ...step, status } : step))
}

export function buildJourneyState({
  overview,
  profile,
  sessionMeta,
  market,
}: {
  overview: DashboardOverview | null
  profile: TraderProfileContext | null
  sessionMeta: ShibuyaSessionMeta | null
  market: Market
}): JourneyState {
  let steps = buildBaseSteps()
  const caseStatus = overview?.case_status ?? sessionMeta?.caseStatus ?? null
  const offerKind = overview?.offer_kind ?? sessionMeta?.offerKind ?? null
  const totalTrades = overview?.total_trades ?? 0
  const expiryDays = daysRemaining(overview?.access_expires_at ?? sessionMeta?.accessExpiresAt ?? null)
  const readOnly = caseStatus === 'read_only'
  const oneTimeAccess = Boolean(offerKind && !offerKind.endsWith('_live') && offerKind !== 'sample')
  const nextActionLabel = overview?.next_action ?? sessionMeta?.nextAction ?? null
  const contextCompleted =
    Boolean(profile?.completed) ||
    ['awaiting_upload', 'baseline_ready', 'delivered', 'read_only'].includes(caseStatus ?? '')

  steps = updateStep(steps, 'activate', 'complete')

  if (!contextCompleted) {
    steps = updateStep(steps, 'context', 'current')
    return {
      eyebrow: 'SETUP',
      title: 'Finish trader context before you trust the board.',
      summary: 'Your capital, income pressure, trading goal, broker, and instruments change what good advice looks like. Lock that context first.',
      steps,
      nextAction: {
        label: 'Complete trader context',
        to: '/dashboard/onboarding',
      },
    }
  }

  steps = updateStep(steps, 'context', 'complete')

  if (!totalTrades || caseStatus === 'awaiting_upload') {
    steps = updateStep(steps, 'upload', 'current')
    return {
      eyebrow: 'NEXT STEP',
      title: 'Upload the first session and let the baseline become real.',
      summary: 'The value starts once the workspace sees your actual trade history. Until then, this is still setup.',
      steps,
      nextAction: {
        label: 'Upload trades',
        to: '/dashboard/upload',
      },
    }
  }

  steps = updateStep(steps, 'upload', 'complete')

  if (caseStatus === 'baseline_ready') {
    steps = updateStep(steps, 'brief', 'current')
    return {
      eyebrow: 'BASELINE READY',
      title: 'Your first brief is ready. Carry it into the next session.',
      summary: `The current board says ${formatMoney(overview?.discipline_tax_30d ?? 0, market)} leaked through behavior over the last 30 days. Do not leave without a next-session mandate.`,
      steps,
      nextAction: {
        label: 'Review the brief below',
        to: '/dashboard',
      },
    }
  }

  steps = updateStep(steps, 'brief', 'complete')

  if (readOnly) {
    steps = updateStep(steps, 'continuity', 'warning')
    return {
      eyebrow: 'READ ONLY',
      title: 'The reset window ended. Review the work, then reopen the loop.',
      summary: 'You still have the board and history, but fresh uploads are locked until you start a new reset package or a live monthly tier.',
      steps,
      nextAction: {
        label: 'See reset options',
        to: '/pricing?upgrade=reset-pro',
      },
    }
  }

  steps = updateStep(steps, 'continuity', 'current')

  if (oneTimeAccess) {
    return {
      eyebrow: 'RESET WINDOW',
      title: expiryDays !== null ? `${expiryDays} day${expiryDays === 1 ? '' : 's'} left in the current reset window.` : 'Use the reset window hard.',
      summary: nextActionLabel
        ? `Current checkpoint: ${nextActionLabel}. Use the reset window hard, compare the delta, and tighten the mandate instead of starting from scratch.`
        : 'The product is now in execution mode. Upload again after a real session, compare the delta, and tighten the mandate instead of starting from scratch.',
      steps,
      nextAction: {
        label: 'Upload another session',
        to: '/dashboard/upload',
      },
    }
  }

  return {
    eyebrow: 'LIVE LOOP',
    title: 'Keep the loop alive session by session.',
    summary: nextActionLabel
      ? `Current checkpoint: ${nextActionLabel}. Monthly live access only pays for itself if the board keeps changing the next decision.`
      : 'Monthly live access only pays for itself if the board keeps changing the next decision. Upload another session once new behavior exists to measure.',
    steps,
    nextAction: {
      label: 'Append another session',
      to: '/dashboard/upload',
    },
  }
}
