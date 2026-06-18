import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { DemoLauncherPage } from '../DemoLauncherPage'

afterEach(() => {
  vi.unstubAllEnvs()
  window.localStorage.clear()
})

describe('DemoLauncherPage', () => {
  test('renders the controlled IFX demo launch packet without printing secrets', () => {
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'founder-only-2026')

    render(
      <MemoryRouter initialEntries={['/demo?market=global']}>
        <DemoLauncherPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('IFX Demo Launcher')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /One controlled path from story to private workspace/i })).toBeInTheDocument()
    expect(screen.getByText('DEMO LAUNCH PACKET')).toBeInTheDocument()
    expect(screen.getByText('Marco / Edge Decay / global-ready storyline.')).toBeInTheDocument()
    expect(screen.getByText('PRIMARY IFX ROUTE')).toBeInTheDocument()
    expect(screen.getByText('Story first. Shortcuts are fallback only.')).toBeInTheDocument()
    expect(screen.getByText(/public recognition earns upload/i)).toBeInTheDocument()
    expect(screen.getByText(/Fallback rule: direct report, direct insight, and activation links are recovery routes/i)).toBeInTheDocument()
    expect(screen.getByText('Configured for this build')).toBeInTheDocument()
    expect(screen.getByText(/Secret values are never printed/i)).toBeInTheDocument()
    expect(screen.queryByText('founder-only-2026')).not.toBeInTheDocument()
    expect(screen.getByText('The launcher is not live proof.')).toBeInTheDocument()
    expect(screen.getByText(/does not prove Stripe mode/i)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Run Story/i })).toHaveAttribute('href', '/story?market=global')
    expect(screen.getByRole('link', { name: /Generate Packet/i })).toHaveAttribute(
      'href',
      '/upload?demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Show Question/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?demo_packet=launcher_sample&source=guided_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Story/i })).toHaveAttribute('href', '/story?market=global')
    expect(screen.getByRole('link', { name: /Open Upload/i })).toHaveAttribute(
      'href',
      '/upload?demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Report/i })).toHaveAttribute(
      'href',
      '/report/sample-behavioral-leak-report?demo_packet=launcher_sample&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Insight/i })).toHaveAttribute(
      'href',
      '/insight/edge-decay-map?demo_packet=launcher_sample&source=guided_report&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(screen.getAllByRole('link', { name: /Open Gate/i })[0]).toHaveAttribute(
      'href',
      '/private-demo?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
    expect(screen.getByRole('link', { name: /Open Activation/i })).toHaveAttribute(
      'href',
      '/activate?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=global',
    )
  })

  test('shows private gate disabled state when no demo code is configured', () => {
    render(
      <MemoryRouter initialEntries={['/ifx-demo?market=india']}>
        <DemoLauncherPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Disabled until demo code is configured')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Story/i })).toHaveAttribute('href', '/story?market=india')
    expect(screen.getAllByRole('link', { name: /Open Gate/i })[0]).toHaveAttribute(
      'href',
      '/private-demo?demo_packet=launcher_sample&source=locked_insight&report=sample-behavioral-leak-report&archetype=marco&axis=edge_decay&section=edge-decay-map&story=guided&scene_count=6&pain_axes=edge_decay&signals=mirror_selected%2Cpain_axis_selected%2Cscene_depth_light%2Cupload_intent&market=india',
    )
  })
})
