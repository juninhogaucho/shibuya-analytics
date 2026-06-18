import { act } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { enterSampleMode } from '../../../lib/runtime'
import { WelcomeModal } from '../WelcomeModal'

describe('WelcomeModal', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    window.localStorage.clear()
  })

  test('shows onboarding for a new dashboard visitor after the page has rendered', () => {
    render(<WelcomeModal />)

    expect(screen.queryByText("Here's what you'll find")).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByText("Here's what you'll find")).toBeInTheDocument()
    expect(screen.getByText('See Your Reality')).toBeInTheDocument()
  })

  test('still shows onboarding for ordinary sample workspaces', () => {
    window.localStorage.setItem('shibuya_onboarding_seen', 'true')
    enterSampleMode()

    render(<WelcomeModal />)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByText("Here's what you'll find")).toBeInTheDocument()
  })

  test('does not cover a private Reset Pro demo handoff with the generic tour', () => {
    enterSampleMode({
      market: 'global',
      preview: 'reset_pro',
      demoSource: 'free_report',
      demoReportId: 'sample-free-report',
      demoArchetypeId: 'marco',
      demoAxisId: 'edge_decay',
    })

    render(<WelcomeModal />)

    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.queryByText("Here's what you'll find")).not.toBeInTheDocument()
    expect(screen.queryByText('See Your Reality')).not.toBeInTheDocument()
  })
})
