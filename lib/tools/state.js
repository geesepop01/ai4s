// science_state — the agent's side of the research workbench.

import { join, resolve } from 'node:path'

import { StateConflict, emptyState, readState, writeState } from '../state.js'
import { setLastStateDir } from '../last-dir.js'
import { textTool } from './define.js'

const ACTIONS = ['read', 'write', 'patch']

/**
 * @param {object} deps
 * @param {object} deps.config
 * @param {object} deps.logger
 */
export function createStateTool({ config, logger, resolveCwd }) {
  const stateDir = config.stateDir ?? '.openscience'
  return textTool({
    name: 'science_state',
    description:
      'Read or update the research state for this workspace (question, hypothesis, stage, papers, next steps). '
      + 'The workbench panel shows the same document, so record progress here instead of restating it in chat.',
    parameters: {
      action: { type: 'string', description: 'read, write (replace) or patch (merge one level deep).', enum: ACTIONS, required: true },
      payload: { type: 'string', description: 'JSON object with the fields to write, e.g. {"stage":"ANALYZE","todos":["..."]}.' },
      expected_revision: { type: 'number', description: 'Revision the payload was based on. Omit for the first write.' },
    },
    async run(args, exec) {
      const dir = resolve(resolveCwd?.(exec) ?? exec?.cwd ?? process.cwd(), stateDir)
      setLastStateDir(dir)
      const action = ACTIONS.includes(args.action) ? args.action : 'read'

      if (action === 'read') {
        const { revision, state } = await readState(dir)
        return render(revision, state)
      }

      const payload = parsePayload(args.payload)
      if (payload.error !== undefined) return payload.error
      const { revision } = await readState(dir)
      const requested = args.expected_revision ?? args.expectedRevision
      if (requested === undefined && revision !== 0) {
        // Never adopt the revision we just read: that would silently clobber a
        // concurrent writer. The model must re-read and pass it explicitly.
        return `conflict: 这个工作区已有 revision ${revision} 的研究状态。先 action:"read"，再带 expected_revision:${revision} 重试。`
      }
      const expected = Number.isInteger(requested) ? requested : null
      const base = action === 'patch' ? (await readState(dir)).state : emptyState()
      const next = action === 'patch' ? merge(base, payload.value) : { ...emptyState(), ...payload.value }
      try {
        const written = await writeState(dir, next, expected)
        logger?.info?.(`openscience: state written at revision ${written.revision}`)
        return render(written.revision, (await readState(dir)).state)
      } catch (error) {
        if (error instanceof StateConflict) {
          return `conflict: 状态已被别的写入改动，当前 revision 是 ${error.currentRevision}。`
            + '先 read 再带新的 expected_revision 重试。'
        }
        logger?.warn?.(`openscience: state write failed (${error instanceof Error ? error.message : error})`)
        return `写入失败：${error instanceof Error ? error.message : String(error)}`
      }
    },
  })
}

function parsePayload(raw) {
  if (raw === undefined || raw === null || raw === '') return { value: {} }
  if (typeof raw === 'object') return { value: raw }
  try {
    const parsed = JSON.parse(String(raw))
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: 'payload 必须是 JSON 对象，例如 {"stage":"COMPUTE"}。' }
    }
    return { value: parsed }
  } catch {
    return { error: 'payload 不是合法 JSON。' }
  }
}

function merge(base, payload) {
  const next = { ...base }
  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value) && Array.isArray(base[key])) next[key] = [...base[key], ...value]
    else if (value !== null && typeof value === 'object' && !Array.isArray(value) && typeof base[key] === 'object' && base[key] !== null) {
      next[key] = { ...base[key], ...value }
    } else next[key] = value
  }
  return next
}

function render(revision, state) {
  const lines = [`revision: ${revision}`, `stage: ${state.stage ?? 'SCOPE'}`]
  if (state.question) lines.push(`question: ${state.question}`)
  if (state.hypothesis) lines.push(`hypothesis: ${state.hypothesis}`)
  if (Array.isArray(state.entries) && state.entries.length > 0) {
    lines.push(`papers: ${state.entries.length}`)
    for (const entry of state.entries.slice(0, 10)) lines.push(`- ${entry.title ?? entry.doi ?? entry}`)
  }
  if (Array.isArray(state.todos) && state.todos.length > 0) {
    lines.push('next steps:')
    for (const todo of state.todos.slice(0, 10)) lines.push(`- ${todo}`)
  }
  return lines.join('\n')
}
