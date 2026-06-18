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
})
