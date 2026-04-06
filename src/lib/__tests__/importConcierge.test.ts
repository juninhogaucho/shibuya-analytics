import { describe, expect, it } from 'vitest'
import { buildImportConcierge } from '../importConcierge'
import { buildUploadPlaybook } from '../uploadPlaybook'
import type { TraderProfileContext } from '../types'

const profile: TraderProfileContext = {
  capital_band: 'under_50k_inr',
  monthly_income_band: 'student_or_none',
  trader_focus: 'retail_fo',
  broker_platform: 'Zerodha',
  primary_instruments: ['nifty_options'],
  trader_mode: 'retail_fn0_struggler',
  completed: true,
}

describe('importConcierge', () => {
  it('builds a high-readiness concierge for completed India profiles', () => {
    const concierge = buildImportConcierge({
      profile,
      playbook: buildUploadPlaybook(profile),
      premiumAccess: false,
    })

    expect(concierge.readinessScore).toBeGreaterThanOrEqual(85)
    expect(concierge.firstMove).toContain('Zerodha')
    expect(concierge.artifacts.map((artifact) => artifact.id)).toContain('cleanup-checklist')
  })

  it('adds a premium import doctor asset for premium users', () => {
    const concierge = buildImportConcierge({
      profile,
      playbook: buildUploadPlaybook(profile),
      premiumAccess: true,
    })

    expect(concierge.artifacts.map((artifact) => artifact.id)).toContain('upload-doctor-note')
    expect(concierge.hiddenGift).toContain('premium')
  })
})
