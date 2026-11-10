---
name: research-critique
description: Adversarial review checklists and the mandatory critique gates for research artifacts. Use before expensive compute and before reporting results, to catch data leakage, wrong statistics, unsupported claims, and untraceable numbers.
category: research
tags: [critique, review, validation, quality, methodology, gates]
---

# Research Critique

## Overview

This skill is the checklist set a critique reviewer applies to research artifacts.
It is deliberately **decoupled**: the reviewer sees the artifacts, not the
author's reasoning. Your chain of thought about why a result is correct can anchor
a reviewer into accepting flawed logic, so the reviewer gets files and numbers only.

## The two mandatory gates

Both gates are blocking. Neither is optional, and a PASS is required to continue.

### Gate 1 — Pre-COMPUTE

Fires **after `methodology.md` is written** and **before any code execution or
paid compute**. Apply Checklist A (data integrity plan), Checklist C (statistical
plan), and Checklist D (methodological soundness). Also confirm the pipeline is
grounded in `literature-review.md`.

- **BLOCKING** → fix the methodology, rewrite `methodology.md`, re-run. Maximum 2
  fix-and-recheck cycles, then escalate to the user.
- **PASS** → proceed to COMPUTE.

### Gate 2 — Post-COMPUTE

Fires **after computation completes** and **before ANALYZE or reporting**.
Apply Checklist G (output integrity) and Checklist E (logical consistency).
Every reported number must trace to a script output file.

- **BLOCKING** → investigate. A code bug means fix and re-run. A methodology flaw
  means loop back to Stage 4.
- **PASS** → proceed to ANALYZE.

### Optional critique

Use judgement at other points — after SYNTHESIZE, when findings contradict the
literature, or when results look suspiciously clean. Skip it for simple lookups
and descriptive statistics.

## How to spawn a critique

Delegate with the `subagent` tool, passing **only the task statement and artifact
paths**. Do not include your own reasoning.

```
subagent(
  description: "Critique methodology",
  prompt: "You are a hostile methods reviewer. Read only the files listed below.
  Task: <one-paragraph task statement>. Artifacts: /path/methodology.md,
  /path/literature-review.md. Apply Checklist A, C, and D from the
  research-critique skill. Report each finding as BLOCKING, MINOR, or OK, with
  the exact file and line. Do not propose rewrites; only report. End with a
  single verdict line: VERDICT: PASS or VERDICT: BLOCKING."
)
```

Give the reviewer a narrow checklist. A reviewer asked to "check everything"
returns vague opinions; one asked for Checklist A returns findings.

## Checklist A — Data integrity

- [ ] Train/test split happened **before** any fitting, scaling, or feature selection
- [ ] Preprocessing was fit on training data only (no leakage through a scaler, encoder, or imputer)
- [ ] No duplicate rows straddling the split
- [ ] Temporal data split by time, never randomly
- [ ] Grouped data split by group (patient, subject, batch, site)
- [ ] The target is not derivable from a feature
- [ ] External datasets are genuinely independent, not the same source re-exported
- [ ] Entity matching across datasets uses stable IDs (COSMIC, DepMap ACH-*, Cellosaurus CVCL), never names alone

## Checklist B — Reproducibility

- [ ] All random seeds set and recorded
- [ ] Exact package versions pinned and captured
- [ ] Every script execution logged with its outputs
- [ ] Checkpoints, configs, and eval outputs saved to files
- [ ] A third party could re-run this from the artifacts alone

## Checklist C — Statistical validity

- [ ] The test matches the data (paired vs unpaired, normal vs non-normal)
- [ ] Assumptions were checked, not assumed
- [ ] Multiple testing corrected (BH/FDR or Bonferroni) and the method stated
- [ ] Effect sizes reported alongside p-values
- [ ] Confidence intervals given for headline numbers
- [ ] Sample size is adequate for the claimed effect (power considered)
- [ ] One-tailed tests are justified a priori
- [ ] No p-hacking — all planned analyses reported, not just significant ones
- [ ] Variance across seeds reported, not a single lucky run

## Checklist D — Methodological soundness

- [ ] The method is appropriate for the question
- [ ] The literature supports this approach (citations to `literature-review.md`)
- [ ] A simpler method was considered and rejected for a stated reason
- [ ] Controls exist — positive and negative where applicable
- [ ] Success criteria were pre-specified **before** looking at results
- [ ] Alternative explanations are acknowledged
- [ ] Limitations are stated honestly
- [ ] Compute cost was estimated and approved before spend

## Checklist E — Logical consistency

- [ ] Conclusions follow from the results, not from the hope
- [ ] No circular reasoning (same data selects and evaluates)
- [ ] Correlation is not presented as causation
- [ ] Contradictions with the literature are addressed, not omitted
- [ ] Claims are calibrated — "suggests" for weak evidence, not "proves"
- [ ] Negative results are reported, not hidden
- [ ] No HARKing — exploratory findings are not relabelled as confirmatory

## Checklist F — Evidence quality in literature work

- [ ] Every citation was fetched and verified to exist (never cite from memory)
- [ ] Claims are attributed to the correct paper
- [ ] Preprints are labelled as preprints
- [ ] Contradictory findings are presented on both sides
- [ ] Reviews are not cited where a primary source exists
- [ ] Retracted work is excluded and the retraction noted

## Checklist G — Output integrity

- [ ] Every reported number traces to a script output file
- [ ] No post-hoc calibration, scaling, or adjustment of raw predictions
- [ ] Reported values match the artifacts exactly (no transcription drift)
- [ ] Figures are generated from actual data, not illustrations of expected results
- [ ] Units and precision are stated
- [ ] Failed or partial runs are reported as such, not smoothed over

## Checklist H — Deliverable conformance

Apply when the task specifies paths, formats, columns, units, or scores. Load the
`deliverable-conformance` skill for the full method.

- [ ] Deliverables were written as a checklist before computing
- [ ] Every item verified on the files **as they are at the end**
- [ ] The conditions the result is graded/judged under were named up front
- [ ] Data coverage gaps are stated, not implied away
- [ ] A constraint-and-score task kept the best artifact under the actual check
- [ ] A cleanup or simplification did not silently lower a scored metric
- [ ] Every reported number came from a saved script run end to end

## Checklist I — Surrogate validity

Apply whenever a simulator, teacher model, pseudo-label set, or synthetic oracle
stands in for reality.

- [ ] Surrogate agreement is not reported as error against reality
- [ ] The shipped artifact was selected on real held-out data, not on the surrogate
- [ ] A candidate meeting the bar on real data was not dropped for one winning on
      the surrogate
- [ ] Revisions to a finished answer were judged on the original evidence
- [ ] Where no real data cover the graded conditions, the spread across plausible
      models is the error estimate — compared against the tolerance, not zero
- [ ] Self-built test cases are acknowledged as implementation checks, not
      accuracy evidence

## Verdict vocabulary

| Verdict | Meaning | Action |
|---|---|---|
| `PASS` | No blocking findings | Continue |
| `MINOR_FIXES` | Non-blocking issues | Fix, then note them |
| `BLOCKING` | Invalidates the result | Fix the root cause and re-run the gate |
| `INSUFFICIENT` | Artifacts missing, cannot judge | Produce the missing artifacts, re-invoke |

When cycles are exhausted, report the best result **with an honest statement of
what remains unverified**. Never fabricate a pass.
