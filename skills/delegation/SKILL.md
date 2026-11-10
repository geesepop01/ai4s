---
name: delegation
description: Delegate independent work to worker agents with self-contained briefs, choosing the right specialist and setting scope, budget, and return format. Use when a task splits into independent pieces that can run in parallel.
category: core
tags: [delegation, subagents, parallel, orchestration, briefs]
disable-model-invocation: true
---

# Delegation

Delegation is worth it when the pieces are genuinely independent and the
brief can stand alone. It is not worth it when the work needs your accumulated
context or when coordination costs exceed the parallel gain.

## When to delegate

- **Independent facets of one question** — three database searches, three
  candidate methods, three datasets to profile.
- **Bounded specialist work** — a genomics sub-analysis, a figure pipeline, a
  literature facet.
- **Adversarial review** — a critique pass that must not see your reasoning.
- **Exploration before commitment** — a scout on an unfamiliar codebase or
  dataset before you plan around it.

Do **not** delegate work that requires the full conversation, sequential
decisions, or a single consistent artifact across steps.

## The brief must be self-contained

A worker cannot see your conversation. The brief carries:

1. **The question** in one sentence, with the specific deliverable.
2. **The inputs** — exact file paths, table names, or URLs, and what is in them.
3. **The scope boundary** — what to do and explicitly what not to do.
4. **The constraints** — budget, time, tools, libraries, statistical rules.
5. **The return format** — the exact structure of the answer you will merge.

```
subagent(
  description: "Profile the EEG subset",
  prompt: "You are profiling one subset of a multi-modal dataset.

  Input: E:/科研数据集/NEW/hbn-eeg/ (EEG BIDS-like tree, ~3080 files)

  Do:
  - count subjects, sessions, runs; report channel counts and sampling rates
  - identify event/annotation file formats
  - flag files that fail to load, with paths

  Do not:
  - modify any file
  - run any analysis beyond loading metadata

  Return: a markdown table (subject, sessions, runs, channels, sfreq, load_status)
  plus a bullet list of anomalies with exact paths. Budget: <30 minutes."
)
```

## Choosing the worker

| Kind of work | Worker |
|---|---|
| Broad unknown territory | explorer / scout |
| Machine learning, training, evaluation | ml specialist |
| Sequencing, cells, pathways | biology specialist |
| Chemistry, molecules, reactions | chemistry specialist |
| Numerics, simulation, PDEs | physics specialist |
| Data plumbing, formats, joins | data specialist |
| Adversarial review of an artifact | critique worker (artifact files only) |

## Merging what comes back

- **Filter before you merge.** A worker that did not find anything did not fail;
  report it as "searched, nothing found."
- **Cross-check overlapping claims.** Two workers that agree from the same source
  are one source, not two.
- **Keep the trace.** Name which worker produced which part of the synthesis.
- **Re-delegate once on a real failure, not on a preference.** A worker that
  misunderstood the brief gets a clearer brief; a worker that hit a wall gets a
  different scope.

## Critique delegation is special

The critique worker gets artifact files only, never your reasoning. Your chain
of thought about why a result is correct anchors a reviewer into accepting flawed
logic. The brief names the checklist to apply and the verdict vocabulary to use.
