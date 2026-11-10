// Shared tool definition helper.
//
// The plugin avoids a hard import of `@deepseek-ai/dsh-tools` so it can load on
// a host where that package is not resolvable from the profile. A tool the
// registry accepts is a plain object: name, description, JSON-schema
// parameters, an output contract with a renderer, and an execute function that
// returns the value the renderer projects.

/**
 * @param {object} spec
 * @param {string} spec.name
 * @param {string} spec.description
 * @param {Record<string, { type: string, description: string, required?: boolean, items?: object, enum?: string[] }>} spec.parameters
 * @param {(args: any, exec: any) => Promise<string>} spec.run returns model-facing text
 */
export function textTool({ name, description, parameters, run }) {
  return {
    name,
    description,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(parameters).map(([key, spec]) => [
          key,
          {
            type: spec.type,
            description: spec.description,
            ...(spec.items === undefined ? {} : { items: spec.items }),
            ...(spec.enum === undefined ? {} : { enum: spec.enum }),
          },
        ]),
      ),
      required: Object.entries(parameters)
        .filter(([, spec]) => spec.required === true)
        .map(([key]) => key),
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { text: { type: 'string' } },
        required: ['text'],
      },
      // `render` projects the validated value into ContentBlocks.
      render: (_args, value) => [{ type: 'text', text: value?.text ?? '' }],
    },
    async execute(args, exec) {
      const text = await run(args ?? {}, exec)
      return { text }
    },
  }
}

/** Render entries as compact lines the model can read and quote. */
export function renderEntries(entries, { empty = '没有检索到符合条件的记录。' } = {}) {
  if (entries.length === 0) return empty
  return entries
    .map((entry, index) => {
      const bits = [
        `${index + 1}. ${entry.title}`,
        entry.authors?.length ? `   authors: ${entry.authors.slice(0, 6).join('; ')}${entry.authors.length > 6 ? ' et al.' : ''}` : undefined,
        entry.year === undefined ? undefined : `   year: ${entry.year}`,
        entry.venue === undefined ? undefined : `   venue: ${entry.venue}`,
        entry.doi === undefined ? undefined : `   doi: ${entry.doi}`,
        entry.pmid === undefined ? undefined : `   pmid: ${entry.pmid}`,
        entry.arxivId === undefined ? undefined : `   arxiv: ${entry.arxivId}`,
        entry.url === undefined ? undefined : `   url: ${entry.url}`,
      ].filter(Boolean)
      return bits.join('\n')
    })
    .join('\n')
}
