import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, test, vi } from 'vitest'
import { AuthGuard } from '../AuthGuard'

const isAuthenticatedMock = vi.fn()

vi.mock('../../lib/api', () => ({
  isAuthenticated: () => isAuthenticatedMock(),
}))

describe('AuthGuard', () => {
  test('renders children for authenticated users', () => {
    isAuthenticatedMock.mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected workspace</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected workspace')).toBeInTheDocument()
  })

  test('redirects unauthenticated users to activation', () => {
    isAuthenticatedMock.mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected workspace</div>
              </AuthGuard>
            }
          />
          <Route path="/activate" element={<div>Activation page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Activation page')).toBeInTheDocument()
  })
})
