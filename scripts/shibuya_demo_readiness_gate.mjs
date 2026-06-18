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
    markers: ['3-minute demo path', 'Public story predicts a provisional fingerprint.', 'Guided demo conductor', 'Run 3-Min Story', 'Finish To Sample Upload', 'Append proof closes the demo where live evidence must begin.', 'IFX emergency demo lane', 'One narrative, six stops, no live-proof overclaim.', 'Open Append', 'URL-only fallback context', 'Every provider sells dashboards. Shibuya sells self-knowledge', 'run the public story first', 'Founder-gated recovery shortcut', 'Public handoff packet', 'Secret-free routing context', 'What survives from story into upload.', 'No raw trade rows, account id, brokerage login, P&L, or private conclusion'],
  },
  {
    label: 'IFX demo launcher',
    file: 'src/pages/marketing/DemoLauncherPage.tsx',
    markers: ['IFX Demo Launcher', 'DEMO LAUNCH PACKET', 'IFX operator run sheet', 'Three minutes. Five beats. One proof boundary.', 'Operator run sheet rule', 'PRIMARY IFX ROUTE', 'Story first. Shortcuts are fallback only.', 'Close Demo', 'Open Append', 'Fallback rule: direct report, direct insight, and activation links are recovery routes.', 'Append close is founder-gated even when opened from this launcher.', 'One controlled path from story to append-proof close.', 'The launcher is not live proof.', 'Secret values are never printed', 'IFX_DEMO_OPERATOR_RUNBOOK', 'buildIfxDemoJourneyPaths'],
  },
  {
    label: 'IFX public signal entry',
    file: 'src/pages/marketing/LaunchSignalPage.tsx',
    markers: ['IFX demo launcher', 'Start 3-Minute Story', 'Founder Demo Gate', 'Operator Launcher', 'This IFX link is a truthful demo path', 'buildIfxDemoJourneyPaths', 'privateDemoPath', 'demoLauncherPath'],
  },
  {
    label: 'public upload',
    file: 'src/pages/marketing/PublicUploadPage.tsx',
    markers: ['Use Sample History', 'Generate Free Report', 'Upload route integrity', 'Cold upload is recovery-only.', 'Direct upload recovery route', 'Route rule: guided story can seed the question', 'Prediction survival test', 'What is allowed to survive from story to report.', 'Survival rule: if a claim requires account-specific proof', 'Sample handoff receipt', 'Report unlock path', 'No raw rows, no production normalization, no account-specific conclusion.'],
  },
  {
    label: 'demo launcher sample packet',
    file: 'src/lib/publicReportSession.ts',
    markers: ['DEMO_LAUNCHER_SAMPLE_PACKET_VALUE', 'buildDemoLauncherSampleReportSession', 'Demo launcher initialized this sample packet from an explicit shared-link flag.', 'sample demo artifact'],
  },
  {
    label: 'locked free report',
    file: 'src/pages/marketing/FreeReportPage.tsx',
    markers: ['Private insight contract', 'Locked until live workspace', 'report.storyHandoff.boundary', 'Report-to-private handoff receipt', 'The report can carry context. It cannot carry the answer.', 'Private question carried', 'Handoff receipt rule: the locked insight inherits the question and evidence status only', 'Report engagement ledger', 'Conversion intent is tracked locally. It is not trader evidence.', 'Engagement ledger rule: report views, locked-section clicks, and private-demo intent', 'Open Locked Insight First', 'Continue Via Locked Insight', 'Private Insight Gate'],
  },
  {
    label: 'report engagement model',
    file: 'src/lib/publicReportEngagement.ts',
    markers: ['PUBLIC_REPORT_ENGAGEMENT_STORAGE_KEY', 'recordPublicReportView', 'recordLockedSectionIntent', 'recordPrivateDemoIntent', 'buildPublicReportEngagementRows', 'No raw trade rows'],
  },
  {
    label: 'story handoff model',
    file: 'src/lib/storyExperience.ts',
    markers: ['storyHandoff', 'Guided StoryExperience signal', 'website-level handoff'],
  },
  {
    label: 'locked private insight',
    file: 'src/pages/marketing/LockedInsightPage.tsx',
    markers: ['Locked Private Insight', 'Private module preview', 'This is where recognition becomes evidence.', 'Locked insight presenter guardrail', 'Presenter guardrail rule: the locked insight is a proof contract, not a private conclusion.', 'Locked insight engagement ledger', 'The click proves intent. It does not prove the answer.', 'route evidence only, never trading evidence', 'Private gate handoff checksum', 'Verify the route before opening Reset Pro.', 'Checksum rule: the founder gate may preserve route identity', 'sample route, not live answer', 'Reset Pro decision-room handoff', 'Turn the locked question into a demo route, not a claim.', 'Decision-room rule: the private demo can show workflow relevance', 'Claims this page refuses'],
  },
  {
    label: 'private demo gate',
    file: 'src/pages/marketing/PrivateDemoPage.tsx',
    markers: ['Private demo preflight', 'Check the handoff before unlocking the workspace.', 'Route integrity', 'Blocked: start from story/report', 'Blocked: open locked insight first', 'Private demo unlocks require a local locked-section intent receipt or an explicit controlled launcher packet.', 'Route integrity blocked', 'Private Reset Pro requires a carried public question.', 'Direct cold unlock is intentionally disabled.', 'Open StoryExperience', 'Open IFX Demo Launcher', 'Public-to-private handoff', 'Locked insight intent', 'Evidence boundary', 'Private gate engagement receipt', 'Intent survived into the founder gate. It still is not evidence.', 'route continuity only, never trader proof', 'Private gate engagement rule: views, locked clicks, and gate attempts can explain routing intent only.', 'engagementReportViewCount', 'engagementPrivateDemoIntentCount', 'Private demo claim script', 'What to say before the code goes in.', 'Do not claim live activation, backend normalization, or account-specific improvement.', 'Claim script rule: unlock can demonstrate workflow readiness only; it cannot prove live outcomes.', 'Post-unlock destination', 'Append proof close after unlock', 'Private demo unlock manifest', 'Unlock manifest rule: a successful code changes access state only after locked insight intent is verified.', 'nothing; URL-only, report-only, and cold private-demo unlocks are blocked', 'Reset Pro unlock receipt preview', 'The workspace will store this receipt, not the private code.', 'Receipt boundary', 'I acknowledge the private demo boundary.', 'Story handoff:', 'Unlock Reset Pro Preview', 'append_proof_shortcut'],
  },
  {
    label: 'workspace access guard',
    file: 'src/lib/runtime.ts',
    markers: ['getWorkspaceAccessState', 'hasPrivateResetProDemoReceipt', 'sample_without_private_gate', 'private_demo_receipt', 'demoUnlockReceiptId', 'demoUnlockBoundary'],
  },
  {
    label: 'checkout evidence boundary',
    file: 'src/pages/checkout/CheckoutPage.tsx',
    markers: ['Checkout intent', 'Checkout route integrity', 'Locked insight intent verified.', 'Locked insight intent required before payment.', 'Checkout requires a local locked-section intent receipt or controlled launcher packet.', 'A URL alone cannot start payment.', 'Open a locked private insight from the report before checkout', 'Generate Free Report First', 'Return To Pricing', 'Checkout engagement receipt', 'Checkout handoff contract', 'Payment can carry', 'Payment cannot prove', 'Next live proof step', 'URL context only', 'public_context_source', 'public_context_report_id', 'public_context_story_source', 'public_context_report_views', 'checkoutEngagementSummary', 'hasLockedSectionIntentProof', 'shouldCarryDemoLauncherPacket', 'enrichedCheckoutIntent', 'checkoutRouteReady'],
  },
  {
    label: 'pricing context ladder',
    file: 'src/pages/marketing/PricingPage.tsx',
    markers: ['readCheckoutIntent', 'appendCheckoutIntentToPath', 'Pricing route integrity', 'Start paid intent from the report, not a cold checkout.', 'Checkout unlocks only after locked insight context.', 'Generate Free Report First', 'Continue Private Demo Gate', 'hasLockedInsightIntent'],
  },
  {
    label: 'checkout intent URL handoff',
    file: 'src/lib/checkoutIntent.ts',
    markers: ['storySource', 'scene_count', 'pain_axes', 'signals', 'enrichCheckoutIntent'],
  },
  {
    label: 'IFX append gate handoff',
    file: 'src/lib/ifxDemoJourney.ts',
    markers: ['buildIfxAppendProofGateParams', 'destination', 'append_proof', 'appendProofPath'],
  },
  {
    label: 'checkout success activation handoff',
    file: 'src/pages/checkout/CheckoutSuccessPage.tsx',
    markers: ['Checkout success route integrity', 'Checkout record missing', 'cannot claim checkout completion without a stored order receipt or verified session id', 'Success route rule: order code, verified session, and activation handoff context are required', 'Carried into activation', 'Activation engagement receipt', 'Activation handoff contract', 'Order code proves', 'Activation must verify', 'Upload must prove', 'URL context only', 'Activate Live Account'],
  },
  {
    label: 'checkout API public context payload',
    file: 'src/lib/api/checkout.ts',
    markers: ['public_context_source', 'public_context_report_id', 'public_context_pain_axes', 'public_context_signal_markers', 'public_context_report_views', 'public_context_private_gate_attempts'],
  },
  {
    label: 'live proof readiness contract',
    file: 'src/lib/liveProofReadiness.ts',
    markers: ['LIVE BACKEND BLOCKED', 'BACKEND TARGET PRESENT', 'First meaningful upload', 'Append history', 'Sample routes, URL context, and founder codes'],
  },
  {
    label: 'live proof readiness card',
    file: 'src/components/dashboard/LiveProofReadinessCard.tsx',
    markers: ['LIVE PROOF READINESS', 'Backend target', 'First meaningful upload', 'Append history', 'Boundary:'],
  },
  {
    label: 'live activation context',
    file: 'src/pages/marketing/ActivationPage.tsx',
    markers: ['CONTEXT DETECTED', 'ACTIVATION ENGAGEMENT RECEIPT', 'activationEngagementSummary', 'activationEngagementReportViewCount', 'activationStorySource', 'activationSelectedPainAxisIds', 'activationVisitedSceneCount', 'activationSignalMarkerIds', 'LIVE PROOF READINESS', 'LIVE ACTIVATION PROOF LADDER', 'First meaningful upload required', 'Append proof close required', 'APPEND PROOF CLOSE', 'Private conclusion still locked'],
  },
  {
    label: 'live workspace activation origin',
    file: 'src/pages/dashboard/OverviewPage.tsx',
    markers: ['LIVE ACTIVATION ORIGIN', 'Story handoff', 'Public signal markers', 'Activation engagement receipt', 'Engagement boundary:', 'No report engagement receipt attached', 'No local story packet attached', 'LIVE FIRST UPLOAD CONTRACT', 'First upload must create', 'Append must prove', 'First screen after unlock is the Reset Pro command center'],
  },
  {
    label: 'Reset Pro context strip',
    file: 'src/components/dashboard/ResetProDemoContextStrip.tsx',
    markers: ['RESET PRO DEMO CONTEXT STRIP', 'Keep the public-to-private handoff visible across every workspace surface.', 'Private gate checksum', 'Engagement receipt', 'No report engagement receipt was stored', 'sample route, not live answer', 'Append Proof'],
  },
  {
    label: 'Reset Pro command center',
    file: 'src/lib/resetProDemo.ts',
    markers: ['Public packet source:', 'Handoff evidence:', 'Validation note:', 'Story handoff:', 'Public pain axes:', 'Private gate checksum:', 'Engagement receipt:', 'Engagement boundary:', 'Receipt id:', 'UNLOCK RECEIPT', 'RESET PRO LIVING MIRROR', 'Story became the product', 'LiveSignal', 'Next Session Mandate', 'RESET PRO CLOSE CONTRACT', 'Live upload, generated backend artifacts, durable account deltas, repeated append history, and trader-specific improvement remain unproven.', 'This receipt proves the founder gate carried context into the sample workspace.'],
  },
  {
    label: 'Reset Pro operator strip',
    file: 'src/components/dashboard/ResetProDemoCommandCenter.tsx',
    markers: ['RESET PRO WORKSPACE STATUS SNAPSHOT', 'Mode: sample-only', 'Context carried', 'Next proof required', 'Know what is live, what is carried, and what must be proven next.', 'RESET PRO LIVING MIRROR', 'Public fingerprint:', 'RESET PRO PRIVATE GATE CHECKSUM', 'The workspace must match the locked-insight route it received.', 'engagement receipt', 'Continuity check only', 'RESET PRO UNLOCK RECEIPT', 'RESET PRO OPERATOR STRIP', 'No dashboard wandering', 'Start at Mission HQ', 'Close On Append Proof', 'RESET PRO CLOSE CONTRACT', 'RESET PRO OBJECTION MAP', 'Fast answers for the questions that can break the demo.'],
  },
  {
    label: 'append-proof exit',
    file: 'src/pages/dashboard/AppendTradesPage.tsx',
    markers: ['LIVE ACTIVATION PROOF TARGET', 'First meaningful upload turns this from carried context into account evidence.', 'Activation engagement receipt', 'Engagement boundary:', 'LIVE PROOF READINESS', 'RESET PRO PROOF EXIT', 'activeStage="append"', 'Close the sample Reset Pro demo on append proof', 'This is the demo endpoint, not live evidence.', 'This is where the live proof loop starts.', 'Sample mode does not persist uploads', 'FOUNDER-GATED APPEND SHORTCUT', 'This close was opened directly after the private gate.', 'Mission HQ was bypassed for append close', 'RESET PRO APPEND CLOSE CHECKLIST', 'End the demo by proving the workflow, not the trader.', 'Forbidden close', 'Live proof path', 'RESET PRO SAMPLE APPEND PACKET', 'Load Reset Pro Sample Trades', 'RESET PRO APPEND PROOF RECEIPT', 'Unlock receipt carried', 'Engagement receipt carried', 'No private demo unlock receipt was attached'],
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
