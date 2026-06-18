import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { getSampleWorkspaceOverview } from '../../../lib/sampleWorkspace'
import { ResetProDemoCommandCenter } from '../ResetProDemoCommandCenter'

describe('ResetProDemoCommandCenter', () => {
  test('renders a private demo path with explicit demo boundaries', () => {
    render(
      <MemoryRouter>
        <ResetProDemoCommandCenter market="india" overview={getSampleWorkspaceOverview('reset_pro')} />
      </MemoryRouter>,
    )

    expect(screen.getByText('PRIVATE RESET PRO DEMO')).toBeInTheDocument()
    expect(screen.getByText('3-MINUTE PATH')).toBeInTheDocument()
    expect(screen.getAllByText('DEMO DATA ONLY')[0]).toBeInTheDocument()
    expect(screen.getByText(/Shibuya does not tell the trader what to buy or sell/i)).toBeInTheDocument()
    expect(screen.getByText('FOUNDER SHOW SEQUENCE')).toBeInTheDocument()
    expect(screen.getByText('Three minutes, no improvising.')).toBeInTheDocument()
    expect(screen.getByText('DEMO READINESS CHECKLIST')).toBeInTheDocument()
    expect(screen.getByText('Before showing the workspace.')).toBeInTheDocument()
    expect(screen.getByText('Public context carried')).toBeInTheDocument()
    expect(screen.getByText(/No public report handoff was found/i)).toBeInTheDocument()
    expect(screen.getByText('Sample boundary visible')).toBeInTheDocument()
    expect(screen.getByText('Append-proof exit')).toBeInTheDocument()
    expect(screen.getByText('0:00-0:30')).toBeInTheDocument()
    expect(screen.getByText('Start from the public recognition moment')).toBeInTheDocument()
    expect(screen.getByText('Name the current enemy')).toBeInTheDocument()
    expect(screen.getByText('Show intervention surfaces')).toBeInTheDocument()
    expect(screen.getByText('Close with the proof loop')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Show propOS angle/i })).toHaveAttribute('href', '/dashboard/shadow-boxing')
    expect(screen.getByText(/Live Reset Pro requires payment, activation, first meaningful upload/i)).toBeInTheDocument()
  })

  test('renders carried report context when the private demo came from a free report', () => {
    render(
      <MemoryRouter>
        <ResetProDemoCommandCenter
          market="india"
          overview={getSampleWorkspaceOverview('reset_pro')}
          origin={{
            source: 'free_report',
            reportId: 'free-report-123',
            archetypeLabel: 'Priya: Prop evaluation survivor',
            axisLabel: 'Drawdown Pressure',
            reportSource: 'sample',
            evidenceLabel: 'Sample history packet',
            validationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
            storySource: 'guided',
            selectedPainAxisLabels: ['Drawdown Pressure'],
            visitedSceneCount: 4,
            lockedSectionId: 'highest-cost-state',
            lockedSectionTitle: 'Highest-cost state',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carried in from the public report')).toBeInTheDocument()
    expect(screen.getByText('Connect the public pain to the private module')).toBeInTheDocument()
    expect(screen.getByText(/The trader tried to unlock Highest-cost state/i)).toBeInTheDocument()
    expect(screen.getByText('Origin report: free-report-123')).toBeInTheDocument()
    expect(screen.getByText('Public archetype: Priya: Prop evaluation survivor')).toBeInTheDocument()
    expect(screen.getByText('Predicted axis: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Public packet source: sample')).toBeInTheDocument()
    expect(screen.getByText('Handoff evidence: Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Validation note: Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText('Story handoff: guided')).toBeInTheDocument()
    expect(screen.getByText('Story scenes before upload: 4')).toBeInTheDocument()
    expect(screen.getByText('Public pain axes: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Requested private insight: Highest-cost state')).toBeInTheDocument()
    expect(screen.getAllByText(/Report, archetype, axis, evidence label/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/not proof that the sample account belongs to the visitor/i).length).toBeGreaterThan(0)
  })
})
