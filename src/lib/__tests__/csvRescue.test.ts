import { describe, expect, it } from 'vitest'
import { rescueCsvForUpload } from '../csvRescue'

describe('csvRescue', () => {
  it('maps common broker aliases into the backend-required headers', async () => {
    const file = new File([
      ['Date,Close Time,Ticker,Qty,Profit', '2026-04-01 09:15,2026-04-01 09:32,NIFTY24APR22500CE,2,1450'].join('\n'),
    ], 'broker.csv', { type: 'text/csv' })

    const rescued = await rescueCsvForUpload(file)
    const text = await rescued.file.text()

    expect(rescued.applied).toBe(true)
    expect(rescued.notes.some((note) => note.includes('Mapped Date -> timestamp'))).toBe(true)
    expect(text.split('\n')[0]).toBe('timestamp,exit_time,Symbol,size,pnl')
  })

  it('duplicates timestamp into exit_time when the source only provides one time column', async () => {
    const file = new File([
      ['Time,Tradingsymbol,Quantity,P&L', '2026-04-01 09:15,NIFTY24APR22500CE,2,1450'].join('\n'),
    ], 'single-time.csv', { type: 'text/csv' })

    const rescued = await rescueCsvForUpload(file)
    const [header, row] = (await rescued.file.text()).split('\n')

    expect(header).toBe('timestamp,exit_time,Symbol,size,pnl')
    expect(row).toContain('2026-04-01 09:15')
    expect(rescued.notes.some((note) => note.includes('Mirrored timestamp into exit_time'))).toBe(true)
  })

  it('rescues semicolon contract-note exports and strips ledger noise', async () => {
    const file = new File([
      [
        'Trade Date;Trade Time;Trading Symbol;Quantity;Realised P&L',
        '2026-04-01;09:15:00;NIFTY24APR22500CE;2;₹1,450.00 CR',
        '2026-04-01;09:20:00;Brokerage Charges;0;50.00 DR',
      ].join('\n'),
    ], 'contract-note.csv', { type: 'text/csv' })

    const rescued = await rescueCsvForUpload(file)
    const lines = (await rescued.file.text()).split('\n')

    expect(lines[0]).toBe('timestamp,exit_time,Symbol,size,pnl')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('2026-04-01 09:15:00,2026-04-01 09:15:00,NIFTY24APR22500CE,2,1450.00')
    expect(rescued.notes.some((note) => note.includes('contract-note style export'))).toBe(true)
    expect(rescued.notes.some((note) => note.includes('semicolon-delimited export'))).toBe(true)
    expect(rescued.notes.some((note) => note.includes('Dropped 1 ledger or charge row'))).toBe(true)
    expect(rescued.notes.some((note) => note.includes('Normalized currency-formatted size/PnL fields'))).toBe(true)
  })
})
