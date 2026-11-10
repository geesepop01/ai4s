// Host http routes consumed by the workbench panel.
//
// `ctx.webServer` registers Node-style handlers on exact paths: one handler per
// path answers every method (405 otherwise). These routes sit OUTSIDE the
// host's authenticated /api channel, so they defend themselves: only absolute
// directories inside a registered workspace are reachable, cross-site callers
// are refused, and the request body is capped.

import { statSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'

import { getLastStateDir } from './last-dir.js'
import { skillsRoot } from './paths.js'
import { skillCatalog } from './skills.js'
import { StateConflict, readState, writeState } from './state.js'

export const STATE_ROUTE = '/ai4s/state'
export const CATALOG_ROUTE = '/ai4s/catalog'
export const CONFIG_ROUTE = '/ai4s/config'

const BODY_LIMIT_BYTES = 1_000_000
const CATALOG_TTL_MS = 60_000

/**
 * @param {object} deps
 * @param {{ register(route: object): () => void }} deps.webServer
 * @param {object} deps.logger
 * @param {() => string[]} [deps.allowedRoots] absolute workspace directories
 */
export function registerStateRoutes({ webServer, logger, allowedRoots = () => [], configInfo = () => ({}) }) {
  const catalog = createCatalogCache()
  const disposers = [
    webServer.register({
      kind: 'exact',
      path: STATE_ROUTE,
      handler: (req, res) => handleState(req, res, { logger, allowedRoots }),
    }),
    webServer.register({
      kind: 'exact',
      path: CATALOG_ROUTE,
      handler: (req, res) => handleCatalog(req, res, catalog),
    }),
    webServer.register({
      kind: 'exact',
      path: CONFIG_ROUTE,
      handler: async (req, res) => {
        if (rejectCrossSite(req) !== undefined) return send(res, 403, { error: 'cross-site request refused' })
        if ((req.method ?? 'GET').toUpperCase() !== 'GET') {
          res?.setHeader?.('allow', 'GET')
          return send(res, 405, { error: 'method not allowed' })
        }
        try {
          return send(res, 200, await configInfo())
        } catch {
          return send(res, 500, { error: 'config unreadable' })
        }
      },
    }),
  ]
  return () => {
    for (const dispose of disposers) dispose?.()
  }
}

async function handleState(req, res, { logger, allowedRoots }) {
  const rejection = rejectCrossSite(req)
  if (rejection !== undefined) return send(res, 403, { error: rejection })

  const url = new URL(req.url ?? '/', 'http://localhost')
  const method = (req.method ?? 'GET').toUpperCase()

  if (method === 'GET') {
    const requested = url.searchParams.get('path') ?? getLastStateDir()
    const checked = checkDirectory(requested, allowedRoots())
    if (checked.error !== undefined) return send(res, checked.status, { error: checked.error })
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
  } catch (error) {
    if (error instanceof PayloadTooLarge) return send(res, 413, { error: 'body too large' })
    return send(res, 400, { error: 'body must be json' })
  }
  const checked = checkDirectory(body?.path, allowedRoots())
  if (checked.error !== undefined) return send(res, checked.status, { error: checked.error })
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

async function handleCatalog(req, res, catalog) {
  if (rejectCrossSite(req) !== undefined) return send(res, 403, { error: 'cross-site request refused' })
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'GET') {
    res?.setHeader?.('allow', 'GET')
    return send(res, 405, { error: 'method not allowed' })
  }
  try {
    return send(res, 200, await catalog.read())
  } catch {
    return send(res, 500, { error: 'catalog unreadable' })
  }
}

function createCatalogCache() {
  let cached
  let at = 0
  return {
    async read() {
      const now = Date.now()
      if (cached !== undefined && now - at < CATALOG_TTL_MS) return cached
      const items = await skillCatalog(skillsRoot)
      cached = items.map(({ name, description, hidden }) => ({ name, description, hidden }))
      at = now
      return cached
    },
  }
}

function rejectCrossSite(req) {
  const site = String(req?.headers?.['sec-fetch-site'] ?? '').toLowerCase()
  if (site === 'cross-site') return 'cross-site request refused'
  const origin = req?.headers?.origin
  if (typeof origin === 'string' && origin !== '' && origin !== 'null') {
    try {
      const host = String(req.headers.host ?? '')
      if (new URL(origin).host !== host) return 'origin mismatch'
    } catch {
      return 'origin unreadable'
    }
  }
  return undefined
}

async function readBody(req) {
  if (typeof req?.body === 'string') {
    if (req.body.length > BODY_LIMIT_BYTES) throw new PayloadTooLarge()
    return req.body
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    size += buffer.length
    if (size > BODY_LIMIT_BYTES) throw new PayloadTooLarge()
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

class PayloadTooLarge extends Error {}

function checkDirectory(dir, roots) {
  if (typeof dir !== 'string' || dir.trim() === '') return { status: 400, error: 'path query parameter is required' }
  if (!isAbsolute(dir)) return { status: 400, error: 'path must be absolute' }
  const target = resolve(dir)
  const allowed = roots
    .filter((root) => typeof root === 'string' && root !== '')
    .map((root) => resolve(root))
  if (!allowed.some((root) => target === root || relative(root, target).split(sep)[0] !== '..')) {
    return { status: 403, error: 'path is outside the registered workspaces' }
  }
  try {
    if (!statSync(target).isDirectory()) return { status: 400, error: 'path must be a directory' }
  } catch {
    return { status: 400, error: 'path does not exist' }
  }
  return { dir: target }
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
