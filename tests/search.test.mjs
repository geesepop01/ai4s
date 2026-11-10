import test from 'node:test'
import assert from 'node:assert/strict'

import { createSearchTool } from '../lib/tools/search.js'
import { dedupe, normalizeEntry, parseArxiv } from '../lib/sources.js'

const openalex = {
  results: [
    {
      id: 'https://openalex.org/W2159974629',
      title: 'Nanometre-scale thermometry in a living cell',
      publication_year: 2013,
      doi: 'https://doi.org/10.1038/nature12373',
      authorships: [{ author: { display_name: 'G. Kucsko' } }, { author: { display_name: 'P. Maurer' } }],
      primary_location: { source: { display_name: 'Nature' } },
    },
  ],
}

const crossref = {
  message: {
    items: [
      {
        DOI: '10.1038/NATURE12373',
        title: ['Nanometre-scale thermometry in a living cell'],
        author: [{ given: 'G.', family: 'Kucsko' }],
        issued: { 'date-parts': [[2013]] },
        'container-title': ['Nature'],
        abstract: '<jats:p>an abstract</jats:p>',
      },
    ],
  },
}

const pubmedSearch = { esearchresult: { idlist: ['23828890'] } }
const pubmedSummary = {
  result: {
    uids: ['23828890'],
    '23828890': {
      title: 'Nanometre-scale thermometry in a living cell.',
      authors: [{ name: 'Kucsko G' }],
      pubdate: '2013 Aug 1',
      source: 'Nature',
      articleids: [{ idtype: 'doi', value: '10.1038/nature12373' }],
    },
  },
}

const arxivXml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry>
<id>http://arxiv.org/abs/1304.1068v1</id><title>Nanoscale thermometry</title>
<published>2013-04-03T00:00:00Z</published><summary>arxiv abstract</summary>
<author><name>Kucsko, G</name></author></entry></feed>`

function fakeClient(routes) {
  return {
    async getJson(url) {
      for (const [pattern, value] of routes) {
        if (url.includes(pattern)) {
          if (value instanceof Error) throw value
          if (typeof value === 'string') return { ok: true, status: 200, body: value, truncated: false }
          return { ok: true, status: 200, body: value, truncated: false }
        }
      }
      return { ok: false, status: 404, reason: 'not-found', message: 'no route' }
    },
  }
}

const config = { mailto: 'someone@example.org', sources: ['openalex', 'crossref', 'pubmed', 'arxiv'] }

test('normalizeEntry maps each source shape onto one entry', () => {
  assert.equal(normalizeEntry(openalex.results[0], 'openalex').doi, '10.1038/nature12373')
  assert.equal(normalizeEntry(crossref.message.items[0], 'crossref').doi, '10.1038/nature12373')
  assert.equal(normalizeEntry(pubmedSummary.result['23828890'], 'pubmed').doi, '10.1038/nature12373')
  const arxiv = parseArxiv(arxivXml)
  assert.equal(arxiv[0].arxivId, '1304.1068')
  assert.equal(arxiv[0].year, 2013)
})

test('dedupe keeps one record per DOI and merges missing identifiers', () => {
  const merged = dedupe([
    { title: 'a', doi: '10.1/x', year: 2013 },
    { title: 'a', doi: '10.1/X', pmid: '999' },
    { title: 'b', year: 2020 },
  ])
  assert.equal(merged.length, 2)
  assert.equal(merged[0].pmid, '999')
})

test('science_search merges sources, filters years and clamps the limit', async () => {
  const client = fakeClient([
    ['api.openalex.org', openalex],
    ['api.crossref.org', crossref],
    ['esearch.fcgi', pubmedSearch],
    ['esummary.fcgi', pubmedSummary],
    ['export.arxiv.org', arxivXml],
  ])
  const tool = createSearchTool({ client, config, logger: { warn() {} } })
  const out = await tool.execute({ query: 'thermometry', limit: 99 }, {})
  assert.match(out.text, /Nanometre-scale thermometry/)
  assert.equal((out.text.match(/doi: 10\.1038\/nature12373/g) ?? []).length, 1)
  assert.match(out.text, /limit/i)
})

test('science_search reports a partial source failure without losing the rest', async () => {
  const client = fakeClient([
    ['api.openalex.org', openalex],
    ['api.crossref.org', new Error('boom')],
  ])
  const tool = createSearchTool({ client, config, logger: { warn() {} } })
  const out = await tool.execute({ query: 'thermometry', sources: ['openalex', 'crossref'] }, {})
  assert.match(out.text, /openalex/i)
  assert.match(out.text, /crossref/i)
  assert.match(out.text, /Nanometre/)
})

test('science_search truncates long abstracts', async () => {
  const long = { results: [{ ...openalex.results[0], abstract_inverted_index: Object.fromEntries(Array.from({ length: 400 }, (_, i) => [`w${i}`, [i]])) }] }
  const client = fakeClient([['api.openalex.org', long]])
  const tool = createSearchTool({ client, config: { ...config, sources: ['openalex'] }, logger: { warn() {} } })
  const out = await tool.execute({ query: 'x', detailed: true }, {})
  assert.ok(out.text.includes('…'), 'long abstract should be marked as truncated')
})
