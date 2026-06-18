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
  test('makes the public story the product surface, not an event landing page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/story']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByText('Interactive film / public mirror')).toBeInTheDocument()
    expect(screen.getByText('The market did not break you.')).toBeInTheDocument()
    expect(screen.getByText('Your state repeated.')).toBeInTheDocument()
    expect(screen.getByText('Choose the frame that stings')).toBeInTheDocument()
    expect(screen.getByText('Public story contract')).toBeInTheDocument()
    expect(screen.getByText(/This is the first product surface/i)).toBeInTheDocument()
    expect(screen.getByText('Truth ladder')).toBeInTheDocument()
    expect(screen.getByText('Public story creates a provisional mirror.')).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro becomes the operating loop only after access and evidence boundaries are clear/i)).toBeInTheDocument()
    expect(screen.queryByText(/Shibuya emergency/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/operator run sheet/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/emergency demo lane/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /I changed near the limit line/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/story')
    expect(screen.getAllByText('Choose the uncomfortable mirror').length).toBeGreaterThan(0)
    expect(screen.getByText(/Current hypothesis: Priya \/ Prop evaluation survivor with Drawdown Pressure/i)).toBeInTheDocument()
  })

  test('routes a selected public hypothesis into upload without claiming account evidence', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/story?market=india']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Priya/i }))
    await user.click(screen.getByRole('button', { name: 'Drawdown Pressure' }))

    expect(screen.getByText('Evidence contract')).toBeInTheDocument()
    expect(screen.getByText('Public signal only')).toBeInTheDocument()
    expect(screen.getByText('Upload must prove it')).toBeInTheDocument()
    expect(screen.getByText(/Current hypothesis: Priya \/ Prop evaluation survivor with Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/No raw trade rows, account id, brokerage login, P&L, or private conclusion/i)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Continue To Upload/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=1')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=drawdown_pressure')
    expect(screen.getByTestId('location')).toHaveTextContent('signals=mirror_selected%2Cpain_axis_selected%2Cupload_intent')
  })

  test('turns the truth ladder action into the same evidence handoff', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/story?market=global']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /Turn Mirror Into Evidence/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('market=global')
    expect(screen.getByTestId('location')).not.toHaveTextContent('demo_packet=launcher_sample')
  })
})
