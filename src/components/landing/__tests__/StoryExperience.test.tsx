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
    expect(screen.getByText('Target engine path')).toBeInTheDocument()
    expect(screen.getAllByText('The model calculates. The language explains.').length).toBeGreaterThan(0)
    expect(screen.getByText(/production proof path the website is promising/i)).toBeInTheDocument()
    expect(screen.getByText('BQL state detection')).toBeInTheDocument()
    expect(screen.getByText('Discipline tax')).toBeInTheDocument()
    expect(screen.getByText('Edge drift')).toBeInTheDocument()
    expect(screen.getByText('Breach pressure')).toBeInTheDocument()
    expect(screen.getByText(/No public accuracy percentage/i)).toBeInTheDocument()
    expect(screen.getByText('IFX presenter brief')).toBeInTheDocument()
    expect(screen.getByText(/Do not pitch signals\. Pitch state, proof, and the next-session operating loop/i)).toBeInTheDocument()
    expect(screen.getByText('Public StoryExperience demo script')).toBeInTheDocument()
    expect(screen.getByText('Guided demo conductor')).toBeInTheDocument()
    expect(screen.getByText('Run this as a 3-minute story, not a scrolling website.')).toBeInTheDocument()
    expect(screen.getByText('Path')).toBeInTheDocument()
    expect(screen.getByText('Marco / Edge Decay')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next Demo Beat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Finish To Sample Upload/i })).toBeInTheDocument()
    expect(screen.getByText('Run the public story as a proof handoff, not a feature tour.')).toBeInTheDocument()
    expect(screen.getByText('Allowed public claims')).toBeInTheDocument()
    expect(screen.getByText('Forbidden public claims')).toBeInTheDocument()
    expect(screen.getByText('This public story builds a website-level hypothesis.')).toBeInTheDocument()
    expect(screen.getByText('Do not say Shibuya analyzed the visitor account from the story page.')).toBeInTheDocument()
    expect(screen.getByText(/No profit uplift, pass-rate, drawdown, or live-account claim is allowed/i)).toBeInTheDocument()
    expect(screen.getByText('3-minute demo path')).toBeInTheDocument()
    expect(screen.getByText('Public story predicts a provisional fingerprint.')).toBeInTheDocument()
    expect(screen.getByText('Locked insight explains what live evidence must prove.')).toBeInTheDocument()
    expect(screen.getByText('Private Reset Pro demo opens only behind the founder gate.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Guided Demo Path/i })).toBeInTheDocument()
    expect(screen.getByText(/For a fast handoff, the guided path uses Marco \/ Edge Decay/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Priya/i }))
    await user.click(screen.getByRole('button', { name: 'Drawdown Pressure' }))
    expect(screen.getByText('Predicted dominant axis')).toBeInTheDocument()
    expect(screen.getByText(/Current hypothesis: Priya \/ Prop evaluation survivor with Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/Current public hypothesis: Priya: Prop evaluation survivor; leading axis: Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/The public page is forming a provisional hypothesis around Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/Trade history has to confirm or reject Drawdown Pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/Reset Pro preview can show the operating loop with sample data only/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continue To Upload/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=1')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=drawdown_pressure')
    expect(screen.getByTestId('location')).toHaveTextContent('signals=mirror_selected%2Cpain_axis_selected%2Cupload_intent')
  })

  test('offers a deterministic guided demo path for expo handoffs', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/story']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Use Guided Demo Path/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('archetype=marco')
    expect(screen.getByTestId('location')).toHaveTextContent('axis=edge_decay')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=4')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=edge_decay')
    expect(screen.getByTestId('location')).toHaveTextContent('signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent')
  })

  test('conductor beats update the public story fingerprint before upload', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/story']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Beat 02/i }))

    expect(screen.getAllByText('Pick the uncomfortable mirror').length).toBeGreaterThan(0)
    expect(screen.getByText(/Select Marco and edge decay for the expo path/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Marco/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Edge Decay/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Pain selected:/i).parentElement).toHaveTextContent('Edge Decay')

    await user.click(screen.getByRole('button', { name: /Beat 03/i }))

    expect(screen.getAllByText('Reveal the provisional fingerprint').length).toBeGreaterThan(0)
    expect(screen.getByText(/public recognition is routing context/i)).toBeInTheDocument()
    expect(screen.getAllByText('Scene 10').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /Finish To Sample Upload/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('archetype=marco')
    expect(screen.getByTestId('location')).toHaveTextContent('axis=edge_decay')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=edge_decay')
  })

  test('exposes the deterministic guided demo path in the hero', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/story']}>
        <StoryExperience />
        <LocationProbe />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Start Guided Demo Path/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/upload')
    expect(screen.getByTestId('location')).toHaveTextContent('archetype=marco')
    expect(screen.getByTestId('location')).toHaveTextContent('axis=edge_decay')
    expect(screen.getByTestId('location')).toHaveTextContent('story=guided')
    expect(screen.getByTestId('location')).toHaveTextContent('scene_count=4')
    expect(screen.getByTestId('location')).toHaveTextContent('pain_axes=edge_decay')
    expect(screen.getByTestId('location')).toHaveTextContent('signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent')
  })
})
