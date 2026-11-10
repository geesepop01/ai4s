// Scholarly source adapters.
//
// Every adapter takes the shared http client, builds a GET URL the host's web
// provider can serve (politeness rides in `mailto`, never headers), and maps the
// upstream shape onto the plugin's one entry shape.

const ABSTRACT_LIMIT = 600

/**
 * @typedef {object} Entry
 * @property {string} title
 * @property {string[]} [authors]
 * @property {number} [year]
 * @property {string} [venue]
 * @property {string} [doi]
 * @property {string} [pmid]
 * @property {string} [arxivId]
 * @property {string} [url]
 * @property {string} [abstract]
 */

/**
 * @param {any} raw one upstream record
 * @param {'openalex'|'crossref'|'pubmed'|'arxiv'} source
 * @returns {Entry|undefined}
 */
export function normalizeEntry(raw, source) {
  if (raw === undefined || raw === null) return undefined
  if (source === 'openalex') {
    const doi = stripDoi(raw.doi)
    const authors = (raw.authorships ?? []).map((a) => a?.author?.display_name).filter(Boolean)
    return clean({
      title: raw.title ?? raw.display_name,
      authors,
      year: raw.publication_year,
      venue: raw.primary_location?.source?.display_name,
      doi,
      url: doi === undefined ? raw.id : undefined,
      abstract: abstractFromInvertedIndex(raw.abstract_inverted_index),
    })
  }
  if (source === 'crossref') {
    const authors = (raw.author ?? [])
      .map((a) => [a?.given, a?.family].filter(Boolean).join(' '))
      .filter((name) => name !== '')
    return clean({
      title: Array.isArray(raw.title) ? raw.title[0] : raw.title,
      authors,
      year: raw.issued?.['date-parts']?.[0]?.[0],
      venue: Array.isArray(raw['container-title']) ? raw['container-title'][0] : raw['container-title'],
      doi: stripDoi(raw.DOI),
      url: raw.URL,
      abstract: stripTags(raw.abstract),
    })
  }
  if (source === 'pubmed') {
    const doi = (raw.articleids ?? []).find((id) => id?.idtype === 'doi')?.value
    const year = /\b(19|20)\d{2}\b/.exec(raw.pubdate ?? '')
    return clean({
      title: (raw.title ?? '').replace(/\.$/, ''),
      authors: (raw.authors ?? []).map((a) => a?.name).filter(Boolean),
      year: year === null ? undefined : Number(year[0]),
      venue: raw.fulljournalname ?? raw.source,
      doi: stripDoi(doi),
      pmid: raw.uid === undefined ? undefined : String(raw.uid),
      url: raw.uid === undefined ? undefined : `https://pubmed.ncbi.nlm.nih.gov/${raw.uid}/`,
      abstract: stripTags(raw.abstract),
    })
  }
  return undefined
}

/** Parse an arXiv Atom response into entries. */
export function parseArxiv(xml) {
  if (typeof xml !== 'string') return []
  const entries = []
  const blocks = xml.split(/<entry>/).slice(1)
  for (const block of blocks) {
    const title = text(block, 'title')
    const summary = text(block, 'summary')
    const id = text(block, 'id')
    const published = text(block, 'published')
    const authors = [...block.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)].map((m) => m[1].trim())
    const arxivId = id === undefined ? undefined : /abs\/([^v<]+)(v\d+)?/.exec(id)?.[1]
    entries.push(clean({
      title,
      authors,
      year: published === undefined ? undefined : Number(published.slice(0, 4)),
      doi: stripDoi(text(block, 'arxiv:doi')),
      arxivId,
      url: id,
      abstract: summary === undefined ? undefined : truncate(summary),
    }))
  }
  return entries.filter((entry) => entry !== undefined)
}

/** Merge duplicate records, keeping the first and filling missing fields. */
export function dedupe(entries) {
  const byKey = new Map()
  for (const entry of entries) {
    if (entry === undefined) continue
    const key = entry.doi !== undefined ? `doi:${entry.doi.toLowerCase()}` : `title:${normalizeTitle(entry.title)}`
    const existing = byKey.get(key)
    if (existing === undefined) {
      byKey.set(key, { ...entry })
      continue
    }
    for (const [field, value] of Object.entries(entry)) {
      if (existing[field] === undefined && value !== undefined) existing[field] = value
    }
  }
  return [...byKey.values()]
}

