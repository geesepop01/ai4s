import test from 'node:test'
import assert from 'node:assert/strict'

import { createPaperTool } from '../lib/tools/paper.js'

const openalexWork = {
  id: 'https://openalex.org/W2159974629',
  title: 'Nanometre-scale thermometry in a living cell',
  publication_year: 2013,
  doi: 'https://doi.org/10.1038/nature12373',
  authorships: [{ author: { display_name: 'G. Kucsko' } }],
  primary_location: { source: { display_name: 'Nature' } },
  open_access: { is_oa: true, oa_status: 'hybrid' },
}

const arxivXml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry>
<id>http://arxiv.org/abs/1304.1068v1</id><title>Nanoscale thermometry</title>
<published>2013-04-03T00:00:00Z</published><summary>abstract text</summary>
<author><name>Kucsko, G</name></author></entry></feed>`

function clientOf(routes, calls = []) {
  return {
    calls,
    async getJson(url) {
      calls.push(url)
      for (const [needle, body] of routes) {
        if (url.includes(needle)) {
          return typeof body === 'string'
            ? { ok: true, status: 200, body, truncated: false }
            : { ok: true, status: 200, body, truncated: false }
        }
      }
      return { ok: false, status: 404, reason: 'not-found', message: '没有找到记录' }
    },
  }
}

test('a DOI resolves to metadata and an open-access verdict', async () => {
  const calls = []
  const tool = createPaperTool({
    client: clientOf([['api.openalex.org', openalexWork], ['api.unpaywall.org', { is_oa: true, best_oa_location: { url_for_pdf: 'https://example.org/p.pdf' } }]], calls),
    config: { mailto: 'a@b.c' },
  })
  const out = await tool.execute({ id: '10.1038/nature12373' }, {})
  assert.match(out.text, /Nanometre-scale thermometry/)
  assert.match(out.text, /10\.1038\/nature12373/)
  assert.match(out.text, /https:\/\/example\.org\/p\.pdf/)
  assert.ok(calls.some((url) => url.includes('unpaywall')))
})

test('without a mailto the open-access lookup is skipped, not faked', async () => {
  const calls = []
  const tool = createPaperTool({ client: clientOf([['api.openalex.org', openalexWork]], calls), config: { mailto: '' } })
  const out = await tool.execute({ id: '10.1038/nature12373' }, {})
  assert.equal(calls.some((url) => url.includes('unpaywall')), false)
  assert.match(out.text, /open access: unknown|oa_status: hybrid/)
})

test('a PMID resolves through the pmid route', async () => {
  const calls = []
  const tool = createPaperTool({ client: clientOf([['api.openalex.org/works/pmid:', openalexWork]], calls), config: { mailto: '' } })
  const out = await tool.execute({ id: '23828890' }, {})
  assert.match(out.text, /Nanometre/)
  assert.ok(calls[0].includes('pmid:23828890'))
})

test('an arXiv id resolves through the Atom route', async () => {
  const tool = createPaperTool({ client: clientOf([['export.arxiv.org', arxivXml]]), config: { mailto: '' } })
  const out = await tool.execute({ id: '1304.1068' }, {})
  assert.match(out.text, /Nanoscale thermometry/)
  assert.match(out.text, /1304\.1068/)
})

test('an unknown identifier answers readably', async () => {
  const tool = createPaperTool({ client: clientOf([]), config: { mailto: '' } })
  const out = await tool.execute({ id: '10.9999/none' }, {})
  assert.match(out.text, /没有找到|未找到/)
})
