// OpenScience for the DeepSeek Harness — host half.
//
// Contributes, at the HOST layer so every session (preset or not) gets them:
//   skills      the vendored `skills/` tree through dsh's own skill-filesystem
//   systemPrompt the always-on research-loop section
//   tools       science_search / science_paper / science_related /
//               science_cite / science_state / science_skill
//   webServer   /ai4s/state and /ai4s/catalog, consumed by the client panel
//
// Everything is registered through public Services, imported lazily, and
// degrades with a diagnostic instead of a bare module-resolution crash.

import { normalizeConfig, readPubmedKey } from './lib/config.js'

// Re-exported for tests and for host code that wants the resolved config.
export { normalizeConfig } from './lib/config.js'
import { createHttpClient, RateLimiter } from './lib/http.js'
import { skillsRoot } from './lib/paths.js'
import { registerSkills } from './lib/skills.js'
import { BOOTSTRAP_ORDER, BOOTSTRAP_SECTION, bootstrapText } from './lib/bootstrap.js'
import { createSearchTool } from './lib/tools/search.js'
import { createPaperTool } from './lib/tools/paper.js'
import { createRelatedTool } from './lib/tools/related.js'
import { createCiteTool } from './lib/tools/cite.js'
import { createStateTool } from './lib/tools/state.js'
import { createSkillTool } from './lib/tools/skill.js'

/** Cordis plugin name. */
export const name = 'openscience'

/**
 * Mount the plugin.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {object} config raw row config (see cordis.patch.yml)
 */
export function apply(ctx, config = {}) {
  const logger = ctx.logger ?? console
  const settings = normalizeConfig(config)
  const web = ctx.get?.('web')
  const client = web === undefined
    ? unavailableClient()
    : createHttpClient({ web, timeoutMs: settings.requestTimeoutMs })
  const limiter = new RateLimiter(340)

  ctx.effect?.(() => registerSkills(ctx, { dir: skillsRoot, mode: settings.catalogMode, logger }))

  if (settings.bootstrap && typeof ctx.systemPrompt?.section === 'function') {
    ctx.systemPrompt.section({
      name: BOOTSTRAP_SECTION,
      order: BOOTSTRAP_ORDER,
      text: bootstrapText(settings),
    })
  }

  if (typeof ctx.tools?.register !== 'function') {
    logger.warn?.('openscience: tool registry unavailable, only skills and guidance are active')
    return
  }

  const tools = [
    createSearchTool({ client, config: settings, logger, limiter, getPubmedKey: () => readPubmedKey(ctx) }),
    createPaperTool({ client, config: settings }),
    createRelatedTool({ client, config: settings }),
    createCiteTool({ client, config: settings, logger }),
    createStateTool({ config: settings, logger }),
    createSkillTool({ dir: skillsRoot, logger }),
  ]
  for (const tool of tools) {
    const dispose = ctx.tools.register(tool)
    if (typeof dispose === 'function') ctx.effect?.(() => dispose)
  }
}

/** Client used when the host has no web provider: every call answers readably. */
function unavailableClient() {
  return {
    async getJson(url) {
      return {
        ok: false,
        status: 0,
        reason: 'network',
        message: `宿主没有可用的联网取数通道（web provider），无法访问 ${url}。到设置 → 插件里配置搜索/抓取来源后重试。`,
      }
    },
  }
}
