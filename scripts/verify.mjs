#!/usr/bin/env node
// Static release checks. Prints PASS/FAIL per item and exits 1 on any failure.
//
//   node scripts/verify.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const results = []

async function check(name, fn) {
  try {
    results.push({ name, ok: true, detail: await fn() })
  } catch (error) {
    results.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) })
  }
}

await check('manifest', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  if (pkg.name !== '@geesepop01/ai4s') throw new Error(`name is ${pkg.name}`)
  if (pkg.dsh?.bundle?.patch !== './cordis.patch.yml') throw new Error('bundle patch missing')
  if (pkg.dsh?.client?.platform !== 'web') throw new Error('client platform missing')
  if (!/>=0\.2\.0/.test(pkg.engines?.dsh ?? '')) throw new Error('engines.dsh missing')
  return pkg.version
})

await check('license files', () => {
  for (const file of ['LICENSE', 'NOTICE']) {
    if (!existsSync(join(root, file))) throw new Error(`${file} missing`)
  }
  const notice = readFileSync(join(root, 'NOTICE'), 'utf8')
  if (!/Synthetic Sciences/.test(notice)) throw new Error('NOTICE lacks upstream attribution')
  return 'Apache-2.0 + NOTICE'
})

await check('skills tree', () => {
  const dir = join(root, 'skills')
  const skills = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, 'SKILL.md')))
  if (skills.length !== 370) throw new Error(`expected 370 skills, found ${skills.length}`)
  return `${skills.length} skills`
})

await check('catalog budget', () => {
  const pin = JSON.parse(readFileSync(join(root, 'upstream', 'PIN.json'), 'utf8'))
  const dir = join(root, 'skills')
  let bytes = 0
  for (const name of pin.curated) {
    const file = join(dir, name, 'SKILL.md')
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf8')
    const description = /^description:\s*(.+)$/m.exec(text)?.[1] ?? ''
    bytes += name.length + description.length + 4
  }
  const tokens = Math.round(bytes / 4)
  if (tokens > 8000) throw new Error(`catalog ~${tokens} tokens, budget is 8000`)
  return `${pin.curated.length} curated, ~${tokens} tokens`
})

await check('tools register', async () => {
  const { apply } = await import('../index.js')
  const names = []
  const sections = []
  apply({
    logger: { info() {}, warn() {}, error() {} },
    skills: { registerProvider: () => () => {} },
    systemPrompt: { section: (input) => sections.push(input) },
    tools: { register: (tool) => names.push(tool.name) },
    effect: (fn) => fn(),
    get: () => undefined,
  }, {})
  const expected = ['science_search', 'science_paper', 'science_related', 'science_cite', 'science_state', 'science_skill']
  const missing = expected.filter((name) => !names.includes(name))
  if (missing.length > 0) throw new Error(`missing tools: ${missing.join(', ')}`)
  if (sections.length !== 1) throw new Error('bootstrap section not registered')
  return `${names.length} tools`
})

let failed = 0
for (const result of results) {
  if (!result.ok) failed += 1
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name} — ${result.detail}`)
}
if (failed > 0) {
  console.log(`\n${failed} check(s) failed`)
  process.exitCode = 1
}
