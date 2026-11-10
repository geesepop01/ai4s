// Plugin config, with in-code defaults for every key so a row may mount with no
// config at all.

export const DEFAULT_SOURCES = ['openalex', 'pubmed', 'arxiv', 'crossref']

/**
 * Normalize raw row config.
 *
 * @param {object} [raw]
 * @returns {{ mailto: string, sources: string[], catalogMode: 'curated'|'all', bootstrap: boolean, stateDir: string, requestTimeoutMs: number }}
 */
export function normalizeConfig(raw = {}) {
  const mailto = typeof raw.mailto === 'string' ? raw.mailto.trim() : ''
  const sources = Array.isArray(raw.sources) && raw.sources.length > 0
    ? raw.sources.filter((source) => DEFAULT_SOURCES.includes(source))
    : [...DEFAULT_SOURCES]
  return {
    mailto,
    sources: sources.length > 0 ? sources : [...DEFAULT_SOURCES],
    catalogMode: raw.catalogMode === 'all' ? 'all' : 'curated',
    bootstrap: raw.bootstrap !== false,
    stateDir: typeof raw.stateDir === 'string' && raw.stateDir.trim() !== '' ? raw.stateDir.trim() : '.openscience',
    requestTimeoutMs: Number.isFinite(raw.requestTimeoutMs) ? raw.requestTimeoutMs : 12_000,
  }
}

/**
 * Read the NCBI API key from the host credential store, tolerating absence.
 *
 * @param {object} ctx
 * @returns {Promise<string|undefined>}
 */
export async function readPubmedKey(ctx) {
  const credentials = ctx.get?.('credentials') ?? ctx.credentials
  if (credentials === undefined || typeof credentials.resolve !== 'function') return undefined
  try {
    const resolved = await credentials.resolve({ key: 'openscience.pubmed' })
    if (typeof resolved === 'string') return resolved === '' ? undefined : resolved
    if (resolved !== null && typeof resolved === 'object') {
      const value = resolved.value ?? resolved.secret
      return typeof value === 'string' && value !== '' ? value : undefined
    }
    return undefined
  } catch {
    return undefined
  }
}
