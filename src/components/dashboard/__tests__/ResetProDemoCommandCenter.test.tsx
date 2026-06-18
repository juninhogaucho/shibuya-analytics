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
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carried in from the public report')).toBeInTheDocument()
    expect(screen.getByText('Origin report: free-report-123')).toBeInTheDocument()
    expect(screen.getByText('Public archetype: Priya: Prop evaluation survivor')).toBeInTheDocument()
    expect(screen.getByText('Predicted axis: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Public packet source: sample')).toBeInTheDocument()
    expect(screen.getByText('Handoff evidence: Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Validation note: Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText(/not proof that the sample account belongs to the visitor/i)).toBeInTheDocument()
  })
})
