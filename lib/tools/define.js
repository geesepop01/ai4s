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
