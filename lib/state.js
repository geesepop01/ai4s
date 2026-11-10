// Research state: one JSON document per workspace, guarded by a revision.
//
// The agent writes it through the `science_state` tool and the workbench panel
// reads it through the host http route, so both see the same picture. Writes are
// compare-and-swap: a stale `expectedRevision` is refused instead of silently
// discarding the other writer's work.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const SCHEMA_VERSION = 1
export const STATE_FILE = 'state.json'

/** Serialises writes per directory so two writers cannot both pass the CAS. */
const queues = new Map()

/** Raised when a write carries a stale `expectedRevision`. */
export class StateConflict extends Error {
  constructor(currentRevision) {
    super(`state changed: current revision is ${currentRevision}`)
    this.name = 'StateConflict'
    this.currentRevision = currentRevision
  }
}

/** @returns {object} a fresh empty state document */
export function emptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    stage: 'SCOPE',
    entries: [],
    todos: [],
    updatedAt: new Date().toISOString(),
  }
}

/** Absolute path of the state document inside `dir`. */
export function statePath(dir) {
  return join(dir, STATE_FILE)
}

/**
 * @param {string} dir
 * @returns {Promise<{ revision: number, state: object }>}
 */
export async function readState(dir) {
  const file = statePath(dir)
  if (!existsSync(file)) return { revision: 0, state: emptyState() }
  const raw = readFileSync(file, 'utf8')
  try {
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    return { revision: Number.isInteger(parsed.revision) ? parsed.revision : 0, state: parsed }
  } catch {
    backupCorrupt(dir, file)
    return { revision: 0, state: emptyState() }
  }
}

/**
 * @param {string} dir
 * @param {object} state
 * @param {number|null} expectedRevision null for the first write
 * @returns {Promise<{ revision: number }>}
 * @throws {StateConflict}
 */
export async function writeState(dir, state, expectedRevision) {
  const previous = queues.get(dir) ?? Promise.resolve()
  const task = previous.then(() => writeStateNow(dir, state, expectedRevision))
  const chained = task.then(() => undefined, () => undefined)
  queues.set(dir, chained)
  try {
    return await task
  } finally {
    if (queues.get(dir) === chained) queues.delete(dir)
  }
}

async function writeStateNow(dir, state, expectedRevision) {
  mkdirSync(dir, { recursive: true })
  const { revision } = await readState(dir)
  // `null` asserts "this is the first write"; a populated document conflicts.
  if (expectedRevision === null ? revision !== 0 : expectedRevision !== revision) {
    throw new StateConflict(revision)
  }
  const next = {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    revision: revision + 1,
    updatedAt: new Date().toISOString(),
  }
  const file = statePath(dir)
  const temp = `${file}.tmp`
  writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`)
  renameSync(temp, file)
  return { revision: next.revision }
}

function backupCorrupt(dir, file) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const target = join(dir, `state.corrupt-${stamp}.json`)
  try {
    renameSync(file, target)
  } catch {
    // Best effort: a read-only directory must not break the read path.
  }
}
