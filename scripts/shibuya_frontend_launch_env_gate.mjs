#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off'])
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])
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
const LEGACY_DIRECT_PAYMENT_LINK_KEYS = [
  'VITE_STRIPE_LINK_BASIC',
  'VITE_STRIPE_LINK_PREMIUM',
]

function parseArgs(argv) {
  const options = {
    envFiles: [],
    target: 'live',
    includeProcessEnv: true,
    reportJson: null,
    pretty: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--env-file') {
      options.envFiles.push(path.resolve(ROOT, argv[++index] ?? ''))
    } else if (arg === '--target') {
      const target = argv[++index]
      if (!['live', 'preview', 'local'].includes(target)) {
        throw new Error(`Unknown target: ${target}`)
      }
      options.target = target
    } else if (arg === '--ignore-process-env') {
      options.includeProcessEnv = false
    } else if (arg === '--report-json') {
      options.reportJson = path.resolve(ROOT, argv[++index] ?? '')
    } else if (arg === '--pretty') {
      options.pretty = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (options.envFiles.length === 0) {
    options.envFiles = [
      path.join(ROOT, '.env.production.local'),
      path.join(ROOT, '.env.production'),
      path.join(ROOT, '.env.local'),
      path.join(ROOT, '.env'),
    ]
  }

  return options
}

function printHelp() {
  console.log(`Shibuya frontend launch environment gate

Usage:
  node scripts/shibuya_frontend_launch_env_gate.mjs [options]

Options:
  --env-file <path>        Dotenv file to load. May be repeated.
  --target <live|preview|local>
                           live requires a public HTTPS API base.
  --ignore-process-env     Use only env files, not current process env.
  --report-json <path>     Write a JSON report.
  --pretty                 Pretty-print JSON.

Secret policy:
  The gate reports key names and states only. It never prints env values.
`)
}

function parseDotenvLine(rawLine) {
  const trimmed = rawLine.trim()
  if (!trimmed || trimmed.startsWith('#')) {
    return null
  }

  const line = trimmed.startsWith('export ') ? trimmed.slice('export '.length).trim() : trimmed
  const delimiter = line.indexOf('=')
  if (delimiter < 1) {
    return null
  }

  const key = line.slice(0, delimiter).trim()
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return null
  }

  let value = line.slice(delimiter + 1).trim()
  if (value.startsWith('"') || value.startsWith("'")) {
    const quote = value[0]
    const end = value.indexOf(quote, 1)
    value = end >= 0 ? value.slice(1, end) : value.slice(1)
  } else {
    value = value.split(' #', 1)[0].trim()
  }

  return [key, value]
}

function loadEnvFiles(paths) {
  const env = {}
  const sources = []

  for (const filePath of paths) {
    const source = {
      path: path.relative(ROOT, filePath) || filePath,
      exists: fs.existsSync(filePath),
      keys_loaded: 0,
    }

    if (source.exists) {
      for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
        const parsed = parseDotenvLine(rawLine)
        if (!parsed) {
          continue
        }
        const [key, value] = parsed
        env[key] = value
        source.keys_loaded += 1
      }
    }

    sources.push(source)
  }

  return { env, sources }
}

function mergeEnv(fileEnv, includeProcessEnv) {
  const merged = { ...fileEnv }
  if (!includeProcessEnv) {
    return merged
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string') {
      merged[key] = value
    }
  }
  return merged
}

function valueState(value) {
  if (value === undefined) {
    return 'missing'
  }

  const normalized = value.trim()
  if (!normalized) {
    return 'empty'
  }

  const lowered = normalized.toLowerCase()
  const placeholders = [
    'xxxxx',
    'your_',
    'your-',
    'placeholder',
    'replace-with',
    'change-me',
    'changeme',
    'example',
    'todo',
  ]

  if (['...', 'xxx', 'https://buy.stripe.com/your_basic_link', 'https://buy.stripe.com/your_premium_link'].includes(lowered)) {
    return 'placeholder'
  }

  if (placeholders.some((term) => lowered.includes(term))) {
    return 'placeholder'
  }

  return 'present'
}

function keyStates(env, keys) {
  return Object.fromEntries(keys.map((key) => [key, valueState(env[key])]))
}

function flagState(value) {
  if (value === undefined) {
    return 'missing'
  }
  const lowered = value.trim().toLowerCase()
  if (TRUE_VALUES.has(lowered)) {
    return 'true'
  }
  if (FALSE_VALUES.has(lowered)) {
    return 'false'
  }
  return 'invalid'
}

