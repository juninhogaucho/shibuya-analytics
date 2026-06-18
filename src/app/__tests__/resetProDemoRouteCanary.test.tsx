import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from '../routes'
import { SHIBUYA_API_KEY_STORAGE_KEY, SHIBUYA_SAMPLE_API_KEY, SHIBUYA_SESSION_META_STORAGE_KEY } from '../../lib/runtime'

vi.unmock('../../components/AuthGuard')
vi.unmock('../../pages/marketing/DemoLauncherPage')
vi.unmock('../../pages/marketing/PrivateDemoPage')

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>
}

afterEach(() => {
  vi.unstubAllEnvs()
  window.localStorage.clear()
})

describe('Reset Pro demo route canary', () => {
  test('operator launcher append shortcut unlocks through AppRoutes and AuthGuard into real append-proof workspace', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_PRIVATE_DEMO_ACCESS_CODE', 'presenter-only')

    render(
      <MemoryRouter initialEntries={['/demo?market=global']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /One controlled path from story to append-proof close/i })).toBeInTheDocument()
    expect(screen.getByText('PRIMARY STORY ROUTE')).toBeInTheDocument()
    expect(screen.getByText(/Append close is presenter-gated even when opened from this launcher/i)).toBeInTheDocument()

    const closeDemoLink = screen.getByRole('link', { name: /^Close Demo$/i })
    expect(closeDemoLink).toHaveAttribute('href', expect.stringContaining('/private-demo'))
    expect(closeDemoLink).toHaveAttribute('href', expect.stringContaining('destination=append_proof'))
    fireEvent.click(closeDemoLink)

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    })
    expect(await screen.findByText('Private demo preflight')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/private-demo')
    expect(screen.getByTestId('location')).toHaveTextContent('destination=append_proof')
    expect(screen.getByText('Presenter demo code configured')).toBeInTheDocument()
    expect(screen.getByText('Append proof close after unlock')).toBeInTheDocument()
    expect(screen.getByText(/This public shortcut still requires the presenter gate/i)).toBeInTheDocument()
    expect(screen.getAllByText('Demo launcher sample packet').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/client-side presenter control/i).length).toBeGreaterThan(0)

    await user.click(screen.getByLabelText(/I acknowledge the private demo boundary/i))
    const demoCodeInput = screen.getByLabelText(/Demo code/i)
    await user.type(demoCodeInput, 'presenter-only')
    expect(demoCodeInput).toHaveValue('presenter-only')
    fireEvent.submit(demoCodeInput.closest('form') as HTMLFormElement)

    await waitFor(() => {
      expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
    })

    expect(JSON.parse(window.localStorage.getItem(SHIBUYA_SESSION_META_STORAGE_KEY) ?? '{}')).toMatchObject({
      market: 'global',
      samplePreview: 'reset_pro',
      demoSource: 'locked_insight',
      demoReportId: 'sample-behavioral-leak-report',
      demoArchetypeId: 'marco',
      demoAxisId: 'edge_decay',
      demoLockedSectionId: 'edge-decay-map',
      demoEntryMode: 'append_proof_shortcut',
      demoUnlockBoundary: 'Presenter code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.',
    })

    cleanup()

    render(
      <MemoryRouter initialEntries={['/dashboard/upload?market=global']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(await screen.findByText('PRESENTER-GATED APPEND SHORTCUT')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard/upload?market=global')
    expect(screen.getAllByText('RESET PRO PREVIEW').length).toBeGreaterThan(0)
    expect(screen.getByText('RESET PRO PROOF EXIT')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO SAMPLE APPEND PACKET')).toBeInTheDocument()
    expect(screen.getByText('Presenter code accepted; sample context attached.')).toBeInTheDocument()
    expect(screen.getByText(/Sample mode does not persist uploads/i)).toBeInTheDocument()
    expect(screen.getByText(/Activation, real upload, generated artifacts, and repeat append packets/i)).toBeInTheDocument()
    expect(window.localStorage.getItem(SHIBUYA_API_KEY_STORAGE_KEY)).toBe(SHIBUYA_SAMPLE_API_KEY)
  })
})
