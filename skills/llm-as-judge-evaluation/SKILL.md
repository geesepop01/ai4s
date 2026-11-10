---
name: llm-as-judge-evaluation
description: Evaluate outputs using LLM judges with calibrated rubrics, inter-rater agreement, and bias controls. Use when scoring free-text, open-ended, or qualitative outputs at scale.
category: ml
tags: [llm, judge, evaluation, rubric, scoring, alignment]
disable-model-invocation: true
---

# LLM-as-Judge Evaluation

An LLM judge is a measurement instrument. Like any instrument, it needs a
calibrated scale, a known error rate, and a procedure that does not drift.

## When a judge is appropriate

- The output is free-text, open-ended, or qualitative (summaries, explanations,
  generated code judged on correctness+clarity, scientific writing).
- Human scoring is the gold standard but cannot scale.
- The criterion is "does this satisfy a rubric" rather than "is this exactly X."

**Not appropriate** where an executable check exists. If the answer is a number,
a file, or a label with a defined ground truth, check it mechanically. Do not
ask a model to judge what a script can verify.

## Building the rubric

A rubric is a set of **independent, observable criteria**, each with an anchored
scale:

```markdown
## Criterion 2: Factual accuracy
Does every claim in the output match the provided source material?

5 — All claims supported by the source; no unsupported additions.
4 — All claims supported; minor imprecision in wording.
3 — Mostly supported; one unsupported or slightly contradicted claim.
2 — Several unsupported claims or a material misreading.
1 — Fabricated or materially false content.

Anchor examples:
- Score 5 example: "<short excerpt>"
- Score 2 example: "<short excerpt showing an unsupported claim>"
```

**Rules:** one criterion per score; the scale describes the output, not the
judge's feeling; anchor examples make the scale reproducible.

## The scoring protocol

1. **Blind the judge** to the condition, the model identity, and the hypothesis.
   Position bias and self-preference are real and large.
2. **Randomize order** of candidates in pairwise comparisons; report both orders
   when comparing two systems.
3. **Independent judgments** across criteria. Do not ask for an overall score and
   derive criteria from it; do the reverse.
4. **Repeat or ensemble** where the cost is acceptable: k judges or k samples,
   report the distribution.
5. **Fixed decoding** for the judge: temperature 0 where supported, fixed prompt,
   fixed model snapshot. A judge that is re-sampled is a different instrument.

## Calibration and agreement

- **Human agreement is the ceiling.** Score a sample with human raters first;
   report inter-rater agreement (Cohen's κ, Krippendorff's α). If humans do not
  agree, the rubric is underspecified — fix it before scaling.
- **Judge-vs-human agreement** is the judge's validity: report it on a held-out
  sample. A judge with κ = 0.45 is not measuring what you think.
- **Drift check** periodically: re-score a fixed anchor set across time or across
  judge versions.

## Known biases to control

| Bias | Control |
|---|---|
| Position bias (A preferred over B by slot) | Randomize order; run both orders |
| Verbosity bias (longer = better) | Rubric penalizes unsupported content; length matched or controlled |
| Self-preference (model likes its own outputs) | Judge model ≠ generator model where possible; blind identity |
| Style over substance | Separate "correctness" and "style" criteria; weight explicitly |
| Anchoring (first example dominates) | Multiple anchors per score level; randomize anchor order |

## Reporting

Report: the rubric (or its path), the judge model and version, the decoding
settings, the blinding procedure, the agreement statistics, the sample size, and
the score distribution — not just a mean. Cite the judge's validity figure
whenever you report a judge-derived number as evidence.

## Before trusting a judge result

- [ ] No executable check was available (otherwise use it instead).
- [ ] Rubric has anchored scales and was calibrated against human ratings.
- [ ] Judge is blind to condition and identity; order randomized.
- [ ] Inter-rater and judge-human agreement reported.
- [ ] Score distribution and N reported, not only a mean.
