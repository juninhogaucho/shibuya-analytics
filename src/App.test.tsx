import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'

vi.mock('./app/routes', () => ({
  AppRoutes: () => <main data-testid="routes-mounted">Routes mounted</main>,
}))

beforeEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState({}, '', '/story')
})

describe('App boot overlay', () => {
  test('mounts routes immediately while the first-visit boot overlay is visible', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('routes-mounted')).toBeInTheDocument()
    expect(screen.getByText('System Boot')).toBeInTheDocument()
  })

  test('skips the boot overlay for instant demo links', () => {
    window.history.replaceState({}, '', '/story?skipBoot=1')

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('routes-mounted')).toBeInTheDocument()
    expect(screen.queryByText('System Boot')).not.toBeInTheDocument()
  })
})
