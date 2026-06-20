import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DEFAULT_BACKEND_ROOT = path.resolve(ROOT, '..', 'medallion')

const FRONTEND_TEST_TARGETS = [
  'src/lib/__tests__/runtime.test.ts',
  'src/lib/__tests__/publicReportSession.test.ts',
  'src/pages/marketing/__tests__/PublicJourneyPages.test.tsx',
  'src/pages/checkout/__tests__/CheckoutPage.test.tsx',
  'src/pages/marketing/__tests__/ActivationPage.test.tsx',
  'src/pages/marketing/__tests__/PricingPage.test.tsx',
  'src/lib/api/__tests__/dashboard.test.ts',
  'src/pages/dashboard/__tests__/OverviewPage.test.tsx',
  'src/pages/dashboard/__tests__/AppendTradesPage.test.tsx',
  'src/pages/dashboard/__tests__/WorkspacePage.test.tsx',
  'src/pages/dashboard/__tests__/ReportsPage.test.tsx',
]

const ESLINT_TARGETS = [
  'src/lib/types.ts',
  'src/lib/runtime.ts',
  'src/lib/api/auth.ts',
  'src/lib/api/checkout.ts',
  'src/lib/api/dashboard.ts',
  'src/pages/checkout/CheckoutPage.tsx',
  'src/pages/checkout/CheckoutSuccessPage.tsx',
  'src/pages/marketing/FreeReportPage.tsx',
  'src/pages/marketing/PublicUploadPage.tsx',
  'src/pages/marketing/ActivationPage.tsx',
  'src/pages/marketing/PricingPage.tsx',
  'src/pages/dashboard/OverviewPage.tsx',
  'src/pages/dashboard/AppendTradesPage.tsx',
  ...FRONTEND_TEST_TARGETS,
]

const NODE_TOOL_ENTRIES = {
  vitest: 'node_modules/vitest/vitest.mjs',
  tsc: 'node_modules/typescript/bin/tsc',
  eslint: 'node_modules/eslint/bin/eslint.js',
  vite: 'node_modules/vite/bin/vite.js',
}

function parseArgs(argv) {
  const options = {
    withBackend: false,
    backendRoot: process.env.SHIBUYA_MEDALLION_ROOT || DEFAULT_BACKEND_ROOT,
    python: process.env.SHIBUYA_MEDALLION_PYTHON || process.env.PYTHON || 'python',
    reportJson: null,
    build: false,
    skipFrontend: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--with-backend') {
      options.withBackend = true
    } else if (arg === '--backend-root') {
      options.backendRoot = path.resolve(argv[++index] ?? '')
    } else if (arg === '--python') {
      options.python = argv[++index] ?? options.python
    } else if (arg === '--report-json') {
      options.reportJson = path.resolve(argv[++index] ?? '')
    } else if (arg === '--build') {
      options.build = true
    } else if (arg === '--skip-frontend') {
      options.skipFrontend = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function printHelp() {
  console.log(`Shibuya public-to-live provenance gate

Usage:
  node scripts/shibuya_public_to_live_provenance_gate.mjs [options]

Options:
  --with-backend              Also run the Medallion backend provenance gate.
  --backend-root <path>       Medallion repo path. Defaults to ../medallion.
  --python <path-or-name>     Python executable for the backend gate.
  --build                     Include production build after tests/lint/typecheck.
  --report-json <path>        Write a JSON execution report.
  --skip-frontend             Only useful with --with-backend; skip frontend checks.
`)
}

function ensureFiles(paths) {
  const missing = paths.filter((target) => !fs.existsSync(path.join(ROOT, target)))
  if (missing.length > 0) {
    throw new Error(`Missing gate file(s): ${missing.join(', ')}`)
  }
}

function nodeTool(name) {
  const entry = path.join(ROOT, NODE_TOOL_ENTRIES[name])
  if (!fs.existsSync(entry)) {
    throw new Error(`${name} entrypoint not found at ${entry}. Run npm ci before this gate.`)
  }
  return { command: process.execPath, args: [entry] }
}

function buildStepEnv() {
  const pathKey = process.platform === 'win32' ? 'Path' : 'PATH'
  const existingPath = process.env[pathKey] || process.env.PATH || ''
  return {
    ...process.env,
    [pathKey]: [path.dirname(process.execPath), existingPath].filter(Boolean).join(path.delimiter),
  }
}

function runStep(name, command, args, cwd = ROOT) {
  console.log(`\n== ${name}`)
  console.log([command, ...args].join(' '))
  const started = performance.now()
  const completed = spawnSync(command, args, {
    cwd,
    env: buildStepEnv(),
    stdio: 'inherit',
    shell: false,
  })
  const durationSeconds = (performance.now() - started) / 1000
  if (completed.error) {
    console.error(completed.error.message)
  }
  const exitCode = typeof completed.status === 'number' ? completed.status : 1
  console.log(`exit=${exitCode} duration=${durationSeconds.toFixed(2)}s`)
  return {
    name,
    command: [command, ...args],
    cwd,
    exit_code: exitCode,
    duration_seconds: Number(durationSeconds.toFixed(3)),
  }
}

function runFrontendGate() {
  ensureFiles([...FRONTEND_TEST_TARGETS, ...ESLINT_TARGETS])
  const vitest = nodeTool('vitest')
  const tsc = nodeTool('tsc')
  const eslint = nodeTool('eslint')
  const vite = nodeTool('vite')

  const steps = [
    runStep('vitest public-to-live provenance contract', vitest.command, [...vitest.args, 'run', ...FRONTEND_TEST_TARGETS]),
    runStep('typecheck frontend provenance surface', tsc.command, [...tsc.args, '-b']),
    runStep('eslint frontend provenance surface', eslint.command, [...eslint.args, ...ESLINT_TARGETS]),
  ]

  return { steps, vite }
}

function runBackendGate(options) {
  const backendRoot = path.resolve(options.backendRoot)
  const gateScript = path.join(backendRoot, 'scripts', 'shibuya_public_to_live_provenance_gate.py')
  if (!fs.existsSync(gateScript)) {
    throw new Error(`Backend provenance gate missing: ${gateScript}`)
  }

  return runStep('medallion backend public-to-live provenance gate', options.python, [gateScript], backendRoot)
}

function writeReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

const options = parseArgs(process.argv.slice(2))
const steps = []

try {
  if (!options.skipFrontend) {
    const frontend = runFrontendGate()
    steps.push(...frontend.steps)
    if (options.build) {
      steps.push(runStep('production build', frontend.vite.command, [...frontend.vite.args, 'build']))
    }
  }

  if (options.withBackend) {
    steps.push(runBackendGate(options))
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const failed = steps.filter((step) => step.exit_code !== 0)
const report = {
  gate: 'shibuya_public_to_live_provenance_frontend',
  root: ROOT,
  backend_root: options.withBackend ? path.resolve(options.backendRoot) : null,
  passed: failed.length === 0,
  steps,
}

if (options.reportJson) {
  writeReport(options.reportJson, report)
}

if (failed.length > 0) {
  console.error(`\nGate failed: ${failed.length} step(s) returned non-zero.`)
  process.exit(1)
}

console.log('\nGate passed: Shibuya public-to-live provenance is intact.')