/** OpenAlex full-text search. */
export async function searchOpenAlex(client, { query, limit, yearFrom, yearTo, mailto }) {
  const params = new URLSearchParams({ search: query, 'per-page': String(limit) })
  if (mailto !== undefined) params.set('mailto', mailto)
  const filters = []
  if (yearFrom !== undefined) filters.push(`from_publication_date:${yearFrom}-01-01`)
  if (yearTo !== undefined) filters.push(`to_publication_date:${yearTo}-12-31`)
  if (filters.length > 0) params.set('filter', filters.join(','))
  const result = await client.getJson(`https://api.openalex.org/works?${params}`)
  if (!result.ok) return { entries: [], error: result.message }
  return { entries: (result.body?.results ?? []).map((raw) => normalizeEntry(raw, 'openalex')).filter(Boolean) }
}

/** Crossref bibliographic search. */
export async function searchCrossref(client, { query, limit, yearFrom, yearTo, mailto }) {
  const params = new URLSearchParams({ 'query.bibliographic': query, rows: String(limit) })
  if (mailto !== undefined) params.set('mailto', mailto)
  const filters = []
  if (yearFrom !== undefined) filters.push(`from-pub-date:${yearFrom}-01-01`)
  if (yearTo !== undefined) filters.push(`until-pub-date:${yearTo}-12-31`)
  if (filters.length > 0) params.set('filter', filters.join(','))
  const result = await client.getJson(`https://api.crossref.org/works?${params}`)
  if (!result.ok) return { entries: [], error: result.message }
  return { entries: (result.body?.message?.items ?? []).map((raw) => normalizeEntry(raw, 'crossref')).filter(Boolean) }
}

/** PubMed search through esearch + esummary. */
export async function searchPubMed(client, { query, limit, yearFrom, yearTo, apiKey, limiter }) {
  const term = []
  term.push(`(${query})`)
  if (yearFrom !== undefined || yearTo !== undefined) {
    term.push(`${yearFrom ?? 1800}:${yearTo ?? 3000}[dp]`)
  }
  const esearch = new URLSearchParams({ db: 'pubmed', term: term.join(' AND '), retmax: String(limit), retmode: 'json' })
  if (apiKey !== undefined) esearch.set('api_key', apiKey)
  const found = await run(limiter, () => client.getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${esearch}`))
  if (!found.ok) return { entries: [], error: found.message }
  const ids = found.body?.esearchresult?.idlist ?? []
  if (ids.length === 0) return { entries: [] }
  const esummary = new URLSearchParams({ db: 'pubmed', id: ids.join(','), retmode: 'json' })
  if (apiKey !== undefined) esummary.set('api_key', apiKey)
  const summary = await run(limiter, () => client.getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${esummary}`))
  if (!summary.ok) return { entries: [], error: summary.message }
  const result = summary.body?.result ?? {}
  return { entries: ids.map((id) => normalizeEntry(result[id], 'pubmed')).filter(Boolean) }
}

/** arXiv Atom search. */
export async function searchArxiv(client, { query, limit }) {
  const params = new URLSearchParams({
    search_query: `all:${query}`,
    max_results: String(limit),
  })
  const result = await client.getJson(`https://export.arxiv.org/api/query?${params}`)
  if (!result.ok) return { entries: [], error: result.message }
  const content = typeof result.body === 'string' ? result.body : undefined
  if (content === undefined) return { entries: [], error: 'arXiv 返回的不是可解析的文本。' }
  return { entries: parseArxiv(content) }
}

function run(limiter, operation) {
  return limiter === undefined ? operation() : limiter.run(operation)
}

function clean(entry) {
  const out = {}
  for (const [key, value] of Object.entries(entry)) {
    if (value === undefined || value === null || value === '') continue
    if (key === 'abstract') {
      out[key] = truncate(String(value))
      continue
    }
    if (key === 'title') {
      out[key] = String(value).replace(/\s+/g, ' ').trim()
      continue
    }
    out[key] = value
  }
  if (out.title === undefined || out.title === '') return undefined
  return out
}

function truncate(text, limit = ABSTRACT_LIMIT) {
  const flat = String(text).replace(/\s+/g, ' ').trim()
  if (flat.length <= limit) return flat
  return `${flat.slice(0, limit - 1)}…`
}

function stripDoi(value) {
  if (typeof value !== 'string' || value === '') return undefined
  return value.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase()
}

function stripTags(value) {
  if (typeof value !== 'string') return undefined
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function text(block, tag) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(block)
  return match === null ? undefined : stripTags(match[1])
}

function abstractFromInvertedIndex(index) {
  if (index === undefined || index === null) return undefined
  const words = []
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word
  }
  return words.filter(Boolean).join(' ')
}

function normalizeTitle(title) {
  return String(title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
