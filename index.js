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

/** Cordis plugin name. */
export const name = 'openscience'

/** Host services this plugin registers against; all optional at mount time. */
export const inject = []

/**
 * Mount the plugin.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {object} config raw row config (see cordis.patch.yml)
 */
export function apply(ctx, config = {}) {
  // Filled in by Task 3 (skills), Task 4 (bootstrap), Task 13 (tools),
  // Task 14 (routes).
  void ctx
  void config
}
