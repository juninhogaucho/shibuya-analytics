import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import StoryExperience from '../StoryExperience'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('StoryExperience', () => {
  test('renders the provisional fingerprint journey and routes to the public upload step', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('You do not have a strategy problem. You have a state problem.')).not.toHaveLength(0)
    expect(screen.getByText(/This is not your report\. It is a website-level prediction based on interaction/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Priya/i }))
    await user.click(screen.getByRole('button', { name: 'Drawdown Pressure' }))
    expect(screen.getByText('Predicted dominant axis')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continue To Upload/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
  })
})
