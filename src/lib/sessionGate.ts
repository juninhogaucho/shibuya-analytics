const SESSION_GATE_KEY = 'shibuya_session_gate'

export interface SessionGateRecord {
  date: string
  completedAt: string
  customerId?: string | null
  setup: string
  invalidation: string
  killCriteria: string
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function readSessionGateRecord(customerId?: string | null): SessionGateRecord | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_GATE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as SessionGateRecord
    if (!parsed?.date || parsed.date !== todayKey()) {
      return null
    }
    if (customerId && parsed.customerId && parsed.customerId !== customerId) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function isSessionGateCompleteToday(customerId?: string | null): boolean {
  return Boolean(readSessionGateRecord(customerId))
}

export function saveSessionGateRecord(record: Omit<SessionGateRecord, 'date' | 'completedAt'>): SessionGateRecord {
  const payload: SessionGateRecord = {
    ...record,
    date: todayKey(),
    completedAt: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_GATE_KEY, JSON.stringify(payload))
  }

  return payload
}

export function clearSessionGateRecord(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_GATE_KEY)
  }
}
