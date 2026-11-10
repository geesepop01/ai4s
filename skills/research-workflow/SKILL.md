---
name: research-workflow
description: Structured scientific research workflow guide. Use when conducting any research task — from literature review to final write-up. Covers the full loop from scope and literature through methodology, compute, analysis, synthesis, and writing.
category: research
tags: [research, workflow, methodology, literature-review, hypothesis, gates]
---

# Research Workflow

## Overview

The eight-stage research loop, with the artifact each stage must produce and the
two blocking critique gates. Skipping a stage is allowed only when the user
explicitly asks; note the gap when you do.

## Stage map

| Stage | Produce | Gate |
|---|---|---|
| 1 SCOPE | `research-scope.md` | — |
| 2 LITERATURE | `literature-review.md` | — |
| 3 REASON | `reasoning.md` | — |
| 4 METHODOLOGY | `methodology.md` | **Gate 1 → COMPUTE** |
| 5 COMPUTE | `_script_manifest.jsonl`, raw outputs | **Gate 2 → ANALYZE** |
| 6 ANALYZE | `figures/`, result tables | — |
| 7 SYNTHESIZE | `synthesis.md` | optional critique |
| 8 WRITE | final document | — |

Also maintain `research-state.md` for the whole run.

## Stage 1 — SCOPE

Define the question, the hypothesis, and what a good answer looks like.

```markdown
# Research Scope: <topic>
## Research Question
<precise, testable>
## Hypothesis
<what you expect and why>
## Success Criteria
<what would confirm; what would refute>
## Domain Tags
<biology, chemistry, physics, ml, clinical, ...>
## Required Skills
<which skills later stages will load>
```

## Stage 2 — LITERATURE

Expected, not optional. Load the **`literature-search`** skill and follow it.

Decompose into 3–5 facets, search OpenAlex plus a domain index per facet, verify
every citation by fetching its record, and write `literature-review.md`.

Do not proceed to Stage 3 until `literature-review.md` exists.

## Stage 3 — REASON

Deliberate before designing. This is the bridge between reading and planning, and
it is where a weak direction gets caught cheaply.

```markdown
# Research Deliberation: <topic>

## Knowledge Consolidation
<what is established, contested, unknown>

## Knowledge Gaps and Contradictions
- Gap:
- Contradiction: <Paper A claims X, Paper B claims Y>

## Candidate Hypotheses
### Hypothesis 1: <statement>
- Null hypothesis:
- Required evidence:
- Feasibility: <high/medium/low, why>
- Novelty:
- If confirmed, significance:
- If refuted, what we learn:

## Structured Deliberation
| Hypothesis | Strengths | Weaknesses | Key Uncertainty | Information Gain |

## Selected Direction
- Chosen hypothesis and rationale (citing specific papers)
- Key risks
- Pre-specified success criteria  <-- fix these NOW, before any data
- Fallback plan
```

Pre-specified success criteria are the point of this stage. Criteria written after
seeing results are not criteria.

Do not proceed to Stage 4 until `reasoning.md` exists.

## Stage 4 — METHODOLOGY

Load domain skills and design against the literature you actually read.

```markdown
# Methodology: <question>

## Research Question and Hypothesis
## Data Sources
<source, access method, expected size, provenance>

## Analysis Pipeline
### Step 1: <name>
- Method (with citation), tools, input, output, expected runtime

## Controls and Validation
- Positive control, negative control
- Validation strategy and the pre-specified metric and threshold

## Statistical Plan
- Primary test, correction method, alpha, effect size measure

## Compute Requirements
- Platform, estimated cost and wall-clock

## Limitations and Assumptions
```

**Then run Gate 1** (see below) before executing anything.

## Stage 5 — COMPUTE

Execute the pipeline. Follow the methodology; do not improvise a different analysis.

- Write small cells (10–30 lines) that print their results.
- Load **`reproducibility`** and set seeds, then log every run to
  `_script_manifest.jsonl`.
- Load **`cloud-compute`** before any paid job and get approval first.
- Save raw outputs to disk unmodified.
- **Report raw outputs exactly as produced.** Never apply post-hoc calibration,
  scaling, or adjustment to make a result agree with the literature. Disagreement
  is a finding, not a defect.

**Then run Gate 2** before analysing or reporting anything.

## Stage 6 — ANALYZE

Load **`statistical-analysis`** and **`scientific-visualization`**.

- Choose tests by data type and assumptions, not by habit.
- Correct for multiple comparisons; report the correction used.
- Report effect sizes and confidence intervals, not only p-values.
- Visualisation gate — before leaving this stage there must be at least one figure
  generated from real data, saved with a descriptive filename, with a caption.

If no figure exists, do not proceed to Stage 7.

## Stage 7 — SYNTHESIZE

Interpret in the context of the literature you read.

