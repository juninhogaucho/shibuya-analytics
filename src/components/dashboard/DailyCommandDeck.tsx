import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { readTodayCampaignEntry, saveDailyBriefing, saveDailyDebrief } from '../../lib/dailyPractice'
import { saveTraderDailyBriefing, saveTraderDailyDebrief } from '../../lib/api'
import type { CampaignMetrics, CampaignRiskTag, CampaignStateLevel, DashboardOverview } from '../../lib/types'
import type { PerformanceStory } from '../../lib/performanceStory'

const STATE_OPTIONS: Array<{ value: CampaignStateLevel; label: string }> = [
  { value: 'in_control', label: 'In control' },
  { value: 'under_pressure', label: 'Under pressure' },
  { value: 'loss_of_command', label: 'Loss of command' },
]

const RISK_OPTIONS: Array<{ value: CampaignRiskTag; label: string }> = [
  { value: 'revenge', label: 'Revenge' },
  { value: 'overtrading', label: 'Overtrading' },
  { value: 'size_discipline', label: 'Size discipline' },
  { value: 'drift', label: 'Execution drift' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'complacency', label: 'Complacency' },
]

const STANDARD_OPTIONS = [
  'Revenge trading',
  'Overtrading',
  'Size discipline',
  'Stop respected',
  'A+ selectivity',
  'Capital preserved',
]

function inferState(overview: DashboardOverview): CampaignStateLevel {
  if (overview.bql_state === 'LOSS_OF_COMMAND') {
    return 'loss_of_command'
  }
  if (overview.bql_state === 'UNDER_PRESSURE' || overview.bql_score >= 0.55) {
    return 'under_pressure'
  }
  return 'in_control'
}

function inferRisk(story: PerformanceStory): CampaignRiskTag {
  const enemy = story.currentEnemy.toLowerCase()
  if (enemy.includes('revenge')) {
    return 'revenge'
  }
  if (enemy.includes('size')) {
    return 'size_discipline'
  }
  if (enemy.includes('overtrading') || enemy.includes('compulsive')) {
    return 'overtrading'
  }
  if (enemy.includes('drift')) {
    return 'drift'
  }
  return 'fatigue'
}

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value]
}

