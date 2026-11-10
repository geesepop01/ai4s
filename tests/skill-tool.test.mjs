import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createSkillTool } from '../lib/tools/skill.js'

function tree() {
  const dir = mkdtempSync(join(tmpdir(), 'ai4s-skill-'))
  for (const [name, description, body] of [
    ['scanpy', 'single-cell analysis with scanpy', '# Scanpy\nUse scanpy.'],
    ['pydeseq2', 'differential expression analysis', '# PyDESeq2'],
    ['vllm', 'serve an LLM with vllm', '# vLLM'],
  ]) {
    mkdirSync(join(dir, name))
    writeFileSync(join(dir, name, 'SKILL.md'), `---\nname: ${name}\ndescription: ${description}\n---\n${body}\n`)
  }
  return dir
}

test('a known skill returns its body and description', async () => {
  const tool = createSkillTool({ dir: tree(), logger: { warn() {} } })
  const out = await tool.execute({ name: 'scanpy' }, {})
  assert.match(out.text, /# Scanpy/)
  assert.match(out.text, /single-cell analysis with scanpy/)
})

test('an unknown name lists fuzzy candidates instead of failing', async () => {
  const tool = createSkillTool({ dir: tree(), logger: { warn() {} } })
  const out = await tool.execute({ name: 'deseq' }, {})
  assert.match(out.text, /pydeseq2/)
})

test('a topic search filters by name and description', async () => {
  const tool = createSkillTool({ dir: tree(), logger: { warn() {} } })
  const out = await tool.execute({ topic: 'single-cell' }, {})
  assert.match(out.text, /scanpy/)
  assert.doesNotMatch(out.text, /pydeseq2/)
})

test('path traversal is refused without touching the disk', async () => {
  const tool = createSkillTool({ dir: tree(), logger: { warn() {} } })
  const out = await tool.execute({ name: '../../etc/passwd' }, {})
  assert.match(out.text, /未找到|不合法|invalid/i)
})
