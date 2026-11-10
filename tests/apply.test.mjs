import test from 'node:test'
import assert from 'node:assert/strict'

import { apply, normalizeConfig } from '../index.js'

function fakeCtx({ withWeb = true, credentials } = {}) {
  const registered = []
  const sections = []
  const ctx = {
    logger: { info() {}, warn() {}, error() {} },
    skills: { registerProvider: () => () => {} },
    systemPrompt: { section: (input) => sections.push(input) },
    tools: { register: (definition) => registered.push(definition) },
    effect: (fn) => fn(),
    get(name) {
      if (name === 'web' && withWeb) return { fetch: async () => ({ statusCode: 200, body: { kind: 'text', content: '{}' }, truncated: false }) }
      if (name === 'credentials' && credentials !== undefined) return credentials
      return undefined
    },
  }
  return { ctx, registered, sections }
}

const NAMES = ['science_search', 'science_paper', 'science_related', 'science_cite', 'science_state', 'science_skill']

test('apply registers the six tools and the bootstrap section', async () => {
  const { ctx, registered, sections } = fakeCtx()
  apply(ctx, {})
  assert.deepEqual(registered.map((tool) => tool.name).sort(), [...NAMES].sort())
  assert.equal(sections.length, 1)
  assert.equal(sections[0].name, 'openscience:bootstrap')
  assert.equal(sections[0].order, 121)
})

test('bootstrap can be switched off without losing the tools', async () => {
  const { ctx, registered, sections } = fakeCtx()
  apply(ctx, { bootstrap: false })
  assert.equal(sections.length, 0)
  assert.equal(registered.length, 6)
})

test('without a web service the network tools degrade readably', async () => {
  const { ctx, registered } = fakeCtx({ withWeb: false })
  apply(ctx, {})
  assert.equal(registered.length, 6)
  const search = registered.find((tool) => tool.name === 'science_search')
  const out = await search.execute({ query: 'thermometry' }, {})
  assert.match(out.text, /联网|web provider|取数/)
})

test('normalizeConfig applies defaults and keeps the mailto out of urls when empty', () => {
  const config = normalizeConfig({})
  assert.equal(config.mailto, '')
  assert.equal(config.catalogMode, 'curated')
  assert.equal(config.stateDir, '.openscience')
  assert.deepEqual(config.sources, ['openalex', 'pubmed', 'arxiv', 'crossref'])
  assert.equal(normalizeConfig({ catalogMode: 'all', mailto: 'x@y.z' }).catalogMode, 'all')
})
