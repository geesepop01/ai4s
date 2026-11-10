import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createStateTool } from '../lib/tools/state.js'

const deps = { config: { stateDir: '.openscience' }, logger: { info() {}, warn() {} } }

test('read on a fresh workspace reports an empty state at revision 0', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-st-'))
  const tool = createStateTool(deps)
  const out = await tool.execute({ action: 'read' }, { cwd })
  assert.match(out.text, /revision: 0/)
  assert.match(out.text, /SCOPE/)
})

test('patch merges a todo and bumps the revision', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-st-'))
  const tool = createStateTool(deps)
  await tool.execute({ action: 'write', payload: { question: 'does X cause Y' } }, { cwd })
  const out = await tool.execute({ action: 'patch', payload: { todos: ['read three papers'] }, expectedRevision: 1 }, { cwd })
  assert.match(out.text, /revision: 2/)
  const file = join(cwd, '.openscience', 'state.json')
  assert.ok(existsSync(file))
  const saved = JSON.parse(readFileSync(file, 'utf8'))
  assert.equal(saved.question, 'does X cause Y')
  assert.deepEqual(saved.todos, ['read three papers'])
})

test('a stale revision answers with a conflict instead of throwing', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-st-'))
  const tool = createStateTool(deps)
  await tool.execute({ action: 'write', payload: { question: 'a' } }, { cwd })
  const out = await tool.execute({ action: 'write', payload: { question: 'b' }, expectedRevision: 0 }, { cwd })
  assert.match(out.text, /conflict/i)
  assert.match(out.text, /1/)
})

test('a write that omits expected_revision on an existing state is refused, not adopted', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-st-'))
  const tool = createStateTool(deps)
  await tool.execute({ action: 'write', payload: { question: 'a' } }, { cwd })
  const out = await tool.execute({ action: 'write', payload: { question: 'b' } }, { cwd })
  assert.match(out.text, /conflict/i)
  assert.match(out.text, /expected_revision/)
  assert.equal(JSON.parse(readFileSync(join(cwd, '.openscience', 'state.json'), 'utf8')).question, 'a')
})
