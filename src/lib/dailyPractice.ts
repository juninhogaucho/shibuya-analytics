import type {
  CampaignJournalEntry,
  CampaignMetrics,
  DashboardOverview,
  DailyBriefingState,
  DailyDebriefState,
  TradingReportComparisonResponse,
} from './types'

const STORAGE_PREFIX = 'shibuya_campaign_journal'

function getStorageKey(customerId?: string | null): string {
  return `${STORAGE_PREFIX}:${customerId || 'anonymous'}`
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readFromStorage(customerId?: string | null): CampaignJournalEntry[] {
  const raw = localStorage.getItem(getStorageKey(customerId))
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as CampaignJournalEntry[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .filter((entry) => entry && typeof entry.date === 'string')
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

function writeToStorage(customerId: string | null | undefined, entries: CampaignJournalEntry[]): void {
  localStorage.setItem(getStorageKey(customerId), JSON.stringify(entries))
}

function upsertEntry(
  customerId: string | null | undefined,
  date: string,
  updater: (entry: CampaignJournalEntry) => CampaignJournalEntry,
): CampaignJournalEntry[] {
  const existing = readFromStorage(customerId)
  const index = existing.findIndex((entry) => entry.date === date)
  const current = index >= 0 ? existing[index] : { date }
  const nextEntry = updater(current)
  const next = [...existing]

  if (index >= 0) {
    next[index] = nextEntry
  } else {
    next.push(nextEntry)
  }

  next.sort((a, b) => a.date.localeCompare(b.date))
  writeToStorage(customerId, next)
  return next
}

export function readCampaignJournal(customerId?: string | null): CampaignJournalEntry[] {
  return readFromStorage(customerId)
}

export function readTodayCampaignEntry(customerId?: string | null): CampaignJournalEntry | null {
  const today = getLocalDateKey()
  return readFromStorage(customerId).find((entry) => entry.date === today) ?? null
}

export function saveDailyBriefing(
  customerId: string | null | undefined,
  briefing: Omit<DailyBriefingState, 'date' | 'completed_at'>,
): CampaignJournalEntry[] {
  const date = getLocalDateKey()
  return upsertEntry(customerId, date, (entry) => ({
    ...entry,
    briefing: {
      ...briefing,
      date,
      completed_at: new Date().toISOString(),
    },
  }))
}

export function saveDailyDebrief(
  customerId: string | null | undefined,
  debrief: Omit<DailyDebriefState, 'date' | 'completed_at'>,
): CampaignJournalEntry[] {
  const date = getLocalDateKey()
  return upsertEntry(customerId, date, (entry) => ({
    ...entry,
    debrief: {
      ...debrief,
      date,
      completed_at: new Date().toISOString(),
    },
  }))
}

function rollingCleanSessions(entries: CampaignJournalEntry[]): number {
  if (!entries.length) {
    return 0
  }

  let best = 0
  for (let index = 0; index < entries.length; index += 1) {
    const windowEntries = entries.slice(Math.max(0, index - 6), index + 1)
    const cleanCount = windowEntries.filter((entry) => {
      const debrief = entry.debrief
      return debrief?.gate_obeyed && debrief.protected_capital && debrief.standards_broken_today.length === 0
    }).length
    best = Math.max(best, cleanCount)
  }
  return best
}

function buildCountMap(values: string[]): Map<string, number> {
  return values.reduce((map, value) => {
    map.set(value, (map.get(value) ?? 0) + 1)
    return map
  }, new Map<string, number>())
}

function getTopValue(values: string[], fallback: string): string {
  if (!values.length) {
    return fallback
  }

  const map = buildCountMap(values)
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback
}

function buildSessionLine(entry: CampaignJournalEntry, kind: 'clean' | 'danger'): string {
  const dateLabel = new Date(`${entry.date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
  const debrief = entry.debrief
  if (!debrief) {
    return `${dateLabel}: session not debriefed yet`
  }

  if (kind === 'clean') {
    return `${dateLabel}: ${debrief.main_win || 'gate held and capital protected'}`
  }

  return `${dateLabel}: ${debrief.main_lapse || debrief.standards_broken_today[0] || 'standards slipped'}`
}

function computeStreak(
  entries: CampaignJournalEntry[],
  predicate: (debrief: DailyDebriefState) => boolean,
): number {
  let streak = 0
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  for (const entry of sorted) {
    if (!entry.debrief) {
      break
    }
    if (!predicate(entry.debrief)) {
      break
    }
    streak += 1
  }

  return streak
}

export function buildCampaignMetrics({
  entries,
  comparison,
  overview,
}: {
  entries: CampaignJournalEntry[]
  comparison?: TradingReportComparisonResponse | null
  overview?: DashboardOverview | null
}): CampaignMetrics {
  const today = getLocalDateKey()
  const todayEntry = entries.find((entry) => entry.date === today) ?? null
  const overviewDebrief = overview?.daily_debrief ?? null
  const effectiveEntries =
    overviewDebrief && !todayEntry
      ? [...entries, { date: today, debrief: overviewDebrief }]
      : entries
  const debriefs = effectiveEntries
    .map((entry) => entry.debrief)
    .filter((entry): entry is DailyDebriefState => Boolean(entry))
  const brokenStandards = debriefs.flatMap((entry) => entry.standards_broken_today)
  const heldStandards = debriefs.flatMap((entry) => entry.standards_held_today)
  const cleanEntries = effectiveEntries.filter((entry) => {
    const debrief = entry.debrief
    return debrief?.gate_obeyed && debrief.protected_capital && debrief.standards_broken_today.length === 0
  })
  const dangerousEntries = effectiveEntries.filter((entry) => (entry.debrief?.standards_broken_today.length ?? 0) > 0)
  const comparisonSavedCapital =
    comparison?.has_comparison && comparison.delta_summary
      ? Math.max(0, -comparison.delta_summary.discipline_tax_change)
      : 0
  const savedCapital = overview?.saved_capital_vs_baseline ?? comparisonSavedCapital

  return {
    daily_briefing_completed: Boolean(overview?.daily_briefing ?? todayEntry?.briefing),
    daily_debrief: overviewDebrief ?? todayEntry?.debrief ?? null,
    standards_held_today: overview?.standards_held_today ?? overviewDebrief?.standards_held_today ?? todayEntry?.debrief?.standards_held_today ?? [],
    standards_broken_today: overview?.standards_broken_today ?? overviewDebrief?.standards_broken_today ?? todayEntry?.debrief?.standards_broken_today ?? [],
    saved_capital_vs_baseline: savedCapital,
    clean_session_count: cleanEntries.length,
    revenge_free_streak: computeStreak(effectiveEntries, (debrief) => !debrief.standards_broken_today.includes('Revenge trading')),
    size_discipline_streak: computeStreak(effectiveEntries, (debrief) => !debrief.standards_broken_today.includes('Size discipline')),
    sessions_stopped_correctly: debriefs.filter((entry) => entry.stopped_correctly).length,
    best_controlled_week: rollingCleanSessions(effectiveEntries),
    recurring_enemy: overview?.recurring_enemy ?? getTopValue(brokenStandards, 'The same enemy has not repeated often enough to name yet.'),
    standards_held_most_often: getTopValue(heldStandards, 'Capital preserved'),
    standards_broken_most_often: getTopValue(brokenStandards, 'No recurring broken standard logged yet.'),
    most_dangerous_session: dangerousEntries.length
      ? buildSessionLine(dangerousEntries[dangerousEntries.length - 1], 'danger')
      : 'No dangerous session recorded yet.',
    cleanest_session: cleanEntries.length
      ? buildSessionLine(cleanEntries[cleanEntries.length - 1], 'clean')
      : 'No fully clean session recorded yet.',
    last_real_improvement:
      savedCapital > 0
        ? `Recovered ${savedCapital.toLocaleString('en-IN')} in discipline leak versus baseline.`
        : cleanEntries.length
          ? buildSessionLine(cleanEntries[cleanEntries.length - 1], 'clean')
          : 'Improvement has not been proven yet.',
  }
}
