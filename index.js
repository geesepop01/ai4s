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

import { skillsRoot } from './lib/paths.js'
import { registerSkills } from './lib/skills.js'
import { BOOTSTRAP_ORDER, BOOTSTRAP_SECTION, bootstrapText } from './lib/bootstrap.js'

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
  const settings = {
    catalogMode: config.catalogMode === 'all' ? 'all' : 'curated',
    bootstrap: config.bootstrap !== false,
  }

  ctx.effect?.(() => registerSkills(ctx, { dir: skillsRoot, mode: settings.catalogMode, logger }))

  if (settings.bootstrap && typeof ctx.systemPrompt?.section === 'function') {
    ctx.systemPrompt.section({
      name: BOOTSTRAP_SECTION,
      order: BOOTSTRAP_ORDER,
      text: bootstrapText(settings),
    })
  }
}
