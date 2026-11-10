// science_cite — turn resolved records into a bibliography file.

import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve, sep } from 'node:path'

import { citationKey, toBibTeX, toCslJson, toRIS } from '../cite.js'
import { resolve as resolveEntry } from './paper.js'
import { textTool } from './define.js'

const FORMATS = ['bibtex', 'ris', 'csljson']
const EXT = { bibtex: 'bib', ris: 'ris', csljson: 'json' }

/**
 * @param {object} deps
 * @param {{ getJson(url: string): Promise<any> }} deps.client
 * @param {object} deps.config
 * @param {object} deps.logger
 */
export function createCiteTool({ client, config, logger, resolveCwd }) {
  return textTool({
    name: 'science_cite',
    description:
      'Resolve identifiers and write them into a bibliography file (BibTeX, RIS or CSL-JSON) in the working '
      + 'directory. Use it after selecting papers so the write-up can cite them by key.',
    parameters: {
      ids: { type: 'array', description: 'DOIs, PMIDs or arXiv ids to export.', items: { type: 'string' }, required: true },
      format: { type: 'string', description: 'bibtex (default), ris, or csljson.', enum: FORMATS },
      out: { type: 'string', description: 'Output path relative to the working directory.' },
    },
    async run(args, exec) {
      const ids = Array.isArray(args.ids) ? args.ids.filter((id) => typeof id === 'string' && id.trim() !== '') : []
      if (ids.length === 0) return '没有可导出的标识符。'
      const format = FORMATS.includes(args.format) ? args.format : 'bibtex'
      const cwd = resolve(resolveCwd?.(exec) ?? exec?.cwd ?? process.cwd())
      const target = targetPath(cwd, args.out, format)
      if (target === undefined) {
        return `拒绝写入工作目录之外的路径：${args.out}。请给出 ${cwd} 内的相对路径。`
      }

      const mailto = config.mailto === '' ? undefined : config.mailto
      const entries = []
      const failures = []
      for (const id of ids) {
        const resolved = await resolveEntry(client, id, mailto)
        if (resolved.error !== undefined) failures.push(`${id}: ${resolved.error}`)
        else entries.push(resolved.entry)
      }
      if (entries.length === 0) return `没有可导出的记录。\n- ${failures.join('\n- ')}`

      const body = format === 'bibtex'
        ? entries.map((entry) => toBibTeX(entry)).join('\n')
        : format === 'ris'
          ? entries.map((entry) => toRIS(entry)).join('\n')
          : `${JSON.stringify(entries.map((entry) => toCslJson(entry)), null, 2)}\n`

      mkdirSync(dirname(target), { recursive: true })
      const temp = `${target}.tmp`
      writeFileSync(temp, body)
      renameSync(temp, target)

      const keys = entries.map((entry) => citationKey(entry)).join(', ')
      const lines = [`wrote ${entries.length} record(s) to ${target}`, `keys: ${keys}`]
      if (failures.length > 0) lines.push(...failures.map((failure) => `- ${failure}`))
      logger?.info?.(`openscience: wrote ${entries.length} citations to ${target}`)
      return lines.join('\n')
    },
  })
}

function targetPath(cwd, out, format) {
  const relative = typeof out === 'string' && out.trim() !== ''
    ? out.trim()
    : join('.openscience', 'citations', `refs.${EXT[format]}`)
  const candidate = isAbsolute(relative) ? resolve(relative) : resolve(cwd, relative)
  if (candidate !== cwd && !candidate.startsWith(cwd + sep)) return undefined
  return candidate
}
