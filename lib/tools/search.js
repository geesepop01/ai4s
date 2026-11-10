// science_search — one query across the scholarly sources the plugin knows.

import { dedupe, searchArxiv, searchCrossref, searchOpenAlex, searchPubMed } from '../sources.js'
import { textTool } from './define.js'

const MAX_LIMIT = 25
const DEFAULT_LIMIT = 10

const SOURCES = ['openalex', 'pubmed', 'arxiv', 'crossref']

/**
 * @param {object} deps
 * @param {{ getJson(url: string): Promise<any> }} deps.client
 * @param {object} deps.config normalized plugin config
 * @param {object} deps.logger
 * @param {object} [deps.limiter] PubMed rate limiter
 */
export function createSearchTool({ client, config, logger, limiter, getPubmedKey }) {
  return textTool({
    name: 'science_search',
    description:
      'Search the literature across OpenAlex, PubMed, arXiv and Crossref and return real records with identifiers. '
      + 'Use it before making any literature claim; never cite a paper that was not returned here.',
    parameters: {
      query: { type: 'string', description: 'Free-text query, e.g. a topic, title fragment or author+keyword.', required: true },
      sources: { type: 'array', description: `Sources to query: ${SOURCES.join(', ')}. Omit for the configured default.`, items: { type: 'string', enum: SOURCES } },
      limit: { type: 'number', description: `Records per source, at most ${MAX_LIMIT}.` },
      year_from: { type: 'number', description: 'Earliest publication year.' },
      year_to: { type: 'number', description: 'Latest publication year.' },
      detailed: { type: 'boolean', description: 'Include abstracts (truncated) when available.' },
    },
    async run(args) {
      const requested = Number.isFinite(args.limit) ? Math.max(1, Math.floor(args.limit)) : DEFAULT_LIMIT
      const limit = Math.min(MAX_LIMIT, requested)
      const sources = Array.isArray(args.sources) && args.sources.length > 0
        ? args.sources.filter((s) => SOURCES.includes(s))
        : config.sources
      const yearFrom = Number.isFinite(args.year_from) ? Math.floor(args.year_from) : undefined
      const yearTo = Number.isFinite(args.year_to) ? Math.floor(args.year_to) : undefined
      const notes = []
      if (requested > MAX_LIMIT) notes.push(`limit 已收窄到 ${MAX_LIMIT}（每次最多 ${MAX_LIMIT} 条）。`)

      const pubmedKey = typeof getPubmedKey === 'function' ? await getPubmedKey() : undefined
      const results = await Promise.all(sources.map(async (source) => {
        try {
          return await querySource(source, {
            client, config, limiter, pubmedKey, query: args.query, limit, yearFrom, yearTo,
          })
        } catch (error) {
          // A provider implementation may throw even though ours returns envelopes.
          logger?.warn?.(`openscience: ${source} search failed (${error instanceof Error ? error.message : error})`)
          return { entries: [], error: error instanceof Error ? error.message : String(error) }
        }
      }))

      const entries = []
      results.forEach((result, index) => {
        if (result.error !== undefined) {
          notes.push(`${sources[index]}: ${result.error}`)
          return
        }
        notes.push(`${sources[index]}: ${result.entries.length} 条`)
        entries.push(...result.entries)
      })

      const merged = dedupe(entries)
        .filter((entry) => yearFrom === undefined || entry.year === undefined || entry.year >= yearFrom)
        .filter((entry) => yearTo === undefined || entry.year === undefined || entry.year <= yearTo)
      if (merged.length === 0) {
        return ['没有检索到符合条件的记录。', ...notes.map((note) => `- ${note}`)].join('\n')
      }
      const header = [`query: ${args.query}`, `records: ${merged.length}`, ...notes.map((note) => `- ${note}`)].join('\n')
      const body = merged.map((entry, index) => renderEntry(entry, index, args.detailed === true)).join('\n')
      return `${header}\n\n${body}`
    },
  })
}

function querySource(source, input) {
  switch (source) {
    case 'openalex':
      return searchOpenAlex(input.client, input)
    case 'crossref':
      return searchCrossref(input.client, input)
    case 'pubmed':
      return searchPubMed(input.client, { ...input, apiKey: input.pubmedKey, limiter: input.limiter })
    case 'arxiv':
      return searchArxiv(input.client, input)
    default:
      return Promise.resolve({ entries: [], error: `未知来源 ${source}` })
  }
}

function renderEntry(entry, index, detailed) {
  const lines = [`${index + 1}. ${entry.title}`]
  if (entry.authors?.length) {
    lines.push(`   authors: ${entry.authors.slice(0, 6).join('; ')}${entry.authors.length > 6 ? ' et al.' : ''}`)
  }
  if (entry.year !== undefined) lines.push(`   year: ${entry.year}`)
  if (entry.venue !== undefined) lines.push(`   venue: ${entry.venue}`)
  if (entry.doi !== undefined) lines.push(`   doi: ${entry.doi}`)
  if (entry.pmid !== undefined) lines.push(`   pmid: ${entry.pmid}`)
  if (entry.arxivId !== undefined) lines.push(`   arxiv: ${entry.arxivId}`)
  if (entry.url !== undefined) lines.push(`   url: ${entry.url}`)
  if (detailed && entry.abstract !== undefined) lines.push(`   abstract: ${entry.abstract}`)
  return lines.join('\n')
}
