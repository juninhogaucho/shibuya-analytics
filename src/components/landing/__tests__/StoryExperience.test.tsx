import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import StoryExperience from '../StoryExperience'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
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
    expect(screen.getByText('Evidence contract')).toBeInTheDocument()
    expect(screen.getByText('Story first. Evidence second.')).toBeInTheDocument()
    expect(screen.getByText('Public signal only')).toBeInTheDocument()
    expect(screen.getByText('Upload must prove it')).toBeInTheDocument()
    expect(screen.getByText('Private demo boundary')).toBeInTheDocument()
    expect(screen.getByText('3-minute demo path')).toBeInTheDocument()
    expect(screen.getByText('Public story predicts a provisional fingerprint.')).toBeInTheDocument()
    expect(screen.getByText('Locked insight explains what live evidence must prove.')).toBeInTheDocument()
    expect(screen.getByText('Private Reset Pro demo opens only behind the founder gate.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Priya/i }))
    await user.click(screen.getByRole('button', { name: 'Drawdown Pressure' }))
    expect(screen.getByText('Predicted dominant axis')).toBeInTheDocument()
    expect(screen.getByText(/Current hypothesis: Priya \/ Prop evaluation survivor with Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/Trade history has to confirm or reject Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro preview can show the operating loop with sample data only/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continue To Upload/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=1')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=drawdown_pressure')
  })
})
