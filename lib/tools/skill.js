// science_skill — load a vendored skill the model catalog hides.
//
// `skill` refuses any skill whose frontmatter says `disable-model-invocation`,
// which is exactly the 311 skills kept out of the per-request catalog. This tool
// is the sanctioned way to read one of them: same body, same base directory,
// only reached by name or topic instead of by catalog discovery.

import { readSkill, skillCatalog } from '../skills.js'
import { textTool } from './define.js'

/**
 * @param {object} deps
 * @param {string} deps.dir vendored skills root
 * @param {object} deps.logger
 */
export function createSkillTool({ dir, logger }) {
  return textTool({
    name: 'science_skill',
    description:
      'Read a research skill from the OpenScience library by name, or list candidates by topic. '
      + 'The session catalog shows only a short list; the other 300+ skills (biology, chemistry, physics, ML, '
      + 'compute, writing) load through here. Call it before doing specialised scientific work.',
    parameters: {
      name: { type: 'string', description: 'Exact skill name, e.g. scanpy, pydeseq2, qiskit.' },
      topic: { type: 'string', description: 'Keyword to list matching skills when the name is unknown.' },
    },
    async run(args) {
      const name = typeof args.name === 'string' ? args.name.trim() : ''
      if (name !== '') {
        const skill = await readSkill(dir, name)
        if (skill !== undefined) {
          return [`skill: ${skill.name}`, `description: ${skill.description}`, `base: ${skill.baseDir}`, '', skill.content].join('\n')
        }
        const candidates = await candidatesFor(dir, name)
        if (candidates.length === 0) return `未找到技能“${name}”，也没有相近的名字。用 topic 参数按主题搜索。`
        return [
          `未找到技能“${name}”。相近的候选：`,
          ...candidates.map((item) => `- ${item.name}: ${item.description}`),
        ].join('\n')
      }

      const topic = typeof args.topic === 'string' ? args.topic.trim() : ''
      if (topic === '') return '请给出 name（精确技能名）或 topic（主题关键字）。'
      const items = await candidatesFor(dir, topic, 20)
      if (items.length === 0) return `没有匹配“${topic}”的技能。`
      return [`topic: ${topic}`, `${items.length} match(es)：`, ...items.map((item) => `- ${item.name}: ${item.description}`)].join('\n')
    },
  })
}

async function candidatesFor(dir, query, limit = 10) {
  const needle = query.toLowerCase()
  const items = await skillCatalog(dir, { logger: undefined })
  const scored = items
    .map((item) => ({ item, score: score(item, needle) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map((entry) => entry.item)
  return scored
}

function score(item, needle) {
  const name = item.name.toLowerCase()
  const description = (item.description ?? '').toLowerCase()
  if (name === needle) return 100
  if (name.includes(needle)) return 80 - Math.abs(name.length - needle.length)
  if (needle.includes(name)) return 60
  if (description.includes(needle)) return 20
  return 0
}
