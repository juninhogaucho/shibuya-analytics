import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import ProofStack from '../ProofStack'
import { METHOD_PROOF_BOUNDARIES, METHOD_PROOF_CARDS } from '../../../lib/methodProof'

describe('ProofStack', () => {
  test('shows method proof numbers with explicit synthetic/live boundaries', () => {
    render(
      <MemoryRouter initialEntries={['/story?market=global']}>
        <ProofStack />
      </MemoryRouter>,
    )

    expect(screen.getByText('Method proof, not magic')).toBeInTheDocument()
    expect(screen.getByText('The public promise now has math underneath it.')).toBeInTheDocument()
    expect(screen.getByText(/synthetic method-validation numbers from Medallion v2 engines/i)).toBeInTheDocument()
    expect(screen.getByText('ROC-AUC')).toBeInTheDocument()
    expect(screen.getByText('0.9788')).toBeInTheDocument()
    expect(screen.getByText('Correlation')).toBeInTheDocument()
    expect(screen.getByText('0.7759')).toBeInTheDocument()
    expect(screen.getByText('Hard-negative FPR')).toBeInTheDocument()
    expect(screen.getByText('13.3%')).toBeInTheDocument()
    expect(screen.getByText('Real proof')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()

    for (const card of METHOD_PROOF_CARDS) {
      expect(screen.getByText(card.title)).toBeInTheDocument()
    }

    for (const boundary of METHOD_PROOF_BOUNDARIES) {
      expect(screen.getByText(boundary)).toBeInTheDocument()
    }

    expect(screen.getByRole('link', { name: /Test The Mirror/i })).toHaveAttribute('href', '/upload?market=global')
    expect(screen.queryByText(/guaranteed profit/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/live account accuracy/i)).not.toBeInTheDocument()
  })
})

