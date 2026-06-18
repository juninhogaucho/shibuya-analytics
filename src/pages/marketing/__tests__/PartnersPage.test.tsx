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
    expect(screen.getByText(/TVA is annualized value created/i)).toBeInTheDocument()
    expect(screen.getByText(/We do not sell "AI magic"/i)).toBeInTheDocument()
  })
})
