export const PUBLIC_REPORT_ENGAGEMENT_STORAGE_KEY = 'shibuya_public_report_engagement_v1'

export interface PublicReportEngagement {
  reportId: string
  firstViewedAt: string
  lastViewedAt: string
  viewCount: number
  lockedSectionClicks: Array<{
    sectionId: string
    clickedAt: string
  }>
  privateDemoIntentCount: number
  lastPrivateDemoIntentAt?: string
}

interface PublicReportEngagementStore {
  reports: Record<string, PublicReportEngagement>
}

export interface PublicReportEngagementRow {
  label: string
  value: string
  body: string
}

export interface PublicReportEngagementSummary {
  reportViewCount: number
  lockedSectionClickCount: number
  currentSectionClickCount: number
  privateDemoIntentCount: number
  boundary: string
}

export const PUBLIC_REPORT_ENGAGEMENT_SUMMARY_BOUNDARY =
  'Report engagement is local route continuity only; it does not prove payment, backend normalization, raw trades, or account-specific improvement.'

function nowIso(): string {
  return new Date().toISOString()
}

function createEngagement(reportId: string, at = nowIso()): PublicReportEngagement {
  return {
    reportId,
    firstViewedAt: at,
    lastViewedAt: at,
    viewCount: 0,
    lockedSectionClicks: [],
    privateDemoIntentCount: 0,
  }
}

function readStore(): PublicReportEngagementStore {
  if (typeof window === 'undefined') {
    return { reports: {} }
  }

  try {
    const raw = window.localStorage.getItem(PUBLIC_REPORT_ENGAGEMENT_STORAGE_KEY)
    if (!raw) {
      return { reports: {} }
    }

    const parsed = JSON.parse(raw) as Partial<PublicReportEngagementStore>
    return parsed && typeof parsed === 'object' && parsed.reports
      ? { reports: parsed.reports }
      : { reports: {} }
  } catch {
    return { reports: {} }
  }
}

function writeReport(engagement: PublicReportEngagement): PublicReportEngagement {
  if (typeof window === 'undefined') {
    return engagement
  }

  const store = readStore()
  window.localStorage.setItem(
    PUBLIC_REPORT_ENGAGEMENT_STORAGE_KEY,
    JSON.stringify({
      reports: {
        ...store.reports,
        [engagement.reportId]: engagement,
      },
    }),
  )

  return engagement
}

export function getPublicReportEngagement(reportId?: string | null): PublicReportEngagement | null {
  if (!reportId) {
    return null
  }

  return readStore().reports[reportId] ?? null
}

export function recordPublicReportView(reportId: string): PublicReportEngagement {
  const at = nowIso()
  const current = getPublicReportEngagement(reportId) ?? createEngagement(reportId, at)

  return writeReport({
    ...current,
    lastViewedAt: at,
    viewCount: current.viewCount + 1,
  })
}

export function recordLockedSectionIntent(reportId: string, sectionId: string): PublicReportEngagement {
  const at = nowIso()
  const current = getPublicReportEngagement(reportId) ?? createEngagement(reportId, at)

  return writeReport({
    ...current,
    lastViewedAt: at,
    lockedSectionClicks: [
      ...current.lockedSectionClicks,
      {
        sectionId,
        clickedAt: at,
      },
    ],
  })
}

export function recordPrivateDemoIntent(reportId: string): PublicReportEngagement {
  const at = nowIso()
  const current = getPublicReportEngagement(reportId) ?? createEngagement(reportId, at)

  return writeReport({
    ...current,
    lastViewedAt: at,
    privateDemoIntentCount: current.privateDemoIntentCount + 1,
    lastPrivateDemoIntentAt: at,
  })
}

export function buildPublicReportEngagementRows(
  engagement: PublicReportEngagement | null,
  currentSectionId?: string | null,
): PublicReportEngagementRow[] {
  const lockedClicks = engagement?.lockedSectionClicks ?? []
  const currentSectionClicks = currentSectionId
    ? lockedClicks.filter((click) => click.sectionId === currentSectionId)
    : []

  return [
    {
      label: 'Report opened',
      value: engagement ? `${engagement.viewCount} time${engagement.viewCount === 1 ? '' : 's'}` : 'No local view yet',
      body: engagement && engagement.viewCount > 1
        ? 'The report was reopened in this browser. That is a conversion signal only, not proof of trading behavior.'
        : 'The free report has created a local attention marker only.',
    },
    {
      label: 'Locked-section intent',
      value: lockedClicks.length ? `${lockedClicks.length} click${lockedClicks.length === 1 ? '' : 's'}` : 'No locked click yet',
      body: currentSectionClicks.length
        ? `This module has been requested ${currentSectionClicks.length} time${currentSectionClicks.length === 1 ? '' : 's'} in this browser.`
        : 'A locked click means the visitor asked a private question. It does not answer that question.',
    },
    {
      label: 'Private demo intent',
      value: engagement?.privateDemoIntentCount ? `${engagement.privateDemoIntentCount} gate attempt${engagement.privateDemoIntentCount === 1 ? '' : 's'}` : 'No private gate intent yet',
      body: 'Private demo intent can route the presenter-gated sample workspace. It cannot prove payment, upload, generated artifacts, or account improvement. No raw trade rows are stored by this ledger.',
    },
  ]
}

export function buildPublicReportEngagementSummary(
  engagement: PublicReportEngagement | null,
  currentSectionId?: string | null,
): PublicReportEngagementSummary {
  const lockedClicks = engagement?.lockedSectionClicks ?? []
  const currentSectionClicks = currentSectionId
    ? lockedClicks.filter((click) => click.sectionId === currentSectionId)
    : []

  return {
    reportViewCount: engagement?.viewCount ?? 0,
    lockedSectionClickCount: lockedClicks.length,
    currentSectionClickCount: currentSectionClicks.length,
    privateDemoIntentCount: engagement?.privateDemoIntentCount ?? 0,
    boundary: PUBLIC_REPORT_ENGAGEMENT_SUMMARY_BOUNDARY,
  }
}
