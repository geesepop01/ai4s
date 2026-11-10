---
name: statistical-power
description: Plan sample size and interpret non-significant results correctly. Use before designing a study, when a result comes back null, or when deciding how many seeds/replicates to run.
category: statistics
tags: [power, sample-size, effect-size, planning, null-results]
---

# Statistical Power

Power is the probability that a study detects an effect of a given size if that
effect is real. It is a design property, and it is what a null result means.

## The four quantities, and what you solve for

| Quantity | Meaning |
|---|---|
| α (alpha) | False-positive rate; usually 0.05, pre-specified |
| 1 − β (power) | True-positive rate; 0.80 conventional, 0.90 for confirmatory |
| Effect size (d, r, OR, Δ) | The smallest effect worth detecting, not the hoped-for one |
| n (per group / total) | What you solve for in planning |

Solving for power given n is the **sensitivity** question: "what effect could
this study detect?" Answer it before interpreting a null.

## Planning the sample size

1. **Specify the smallest effect of interest** (SESOI), from domain knowledge or
   from a pilot — not from the effect you hope to find.
2. **Choose the test** that matches the design (see `statistical-conventions`).
3. **Compute n** with the chosen α, power, and SESOI.
4. **Inflate for attrition, clustering, or multiple comparisons** as the design
   requires. Clustered designs need a design effect: `1 + (m-1)·ICC`.
5. **Record the calculation** in `methodology.md`, with the assumed effect size
   and where it came from.

## Replicates and seeds in computation

The same logic applies to experiments, not only to subjects:

- **Biological/subject replicates** support inference about the population.
- **Technical replicates** support inference about measurement noise only.
- **Random seeds** support inference about training stability. Three seeds is a
  floor, not a guarantee; report the per-seed distribution, not just the mean.
- If the improvement you are chasing is smaller than the seed-to-seed spread,
  the study cannot resolve it. Increase seeds or widen the claim.

## Interpreting a null result

A non-significant result is **not** evidence of no effect unless the study had
power to detect the effect you care about.

- **Report the interval**, not just the p-value. If the 95% CI includes both 0
  and your SESOI, the result is inconclusive, not negative.
- **Equivalence testing** (TOST) supports a claim of "no meaningful difference"
  within a pre-specified margin. Use it when the claim is equivalence.
- **Bayes factors** can quantify evidence for the null relative to an alternative;
  state the prior if you use one.
- A wide CI on a null is an honest "we do not know." A narrow CI around zero is
  evidence of no meaningful effect.

## Common errors

- **Post-hoc power** computed from the observed effect is circular and adds
  nothing. Report the interval instead.
- **Underpowered subgroup analyses.** A subgroup analysis at n = 12 per cell is a
  hypothesis generator, not a finding.
- **Power for the wrong test.** The sample size must match the analysis that will
  actually run.
- **No correction for multiplicity in the power calculation.** If 20 outcomes are
  tested and corrected, the per-test power is lower than the nominal figure.
