import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(import.meta.dirname, '..')
const DEFAULT_MEDALLION_ROOT = path.resolve(ROOT, '..', 'medallion')

const FRONTEND_CLAIM_SURFACES = [
  {
    label: 'method proof data contract',
    file: 'src/lib/methodProof.ts',
    markers: [
      'METHOD_PROOF_CARDS',
      'Shibuya Shield v2',
      'Risk v2',
      '0.9788',
      '0.9753',
      '0.7759',
      '0.1647',
      '13.3%',
      'Synthetic proof validates method behavior, not real-world accuracy.',
      'Real proof',
      'Pending',
    ],
  },
  {
    label: 'public proof stack surface',
    file: 'src/components/landing/ProofStack.tsx',
    markers: [
      'Method proof, not magic',
      'The public promise now has math underneath it.',
      'synthetic method-validation numbers from Medallion v2 engines',
      'not real-world accuracy on a live trader or firm book',
      'METHOD_PROOF_BOUNDARIES',
      'METHOD_PROOF_CARDS',
      'Test The Mirror',
    ],
  },
  {
    label: 'homepage composition',
    file: 'src/pages/marketing/HomePage.tsx',
    markers: [
      "import ProofStack from '../../components/landing/ProofStack'",
      '<ProofStack />',
    ],
  },
  {
    label: 'proof stack regression test',
    file: 'src/components/landing/__tests__/ProofStack.test.tsx',
    markers: [
      'Method proof, not magic',
      'synthetic/live boundaries',
      '0.9788',
      '0.7759',
      '13.3%',
      'guaranteed profit',
      'live account accuracy',
    ],
  },
]

const MEDALLION_PROOF_SOURCES = [
  {
    label: 'Shibuya Shield v2 proof source',
    file: 'shibuya_shield_v2/PROOF.md',
    markers: [
      'Method Validation (SYNTHETIC data)',
      'What this is NOT',
      'ROC-AUC:** 0.9788',
      'PR-AUC',
      '0.9753',
      'Hard-negative FPR',
      '0.1333',
      'not verdicts',
    ],
  },
  {
    label: 'Risk v2 proof source',
    file: 'risk_v2/PROOF.md',
    markers: [
      'Ruin Estimator Calibration (SYNTHETIC)',
      'first-passage ruin estimator',
      'Correlation (pred vs real):** 0.7759',
      'MAE:** 0.1647',
      'low ruin estimate from short history is NOT evidence of safety',
      'Real-world calibration requires real account histories',
    ],
  },
]

function parseArgs(argv) {
  const options = {
    medallionRoot: process.env.SHIBUYA_MEDALLION_ROOT || DEFAULT_MEDALLION_ROOT,
    json: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--medallion-root') {
      options.medallionRoot = path.resolve(argv[++index] ?? '')
    } else if (arg === '--json') {
      options.json = true
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/shibuya_method_proof_gate.mjs [--medallion-root <path>] [--json]')
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function inspectFile(root, surface) {
  const absolutePath = path.join(root, surface.file)
  if (!fs.existsSync(absolutePath)) {
    return {
      label: surface.label,
      file: absolutePath,
      ok: false,
      missing: surface.markers,
      message: `${surface.file} is missing.`,
    }
  }

  const body = fs.readFileSync(absolutePath, 'utf8')
  const missing = surface.markers.filter((marker) => !body.includes(marker))
  return {
    label: surface.label,
    file: absolutePath,
    ok: missing.length === 0,
    missing,
    message: missing.length === 0
      ? `${surface.file} contains the expected method-proof markers.`
      : `${surface.file} is missing marker(s): ${missing.join(', ')}`,
  }
}

function printLine(result) {
  const status = result.ok ? 'PASS' : 'FAIL'
  console.log(`${status.padEnd(5)} ${result.label}: ${result.message}`)
}

const options = parseArgs(process.argv.slice(2))
const checks = [
  ...FRONTEND_CLAIM_SURFACES.map((surface) => inspectFile(ROOT, surface)),
  ...MEDALLION_PROOF_SOURCES.map((surface) => inspectFile(options.medallionRoot, surface)),
]
const failed = checks.filter((check) => !check.ok)
const report = {
  gate: 'shibuya_method_proof_gate',
  root: ROOT,
  medallionRoot: path.resolve(options.medallionRoot),
  passed: failed.length === 0,
  checks,
  boundary:
    'This gate proves the Shibuya frontend method-proof copy is traceable to Medallion synthetic method-validation artifacts. It does not prove live account accuracy.',
}

if (options.json) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('Shibuya method proof gate')
  console.log('Mode: public proof surface -> frontend method contract -> Medallion proof artifacts')
  console.log('')
  for (const check of checks) {
    printLine(check)
  }
  console.log('')
  console.log(`Boundary: ${report.boundary}`)
}

if (failed.length > 0) {
  if (!options.json) {
    console.error('')
    console.error(`Method proof gate failed: ${failed.length} blocker(s).`)
  }
  process.exit(1)
}

if (!options.json) {
  console.log('')
  console.log('Method proof gate passed.')
}

