---
name: autoresearch
description: Run a hill-climbing study over many training or analysis runs with one metric and direction, a baseline, ranked ideas, kill criteria, a budget, and verdicts per run. Use when optimizing a model or analysis across a space of candidate changes.
category: core
tags: [experiments, optimization, ablation, study, budget]
disable-model-invocation: true
---

# Autoresearch

Autoresearch is a disciplined loop over many candidate runs. The discipline is
what makes the result a finding instead of a lucky run.

## The study record

Write `study.md` before the first run:

```markdown
# Study: <what is being optimized>

Metric: <name>   Direction: <maximize|minimize>   Measured on: <split / protocol>
Baseline: <the current best, with its measured value and the run id>
Budget: <max runs | max wall clock | max spend>
Kill criteria: <conditions that stop the whole study>
Repeats: <seeds per config, e.g. 3>

## Ideas ranked by expected value
1. <change> — expected effect: <reason> — cost: <runs/time>
2. ...
```

## The loop

For each idea, **in ranked order**:

1. **State the hypothesis** the change tests, in one sentence.
2. **Change exactly one thing.** A change that bundles three is not attributable.
3. **Run it** with the same metric, same protocol, same seeds as the baseline.
4. **Record the verdict** against the baseline, with the per-seed distribution.
5. **Update the ranking.** Keep the best artifact on disk; never let a later run
   replace a better one with a worse one.
6. **Check the budget and the kill criteria** before starting the next idea.

## Rules

- **One run per idea** is the default; a repeat run is only justified when the
  run-to-run variance is comparable to the improvement you are chasing.
- **The metric and direction are fixed before the study.** Changing the metric
  mid-study is a new study.
- **A worse result is a result.** Negative findings stay in the record with their
  analysis; deleting them biases the study.
- **Keep the winner on disk** while you try to beat it. A cleanup or a
  simplification that lowers the score is a rejected experiment, not a delivery.
- **Do not tune against the test set.** The test set is touched once, at the end,
  on the frozen winner.
- **Attribute honestly.** If several changes were tuned together, report the
  recipe as a whole and do not claim a per-change causal effect.

## Verdict vocabulary

| Verdict | Meaning |
|---|---|
| **IMPROVED** | Beats baseline beyond the noise band, across seeds |
| **NEUTRAL** | Within noise; keep the simpler option |
| **DEGRADED** | Worse than baseline; record why |
| **INCONCLUSIVE** | Noise too large to judge; repeat or widen the budget |
| **KILLED** | Triggered a kill criterion; stop the study and report |

## Ending the study

End when the budget is exhausted, the ideas are spent, or a kill criterion fires.
Report the frozen winner, its measured value on the untouched test set, the
per-seed distribution, the full run table with every idea and its verdict, and
the total cost in runs, wall clock, and spend.
