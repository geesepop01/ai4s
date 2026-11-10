import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { CATALOG_ROUTE, STATE_ROUTE, registerStateRoutes } from '../lib/routes.js'
import { setLastStateDir } from '../lib/last-dir.js'

function harness() {
  const routes = []
  const webServer = { register: (route) => { routes.push(route); return () => {} } }
  const dispose = registerStateRoutes({ webServer, logger: { warn() {}, info() {} } })
  return { routes, dispose }
}

function request(url, { method = 'GET', body } = {}) {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
  return {
    method,
    url,
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
  assert.deepEqual(routes.map((route) => `${route.kind}:${route.path}`), [`exact:${STATE_ROUTE}`, `exact:${CATALOG_ROUTE}`])
})

test('GET without a path falls back to the last research workspace', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  setLastStateDir(cwd)
  const { routes } = harness()
  const result = await call(routes[0], request('/ai4s/state'))
  assert.equal(result.status, 200)
  assert.equal(result.json.revision, 0)
  assert.equal(result.json.path, cwd)
})

test('GET with an explicit path answers that workspace', async () => {
  const { routes } = harness()
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const result = await call(routes[0], request(`/ai4s/state?path=${encodeURIComponent(cwd)}`))
  assert.equal(result.status, 200)
  assert.equal(result.json.state.schemaVersion, 1)
})

test('POST writes the state and a stale POST answers 409', async () => {
  const { routes } = harness()
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
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

test('a bad path or an unknown method is refused without touching disk', async () => {
  setLastStateDir(undefined)
  const { routes } = harness()
  const missing = await call(routes[0], request(STATE_ROUTE))
  assert.equal(missing.status, 400)
  const notADir = await call(routes[0], request(`${STATE_ROUTE}?path=${encodeURIComponent('C:/definitely/not/here')}`))
  assert.equal(notADir.status, 400)
  const wrong = await call(routes[0], request(STATE_ROUTE, { method: 'PUT' }))
  assert.equal(wrong.status, 405)
})

test('the catalog route lists the vendored skills', async () => {
  const { routes } = harness()
  const result = await call(routes[1], request(CATALOG_ROUTE))
  assert.equal(result.status, 200)
  assert.equal(result.json.length, 370)
  assert.ok(result.json.every((item) => typeof item.hidden === 'boolean'))
})
