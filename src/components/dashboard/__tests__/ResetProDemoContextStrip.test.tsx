import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { ResetProDemoContextStrip } from '../ResetProDemoContextStrip'

describe('ResetProDemoContextStrip', () => {
  test('keeps locked-insight continuity visible across Reset Pro workspace pages', () => {
    render(
      <MemoryRouter>
        <ResetProDemoContextStrip
          sessionMeta={{
            market: 'global',
            demoSource: 'locked_insight',
            demoReportId: 'free-report-123',
            demoArchetypeId: 'marco',
            demoAxisId: 'edge_decay',
            demoStorySource: 'guided',
            demoVisitedSceneCount: 6,
            demoSignalMarkerIds: ['mirror_selected', 'upload_intent'],
            demoLockedSectionId: 'edge-decay-map',
            demoLockedSectionTitle: 'Edge decay map',
            demoPrivateGateChecksum: 'source=locked_insight; report=free-report-123; section=edge-decay-map | archetype=marco; axis=edge_decay | story=guided; scene_count=6; pain_axes=edge_decay; signals=mirror_selected,upload_intent | sample route, not live answer',
            demoEngagementReportViewCount: 2,
            demoEngagementLockedSectionClickCount: 1,
            demoEngagementPrivateDemoIntentCount: 1,
            demoEngagementBoundary: 'Report engagement is local route continuity only; it does not prove payment, backend normalization, raw trades, or account-specific improvement.',
            demoUnlockBoundary: 'Founder code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('RESET PRO DEMO CONTEXT STRIP')).toBeInTheDocument()
    expect(screen.getByText('Keep the public-to-private handoff visible across every workspace surface.')).toBeInTheDocument()
    expect(screen.getByText('Origin')).toBeInTheDocument()
    expect(screen.getByText('locked_insight')).toBeInTheDocument()
    expect(screen.getByText('Report free-report-123; module Edge decay map.')).toBeInTheDocument()
    expect(screen.getByText('Public context')).toBeInTheDocument()
    expect(screen.getByText('Marco: Profitable refiner / Edge Decay')).toBeInTheDocument()
    expect(screen.getByText('Story guided; scenes 6; markers Mirror selected, Evidence intent.')).toBeInTheDocument()
    expect(screen.getByText('Private gate checksum')).toBeInTheDocument()
    expect(screen.getByText(/source=locked_insight; report=free-report-123; section=edge-decay-map/i)).toBeInTheDocument()
    expect(screen.getByText('Engagement receipt')).toBeInTheDocument()
    expect(screen.getByText('2 view(s), 1 locked click(s), 1 gate attempt(s)')).toBeInTheDocument()
    expect(screen.getByText(/local route continuity only/i)).toBeInTheDocument()
    expect(screen.getByText('Claim boundary')).toBeInTheDocument()
    expect(screen.getByText('sample route, not live answer')).toBeInTheDocument()
    expect(screen.getByText(/Founder code opened sample Reset Pro access only/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mission HQ' })).toHaveAttribute('href', '/dashboard?market=global')
    expect(screen.getByRole('link', { name: 'Append Proof' })).toHaveAttribute('href', '/dashboard/upload?market=global')
  })

  test('makes weak direct sample context explicit when no checksum is attached', () => {
    render(
      <MemoryRouter>
        <ResetProDemoContextStrip
          sessionMeta={{
            market: 'india',
            demoSource: 'direct_private_demo',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('direct_private_demo')).toBeInTheDocument()
    expect(screen.getByText('No report id is attached. Treat this as a cold sample workspace.')).toBeInTheDocument()
    expect(screen.getAllByText('not attached').length).toBeGreaterThan(0)
    expect(screen.getByText('No checksum was stored; do not claim a completed locked-insight handoff.')).toBeInTheDocument()
    expect(screen.getByText('No report engagement receipt was stored; do not claim the public journey created private evidence.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mission HQ' })).toHaveAttribute('href', '/dashboard?market=india')
    expect(screen.getByRole('link', { name: 'Append Proof' })).toHaveAttribute('href', '/dashboard/upload?market=india')
  })
})
