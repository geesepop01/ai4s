// The always-on research guidance section.
//
// This is the only prompt surface the plugin owns, so it carries the loop, the
// task → skill routing table, and the citation discipline. Detail lives in the
// skills; this text stays short enough to belong in every request.

/** Prompt-section name; unique per scope. */
export const BOOTSTRAP_SECTION = 'openscience:bootstrap'

/**
 * Section order. dsh places harness identity at -1000, persona at 0, plan/team
 * policy at 500/600 and per-tool guidance at 1000+, so 121 lands right after
 * the persona and before every policy block.
 */
export const BOOTSTRAP_ORDER = 121

const ROUTES = [
  ['literature review', 'literature-review'],
  ['find papers', 'literature-search'],
  ['look up a paper', 'paper-lookup'],
  ['map a field', 'research-lookup'],
  ['manage references', 'citation-management'],
  ['form a hypothesis', 'hypothesis-generation'],
  ['design an experiment', 'experimental-design'],
  ['ensure reproducibility', 'experimental-reproducibility'],
  ['choose a test', 'statistical-analysis'],
  ['report statistics', 'statistical-conventions'],
  ['size a study', 'statistical-power'],
  ['publication figures', 'figures-manuscripts'],
  ['write a paper', 'scientific-writing'],
  ['polish prose', 'academic-writing'],
  ['review a manuscript', 'peer-review'],
  ['critique a result', 'research-critique'],
  ['evaluate a paper', 'scholar-evaluation'],
  ['write a grant', 'research-grants'],
  ['brainstorm directions', 'scientific-brainstorming'],
  ['stress-test an argument', 'scientific-critical-thinking'],
  ['clean a dataframe', 'pandas'],
  ['statistical models', 'statsmodels'],
  ['machine learning', 'scikit-learn'],
  ['single-cell analysis', 'scanpy'],
  ['differential expression', 'pydeseq2'],
  ['genomic reads', 'pysam'],
  ['protein sequences', 'biopython'],
  ['protein structures', 'pdb-database'],
  ['molecule properties', 'rdkit'],
  ['quantum circuits', 'qiskit'],
  ['train a model', 'pytorch'],
]

const STAGES = [
  ['SCOPE', 'research-scope.md'],
  ['LITERATURE', 'literature-review.md'],
  ['REASON', 'reasoning.md'],
  ['METHODOLOGY', 'methodology.md'],
  ['COMPUTE', 'saved scripts'],
  ['ANALYZE', 'figures + tables'],
  ['SYNTHESIZE', 'synthesis.md'],
  ['WRITE', 'the deliverable'],
]

/** Build the section text for the configured catalog mode. */
export function bootstrapText({ catalogMode = 'curated' } = {}) {
  const lines = [
    '## Research loop',
    'Each stage writes its artefact; a claim you cannot point at is not one.',
    ...STAGES.map(([stage, artefact]) => `- ${stage}: ${artefact}`),
    'Record progress with `science_state`; skip a stage only if the user asks, and say so.',
    '',
    '## Route',
    'Load the matching skill with the `skill` tool first:',
    ...ROUTES.map(([task, skill]) => `- ${task} -> skill: ${skill}`),
    '',
  ]
  if (catalogMode !== 'all') {
    lines.push(
      'Other research skills (300+, biology through writing): call `science_skill`',
      'with a name or topic to read one, then follow it.',
      '',
    )
  }
  lines.push(
    '## Tools',
    '- `science_search` retrieves records; never cite what you did not retrieve.',
    '- `science_paper` resolves DOI/PMID/arXiv and reports open access.',
    '- `science_related` walks references, citations, related work.',
    '- `science_cite` writes BibTeX/RIS/CSL-JSON into the working directory.',
    '- `science_state` reads/writes research state; pass `expectedRevision`.',
    '',
    '## Rules',
    'Report failures as failures; never invent a DOI, PMID, author or year;',
    'name the source behind every number.',
    '',
    '中文触发词：文献综述 / 假设 / 实验设计 / 统计分析 / 画图 / 写论文 / 复现',
  )
  return `${lines.join('\n')}\n`
}
