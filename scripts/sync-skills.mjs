#!/usr/bin/env node
// Rebuild the vendored skills tree from a local OpenScience checkout.
//
//   node scripts/sync-skills.mjs [--source <dir>] [--out <dir>]
//
// The curated tier keeps a full model-facing description; everything else gets
// `disable-model-invocation: true` so it never enters the per-request skill
// catalog and is loaded on demand through the `science_skill` tool.

import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOSITORY = 'https://github.com/synthetic-sciences/OpenScience'
const COMMIT = '6de022d'
const TAG = 'v1.3.4'
const LICENSE = 'Apache-2.0'

/** Skills whose description stays in the model catalog (<= 60). */
const CURATED = [
  'research-workflow', 'literature-review', 'literature-search', 'paper-lookup',
  'research-lookup', 'citation-management', 'hypothesis-generation', 'experimental-design',
  'experimental-reproducibility', 'statistical-analysis', 'statistical-conventions',
  'statistical-power', 'figures-manuscripts', 'scientific-writing', 'academic-writing',
  'peer-review', 'research-critique', 'scholar-evaluation', 'research-grants',
  'scientific-brainstorming', 'scientific-critical-thinking', 'scientific-visualization',
  'scientific-slides', 'venue-templates', 'reproducibility', 'document-parsing',
  'pdf-analysis', 'analysis-report', 'pandas', 'polars', 'matplotlib', 'seaborn',
  'plotly', 'scikit-learn', 'statsmodels', 'networkx', 'sympy', 'umap-learn',
  'data-exploration', 'exploratory-data-analysis', 'biopython', 'scanpy',
  'single-cell-analysis', 'pydeseq2', 'pysam', 'pdb-database', 'uniprot-database',
  'pubmed-database', 'openalex-database', 'ensembl-database', 'rdkit', 'chembl-database',
  'pubchem-database', 'molecular-docking', 'astropy', 'qiskit', 'pymatgen', 'pytorch',
  'transformers',
]

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const source = resolve(argValue('--source') ?? 'C:/Users/hangj/.dsh/bundles/science-research-preset/skills')
const out = resolve(argValue('--out') ?? join(root, 'skills'))

function argValue(flag) {
  const i = args.indexOf(flag)
  return i === -1 ? undefined : args[i + 1]
}

function frontmatterRange(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  return m ? { start: 0, bodyStart: m[0].length, end: m[0].length, block: m[0] } : undefined
}

function skillName(block) {
  const m = /^name:\s*(.+)$/m.exec(block)
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : undefined
}

function setHidden(text, hidden) {
  const range = frontmatterRange(text)
  if (!range) return { text, changed: false }
  const lines = range.block.split('\n')
  const closing = lines.length - 1
  const has = lines.some((l) => /^disable-model-invocation:/.test(l))
  if (hidden && !has) lines.splice(closing, 0, 'disable-model-invocation: true')
  if (!hidden && has) return { text: lines.filter((l) => !/^disable-model-invocation:/.test(l)).join('\n') + text.slice(range.end), changed: true }
  if (!hidden) return { text, changed: false }
  return { text: lines.join('\n') + text.slice(range.end), changed: true }
}

if (!existsSync(source)) {
  console.error(`source skills tree not found: ${source}`)
  process.exit(1)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const curated = new Set(CURATED)
const hiddenNames = []
const patchedFrontmatter = []
const seen = new Map()
let copied = 0

for (const dir of readdirSync(source, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const from = join(source, dir.name)
  const skillFile = join(from, 'SKILL.md')
  if (!existsSync(skillFile)) continue
  const name = skillName(frontmatterRange(readFileSync(skillFile, 'utf8'))?.block ?? '')
  if (!name) {
    console.warn(`skip ${dir.name}: no name in frontmatter`)
    continue
  }
  if (seen.has(name)) {
    console.warn(`skip ${dir.name}: duplicate skill name ${name} (also ${seen.get(name)})`)
    continue
  }
  seen.set(name, dir.name)
  cpSync(from, join(out, dir.name), { recursive: true })
  const target = join(out, dir.name, 'SKILL.md')
  const before = readFileSync(target, 'utf8')
  const { text, changed } = setHidden(before, !curated.has(name))
  if (changed) {
    writeFileSync(target, text)
    patchedFrontmatter.push(name)
  }
  if (!curated.has(name)) hiddenNames.push(name)
  copied += 1
}

const missing = CURATED.filter((n) => !seen.has(n))
if (missing.length > 0) console.warn(`curated names absent from source: ${missing.join(', ')}`)

const pin = {
  repository: REPOSITORY,
  commit: COMMIT,
  tag: TAG,
  license: LICENSE,
  syncedAt: new Date().toISOString(),
  curated: CURATED.filter((n) => seen.has(n)),
  hidden: hiddenNames.sort(),
  patchedFrontmatter: patchedFrontmatter.sort(),
}
writeFileSync(join(root, 'upstream', 'PIN.json'), `${JSON.stringify(pin, null, 2)}\n`)
console.log(`copied=${copied} curated=${pin.curated.length} hidden=${hiddenNames.length} patched=${patchedFrontmatter.length}`)
