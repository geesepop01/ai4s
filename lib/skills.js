// Skill catalog for the OpenScience plugin.
//
// The vendored tree is served through dsh's OWN provider (a private
// `FileSystemSkillProvider` instance pointed at this package), so frontmatter
// parsing, watching and future provider fixes come for free. The wrapper adds
// only what dsh does not: the `catalogMode` policy, and the local reader the
// `science_skill` tool uses for skills the model catalog hides.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'

/** Provider name registered on `ctx.skills`. */
export const PROVIDER_NAME = 'openscience'

/** The official provider package, imported lazily on first discovery. */
const FILESYSTEM_PROVIDER = '@deepseek-ai/dsh-skill-filesystem'

const SKILL_FILE = 'SKILL.md'
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** True when `name` is a syntactically valid skill name. */
export function isValidSkillName(name) {
  return typeof name === 'string' && NAME_PATTERN.test(name)
}

/**
 * Register the vendored skills on `ctx.skills`.
 *
 * @param {object} ctx cordis context carrying `skills`
 * @param {object} options
 * @param {string} options.dir skills root
 * @param {'curated'|'all'} options.mode catalog policy
 * @param {object} options.logger
 * @param {() => Promise<object|undefined>} [options.loadDelegate] test seam
 * @returns {() => void} disposer
 */
export function registerSkills(ctx, { dir, mode, logger, loadDelegate = loadOfficialProvider }) {
  return ctx.skills.registerProvider((control) => {
    let pending
    const delegate = () => {
      if (pending !== undefined) return pending
      pending = loadDelegate({ ctx, control, dir, logger }).catch((error) => {
        logger.warn?.(`openscience: skill catalog unavailable (${messageOf(error)})`)
        // Not memoized: a later refresh retries instead of disabling skills.
        pending = undefined
        return undefined
      })
      return pending
    }

    const policy = (candidate) => {
      if (mode !== 'all') return candidate
      const invocation = candidate.invocation ?? {}
      return { ...candidate, invocation: { ...invocation, modelInvocable: true } }
    }

    return {
      name: PROVIDER_NAME,
      async list(options = {}) {
        const inner = await delegate()
        if (inner === undefined) return []
        try {
          const candidates = await inner.list(options)
          return Array.isArray(candidates) ? candidates.map(policy) : []
        } catch (error) {
          logger.warn?.(`openscience: skill discovery failed (${messageOf(error)})`)
          return []
        }
      },
      async get(candidate, options = {}) {
        const inner = await delegate()
        if (inner === undefined) return undefined
        try {
          const skill = await inner.get(candidate, options)
          return skill === undefined ? undefined : policy(skill)
        } catch (error) {
          logger.warn?.(`openscience: skill load failed (${messageOf(error)})`)
          return undefined
        }
      },
      async dispose() {
        const inner = await delegate()
        await inner?.dispose?.()
      },
    }
  })
}

/** Lazily construct the official provider as a private instance. */
async function loadOfficialProvider({ ctx, control, dir, logger }) {
  const mod = await import(FILESYSTEM_PROVIDER)
  return new mod.FileSystemSkillProvider(ctx, control, {
    providerName: PROVIDER_NAME,
    includeDefaultRoots: false,
    bundledSkillDir: dir,
  })
}

/**
 * Read the vendored tree directly (used by the catalog route and the
 * `science_skill` tool).
 *
 * @returns {Promise<Array<{name: string, description: string, dir: string}>>}
 */
export async function skillCatalog(dir, { logger } = {}) {
  if (!existsSync(dir)) return []
  const items = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = join(dir, entry.name, SKILL_FILE)
    if (!existsSync(file)) continue
    const frontmatter = parseFrontmatter(readFileSync(file, 'utf8'))
    if (frontmatter === undefined) {
      logger?.warn?.(`openscience: skip ${entry.name}: no usable frontmatter`)
      continue
    }
    if (!isValidSkillName(frontmatter.name)) {
      logger?.warn?.(`openscience: skip ${entry.name}: invalid skill name`)
      continue
    }
    items.push({
      name: frontmatter.name,
      description: frontmatter.description ?? '',
      dir: entry.name,
      hidden: frontmatter['disable-model-invocation'] === 'true',
    })
  }
  items.sort((a, b) => a.name.localeCompare(b.name))
  return items
}

/**
 * Load one skill body from the vendored tree.
 *
 * @returns {Promise<{name: string, description: string, content: string, baseDir: string} | undefined>}
 */
export async function readSkill(dir, name) {
  if (!isValidSkillName(name)) return undefined
  const root = resolve(dir)
  const baseDir = resolve(root, name)
  if (baseDir !== root && !baseDir.startsWith(root + sep)) return undefined
  const file = join(baseDir, SKILL_FILE)
  if (!existsSync(file)) return undefined
  const text = readFileSync(file, 'utf8')
  const frontmatter = parseFrontmatter(text)
  if (frontmatter === undefined) return undefined
  return {
    name: frontmatter.name ?? name,
    description: frontmatter.description ?? '',
    content: text,
    baseDir,
  }
}

/** Minimal frontmatter reader: `key: value` lines in the first `---` block. */
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (match === null) return undefined
  const out = {}
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(':')
    if (index <= 0) continue
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key !== '') out[key] = value
  }
  return typeof out.name === 'string' && out.name !== '' ? out : undefined
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}
