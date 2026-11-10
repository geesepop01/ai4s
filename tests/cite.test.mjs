import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { toBibTeX, toCslJson, toRIS } from '../lib/cite.js'
import { createCiteTool } from '../lib/tools/cite.js'

const entry = {
  title: 'Nanometre-scale thermometry in a living cell',
  authors: ['G. Kucsko', 'P. Maurer'],
  year: 2013,
  venue: 'Nature',
  doi: '10.1038/nature12373',
}

function clientOf(payload) {
  return { async getJson() { return { ok: true, status: 200, body: payload, truncated: false } } }
}

test('BibTeX carries the fields and never the word undefined', () => {
  const text = toBibTeX(entry)
  assert.match(text, /@article\{/)
  assert.match(text, /author = \{G\. Kucsko and P\. Maurer\}/)
  assert.match(text, /year = \{2013\}/)
  assert.doesNotMatch(text, /undefined/)
})

test('RIS uses the standard frame', () => {
  const text = toRIS(entry)
  assert.match(text, /^TY {2}- JOUR/m)
  assert.match(text, /ER {2}- /)
})

test('CSL-JSON is a plain citation object', () => {
  const value = toCslJson(entry)
  assert.equal(value.type, 'article-journal')
  assert.equal(value.title, entry.title)
  assert.equal(value.issued['date-parts'][0][0], 2013)
  assert.equal(value.author.length, 2)
})

test('science_cite writes a bibliography inside the working directory', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-cite-'))
  const tool = createCiteTool({ client: clientOf({ title: entry.title, doi: 'https://doi.org/10.1038/nature12373', publication_year: 2013, authorships: [] }), config: { mailto: '' }, logger: { warn() {} } })
  const out = await tool.execute({ ids: ['10.1038/nature12373'], format: 'bibtex' }, { cwd })
  const target = join(cwd, '.openscience', 'citations', 'refs.bib')
  assert.ok(existsSync(target), 'bibliography file missing')
  assert.match(readFileSync(target, 'utf8'), /Nanometre-scale/)
  assert.match(out.text, /refs\.bib/)
})

test('an out path outside the working directory is refused', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ai4s-cite-'))
  const tool = createCiteTool({ client: clientOf({ title: 'x', doi: 'https://doi.org/10.1/x' }), config: { mailto: '' }, logger: { warn() {} } })
  const out = await tool.execute({ ids: ['10.1/x'], out: '../escape.bib' }, { cwd })
  assert.match(out.text, /目录|拒绝|outside/)
  assert.equal(existsSync(join(cwd, '..', 'escape.bib')), false)
})
