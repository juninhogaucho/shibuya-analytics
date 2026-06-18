import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const PRIVATE_DEMO_MIN_CODE_LENGTH = 8
const DISALLOWED_PRIVATE_DEMO_CODES = new Set([
  'changeme',
  'change-me',
  'demo',
  'demo-code',
  'password',
  'private-demo-code',
  'replace-with-private-demo-code',
  'secret',
  'test',
])

const REQUIRED_SURFACES = [
  {
    label: 'public StoryExperience',
    file: 'src/components/landing/StoryExperience.tsx',
    markers: ['3-minute demo path', 'Public story predicts a provisional fingerprint.', 'Guided demo conductor', 'Finish To Sample Upload', 'IFX emergency demo lane', 'One narrative, five stops, no live-proof overclaim.', 'URL-only fallback context'],
  },
  {
    label: 'public upload',
    file: 'src/pages/marketing/PublicUploadPage.tsx',
    markers: ['Use Sample History', 'Generate Free Report'],
  },
  {
    label: 'locked free report',
    file: 'src/pages/marketing/FreeReportPage.tsx',
    markers: ['Private insight contract', 'Locked until live workspace', 'report.storyHandoff.boundary', 'Open Locked Insight First', 'Continue Via Locked Insight', 'Private Insight Gate'],
  },
  {
    label: 'story handoff model',
    file: 'src/lib/storyExperience.ts',
    markers: ['storyHandoff', 'Guided StoryExperience signal', 'website-level handoff'],
  },
  {
    label: 'locked private insight',
    file: 'src/pages/marketing/LockedInsightPage.tsx',
    markers: ['Locked Private Insight', 'Private module preview', 'This is where recognition becomes evidence.', 'Claims this page refuses'],
  },
  {
    label: 'private demo gate',
    file: 'src/pages/marketing/PrivateDemoPage.tsx',
    markers: ['Private demo preflight', 'Check the handoff before unlocking the workspace.', 'Public-to-private handoff', 'Locked insight intent', 'Evidence boundary', 'Story handoff:', 'Unlock Reset Pro Preview'],
  },
  {
    label: 'checkout evidence boundary',
    file: 'src/pages/checkout/CheckoutPage.tsx',
    markers: ['Checkout intent', 'URL context only', 'public_context_source', 'public_context_report_id', 'public_context_story_source', 'enrichedCheckoutIntent'],
  },
  {
    label: 'pricing context ladder',
    file: 'src/pages/marketing/PricingPage.tsx',
    markers: ['readCheckoutIntent', 'appendCheckoutIntentToPath', 'Generate Free Report First', 'Continue Private Demo Gate'],
  },
  {
    label: 'checkout intent URL handoff',
    file: 'src/lib/checkoutIntent.ts',
    markers: ['storySource', 'scene_count', 'pain_axes', 'enrichCheckoutIntent'],
  },
  {
    label: 'checkout success activation handoff',
    file: 'src/pages/checkout/CheckoutSuccessPage.tsx',
    markers: ['Carried into activation', 'URL context only', 'Activate Live Account'],
  },
  {
    label: 'checkout API public context payload',
    file: 'src/lib/api/checkout.ts',
    markers: ['public_context_source', 'public_context_report_id', 'public_context_pain_axes'],
  },
  {
    label: 'live activation context',
    file: 'src/pages/marketing/ActivationPage.tsx',
    markers: ['CONTEXT DETECTED', 'activationStorySource', 'activationSelectedPainAxisIds', 'activationVisitedSceneCount', 'LIVE ACTIVATION PROOF LADDER', 'First meaningful upload required', 'Private conclusion still locked'],
  },
  {
    label: 'live workspace activation origin',
    file: 'src/pages/dashboard/OverviewPage.tsx',
    markers: ['LIVE ACTIVATION ORIGIN', 'Story handoff', 'No local story packet attached'],
  },
  {
    label: 'Reset Pro command center',
    file: 'src/lib/resetProDemo.ts',
    markers: ['Public packet source:', 'Handoff evidence:', 'Validation note:', 'Story handoff:', 'Public pain axes:', 'UNLOCK RECEIPT', 'This receipt proves the founder gate carried context into the sample workspace.'],
  },
  {
    label: 'Reset Pro operator strip',
    file: 'src/components/dashboard/ResetProDemoCommandCenter.tsx',
    markers: ['RESET PRO UNLOCK RECEIPT', 'RESET PRO OPERATOR STRIP', 'No dashboard wandering', 'Start at Mission HQ', 'Close On Append Proof'],
  },
  {
    label: 'append-proof exit',
    file: 'src/pages/dashboard/AppendTradesPage.tsx',
    markers: ['RESET PRO PROOF EXIT', 'This is the demo endpoint, not live evidence.', 'This is where the live proof loop starts.', 'Sample mode does not persist uploads', 'RESET PRO SAMPLE APPEND PACKET', 'Load Reset Pro Sample Trades', 'RESET PRO APPEND PROOF RECEIPT'],
  },
  {
    label: 'partner economics',
    file: 'src/pages/marketing/PartnersPage.tsx',
    markers: ['Simple base fee. Optional proved-uplift share.', 'TVA proof ledger', 'TVA reconciliation ladder'],
  },
]

