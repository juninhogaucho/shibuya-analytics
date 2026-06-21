import { useEffect, useMemo, useState } from 'react'
import { getPublicTeaserReport } from './api/publicReport'
import type { Market } from './market'
import {
  buildPublicReportSession,
  getPublicReportSession,
  persistPublicReportSession,
  validatePublicTeaserReportResponse,
  type PublicReportSession,
} from './publicReportSession'
import type { FingerprintAxisId, StoryArchetypeId } from './storyExperience'

export type PublicReportRecoveryStatus = 'idle' | 'loading' | 'recovered' | 'failed'

export interface PublicReportRecoveryInput {
  reportId: string
  market: Market
  archetypeId: StoryArchetypeId
  axisId: FingerprintAxisId
  storySource?: string | null
  selectedPainAxisIds?: string[]
  visitedSceneCount?: number
  signalMarkerIds?: string[]
  disabled?: boolean
}

export interface PublicReportRecoveryState {
  session: PublicReportSession | null
  status: PublicReportRecoveryStatus
  error: string | null
  attemptedBackendRecovery: boolean
}

interface InternalPublicReportRecoveryState extends PublicReportRecoveryState {
  reportId: string
}

export function isRecoverablePublicTeaserReportId(reportId?: string | null): boolean {
  return Boolean(reportId && (/^public-teaser-[a-z0-9-]+$/i.test(reportId) || /^TEASER-[a-z0-9-]+$/i.test(reportId)))
}

export function usePublicReportSessionRecovery(input: PublicReportRecoveryInput): PublicReportRecoveryState {
  const [state, setState] = useState<InternalPublicReportRecoveryState>(() => ({
    reportId: input.reportId,
    session: getPublicReportSession(input.reportId),
    status: 'idle',
    error: null,
    attemptedBackendRecovery: false,
  }))
  const selectedPainAxisKey = (input.selectedPainAxisIds ?? []).join(',')
  const signalMarkerKey = (input.signalMarkerIds ?? []).join(',')
  const selectedPainAxisIds = useMemo(
    () => selectedPainAxisKey.split(',').filter(Boolean),
    [selectedPainAxisKey],
  )
  const signalMarkerIds = useMemo(
    () => signalMarkerKey.split(',').filter(Boolean),
    [signalMarkerKey],
  )

  const currentState: PublicReportRecoveryState =
    state.reportId === input.reportId
      ? state
      : {
          session: getPublicReportSession(input.reportId),
          status: 'idle',
          error: null,
          attemptedBackendRecovery: false,
        }

  useEffect(() => {
    const existingSession = getPublicReportSession(input.reportId)
    if (existingSession) {
      return
    }

    if (input.disabled || !isRecoverablePublicTeaserReportId(input.reportId)) {
      return
    }

    let cancelled = false

    Promise.resolve()
      .then(() => getPublicTeaserReport(input.reportId))
      .then((backendTeaser) => {
        if (cancelled) {
          return
        }

        const receiptError = validatePublicTeaserReportResponse(backendTeaser)
        if (receiptError) {
          setState({
            reportId: input.reportId,
            session: null,
            status: 'failed',
            error: receiptError,
            attemptedBackendRecovery: true,
          })
          return
        }

        const recoveredReportId = backendTeaser.report_id ?? input.reportId
        const recoveredSession = buildPublicReportSession({
          reportId: recoveredReportId,
          market: input.market,
          archetypeId: input.archetypeId,
          axisId: input.axisId,
          source: 'backend_teaser',
          storySource: input.storySource,
          selectedPainAxisIds,
          visitedSceneCount: input.visitedSceneCount,
          signalMarkerIds,
          backendTeaser,
        })
        persistPublicReportSession(recoveredSession)
        setState({
          reportId: input.reportId,
          session: recoveredSession,
          status: 'recovered',
          error: null,
          attemptedBackendRecovery: true,
        })
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setState({
          reportId: input.reportId,
          session: null,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Backend teaser receipt recovery failed.',
          attemptedBackendRecovery: true,
        })
      })

    return () => {
      cancelled = true
    }
  }, [
    input.archetypeId,
    input.axisId,
    input.disabled,
    input.market,
    input.reportId,
    input.storySource,
    input.visitedSceneCount,
    selectedPainAxisIds,
    signalMarkerIds,
  ])

  return currentState
}
