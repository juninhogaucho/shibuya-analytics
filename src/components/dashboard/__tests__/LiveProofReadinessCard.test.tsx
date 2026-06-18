import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { LiveProofReadinessCard } from '../LiveProofReadinessCard'

describe('LiveProofReadinessCard', () => {
  test('renders the live proof contract and required evidence stages', () => {
    render(<LiveProofReadinessCard title="Before activation can become live proof." />)

    expect(screen.getByText('LIVE PROOF READINESS')).toBeInTheDocument()
    expect(screen.getByText('Before activation can become live proof.')).toBeInTheDocument()
    expect(screen.getByText('Backend target')).toBeInTheDocument()
    expect(screen.getByText('Activation')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload')).toBeInTheDocument()
    expect(screen.getByText('Append history')).toBeInTheDocument()
    expect(screen.getByText(/This contract separates the sample demo from the live evidence path/i)).toBeInTheDocument()
    expect(screen.getByText(/Sample routes, URL context, and founder codes/i)).toBeInTheDocument()
  })
})
