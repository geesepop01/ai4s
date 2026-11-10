---
name: ml-benchmark-evaluation
description: Evaluate models on scientific and ML benchmarks with proper protocol, budget accounting, and honest reporting. Use for running benchmarks, comparing to baselines, or writing up a benchmark result.
category: ml
tags: [benchmark, evaluation, leaderboard, protocol, harness]
disable-model-invocation: true
---

# Benchmark Evaluation

A benchmark number is only meaningful with its protocol. The same model scores
differently under different prompts, budgets, tools, and retry policies. This
skill is the protocol discipline.

## The benchmark record

```markdown
# Benchmark: <name and version>

Task set: <exact IDs, and how they were selected>
Source: <dataset repo, revision/commit, image digest>
Native contract: <runner, limits, verifier/judge, scoring>
Agent configuration:
  model: <exact snapshot>
  reasoning/effort: <setting>
  tools: <list, and any access restrictions>
  permissions: <what the agent could do>
  retries: <none | N, and whether the best or last attempt counts>
Repeats: <attempts per task>
Budget: <wall clock, calls, spend>
Credentials: <by purpose; judge credentials separate from agent>
```

Freeze this **before** the run. A benchmark compared across different protocols
is not a comparison.

## Protocol rules

1. **Use the native runner and the native verifier.** Do not reimplement grading;
   a reimplementation measures your grader, not the task.
2. **The judge/verifier credentials are never visible to the agent.** A judge
   prompt in the agent's context is contamination.
3. **Do not tune on the test split.** Development tasks are labelled as such and
   kept disjoint from the reported set.
4. **Repeats are declared.** Whether the number is mean-of-3, best-of-3, or
   first-attempt is part of the result.
5. **Effort settings are part of the identity.** "Score 82" is meaningless
   without the reasoning setting and the tool access.
6. **No silent retries.** A retry rule declared before the run; failures are
   preserved.

## Cost and time accounting

Report, separately:

- Model tokens/calls and their cost (catalog estimate vs measured charge).
- Tool and compute cost.
- Judge cost.
- Wall clock: setup, queue, agent execution, tool wait, judging, teardown.
- Cold vs warm runs where cache state matters.

Missing usage is **unknown**, not zero. Report it as unknown.

## Interpreting results

- **Compare like with like.** A matched-model harness comparison answers "which
  harness is better"; a complete-product comparison answers "which product is
  better." Do not mix these in one table without labelling.
- **Report uncertainty.** Repeat variance across attempts; bootstrap over tasks
  for an interval on the mean. A 2-point difference on 14 tasks is noise.
- **Do not average unlike metrics.** A 0–100 rubric judge and a binary verifier
  are different scales; a synthetic composite is a fiction.
- **Historical leaderboard rows stay labelled historical** unless task, grader,
  environment, and run settings match.

## What to preserve

Every scheduled attempt retains: native result files, raw trajectory, errors,
artifacts, and the frozen identity record. Reconcile model calls, retries, child
agents, judge calls, and external charges. Report agent overhead and evaluation
overhead separately from the total.

## Before writing the result

- [ ] The protocol record is complete and frozen.
- [ ] Every number in the table traces to a run artifact.
- [ ] Deviations from the native contract are stated.
- [ ] Uncertainty is reported.
- [ ] Cost and time are reported with their scope.
- [ ] The result does not claim generality it did not test.