- Cross-reference against `literature-review.md`.
- Evaluate against the success criteria fixed in Stage 3.
- State limitations, confounders, and alternative explanations.
- Report what did **not** work. Negative results are results.
- Consider an optional critique pass here.

Write `synthesis.md`.

## Stage 8 — WRITE

Load **`academic-writing`**. Produce the document the user asked for —
paper, report, or review. Include methods, results with effect sizes, figures with
captions, limitations, and a complete verified reference list.

## The two blocking gates

Load the **`research-critique`** skill for the full checklists.

### Gate 1 — after `methodology.md`, before any compute

Delegate a critique `subagent` with the methodology and literature files only —
**not** your reasoning. Apply Checklist A (data integrity plan), C (statistical
plan), D (methodological soundness).

- BLOCKING → fix, rewrite `methodology.md`, re-run. Max 2 cycles, then escalate.
- PASS → proceed to COMPUTE.

### Gate 2 — after COMPUTE, before ANALYZE or reporting

Delegate a critique `subagent` to apply Checklist G (output integrity) and
Checklist E (logical consistency). Every reported number must trace to a script
output.

- BLOCKING → code bug means fix and re-run; methodology flaw means back to Stage 4.
- PASS → proceed.

## Skill routing

| Task | Load |
|---|---|
| Any research task | `research-workflow` |
| Literature, citations | `literature-search` |
| Real database queries | `scientific-databases` |
| Inspecting a dataset | `data-exploration` |
| Statistics | `statistical-analysis` |
| Figures | `scientific-visualization` |
| Before/after compute | `research-critique` |
| Seeds, manifests, provenance | `reproducibility` |
| Paid GPU jobs | `cloud-compute` |
| Sequences, phylogenetics | `biopython` |
| Single-cell | `single-cell-analysis` |
| Pathways, enrichment | `pathway-analysis` |
| Molecules, drug-likeness | `cheminformatics` |
| Model training | `ml-training` |
| Model evaluation | `ml-evaluation` |
| Numerical physics | `physics-computing` |
| Clinical, trials, regulatory | `clinical-research` |
| Papers, LaTeX, BibTeX | `academic-writing` |

Chain several when a task spans domains.

**Skill directories are read-only.** Never modify files inside a skill directory.
Write all outputs to the user's working directory, and execute skill scripts in
place rather than copying them.

## Sub-agent output filtering

When merging parallel sub-agent returns, assess each before use:

- **Relevance** — does it address the assigned facet?
- **Evidence quality** — are the citations real and verified?
- **Contradictions** — flag disagreement; never silently resolve it.

Decision rule — high relevance + high evidence goes in at full weight; high
relevance + weak evidence goes in with caveats; low relevance is excluded and
noted under discarded facets; contradictions keep both sides.

## Hypothesis iteration loop

Triggered when post-COMPUTE results miss the pre-specified success criteria, or
Gate 2 returns BLOCKING, or the results are too poor to analyse.

Protocol, **maximum 2 iterations**:

1. Read the "what didn't work" section of `research-state.md`.
2. Diagnose the cause — code bug (fix and re-run, does not count as an iteration),
   flawed methodology (revise and re-gate), or wrong hypothesis (update
   `reasoning.md` and flag for user review).
3. Apply a fix that **changes something different** each iteration.
4. Re-run COMPUTE, re-run Gate 2, update `research-state.md`.
5. If improved, exit. If not and iterations remain, iterate.
6. After the limit, stop and present options — continue with the best result,
   pivot to the fallback hypothesis, or abandon with an explanation.

## Budget-bounded autonomous mode

Active **only** when the user gives an upfront budget and asks for autonomous
operation (e.g. "run this autonomously, budget $50, max 4 hours").

Changes in this mode:

1. Cost approval is pre-authorised **up to the stated budget**; individual
   operations inside it need no further approval.
2. Stage transitions are automatic.
3. **The two critique gates remain mandatory.**
4. Track spend in `research-state.md` and stop at the ceiling.
5. Terminate on success criteria met, budget reached, time reached, or iteration
   limit exhausted — then report partial results honestly.

Normal sessions keep per-step cost approval.

## Research state file

```markdown
# Research State: <topic>

## Current Stage
<SCOPE | LITERATURE | REASON | METHODOLOGY | COMPUTE | ANALYZE | SYNTHESIZE | WRITE>

## Research Question
<one sentence>

## Key Decisions
- <stage>: <decision and why>

## Experiment Log
| Attempt | Method | Result | Status |

## Critique History
- Gate 1 (pre-COMPUTE): PASS/BLOCK — summary
- Gate 2 (post-COMPUTE): PASS/BLOCK — summary

## Budget
- Approved: $ —
- Spent: $ —
- Remaining: $ —

## What Worked
## What Didn't Work
## Open Questions
## Artifacts
- literature-review.md
- reasoning.md
- methodology.md
- figures/
- _script_manifest.jsonl
```

Update it after every stage. It is what lets you recover after context compaction.
