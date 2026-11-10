// Citation rendering. Pure functions so they can be tested without I/O.

/** BibTeX for one entry. */
export function toBibTeX(entry) {
  const key = citationKey(entry)
  const fields = [
    ['title', entry.title],
    ['author', entry.authors?.length ? entry.authors.join(' and ') : undefined],
    ['year', entry.year === undefined ? undefined : String(entry.year)],
    ['journal', entry.venue],
    ['doi', entry.doi],
    ['url', entry.url],
  ].filter(([, value]) => value !== undefined && value !== '')
  const body = fields.map(([name, value]) => `  ${name} = {${escapeBraces(value)}}`).join(',\n')
  return `@article{${key},\n${body}\n}\n`
}

/** RIS for one entry. */
export function toRIS(entry) {
  const lines = ['TY  - JOUR']
  if (entry.title !== undefined) lines.push(`TI  - ${entry.title}`)
  for (const author of entry.authors ?? []) lines.push(`AU  - ${author}`)
  if (entry.year !== undefined) lines.push(`PY  - ${entry.year}`)
  if (entry.venue !== undefined) lines.push(`JO  - ${entry.venue}`)
  if (entry.doi !== undefined) lines.push(`DO  - ${entry.doi}`)
  if (entry.url !== undefined) lines.push(`UR  - ${entry.url}`)
  lines.push('ER  - ', '')
  return lines.join('\n')
}

/** CSL-JSON for one entry. */
export function toCslJson(entry) {
  return {
    type: 'article-journal',
    id: entry.doi ?? entry.title,
    title: entry.title,
    ...(entry.authors?.length
      ? {
          author: entry.authors.map((name) => {
            const parts = name.trim().split(/\s+/)
            const family = parts.length > 1 ? parts.at(-1) : name
            const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : undefined
            return { family, ...(given === undefined ? {} : { given }) }
          }),
        }
      : {}),
    ...(entry.year === undefined ? {} : { issued: { 'date-parts': [[entry.year]] } }),
    ...(entry.venue === undefined ? {} : { 'container-title': entry.venue }),
    ...(entry.doi === undefined ? {} : { DOI: entry.doi }),
    ...(entry.url === undefined ? {} : { URL: entry.url }),
  }
}

/** Stable, readable citation key. */
export function citationKey(entry) {
  if (entry.doi !== undefined) return entry.doi.replace(/[^a-zA-Z0-9]+/g, '_')
  const first = entry.authors?.[0]?.split(/\s+/).at(-1)?.toLowerCase() ?? 'anon'
  return `${first}${entry.year ?? ''}`
}

function escapeBraces(value) {
  return String(value).replace(/[{}]/g, '')
}
