import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { registerSkills, skillCatalog, readSkill, isValidSkillName } from '../lib/skills.js'

function fakeCtx() {
  const captured = { provider: undefined, registered: 0 }
  const ctx = {
    skills: {
      registerProvider(create) {
        captured.registered += 1
        captured.provider = create({ signal: new AbortController().signal, invalidate() {} })
        return () => {}
      },
    },
    logger: { info() {}, warn() {}, error() {} },
  }
  return { ctx, captured }
}

function fakeDelegate(candidates) {
  return {
    name: 'openscience',
    async list() {
      return candidates
    },
    async get(candidate) {
      return { ...candidate, content: 'body' }
    },
    async dispose() {},
  }
}

const visible = { name: 'scanpy', description: 'single cell', rank: 1, invocation: { modelInvocable: true, userInvocable: true } }
const hidden = { name: 'vllm', description: 'serving', rank: 1, invocation: { modelInvocable: false, userInvocable: true } }

test('registerSkills registers one provider named openscience', () => {
  const { ctx, captured } = fakeCtx()
  const dispose = registerSkills(ctx, {
    dir: '/tmp/skills',
    mode: 'curated',
    logger: ctx.logger,
    loadDelegate: async () => fakeDelegate([visible, hidden]),
  })
  assert.equal(typeof dispose, 'function')
  assert.equal(captured.registered, 1)
  assert.equal(captured.provider.name, 'openscience')
})

test('curated mode keeps hidden skills hidden, all mode reveals them', async () => {
  const { ctx, captured } = fakeCtx()
  registerSkills(ctx, { dir: '/tmp/skills', mode: 'curated', logger: ctx.logger, loadDelegate: async () => fakeDelegate([visible, hidden]) })
  let list = await captured.provider.list({})
  assert.deepEqual(list.map((c) => c.invocation.modelInvocable), [true, false])

  const second = fakeCtx()
  registerSkills(second.ctx, { dir: '/tmp/skills', mode: 'all', logger: second.ctx.logger, loadDelegate: async () => fakeDelegate([visible, hidden]) })
  list = await second.captured.provider.list({})
  assert.deepEqual(list.map((c) => c.invocation.modelInvocable), [true, true])
})

test('a missing skill-filesystem package degrades to an empty catalog', async () => {
  const { ctx, captured } = fakeCtx()
  registerSkills(ctx, {
    dir: '/tmp/skills',
    mode: 'curated',
    logger: ctx.logger,
    loadDelegate: async () => {
      throw new Error('ERR_MODULE_NOT_FOUND')
    },
  })
  assert.deepEqual(await captured.provider.list({}), [])
  assert.equal(await captured.provider.get({ name: 'scanpy' }), undefined)
})

test('skillCatalog skips a broken SKILL.md and keeps the rest', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai4s-skills-'))
  mkdirSync(join(dir, 'good'))
  writeFileSync(join(dir, 'good', 'SKILL.md'), '---\nname: good\ndescription: works fine here\n---\n# Good\n')
  mkdirSync(join(dir, 'broken'))
  writeFileSync(join(dir, 'broken', 'SKILL.md'), 'no frontmatter at all\n')
  const items = await skillCatalog(dir, { logger: { warn() {}, error() {}, info() {} } })
  assert.deepEqual(items.map((i) => i.name), ['good'])
})

test('readSkill refuses path traversal and unknown names', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai4s-skills-'))
  mkdirSync(join(dir, 'good'))
  writeFileSync(join(dir, 'good', 'SKILL.md'), '---\nname: good\ndescription: works fine here\n---\n# Good body\n')
  assert.equal(await readSkill(dir, '../etc/passwd'), undefined)
  assert.equal(await readSkill(dir, 'missing'), undefined)
  const skill = await readSkill(dir, 'good')
  assert.match(skill.content, /# Good body/)
  assert.equal(skill.description, 'works fine here')
  assert.equal(isValidSkillName('../etc/passwd'), false)
})
