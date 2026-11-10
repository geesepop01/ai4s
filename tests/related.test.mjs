import test from 'node:test'
import assert from 'node:assert/strict'

import { createRelatedTool } from '../lib/tools/related.js'

const work = {
  id: 'https://openalex.org/W1',
  title: 'Nanometre-scale thermometry in a living cell',
  publication_year: 2013,
  doi: 'https://doi.org/10.1038/nature12373',
  related_works: ['https://openalex.org/W2'],
  referenced_works: ['https://openalex.org/W3'],
}

const byId = {
  results: [
    { id: 'https://openalex.org/W2', title: 'Related paper', publication_year: 2015 },
    { id: 'https://openalex.org/W3', title: 'Earlier reference', publication_year: 2008 },
    { id: 'https://openalex.org/W4', title: 'Citing paper', publication_year: 2016 },
  ],
}

function client(routes) {
  return {
    async getJson(url) {
      for (const [needle, body] of routes) {
        if (url.includes(needle)) return { ok: true, status: 200, body, truncated: false }
      }
      return { ok: false, status: 404, reason: 'not-found', message: '没有找到记录' }
    },
  }
}

const config = { mailto: 'a@b.c' }

test('related direction walks OpenAlex related_works', async () => {
  const tool = createRelatedTool({ client: client([['/works/doi:', work], ['filter=openalex_id', byId]]), config })
  const out = await tool.execute({ id: '10.1038/nature12373', direction: 'related' }, {})
  assert.match(out.text, /Related paper/)
})

test('references and citations directions use the right upstream field', async () => {
  const refs = createRelatedTool({ client: client([['/works/doi:', work], ['filter=openalex_id', byId]]), config })
  assert.match((await refs.execute({ id: '10.1038/nature12373', direction: 'references' }, {})).text, /Earlier reference/)

  const cites = createRelatedTool({ client: client([['/works/doi:', work], ['filter=cites', byId]]), config })
  assert.match((await cites.execute({ id: '10.1038/nature12373', direction: 'citations' }, {})).text, /Citing paper/)
})

test('an unknown id answers readably instead of throwing', async () => {
  const tool = createRelatedTool({ client: client([]), config })
  const out = await tool.execute({ id: '10.9999/none' }, {})
  assert.match(out.text, /没有找到|未找到/)
})

test('a work with no neighbours says so', async () => {
  const empty = { ...work, related_works: [], referenced_works: [] }
  const tool = createRelatedTool({ client: client([['/works/doi:', empty]]), config })
  const out = await tool.execute({ id: '10.1/x', direction: 'related' }, {})
  assert.match(out.text, /没有/)
})
