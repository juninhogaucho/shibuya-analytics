import { beforeEach, describe, expect, it } from 'vitest'
import { clearSessionGateRecord, isSessionGateCompleteToday, readSessionGateRecord, saveSessionGateRecord } from '../sessionGate'

describe('sessionGate', () => {
  beforeEach(() => {
    clearSessionGateRecord()
  })

  it('stores and reads a gate record for today', () => {
    saveSessionGateRecord({
      customerId: 'cust_123',
      setup: 'Nifty opening drive only',
      invalidation: 'Below the morning range low',
      killCriteria: 'Two losses or any revenge impulse',
    })

    expect(isSessionGateCompleteToday('cust_123')).toBe(true)
    expect(readSessionGateRecord('cust_123')?.setup).toContain('Nifty')
  })

  it('ignores a record for a different customer id', () => {
    saveSessionGateRecord({
      customerId: 'cust_123',
      setup: 'Setup',
      invalidation: 'Invalidation',
      killCriteria: 'Kill criteria',
    })

    expect(readSessionGateRecord('cust_other')).toBeNull()
  })
})
