import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const skillsDir = join(root, 'skills')
const pinPath = join(root, 'upstream/PIN.json')

function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!m) return undefined
  const out = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

function skillEntries() {
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ dir: d.name, file: join(skillsDir, d.name, 'SKILL.md') }))
    .filter((e) => existsSync(e.file))
}

test('vendored tree holds 370 top-level skills with valid frontmatter', () => {
  const entries = skillEntries()
  // 370 top-level skills: the upstream tree has one nested SKILL.md
  // (skills/accelerate/accelerate/) that dsh's one-level discovery ignores.
  assert.equal(entries.length, 370)
  const names = new Set()
  for (const entry of entries) {
    const text = readFileSync(entry.file, 'utf8')
    const fm = frontmatter(text)
    assert.ok(fm, `${entry.dir}: no frontmatter`)
    assert.match(fm.name ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${entry.dir}: bad name`)
    assert.ok((fm.description ?? '').length > 10, `${entry.dir}: empty description`)
    assert.ok(!names.has(fm.name), `duplicate skill name ${fm.name}`)
    names.add(fm.name)
  }
})

test('PIN records provenance and a curated tier of at most 60 skills', () => {
  const pin = JSON.parse(readFileSync(pinPath, 'utf8'))
  assert.match(pin.repository, /synthetic-sciences\/OpenScience/)
  assert.match(pin.commit, /^[0-9a-f]{7,40}$/)
  assert.match(pin.tag, /^v/)
  assert.equal(pin.license, 'Apache-2.0')
  assert.ok(Array.isArray(pin.curated) && pin.curated.length <= 60 && pin.curated.length >= 40)
  assert.ok(Array.isArray(pin.patchedFrontmatter))
  const names = new Set(skillEntries().map((e) => frontmatter(readFileSync(e.file, 'utf8')).name))
  for (const name of pin.curated) assert.ok(names.has(name), `curated skill missing: ${name}`)
})

test('every skill outside curated is hidden from the model catalog', () => {
  const pin = JSON.parse(readFileSync(pinPath, 'utf8'))
  const curated = new Set(pin.curated)
  for (const entry of skillEntries()) {
    const fm = frontmatter(readFileSync(entry.file, 'utf8'))
    const hidden = fm['disable-model-invocation'] === 'true'
    if (curated.has(fm.name)) assert.equal(hidden, false, `${fm.name} should be visible`)
    else assert.equal(hidden, true, `${fm.name} should be hidden`)
  }
})
