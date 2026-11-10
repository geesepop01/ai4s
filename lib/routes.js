// Host http routes consumed by the workbench panel.
//
// `ctx.webServer` registers Node-style handlers on exact paths: one handler per
// path answers every method (405 otherwise), and the client half never touches
// the filesystem — it asks for one workspace's state document and posts back
// the exact document it edited, under the same revision guard the agent's tool
// uses.

import { statSync } from 'node:fs'

import { getLastStateDir } from './last-dir.js'
import { skillsRoot } from './paths.js'
import { skillCatalog } from './skills.js'
import { StateConflict, readState, writeState } from './state.js'

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
    webServer.register({ kind: 'exact', path: STATE_ROUTE, handler: (req, res) => handleState(req, res, logger) }),
    webServer.register({ kind: 'exact', path: CATALOG_ROUTE, handler: (req, res) => handleCatalog(req, res) }),
  ]
  return () => {
    for (const dispose of disposers) dispose?.()
  }
}

async function handleState(req, res, logger) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const method = (req.method ?? 'GET').toUpperCase()

  if (method === 'GET') {
    const dir = url.searchParams.get('path') ?? getLastStateDir()
    const checked = checkDirectory(dir)
    if (checked.error !== undefined) return send(res, 400, { error: checked.error })
    try {
      const { revision, state } = await readState(checked.dir)
      return send(res, 200, { revision, state, path: checked.dir })
    } catch (error) {
      logger?.warn?.(`openscience: state read failed (${messageOf(error)})`)
      return send(res, 500, { error: 'state unreadable' })
    }
  }

  if (method !== 'POST') {
    res?.setHeader?.('allow', 'GET, POST')
    return send(res, 405, { error: 'method not allowed' })
  }

  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch {
    return send(res, 400, { error: 'body must be json' })
  }
  const checked = checkDirectory(body?.path)
  if (checked.error !== undefined) return send(res, 400, { error: checked.error })
  const state = body?.state
  if (state === null || typeof state !== 'object' || Array.isArray(state)) {
    return send(res, 400, { error: 'state must be an object' })
  }
  const expected = body?.expectedRevision
  if (expected !== null && expected !== undefined && !Number.isInteger(expected)) {
    return send(res, 400, { error: 'expectedRevision must be an integer or null' })
  }
  try {
    const { revision } = await writeState(checked.dir, state, expected ?? null)
    return send(res, 200, { revision, path: checked.dir })
  } catch (error) {
    if (error instanceof StateConflict) return send(res, 409, { error: 'state changed', revision: error.currentRevision })
    logger?.warn?.(`openscience: state write failed (${messageOf(error)})`)
    return send(res, 500, { error: 'state unwritable' })
  }
}

async function handleCatalog(req, res) {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'GET') {
    res?.setHeader?.('allow', 'GET')
    return send(res, 405, { error: 'method not allowed' })
  }
  try {
    const items = await skillCatalog(skillsRoot)
    return send(res, 200, items.map(({ name, description, hidden }) => ({ name, description, hidden })))
  } catch {
    return send(res, 500, { error: 'catalog unreadable' })
  }
}

async function readBody(req) {
  if (typeof req?.body === 'string') return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
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

function send(res, status, value) {
  const payload = JSON.stringify(value)
  if (res !== undefined && res !== null) {
    res.writeHead?.(status, { 'content-type': 'application/json; charset=utf-8' })
    res.statusCode = status
    res.end?.(payload)
  }
  return { status, body: value }
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}
