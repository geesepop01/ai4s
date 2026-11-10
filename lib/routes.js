// Host http routes consumed by the workbench panel.
//
// The client half never touches the filesystem: it asks the host for the state
// document of one workspace and posts back the exact document it edited, under
// the same revision guard the agent's tool uses.

import { statSync } from 'node:fs'

import { StateConflict, readState, writeState } from './state.js'
import { getLastStateDir } from './last-dir.js'
import { skillCatalog } from './skills.js'
import { skillsRoot } from './paths.js'

export const STATE_ROUTE = '/ai4s/state'
export const CATALOG_ROUTE = '/ai4s/catalog'

/**
 * @param {object} deps
 * @param {{ register(route: object): () => void }} deps.webServer
 * @param {object} deps.logger
 * @returns {() => void}
 */
export function registerStateRoutes({ webServer, logger }) {
  const disposers = [
    webServer.register({ method: 'GET', path: STATE_ROUTE, handler: (request) => handleGet(request, logger) }),
    webServer.register({ method: 'POST', path: STATE_ROUTE, handler: (request) => handlePost(request, logger) }),
  ]
  disposers.push(webServer.register({ method: 'GET', path: CATALOG_ROUTE, handler: () => handleCatalog() }))
  return () => {
    for (const dispose of disposers) dispose?.()
  }
}

async function handleGet(request, logger) {
  const url = new URL(request.url, 'http://localhost')
  const dir = url.searchParams.get('path') ?? getLastStateDir()
  const checked = checkDirectory(dir)
  if (checked.error !== undefined) return json(400, { error: checked.error })
  try {
    const { revision, state } = await readState(checked.dir)
    return json(200, { revision, state, path: checked.dir })
  } catch (error) {
    logger?.warn?.(`openscience: state read failed (${messageOf(error)})`)
    return json(500, { error: 'state unreadable' })
  }
}

let catalogCache
async function handleCatalog() {
  if (catalogCache !== undefined) return json(200, catalogCache)
  const items = await skillCatalog(skillsRoot)
  catalogCache = items.map(({ name, description, hidden }) => ({ name, description, hidden }))
  return json(200, catalogCache)
}

async function handlePost(request, logger) {
  if (request.method !== 'POST') return json(405, { error: 'method not allowed' })
  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'body must be json' })
  }
  const checked = checkDirectory(body?.path)
  if (checked.error !== undefined) return json(400, { error: checked.error })
  const state = body?.state
  if (state === null || typeof state !== 'object' || Array.isArray(state)) {
    return json(400, { error: 'state must be an object' })
  }
  const expected = body?.expectedRevision
  if (expected !== null && expected !== undefined && !Number.isInteger(expected)) {
    return json(400, { error: 'expectedRevision must be an integer or null' })
  }
  try {
    const { revision } = await writeState(checked.dir, state, expected ?? null)
    return json(200, { revision, path: checked.dir })
  } catch (error) {
    if (error instanceof StateConflict) return json(409, { error: 'state changed', revision: error.currentRevision })
    logger?.warn?.(`openscience: state write failed (${messageOf(error)})`)
    return json(500, { error: 'state unwritable' })
  }
}

function checkDirectory(dir) {
  if (typeof dir !== 'string' || dir.trim() === '') return { error: 'path query parameter is required' }
  try {
    if (!statSync(dir).isDirectory()) return { error: 'path must be a directory' }
  } catch {
    return { error: 'path does not exist' }
  }
  return { dir }
}

function json(status, value) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    async json() {
      return value
    },
    text() {
      return JSON.stringify(value)
    },
  }
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}
