import test from 'node:test'
import assert from 'node:assert/strict'

import { bootstrapText, BOOTSTRAP_SECTION, BOOTSTRAP_ORDER } from '../lib/bootstrap.js'

test('bootstrap names the eight stages and keeps the token budget', () => {
  const text = bootstrapText({ catalogMode: 'curated' })
  for (const stage of ['SCOPE', 'LITERATURE', 'REASON', 'METHODOLOGY', 'COMPUTE', 'ANALYZE', 'SYNTHESIZE', 'WRITE']) {
    assert.ok(text.includes(stage), `missing stage ${stage}`)
  }
  assert.ok(Buffer.byteLength(text) < 2600, 'bootstrap grew past its token budget')
  assert.equal(BOOTSTRAP_SECTION, 'openscience:bootstrap')
  assert.equal(BOOTSTRAP_ORDER, 121)
})

test('bootstrap routes at least 30 tasks to skills and teaches both loaders', () => {
  const text = bootstrapText({ catalogMode: 'curated' })
  const routes = text.split('\n').filter((line) => line.startsWith('- ') && line.includes('->'))
  assert.ok(routes.length >= 30, `only ${routes.length} routes`)
  assert.match(text, /science_search/)
  assert.match(text, /science_skill/)
  assert.match(text, /`skill` tool/)
})

test('curated mode explains the hidden catalog, all mode does not', () => {
  assert.match(bootstrapText({ catalogMode: 'curated' }), /science_skill/)
  assert.doesNotMatch(bootstrapText({ catalogMode: 'all' }), /not listed in the catalog/i)
})

test('bootstrap carries Chinese trigger words for routing', () => {
  assert.match(bootstrapText({ catalogMode: 'curated' }), /文献综述/)
})
