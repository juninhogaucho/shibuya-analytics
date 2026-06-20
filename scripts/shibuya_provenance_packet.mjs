import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..')
const reportPath = path.join(ROOT, 'artifacts', 'provenance', 'shibuya_public_to_live_provenance_latest.json')
const backendRoot = process.env.SHIBUYA_MEDALLION_ROOT || path.resolve(ROOT, '..', 'medallion')

function canRun(command) {
  const probe = spawnSync(command, ['--version'], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: false,
  })
  return probe.status === 0
}

function resolvePython() {
  const localAppData = process.env.LOCALAPPDATA || ''
  const candidates = [
    process.env.SHIBUYA_MEDALLION_PYTHON,
    process.env.PYTHON,
    path.join(localAppData, 'Temp', 'codex-medallion-test-venv-20260617', 'Scripts', 'python.exe'),
    path.join(backendRoot, '.venv', 'Scripts', 'python.exe'),
    path.join(backendRoot, '.venv-ci', 'Scripts', 'python.exe'),
    'python',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (path.isAbsolute(candidate) && !fs.existsSync(candidate)) {
      continue
    }
    if (canRun(candidate)) {
      return candidate
    }
  }

  return 'python'
}

const python = resolvePython()

const result = spawnSync(
  process.execPath,
  [
    path.join(ROOT, 'scripts', 'shibuya_public_to_live_provenance_gate.mjs'),
    '--build',
    '--with-backend',
    '--backend-root',
    backendRoot,
    '--python',
    python,
    '--report-json',
    reportPath,
  ],
  {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  },
)

if (result.error) {
  console.error(result.error.message)
}

process.exit(typeof result.status === 'number' ? result.status : 1)