export function DailyCommandDeck({
  customerId,
  story,
  overview,
  metrics,
  onUpdate,
}: {
  customerId?: string
  story: PerformanceStory
  overview: DashboardOverview
  metrics: CampaignMetrics
  onUpdate?: () => void
}) {
  const today = readTodayCampaignEntry(customerId)
  const backendBriefing = overview.daily_briefing
  const backendDebrief = overview.daily_debrief
  const [briefingState, setBriefingState] = useState<CampaignStateLevel>(() => backendBriefing?.current_state ?? today?.briefing?.current_state ?? inferState(overview))
  const [briefingRisk, setBriefingRisk] = useState<CampaignRiskTag>(() => backendBriefing?.current_risk ?? today?.briefing?.current_risk ?? inferRisk(story))
  const [avoidToday, setAvoidToday] = useState(() => backendBriefing?.avoid_today ?? today?.briefing?.avoid_today ?? story.currentEnemy)
  const [missionLine, setMissionLine] = useState(() => backendBriefing?.mission_line ?? today?.briefing?.mission_line ?? story.missionLine)
  const [gateObeyed, setGateObeyed] = useState(() => backendDebrief?.gate_obeyed ?? today?.debrief?.gate_obeyed ?? true)
  const [stoppedCorrectly, setStoppedCorrectly] = useState(() => backendDebrief?.stopped_correctly ?? today?.debrief?.stopped_correctly ?? false)
  const [protectedCapital, setProtectedCapital] = useState(() => backendDebrief?.protected_capital ?? today?.debrief?.protected_capital ?? true)
  const [mainLapse, setMainLapse] = useState(() => backendDebrief?.main_lapse ?? today?.debrief?.main_lapse ?? '')
  const [mainWin, setMainWin] = useState(() => backendDebrief?.main_win ?? today?.debrief?.main_win ?? '')
  const [tomorrowLine, setTomorrowLine] = useState(() => backendDebrief?.tomorrow_line ?? today?.debrief?.tomorrow_line ?? story.commandLine)
  const [standardsHeld, setStandardsHeld] = useState<string[]>(() => backendDebrief?.standards_held_today ?? today?.debrief?.standards_held_today ?? [])
  const [standardsBroken, setStandardsBroken] = useState<string[]>(() => backendDebrief?.standards_broken_today ?? today?.debrief?.standards_broken_today ?? [])
  const [savedBriefing, setSavedBriefing] = useState(() => Boolean(backendBriefing ?? today?.briefing))
  const [savedDebrief, setSavedDebrief] = useState(() => Boolean(backendDebrief ?? today?.debrief))

  const headline = useMemo(() => {
    if (metrics.standards_broken_today.length) {
      return `Recurring enemy: ${metrics.standards_broken_today[0]}`
    }
    return `Command line: ${story.commandLine}`
  }, [metrics.standards_broken_today, story.commandLine])

  const handleSaveBriefing = async () => {
    saveDailyBriefing(customerId, {
      current_state: briefingState,
      current_risk: briefingRisk,
      avoid_today: avoidToday.trim() || story.currentEnemy,
      mission_line: missionLine.trim() || story.missionLine,
    })
    try {
      await saveTraderDailyBriefing({
        current_state: briefingState,
        current_risk: briefingRisk,
        avoid_today: avoidToday.trim() || story.currentEnemy,
        mission_line: missionLine.trim() || story.missionLine,
        headline: overview.daily_briefing?.headline,
        summary: overview.daily_briefing?.summary,
        action_plan: overview.daily_briefing?.action_plan,
        proof_focus: overview.daily_briefing?.proof_focus,
        trader_mode: overview.trader_mode,
      })
    } catch {
      // Local journal remains the resilience fallback if backend persistence is unavailable.
    }
    setSavedBriefing(true)
    onUpdate?.()
    window.setTimeout(() => setSavedBriefing(false), 1800)
  }

  const handleSaveDebrief = async () => {
    saveDailyDebrief(customerId, {
      gate_obeyed: gateObeyed,
      stopped_correctly: stoppedCorrectly,
      protected_capital: protectedCapital,
      main_lapse: mainLapse.trim(),
      main_win: mainWin.trim(),
      tomorrow_line: tomorrowLine.trim() || story.commandLine,
      standards_held_today: standardsHeld,
      standards_broken_today: standardsBroken,
    })
    try {
      await saveTraderDailyDebrief({
        gate_obeyed: gateObeyed,
        stopped_correctly: stoppedCorrectly,
        protected_capital: protectedCapital,
        main_lapse: mainLapse.trim(),
        main_win: mainWin.trim(),
        tomorrow_line: tomorrowLine.trim() || story.commandLine,
        standards_held_today: standardsHeld,
        standards_broken_today: standardsBroken,
      })
    } catch {
      // Keep the local journal as the fallback so the ritual never hard-fails.
    }
    setSavedDebrief(true)
    onUpdate?.()
    window.setTimeout(() => setSavedDebrief(false), 1800)
  }

  return (
    <section className="grid-responsive two" style={{ marginBottom: '1.5rem' }}>
      <article className="glass-panel" style={{ borderColor: 'rgba(16, 185, 129, 0.18)', background: 'rgba(16, 185, 129, 0.05)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>DAILY BRIEFING</p>
            <h3 style={{ marginBottom: '0.5rem' }}>Lock the mission before the first order.</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              {headline}
            </p>
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleSaveBriefing}>
            {savedBriefing ? <CheckCircle2 className="w-4 h-4" /> : null}
            {savedBriefing ? 'Locked' : 'Lock briefing'}
          </button>
        </div>

        <div className="grid-responsive two" style={{ marginTop: '1rem', gap: '0.75rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Current state</h4>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {STATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`btn btn-sm ${briefingState === option.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setBriefingState(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </article>

          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Current risk</h4>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {RISK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`btn btn-sm ${briefingRisk === option.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setBriefingRisk(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </article>
        </div>

        <div className="grid-responsive two" style={{ marginTop: '1rem', gap: '0.75rem' }}>
          <label className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', display: 'block' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>What to avoid today</h4>
            <textarea
              value={avoidToday}
              onChange={(event) => setAvoidToday(event.target.value)}
              style={{ width: '100%', minHeight: '96px' }}
            />
          </label>
          <label className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', display: 'block' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Mission line</h4>
            <textarea
              value={missionLine}
              onChange={(event) => setMissionLine(event.target.value)}
              style={{ width: '100%', minHeight: '96px' }}
            />
          </label>
        </div>
      </article>

      <article className="glass-panel" style={{ borderColor: 'rgba(99, 102, 241, 0.18)', background: 'rgba(99, 102, 241, 0.05)' }}>
        <div className="section-header-inline" style={{ alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <p className="badge" style={{ marginBottom: '0.5rem' }}>DAILY DEBRIEF</p>
            <h3 style={{ marginBottom: '0.5rem' }}>Name the lapse, name the win, set tomorrow’s command.</h3>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              This is private by design. The job is not to look busy. The job is to become harder to break.
            </p>
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleSaveDebrief}>
            {savedDebrief ? <CheckCircle2 className="w-4 h-4" /> : null}
            {savedDebrief ? 'Saved' : 'Save debrief'}
          </button>
        </div>

        <div className="grid-responsive three" style={{ marginTop: '1rem', gap: '0.75rem' }}>
          <button className={`btn btn-sm ${gateObeyed ? 'btn-primary' : 'btn-secondary'}`} type="button" onClick={() => setGateObeyed((value) => !value)}>
            {gateObeyed ? 'Gate obeyed' : 'Gate broken'}
          </button>
          <button className={`btn btn-sm ${stoppedCorrectly ? 'btn-primary' : 'btn-secondary'}`} type="button" onClick={() => setStoppedCorrectly((value) => !value)}>
            {stoppedCorrectly ? 'Stopped correctly' : 'Did not stop correctly'}
          </button>
          <button className={`btn btn-sm ${protectedCapital ? 'btn-primary' : 'btn-secondary'}`} type="button" onClick={() => setProtectedCapital((value) => !value)}>
            {protectedCapital ? 'Capital protected' : 'Capital exposed'}
          </button>
        </div>

        <div className="grid-responsive two" style={{ marginTop: '1rem', gap: '0.75rem' }}>
          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Standards held today</h4>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {STANDARD_OPTIONS.map((standard) => (
                <button
                  key={`held-${standard}`}
                  className={`btn btn-sm ${standardsHeld.includes(standard) ? 'btn-primary' : 'btn-secondary'}`}
                  type="button"
                  onClick={() => setStandardsHeld((values) => toggleSelection(values, standard))}
                >
                  {standard}
                </button>
              ))}
            </div>
          </article>

          <article className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Standards broken today</h4>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {STANDARD_OPTIONS.map((standard) => (
                <button
                  key={`broken-${standard}`}
                  className={`btn btn-sm ${standardsBroken.includes(standard) ? 'btn-primary' : 'btn-secondary'}`}
                  type="button"
                  onClick={() => setStandardsBroken((values) => toggleSelection(values, standard))}
                >
                  {standard}
                </button>
              ))}
            </div>
          </article>
        </div>

        <div className="grid-responsive two" style={{ marginTop: '1rem', gap: '0.75rem' }}>
          <label className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', display: 'block' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Main lapse</h4>
            <textarea
              value={mainLapse}
              onChange={(event) => setMainLapse(event.target.value)}
              style={{ width: '100%', minHeight: '88px' }}
            />
          </label>
          <label className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', display: 'block' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Main win</h4>
            <textarea
              value={mainWin}
              onChange={(event) => setMainWin(event.target.value)}
              style={{ width: '100%', minHeight: '88px' }}
            />
          </label>
        </div>

        <label className="glass-panel" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', display: 'block' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>One line for tomorrow</h4>
          <textarea
            value={tomorrowLine}
            onChange={(event) => setTomorrowLine(event.target.value)}
            style={{ width: '100%', minHeight: '88px' }}
          />
        </label>
      </article>
    </section>
  )
}
