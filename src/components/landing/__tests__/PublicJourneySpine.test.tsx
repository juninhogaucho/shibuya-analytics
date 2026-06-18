import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { PublicJourneySpine } from '../PublicJourneySpine'

describe('PublicJourneySpine', () => {
  test('renders the corrected public-to-private product order with proof boundaries', () => {
    render(<PublicJourneySpine activeStage="insight" detail="Private proof is still locked." />)

    const spine = screen.getByLabelText('Shibuya public to private journey')

    expect(within(spine).getByText('Public-to-private journey')).toBeInTheDocument()
    expect(within(spine).getByText('Story first. Evidence decides what unlocks.')).toBeInTheDocument()
    expect(within(spine).getByText('Private proof is still locked.')).toBeInTheDocument()

    expect(within(spine).getByText('Public story')).toBeInTheDocument()
    expect(within(spine).getByText('Upload packet')).toBeInTheDocument()
    expect(within(spine).getByText('Free baseline')).toBeInTheDocument()
    expect(within(spine).getByText('Private insight lock')).toBeInTheDocument()
    expect(within(spine).getByText('Reset Pro demo')).toBeInTheDocument()
    expect(within(spine).getByText('Append proof close')).toBeInTheDocument()

    expect(within(spine).getByText('Website-level recognition only.')).toBeInTheDocument()
    expect(within(spine).getByText('One sharp preview, private proof still locked.')).toBeInTheDocument()
    expect(within(spine).getByText('Founder-gated sample workspace.')).toBeInTheDocument()
    expect(within(spine).getByText('Demo ends where live evidence must begin.')).toBeInTheDocument()
  })
})