function publicApiBaseState(value, target) {
  const state = valueState(value)
  if (state !== 'present') {
    return {
      ok: false,
      detail: `VITE_API_BASE is ${state}`,
      evidence: { value_state: state },
    }
  }

  let parsed
  try {
    parsed = new URL(value)
  } catch {
    return {
      ok: false,
      detail: 'VITE_API_BASE must be a valid URL',
      evidence: { value_state: state, url_parse: 'failed' },
    }
  }

  const host = parsed.hostname.toLowerCase()
  const local = LOCAL_HOSTS.has(host)
  const https = parsed.protocol === 'https:'
  const http = parsed.protocol === 'http:'
  const evidence = {
    scheme: parsed.protocol.replace(':', '') || 'missing',
    host_class: local ? 'local' : 'public_or_private',
    pathname_present: Boolean(parsed.pathname && parsed.pathname !== '/'),
  }

  if (target === 'local') {
    return {
      ok: (http || https) && Boolean(parsed.hostname),
      detail: 'local target allows localhost HTTP/HTTPS API bases',
      evidence,
    }
  }

  if (!https) {
    return {
      ok: false,
      detail: 'live and preview targets require HTTPS',
      evidence,
    }
  }

  if (local || host.endsWith('.local')) {
    return {
      ok: false,
      detail: 'live and preview targets must not point at localhost',
      evidence,
    }
  }

  if (host === 'api-not-configured.invalid') {
    return {
      ok: false,
      detail: 'VITE_API_BASE points at the runtime failure sentinel',
      evidence,
    }
  }

  return {
    ok: true,
    detail: 'VITE_API_BASE is configured as a reachable-shape HTTPS API base',
    evidence,
  }
}

function privateDemoCodeState(value) {
  const state = valueState(value)
  if (state === 'missing' || state === 'empty') {
    return {
      ok: true,
      status: 'pass',
      detail: 'private sample access is disabled because VITE_PRIVATE_DEMO_ACCESS_CODE is not configured',
      evidence: { value_state: state },
    }
  }

  const normalized = value.trim().toLowerCase()
  const usable = state === 'present'
    && normalized.length >= PRIVATE_DEMO_MIN_CODE_LENGTH
    && !DISALLOWED_PRIVATE_DEMO_CODES.has(normalized)

  return {
    ok: usable,
    status: usable ? 'pass' : 'fail',
    detail: usable
      ? 'private sample access code is configured and non-placeholder'
      : `VITE_PRIVATE_DEMO_ACCESS_CODE must be at least ${PRIVATE_DEMO_MIN_CODE_LENGTH} characters and non-placeholder when set`,
    evidence: {
      value_state: state,
      length_class: normalized.length >= PRIVATE_DEMO_MIN_CODE_LENGTH ? 'min_length_met' : 'too_short',
    },
  }
}

function addResult(results, { id, ok, required = true, keys, detail, evidence = {} }) {
  results.push({
    id,
    status: ok ? 'pass' : (required ? 'fail' : 'warn'),
    required,
    keys,
    detail,
    evidence,
  })
}

function runGate(env, options, sources) {
  const results = []

  const apiBase = publicApiBaseState(env.VITE_API_BASE, options.target)
  addResult(results, {
    id: 'frontend_api_base',
    ok: apiBase.ok,
    required: true,
    keys: ['VITE_API_BASE'],
    detail: apiBase.detail,
    evidence: apiBase.evidence,
  })

  const privateCode = privateDemoCodeState(env.VITE_PRIVATE_DEMO_ACCESS_CODE)
  addResult(results, {
    id: 'private_sample_access_code',
    ok: privateCode.ok,
    required: true,
    keys: ['VITE_PRIVATE_DEMO_ACCESS_CODE'],
    detail: privateCode.detail,
    evidence: privateCode.evidence,
  })

  const legacyDirectLinks = keyStates(env, LEGACY_DIRECT_PAYMENT_LINK_KEYS)
  const configuredLegacyLinks = Object.values(legacyDirectLinks).filter((state) => state === 'present' || state === 'placeholder')
  addResult(results, {
    id: 'legacy_direct_stripe_links',
    ok: configuredLegacyLinks.length === 0,
    required: false,
    keys: LEGACY_DIRECT_PAYMENT_LINK_KEYS,
    detail: 'live checkout should use backend Checkout Sessions so public context, order metadata, and activation proof are preserved',
    evidence: { key_states: legacyDirectLinks },
  })

  const buildMode = flagState(env.VITE_SHIBUYA_ALLOW_SAMPLE_FALLBACK)
  if (buildMode !== 'missing') {
    addResult(results, {
      id: 'sample_fallback_override',
      ok: buildMode === 'false',
      required: options.target === 'live',
      keys: ['VITE_SHIBUYA_ALLOW_SAMPLE_FALLBACK'],
      detail: 'live builds must not enable sample fallback overrides',
      evidence: { flag_state: buildMode },
    })
  }

  const failedRequired = results.filter((result) => result.required && result.status === 'fail')
  const warnings = results.filter((result) => result.status === 'warn')
  const passed = results.filter((result) => result.status === 'pass')

  return {
    gate: 'shibuya_frontend_launch_env',
    target: options.target,
    generated_at: new Date().toISOString(),
    root: ROOT,
    secret_policy: 'no secret values or masked secret previews are emitted',
    sources,
    summary: {
      passed: passed.length,
      failed_required: failedRequired.length,
      warnings: warnings.length,
      go_for_frontend_launch: failedRequired.length === 0,
    },
    missing_or_invalid_required_keys: [...new Set(failedRequired.flatMap((result) => result.keys))].sort(),
    checks: results,
  }
}

function writeReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

let options
try {
  options = parseArgs(process.argv.slice(2))
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const loaded = loadEnvFiles(options.envFiles)
const env = mergeEnv(loaded.env, options.includeProcessEnv)
const report = runGate(env, options, loaded.sources)

if (options.reportJson) {
  writeReport(options.reportJson, report)
}

console.log(JSON.stringify(report, null, options.pretty ? 2 : 0))

if (!report.summary.go_for_frontend_launch) {
  process.exit(1)
}
