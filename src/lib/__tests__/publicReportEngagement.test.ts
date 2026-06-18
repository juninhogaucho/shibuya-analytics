import { beforeEach, describe, expect, test } from 'vitest'
import {
  PUBLIC_REPORT_ENGAGEMENT_STORAGE_KEY,
  buildPublicReportEngagementRows,
  getPublicReportEngagement,
  recordLockedSectionIntent,
  recordPrivateDemoIntent,
  recordPublicReportView,
} from '../publicReportEngagement'

describe('public report engagement', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('records report views and locked-section intent locally', () => {
    const firstView = recordPublicReportView('sample-report')
    const secondView = recordPublicReportView('sample-report')
    const lockedIntent = recordLockedSectionIntent('sample-report', 'edge-decay-map')

    expect(firstView.viewCount).toBe(1)
    expect(secondView.viewCount).toBe(2)
    expect(lockedIntent.lockedSectionClicks).toEqual([
      expect.objectContaining({ sectionId: 'edge-decay-map' }),
    ])
    expect(getPublicReportEngagement('sample-report')).toMatchObject({
      reportId: 'sample-report',
      viewCount: 2,
      lockedSectionClicks: [
        expect.objectContaining({ sectionId: 'edge-decay-map' }),
      ],
    })
    expect(window.localStorage.getItem(PUBLIC_REPORT_ENGAGEMENT_STORAGE_KEY)).toContain('sample-report')
  })

  test('records private demo intent without creating proof claims', () => {
    recordPublicReportView('sample-report')
    const engagement = recordPrivateDemoIntent('sample-report')
    const rows = buildPublicReportEngagementRows(engagement, 'edge-decay-map')

    expect(engagement.privateDemoIntentCount).toBe(1)
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Private demo intent',
          value: '1 gate attempt',
          body: expect.stringContaining('No raw trade rows'),
        }),
        expect.objectContaining({
          label: 'Locked-section intent',
          value: 'No locked click yet',
        }),
      ]),
    )
  })
})

