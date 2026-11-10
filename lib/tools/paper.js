// science_paper — resolve one identifier into verified metadata + open access.

import { normalizeEntry, parseArxiv } from '../sources.js'
import { textTool } from './define.js'

/**
 * @param {object} deps
 * @param {{ getJson(url: string): Promise<any> }} deps.client
 * @param {object} deps.config
 */
export function createPaperTool({ client, config }) {
  return textTool({
    name: 'science_paper',
    description:
      'Resolve one DOI, PMID, arXiv id or OpenAlex id into verified metadata (authors, year, venue, abstract) '
      + 'and an open-access verdict with a PDF link when one exists. Use it before citing a specific paper.',
    parameters: {
      id: { type: 'string', description: 'DOI (10.x/...), PMID, arXiv id (1234.5678) or OpenAlex id (W...).', required: true },
      include_pdf: { type: 'boolean', description: 'Look up an open-access PDF link. Default true.' },
    },
    async run(args) {
      const mailto = config.mailto === '' ? undefined : config.mailto
      const resolved = await resolve(client, String(args.id).trim(), mailto)
      if (resolved.error !== undefined) return resolved.error

      const lines = [`title: ${resolved.entry.title}`]
      if (resolved.entry.authors?.length) lines.push(`authors: ${resolved.entry.authors.join('; ')}`)
      if (resolved.entry.year !== undefined) lines.push(`year: ${resolved.entry.year}`)
      if (resolved.entry.venue !== undefined) lines.push(`venue: ${resolved.entry.venue}`)
      if (resolved.entry.doi !== undefined) lines.push(`doi: ${resolved.entry.doi}`)
      if (resolved.entry.pmid !== undefined) lines.push(`pmid: ${resolved.entry.pmid}`)
      if (resolved.entry.arxivId !== undefined) lines.push(`arxiv: ${resolved.entry.arxivId}`)
      if (resolved.entry.url !== undefined) lines.push(`url: ${resolved.entry.url}`)
      if (resolved.oaStatus !== undefined) lines.push(`open access: ${resolved.oaStatus}`)
      if (resolved.abstract !== undefined) lines.push(`abstract: ${resolved.abstract}`)

      if ((args.include_pdf ?? true) && resolved.entry.doi !== undefined) {
        if (mailto === undefined) {
          // Only say "unknown" when OpenAlex did not already answer.
          if (resolved.oaStatus === undefined) lines.push('open access: unknown（未配置 mailto，跳过 Unpaywall 查询）')
        } else {
          const pdf = await openAccessPdf(client, resolved.entry.doi, mailto, lines)
          if (pdf !== undefined) lines.push(`pdf: ${pdf}`)
        }
      }
      return lines.join('\n')
    },
  })
}

/** Resolve any supported identifier. Shared with science_cite. */
export async function resolve(client, id, mailto) {
  const params = new URLSearchParams()
  if (mailto !== undefined) params.set('mailto', mailto)
  const suffix = params.toString() === '' ? '' : `?${params}`

  if (/^https?:\/\/openalex\.org\/W\d+$/.test(id)) return fromOpenAlex(client, id)
  if (/^W\d+$/.test(id)) return fromOpenAlex(client, `https://api.openalex.org/works/${id}${suffix}`)
  if (/^\d{6,9}$/.test(id)) return fromOpenAlex(client, `https://api.openalex.org/works/pmid:${id}${suffix}`)
  if (/^\d{4}\.\d{4,5}(v\d+)?$/.test(id)) return fromArxiv(client, id)
  if (/^10\.\d{4,9}\/\S+$/.test(id) || /^https?:\/\/(dx\.)?doi\.org\//i.test(id)) {
    const doi = id.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    return fromOpenAlex(client, `https://api.openalex.org/works/doi:${doi}${suffix}`)
  }
  return { error: `无法识别这个标识符：${id}。支持 DOI、PMID、arXiv id 和 OpenAlex W id。` }
}

async function fromOpenAlex(client, url) {
  const result = await client.getJson(url)
  if (!result.ok) return { error: `没有找到这篇文献：${result.message}` }
  const entry = normalizeEntry(result.body, 'openalex')
  if (entry === undefined) return { error: '没有找到这篇文献。' }
  const openAccess = result.body?.open_access
  return {
    entry,
    abstract: entry.abstract,
    oaStatus: openAccess?.is_oa === true ? (openAccess.oa_status ?? 'open') : openAccess?.is_oa === false ? 'closed' : undefined,
  }
}

async function fromArxiv(client, id) {
  const params = new URLSearchParams({ id_list: id.replace(/v\d+$/, '') })
  const result = await client.getJson(`https://export.arxiv.org/api/query?${params}`)
  if (!result.ok) return { error: `没有找到这篇文献：${result.message}` }
  const entries = parseArxiv(typeof result.body === 'string' ? result.body : '')
  if (entries.length === 0) return { error: '没有找到这篇文献。' }
  return { entry: entries[0], abstract: entries[0].abstract }
}

async function openAccessPdf(client, doi, mailto, lines) {
  if (mailto === undefined) return undefined
  const result = await client.getJson(`https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(mailto)}`)
  if (!result.ok) {
    lines.push(`open access: unknown（Unpaywall 查询失败：${result.message}）`)
    return undefined
  }
  const pdf = result.body?.best_oa_location?.url_for_pdf ?? result.body?.best_oa_location?.url
  if (result.body?.is_oa === true) {
    lines.push(`open access: ${result.body.oa_status ?? 'open'}`)
  } else {
    lines.push('open access: closed（Unpaywall 未找到开放版本）')
  }
  return typeof pdf === 'string' ? pdf : undefined
}