function readEnvFile(fileName) {
  const filePath = path.join(ROOT, fileName)
  if (!fs.existsSync(filePath)) {
    return {}
  }

  const values = {}
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const delimiter = line.indexOf('=')
    if (delimiter === -1) {
      continue
    }

    const key = line.slice(0, delimiter).trim()
    const value = line.slice(delimiter + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && !(key in values)) {
      values[key] = value
    }
  }

  return values
}

function getEnvValue(key) {
  return (
    process.env[key]
    ?? readEnvFile('.env.local')[key]
    ?? readEnvFile('.env')[key]
    ?? ''
  ).trim()
}

function isUsablePrivateDemoCode(value) {
  const normalized = value.trim().toLowerCase()
  return normalized.length >= PRIVATE_DEMO_MIN_CODE_LENGTH && !DISALLOWED_PRIVATE_DEMO_CODES.has(normalized)
}

function inspectSurface(surface) {
  const absolutePath = path.join(ROOT, surface.file)
  if (!fs.existsSync(absolutePath)) {
    return {
      label: surface.label,
      ok: false,
      message: `${surface.file} is missing.`,
    }
  }

  const body = fs.readFileSync(absolutePath, 'utf8')
  const missingMarkers = surface.markers.filter((marker) => !body.includes(marker))

  return {
    label: surface.label,
    ok: missingMarkers.length === 0,
    message: missingMarkers.length === 0
      ? `${surface.file} contains the expected demo-path markers.`
      : `${surface.file} is missing marker(s): ${missingMarkers.join(', ')}`,
  }
}

function resultLine(status, label, message) {
  return `${status.padEnd(6)} ${label}: ${message}`
}

const checks = REQUIRED_SURFACES.map(inspectSurface)
const privateDemoCode = getEnvValue('VITE_PRIVATE_DEMO_ACCESS_CODE')
const apiBase = getEnvValue('VITE_API_BASE')
const privateGateReady = isUsablePrivateDemoCode(privateDemoCode)

checks.push({
  label: 'private demo code',
  ok: privateGateReady,
  message: privateGateReady
    ? 'VITE_PRIVATE_DEMO_ACCESS_CODE is configured and non-placeholder. Value is intentionally not printed.'
    : `VITE_PRIVATE_DEMO_ACCESS_CODE must be at least ${PRIVATE_DEMO_MIN_CODE_LENGTH} characters and not a placeholder.`,
})

const warnings = []
if (!apiBase) {
  warnings.push({
    label: 'live backend',
    message: 'VITE_API_BASE is not configured. Private sample demo can run, but live upload/payment/backend proof remains blocked.',
  })
}

console.log('Shibuya demo readiness gate')
console.log('Mode: public story -> upload/report -> locked insight -> checkout/activation -> private Reset Pro sample demo -> append-proof exit -> partner economics')
console.log('')

for (const check of checks) {
  console.log(resultLine(check.ok ? 'PASS' : 'FAIL', check.label, check.message))
}

for (const warning of warnings) {
  console.log(resultLine('WARN', warning.label, warning.message))
}

console.log('')
console.log('Secret policy: this gate reports presence/state only and never prints private demo code values.')

const failed = checks.filter((check) => !check.ok)
if (failed.length > 0) {
  console.error('')
  console.error(`Demo readiness failed: ${failed.length} blocker(s).`)
  process.exit(1)
}

console.log('')
console.log('Demo readiness passed for controlled private sample demos.')
