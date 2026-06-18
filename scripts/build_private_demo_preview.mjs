import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const PRIVATE_DEMO_CODE_KEY = 'VITE_PRIVATE_DEMO_ACCESS_CODE'
const MIN_PRIVATE_DEMO_CODE_LENGTH = 8
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

function getPrivateDemoCode() {
  return (
    process.env[PRIVATE_DEMO_CODE_KEY]
    ?? readEnvFile('.env.local')[PRIVATE_DEMO_CODE_KEY]
    ?? readEnvFile('.env')[PRIVATE_DEMO_CODE_KEY]
    ?? ''
  ).trim()
}

function isUsablePrivateDemoCode(code) {
  const normalized = code.trim().toLowerCase()
  return normalized.length >= MIN_PRIVATE_DEMO_CODE_LENGTH && !DISALLOWED_PRIVATE_DEMO_CODES.has(normalized)
}

function run(label, command, args, env = process.env) {
  console.log(`\n${label}`)
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const privateDemoCode = getPrivateDemoCode()
if (!isUsablePrivateDemoCode(privateDemoCode)) {
  console.error(`${PRIVATE_DEMO_CODE_KEY} is required before building the private demo preview.`)
  console.error(`Use a non-placeholder value with at least ${MIN_PRIVATE_DEMO_CODE_LENGTH} characters.`)
  process.exit(1)
}

const env = {
  ...process.env,
  [PRIVATE_DEMO_CODE_KEY]: privateDemoCode,
}

console.log('Building Shibuya controlled private demo preview.')
console.log('Secret policy: demo code presence is validated but the value is never printed.')

run('1/2 Readiness gate', process.execPath, ['scripts/shibuya_demo_readiness_gate.mjs'], env)
run('2/2 Production build', process.execPath, ['node_modules/vite/bin/vite.js', 'build'], env)

console.log('\nPrivate demo preview build completed.')
console.log('Serve with: node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4174 --strictPort')
