import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { registerStateRoutes } from '../lib/routes.js'

function harness() {
  const routes = []
  const webServer = { register: (route) => { routes.push(route); return () => {} } }
  const dispose = registerStateRoutes({ webServer, logger: { warn() {}, info() {} } })
  return { routes, dispose }
}

function request(url, init = {}) {
  return { url, method: init.method ?? 'GET', async json() { return init.body } }
}

test('GET on a fresh workspace answers revision 0 and an empty state', async () => {
  const { routes } = harness()
  const route = routes.find((r) => r.method === 'GET')
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const response = await route.handler(request(`http://localhost/ai4s/state?path=${encodeURIComponent(cwd)}`))
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.revision, 0)
  assert.equal(body.state.schemaVersion, 1)
})

test('POST writes the state and returns the new revision', async () => {
  const { routes } = harness()
  const route = routes.find((r) => r.method === 'POST')
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const response = await route.handler(request('http://localhost/ai4s/state', {
    method: 'POST',
    body: { path: cwd, state: { schemaVersion: 1, stage: 'COMPUTE', entries: [], todos: [] }, expectedRevision: null },
  }))
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.revision, 1)
  assert.ok(existsSync(join(cwd, 'state.json')))
})

test('a stale POST answers 409 with the current revision', async () => {
  const { routes } = harness()
  const route = routes.find((r) => r.method === 'POST')
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-rt-'))
  const post = (expectedRevision) => route.handler(request('http://localhost/ai4s/state', {
    method: 'POST',
    body: { path: cwd, state: { schemaVersion: 1, stage: 'SCOPE' }, expectedRevision },
  }))
  await post(null)
  const response = await post(null)
  assert.equal(response.status, 409)
  assert.equal((await response.json()).revision, 1)
})

test('a bad path or an unknown method is refused without touching disk', async () => {
  const { routes } = harness()
  const get = routes.find((r) => r.method === 'GET')
  const missing = await get.handler(request('http://localhost/ai4s/state'))
  assert.equal(missing.status, 400)
  const notADir = await get.handler(request('http://localhost/ai4s/state?path=' + encodeURIComponent('C:/definitely/not/here')))
  assert.equal(notADir.status, 400)
  const post = routes.find((r) => r.method === 'POST')
  const wrong = await post.handler(request('http://localhost/ai4s/state', { method: 'PUT', body: {} }))
  assert.equal(wrong.status, 405)
})
