# OpenScience for DeepSeek Harness (`@geesepop01/ai4s`)

English | [中文](./README.zh-CN.md)

A research plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Install it once and **every session** — including the built-in modes that never select an agent preset — gets 370 research skills, an always-on research loop, six literature tools, and a research workbench panel.

Vendored from [synthetic-sciences/OpenScience](https://github.com/synthetic-sciences/OpenScience) (tag `v1.3.4`, commit `6de022d`, Apache-2.0). See [NOTICE](./NOTICE) and [`upstream/PIN.json`](./upstream/PIN.json) for provenance.

## Install

```sh
# npm
dsh plugin --profile <profile> add @geesepop01/ai4s

# or from the local checkout
plugin_manager install_bundle target "D:/path/to/ai4s"
```

In DSH Desktop: **Settings → Plugins → Install**, then search `ai4s`. Restart or let the profile hot-reload.

After install, open **Settings → Plugins → ai4s** to set a contact email (used for Crossref/OpenAlex politeness and open-access lookups) and an optional NCBI API key.

## What you get

| | |
|---|---|
| **370 skills** | Biology, chemistry, physics, ML, compute and writing. About 60 carry a full description in the model catalog; the rest load on demand by name through `science_skill`, so the per-request catalog stays around 3.6k tokens instead of 30k. |
| **Always-on research loop** | A ~2.5KB system-prompt section with the eight-stage loop (SCOPE → LITERATURE → REASON → METHODOLOGY → COMPUTE → ANALYZE → SYNTHESIZE → WRITE), a task→skill routing table, and citation discipline. It is present in every mode, not only in a preset. |
| **`science_search`** | One query across OpenAlex, PubMed, arXiv and Crossref; normalized entries with DOI/PMID/arXiv identifiers, year filtering, per-source notes. |
| **`science_paper`** | Resolve a DOI, PMID, arXiv id or OpenAlex id into verified metadata plus an open-access verdict and PDF link (Unpaywall, when an email is configured). |
| **`science_related`** | Walk one paper's references, citations or related works. |
| **`science_cite`** | Write BibTeX, RIS or CSL-JSON into the working directory, path-guarded to the session cwd. |
| **`science_state`** | Revision-guarded research state (`.openscience/state.json`) shared with the panel. |
| **`science_skill`** | Load any of the 370 skills by name or topic — including the 300+ that the catalog hides. |
| **Workbench panel** | A sidebar entry opens a floating panel with the research state, the literature list and a searchable skill catalog. |

## How it differs from a research preset

A preset is an agent-plane composition: only sessions that select it get its tools and skills. This plugin registers at the host layer through public services (`ctx.skills`, `ctx.systemPrompt`, `ctx.tools`, `ctx.webServer`), so the capability is not tied to a mode.

If you also keep a research preset installed, the two coexist: the skill registry merges layers, and the nearest layer wins a duplicate name outright — a preset session uses the preset's copy, a plain session uses this plugin's. Nothing is duplicated in the catalog.

## Configuration

| Key | Default | Meaning |
|---|---|---|
| `mailto` | `""` | Contact address for Crossref/OpenAlex politeness and Unpaywall. Empty skips the open-access lookup and says so. |
| `pubmedApiKey` | — | Stored in the host credential store (`openscience.pubmed`), never in config or logs. Raises the PubMed rate limit. |
| `sources` | all four | Which sources `science_search` queries by default. |
| `catalogMode` | `curated` | `curated` = ~60 visible descriptions; `all` = every skill model-invocable (costs ~30k tokens per request). |
| `bootstrap` | `true` | Include the always-on research-loop section. |
| `stateDir` | `.openscience` | Research state directory, relative to each session's working directory. |

## Behaviour worth knowing

- Outbound calls use the host's web provider, which accepts a URL only — no headers, no POST. Politeness therefore rides in query parameters, and a provider that is missing or rate-limited produces a readable sentence, never a crash.
- Tools never throw on upstream failure: the model gets "rate-limited / not-found / upstream-error / not configured" and can decide what to do next.
- The panel follows the **last research workspace the agent touched**; a per-session picker is planned.

## Development

```sh
node --test-isolation=none --test tests/*.test.mjs   # 64 tests
node scripts/verify.mjs                              # release checks
node scripts/sync-skills.mjs --source <openscience>/skills   # re-vendor
```

No build step, no runtime dependencies. `@deepseek-ai/dsh-tools` and `@deepseek-ai/dsh-skill-filesystem` are optional peers, imported lazily.

## License

Plugin code: Apache-2.0. Vendored skills: Apache-2.0, © Synthetic Sciences — see [NOTICE](./NOTICE).
