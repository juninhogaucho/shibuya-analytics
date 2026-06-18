import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { PartnersPage } from '../PartnersPage'

describe('PartnersPage', () => {
  test('positions Shibuya as the retained trader-intelligence layer for firms', () => {
    render(
      <MemoryRouter>
        <PartnersPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Not another prop-tech shell/i })).toBeInTheDocument()
    expect(screen.getByText(/trader-intelligence layer for firms that already own distribution/i)).toBeInTheDocument()
    expect(screen.getByText(/Sell the platform. Retain the intelligence./i)).toBeInTheDocument()
    expect(screen.getByText(/Simple base fee. Optional proved-uplift share./i)).toBeInTheDocument()
    expect(screen.getByText(/Base distribution fee/i)).toBeInTheDocument()
    expect(screen.getByText(/Partner-subsidized pilot/i)).toBeInTheDocument()
    expect(screen.getByText(/TVA success share/i)).toBeInTheDocument()
    expect(screen.getByText(/TVA is annualized value created/i)).toBeInTheDocument()
    expect(screen.getByText(/partner revenue share pays for distribution/i)).toBeInTheDocument()
    expect(screen.getByText(/Paid pilot: fixed implementation\/access economics/i)).toBeInTheDocument()
    expect(screen.getByText(/Involved pilot: lower upfront cost/i)).toBeInTheDocument()
    expect(screen.getByText(/Merit\/design-partner pilot/i)).toBeInTheDocument()
    expect(screen.getByText(/We do not sell "AI magic"/i)).toBeInTheDocument()
  })
})
