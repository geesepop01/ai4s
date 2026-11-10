import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { CATALOG_ROUTE, CONFIG_ROUTE, STATE_ROUTE, registerStateRoutes } from '../lib/routes.js'
import { setLastStateDir } from '../lib/last-dir.js'

function harness(roots = []) {
  const routes = []
  const webServer = { register: (route) => { routes.push(route); return () => {} } }
  const dispose = registerStateRoutes({ webServer, logger: { warn() {}, info() {} }, allowedRoots: () => roots })
  return { routes, dispose }
}

function request(url, { method = 'GET', body, headers = {} } = {}) {
  const chunks = body === undefined ? [] : [Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]
  return {
    method,
    url,
    headers,
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk
    },
  }
}

function response() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(status, headers) {
      this.statusCode = status
      this.headers = headers ?? {}
    },
    setHeader() {},
    end(text) {
      this.body = text ?? ''
    },
  }
}

async function call(route, req) {
  const res = response()
  await route.handler(req, res)
  return { status: res.statusCode, json: res.body === '' ? undefined : JSON.parse(res.body) }
}

test('routes register one exact handler per path', () => {
  const { routes } = harness()
  assert.deepEqual(routes.map((route) => `${route.kind}:${route.path}`), [`exact:${STATE_ROUTE}`, `exact:${CATALOG_ROUTE}`, `exact:${CONFIG_ROUTE}`])
})

test('GET without a path falls back to the last research workspace', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  setLastStateDir(cwd)
  const { routes } = harness([cwd])
  const result = await call(routes[0], request('/ai4s/state'))
  assert.equal(result.status, 200)
  assert.equal(result.json.revision, 0)
  assert.equal(result.json.path, cwd)
})

test('GET with an explicit workspace path answers that workspace', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const { routes } = harness([cwd])
  const result = await call(routes[0], request(`/ai4s/state?path=${encodeURIComponent(cwd)}`))
  assert.equal(result.status, 200)
  assert.equal(result.json.state.schemaVersion, 1)
})

test('POST writes the state and a stale POST answers 409', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const { routes } = harness([cwd])
  const post = (expectedRevision) => call(routes[0], request(STATE_ROUTE, {
    method: 'POST',
    body: { path: cwd, state: { schemaVersion: 1, stage: 'COMPUTE', entries: [], todos: [] }, expectedRevision },
  }))
  const first = await post(null)
  assert.equal(first.status, 200)
  assert.equal(first.json.revision, 1)
  assert.ok(existsSync(join(cwd, 'state.json')))
  const second = await post(null)
  assert.equal(second.status, 409)
  assert.equal(second.json.revision, 1)
})

test('a path outside the registered workspaces is refused', async () => {
  const allowed = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const outside = mkdtempSync(join(tmpdir(), 'ai4s-other-'))
  const { routes } = harness([allowed])
  const read = await call(routes[0], request(`${STATE_ROUTE}?path=${encodeURIComponent(outside)}`))
  assert.equal(read.status, 403)
  const write = await call(routes[0], request(STATE_ROUTE, {
    method: 'POST',
    body: { path: outside, state: { schemaVersion: 1 }, expectedRevision: null },
  }))
  assert.equal(write.status, 403)
  assert.equal(existsSync(join(outside, 'state.json')), false)
})

test('relative paths, unknown methods and oversized bodies are refused', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const { routes } = harness([cwd])
  setLastStateDir(undefined)
  const relative = await call(routes[0], request(`${STATE_ROUTE}?path=relative/dir`))
  assert.equal(relative.status, 400)
  const wrong = await call(routes[0], request(STATE_ROUTE, { method: 'PUT' }))
  assert.equal(wrong.status, 405)
  const big = await call(routes[0], request(STATE_ROUTE, { method: 'POST', body: 'x'.repeat(1_100_000) }))
  assert.equal(big.status, 413)
})

test('a cross-site caller is refused', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const { routes } = harness([cwd])
  const read = await call(routes[0], request(`${STATE_ROUTE}?path=${encodeURIComponent(cwd)}`, { headers: { 'sec-fetch-site': 'cross-site' } }))
  assert.equal(read.status, 403)
  const origin = await call(routes[0], request(`${STATE_ROUTE}?path=${encodeURIComponent(cwd)}`, { headers: { origin: 'https://evil.example', host: '127.0.0.1:3080' } }))
  assert.equal(origin.status, 403)
})

test('the catalog route lists the vendored skills and caches them', async () => {
  const { routes } = harness()
  const first = await call(routes[1], request(CATALOG_ROUTE))
  assert.equal(first.status, 200)
  assert.equal(first.json.length, 370)
  assert.ok(first.json.every((item) => typeof item.hidden === 'boolean'))
})
