import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { StateConflict, emptyState, readState, statePath, writeState } from '../lib/state.js'

function dir() {
  return mkdtempSync(join(tmpdir(), 'ai4s-state-'))
}

test('an absent state file reads as revision 0 and an empty state', async () => {
  const { revision, state } = await readState(dir())
  assert.equal(revision, 0)
  assert.equal(state.schemaVersion, 1)
  assert.deepEqual(state.entries, [])
})

test('writes bump the revision and honour the expected revision', async () => {
  const root = dir()
  const first = await writeState(root, { ...emptyState(), question: 'q1' }, null)
  assert.equal(first.revision, 1)
  const second = await writeState(root, { ...emptyState(), question: 'q2' }, 1)
  assert.equal(second.revision, 2)
  const { state } = await readState(root)
  assert.equal(state.question, 'q2')
})

test('a stale expected revision raises StateConflict and leaves the file alone', async () => {
  const root = dir()
  await writeState(root, emptyState(), null)
  await writeState(root, { ...emptyState(), question: 'winner' }, 1)
  await assert.rejects(
    () => writeState(root, { ...emptyState(), question: 'loser' }, 1),
    (error) => error instanceof StateConflict && error.currentRevision === 2,
  )
  const { state } = await readState(root)
  assert.equal(state.question, 'winner')
})

test('a corrupt state file is backed up and reads as empty', async () => {
  const root = dir()
  mkdirSync(root, { recursive: true })
  writeFileSync(statePath(root), '{ not json')
  const { revision, state } = await readState(root)
  assert.equal(revision, 0)
  assert.equal(state.schemaVersion, 1)
  const backups = readdirSync(root).filter((name) => name.startsWith('state.corrupt-'))
  assert.equal(backups.length, 1)
  assert.equal(readFileSync(join(root, backups[0]), 'utf8'), '{ not json')
})

test('concurrent writers cannot both win', async () => {
  const root = dir()
  await writeState(root, emptyState(), null)
  const results = await Promise.allSettled([
    writeState(root, { ...emptyState(), question: 'a' }, 1),
    writeState(root, { ...emptyState(), question: 'b' }, 1),
  ])
  const fulfilled = results.filter((r) => r.status === 'fulfilled')
  const rejected = results.filter((r) => r.status === 'rejected')
  assert.equal(fulfilled.length, 1)
  assert.equal(rejected.length, 1)
})
