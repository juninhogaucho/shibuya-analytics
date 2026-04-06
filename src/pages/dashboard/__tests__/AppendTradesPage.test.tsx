import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import { AppendTradesPage } from '../AppendTradesPage'

const parseTradePasteMock = vi.fn()
const submitParsedTradesMock = vi.fn()
const uploadTradesCSVMock = vi.fn()
const getTradePasteMemoryMock = vi.fn()
const logTraderLifecycleEventMock = vi.fn()
const isSampleModeMock = vi.fn()
const getStoredSessionMetaMock = vi.fn()
const isReadOnlySessionMock = vi.fn()
const updateSessionMetaMock = vi.fn()

vi.mock('../../../lib/api', () => ({
  parseTradePaste: (...args: unknown[]) => parseTradePasteMock(...args),
  submitParsedTrades: (...args: unknown[]) => submitParsedTradesMock(...args),
  uploadTradesCSV: (...args: unknown[]) => uploadTradesCSVMock(...args),
  getTradePasteMemory: (...args: unknown[]) => getTradePasteMemoryMock(...args),
  logTraderLifecycleEvent: (...args: unknown[]) => logTraderLifecycleEventMock(...args),
}))

vi.mock('../../../lib/runtime', () => ({
  isSampleMode: () => isSampleModeMock(),
  getStoredSessionMeta: () => getStoredSessionMetaMock(),
  isReadOnlySession: (...args: unknown[]) => isReadOnlySessionMock(...args),
  updateSessionMeta: (...args: unknown[]) => updateSessionMetaMock(...args),
}))

describe('AppendTradesPage', () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <AppendTradesPage />
      </MemoryRouter>,
    )
  }

  beforeEach(() => {
    parseTradePasteMock.mockResolvedValue({
      rowsParsed: 2,
      symbols: ['NIFTY24JAN22500CE', 'BANKNIFTY24JAN48200PE'],
      trades: [{ symbol: 'NIFTY24JAN22500CE' }, { symbol: 'BANKNIFTY24JAN48200PE' }],
    })
    submitParsedTradesMock.mockResolvedValue({ status: 'sample', trades_uploaded: 2 })
    uploadTradesCSVMock.mockResolvedValue({ status: 'sample', trades_uploaded: 0, report: {} })
    logTraderLifecycleEventMock.mockResolvedValue(undefined)
    getStoredSessionMetaMock.mockReturnValue(null)
    isReadOnlySessionMock.mockReturnValue(false)
    updateSessionMetaMock.mockReset()
    getTradePasteMemoryMock.mockResolvedValue({
      has_previous: true,
      message: 'Comparing upload #3 to #2',
      deltas: [
        {
          metric: 'Win Rate',
          previous: '50.0%',
          current: '55.0%',
          delta: '+5.0pp',
          direction: 'up',
        },
      ],
    })
  })

  test('teaches the sample workspace without implying persistence', async () => {
    isSampleModeMock.mockReturnValue(true)
    const user = userEvent.setup()

    renderPage()

    fireEvent.change(screen.getByLabelText('Trades'), {
      target: { value: '2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20' },
    })
    await user.click(screen.getByRole('button', { name: 'Parse and preview trades' }))

    expect(await screen.findByText('Sample workspace can preview the parser, but it will not write trades to a permanent account.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm upload (2 trades)' }))

    expect(await screen.findByText('Sample workspace processed 2 trades.')).toBeInTheDocument()
    expect(screen.getByText('Sample mode shows parsing and workflow only. It does not persist uploads or update your account history.')).toBeInTheDocument()
    expect(getTradePasteMemoryMock).not.toHaveBeenCalled()
  }, 15000)

  test('shows real trade-paste-memory deltas in live mode', async () => {
    isSampleModeMock.mockReturnValue(false)
    getStoredSessionMetaMock.mockReturnValue({
      caseStatus: 'awaiting_upload',
      market: 'india',
      offerKind: 'psych_audit',
    })
    submitParsedTradesMock.mockResolvedValue({ status: 'ok', trades_uploaded: 2 })
    const user = userEvent.setup()

    renderPage()

    fireEvent.change(screen.getByLabelText('Trades'), {
      target: { value: '2024-01-15 09:32 NIFTY24JAN22500CE BUY 2 125.40 148.20' },
    })
    await user.click(screen.getByRole('button', { name: 'Parse and preview trades' }))
    await user.click(screen.getByRole('button', { name: 'Confirm upload (2 trades)' }))

    expect(await screen.findByText('Uploaded 2 trades to your live account.')).toBeInTheDocument()
    expect(screen.getByText('Comparing upload #3 to #2')).toBeInTheDocument()
    expect(screen.getByText('Win Rate: 50.0% -> 55.0% (+5.0pp)')).toBeInTheDocument()

    await waitFor(() => {
      expect(getTradePasteMemoryMock).toHaveBeenCalledTimes(1)
    })
    expect(updateSessionMetaMock).toHaveBeenCalledWith({ caseStatus: 'baseline_ready' })
  }, 15000)
})
