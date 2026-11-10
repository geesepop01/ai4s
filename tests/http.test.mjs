import test from 'node:test'
import assert from 'node:assert/strict'

import { createHttpClient, RateLimiter } from '../lib/http.js'

function webReturning(impl) {
  return { fetch: impl }
}

const json = (statusCode, value, truncated = false) => async () => ({
  url: '',
  statusCode,
  body: { kind: 'text', content: JSON.stringify(value) },
  truncated,
})

test('getJson returns parsed body on 200', async () => {
  const client = createHttpClient({ web: webReturning(json(200, { id: 'W1' })) })
  const result = await client.getJson('https://example.org/a')
  assert.equal(result.ok, true)
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { id: 'W1' })
})

test('getJson maps http failures to reasons instead of throwing', async () => {
  const cases = [
    [429, 'rate-limited'],
    [404, 'not-found'],
    [503, 'upstream-error'],
  ]
  for (const [status, reason] of cases) {
    const client = createHttpClient({ web: webReturning(json(status, {})), sleep: async () => {} })
    const result = await client.getJson('https://example.org/a')
    assert.equal(result.ok, false)
    assert.equal(result.reason, reason, `status ${status}`)
  }
})

test('getJson reports an html error page and a truncated body as not-json', async () => {
  for (const truncated of [false, true]) {
    const client = createHttpClient({
      web: webReturning(async () => ({ url: '', statusCode: 200, body: { kind: 'html', content: '<html>err</html>' }, truncated })),
    })
    const result = await client.getJson('https://example.org/a')
    assert.equal(result.ok, false)
    assert.ok(['not-json', 'truncated-parse'].includes(result.reason), result.reason)
  }
})

test('getJson turns a missing web provider into a readable network failure', async () => {
  const client = createHttpClient({
    web: webReturning(async () => {
      throw new Error('WEB_PROVIDER_UNAVAILABLE: no provider')
    }),
  })
  const result = await client.getJson('https://example.org/a')
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'network')
  assert.match(result.message, /联网|web provider|WEB_PROVIDER/)
})

test('getJson times out instead of hanging', async () => {
  const client = createHttpClient({
    web: webReturning(() => new Promise(() => {})),
    timeoutMs: 20,
  })
  const result = await client.getJson('https://example.org/a')
  assert.equal(result.ok, false)
  assert.equal(result.reason, 'network')
})

test('RateLimiter waits at least the minimum interval between runs', async () => {
  const waits = []
  const limiter = new RateLimiter(100, async (ms) => waits.push(ms))
  await limiter.run(async () => 1)
  await limiter.run(async () => 2)
  assert.equal(waits.length, 1)
  assert.ok(waits[0] >= 100, `waited ${waits[0]}`)
})
