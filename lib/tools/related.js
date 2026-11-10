// science_related — walk one paper's neighbourhood in OpenAlex.

import { normalizeEntry } from '../sources.js'
import { textTool } from './define.js'

const DIRECTIONS = { related: 'related_works', references: 'referenced_works', citations: 'cites' }

/**
 * @param {object} deps
 * @param {{ getJson(url: string): Promise<any> }} deps.client
 * @param {object} deps.config
 */
export function createRelatedTool({ client, config }) {
  return textTool({
    name: 'science_related',
    description:
      'Find papers related to one known paper: its references, the works citing it, or OpenAlex related works. '
      + 'Use it to walk backwards from a seed paper instead of guessing citations.',
    parameters: {
      id: { type: 'string', description: 'DOI, PMID or OpenAlex work id of the seed paper.', required: true },
      direction: { type: 'string', description: 'related (default), references, or citations.', enum: ['related', 'references', 'citations'] },
      limit: { type: 'number', description: 'Maximum records, at most 25.' },
    },
    async run(args) {
      const direction = args.direction ?? 'related'
      const limit = Math.min(25, Number.isFinite(args.limit) ? Math.max(1, Math.floor(args.limit)) : 10)
      const mailto = config.mailto === '' ? undefined : config.mailto

      const seed = await fetchSeed(client, args.id, mailto)
      if (seed.error !== undefined) return seed.error
      const work = seed.work

      const text = (value) => String(value)
      const openalexIds = (value) => (value ?? []).map((id) => text(id).replace(/^https?:\/\/openalex\.org\//, '')).filter(Boolean)

      let ids
      if (direction === 'citations') {
        const params = new URLSearchParams({ filter: `cites:${openalexIds([work.id])[0]}`, 'per-page': String(limit) })
        if (mailto !== undefined) params.set('mailto', mailto)
        const found = await client.getJson(`https://api.openalex.org/works?${params}`)
        if (!found.ok) return `没有取到引用文献：${found.message}`
        return render(found.body?.results ?? [], limit, 'citations')
      }

      ids = openalexIds(work[DIRECTIONS[direction]])
      if (ids.length === 0) return `这篇文献在 OpenAlex 里没有可用的${label(direction)}记录。`
      const picked = ids.slice(0, limit)

      const params = new URLSearchParams({ filter: `openalex_id:${picked.join('|')}`, 'per-page': String(picked.length) })
      if (mailto !== undefined) params.set('mailto', mailto)
      const found = await client.getJson(`https://api.openalex.org/works?${params}`)
      if (!found.ok) return `没有取到关联文献：${found.message}`
      return render(found.body?.results ?? [], limit, direction)
    },
  })
}

function render(results, limit, direction) {
  const entries = results.map((raw) => normalizeEntry(raw, 'openalex')).filter(Boolean).slice(0, limit)
  if (entries.length === 0) return `没有可用的${label(direction)}记录。`
  const lines = [`direction: ${direction}`, `records: ${entries.length}`, '']
  entries.forEach((entry, index) => {
    lines.push(`${index + 1}. ${entry.title}`)
    if (entry.authors?.length) lines.push(`   authors: ${entry.authors.slice(0, 6).join('; ')}`)
    if (entry.year !== undefined) lines.push(`   year: ${entry.year}`)
    if (entry.doi !== undefined) lines.push(`   doi: ${entry.doi}`)
  })
  return lines.join('\n')
}

function label(direction) {
  return direction === 'references' ? '参考文献' : direction === 'citations' ? '引用' : '关联'
}

async function fetchSeed(client, id, mailto) {
  const params = new URLSearchParams()
  if (mailto !== undefined) params.set('mailto', mailto)
  const suffix = params.toString() === '' ? '' : `?${params}`
  let url
  if (/^https?:\/\/openalex\.org\/W\d+$/.test(id)) url = id
  else if (/^W\d+$/.test(id)) url = `https://api.openalex.org/works/${id}`
  else if (/^\d{6,9}$/.test(id)) url = `https://api.openalex.org/works/pmid:${id}${suffix}`
  else url = `https://api.openalex.org/works/doi:${id.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}${suffix}`

  const result = await client.getJson(url)
  if (!result.ok) return { error: `没有找到这篇文献：${result.message}` }
  if (result.body === undefined || result.body?.id === undefined) return { error: '没有找到这篇文献。' }
  return { work: result.body }
}
