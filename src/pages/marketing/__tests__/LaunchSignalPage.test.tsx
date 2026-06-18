import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import LaunchSignalPage from '../LaunchSignalPage'

describe('LaunchSignalPage', () => {
  test('routes IFX entry through the canonical story-first demo packet', () => {
    render(
      <MemoryRouter initialEntries={['/ifx?market=global']}>
        <LaunchSignalPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('IFX demo launcher')).toBeInTheDocument()
    expect(screen.getByText(/This IFX link is a truthful demo path/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Story' })).toHaveAttribute('href', '/story?market=global')
    expect(screen.getByRole('link', { name: 'Demo path' })).toHaveAttribute('href', '/demo?market=global')
    expect(screen.getByRole('link', { name: /Start 3-Minute Story/i })).toHaveAttribute('href', '/story?market=global')
    expect(screen.getByRole('link', { name: /Operator Launcher/i })).toHaveAttribute('href', '/demo?market=global')
    const presenterGate = screen.getByRole('link', { name: /Presenter Demo Gate/i })

    expect(presenterGate).toHaveAttribute(
      'href',
      '/private-demo?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(presenterGate).not.toHaveAttribute('href', '/private-demo?source=ifx&market=global')
  })
})
