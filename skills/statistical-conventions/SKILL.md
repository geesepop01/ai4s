---
name: statistical-conventions
description: Choose and report statistical tests the way a careful referee expects. Use whenever comparing groups, fitting models, reporting significance, or summarizing uncertainty.
category: statistics
tags: [statistics, tests, inference, reporting, referee]
---

# Statistical Conventions

The question a referee asks first is not "is the p-value small" but "was this the
right test for this design, and is the reported number the one the design
supports." This skill is the design-to-test mapping and the reporting standard.

## Choose the test from the design

| Design | Typical test | Notes |
|---|---|---|
| Two independent groups, continuous outcome | Welch t-test (default) | Welch over Student unless equal variance is established |
| Two independent groups, ordinal or heavy-tailed | Mann–Whitney U | Report the effect as P(X>Y), not just a p-value |
| Two paired measurements | Paired t-test / Wilcoxon signed-rank | Paired structure must be real, not assumed |
| Three or more groups | Welch ANOVA / Kruskal–Wallis | Post-hoc corrected, never unplanned pairwise t-tests |
| Ordered dose or grade levels | Jonckheere–Terpstra (continuous), Cochran–Armitage (binary) | Uses the ordering that a plain ANOVA throws away |
| Proportions | Chi-squared / Fisher exact | Fisher when any expected cell < 5 |
| Count data | Poisson or negative binomial with offset | Never a t-test on raw counts |
| Time-to-event | Kaplan–Meier + log-rank; Cox for covariates | State censoring rules; check PH assumption |
| Repeated measures over time | Mixed-effects model or repeated-measures ANOVA | Sphericity is an assumption, not a default |
| Many outcomes / many tests | FDR (Benjamini–Hochberg) or FWER (Holm/Bonferroni) | Name which family the correction applies to |

## Matched vs paired, parametric vs rank

- **Paired** means each observation in one group is linked to a specific
  observation in the other (same subject, same batch, matched pair). Repeated
  measurements on the same subject are paired; two independent cohorts are not.
- **Parametric vs rank** follows from the data: normality of the *residuals* (not
  the raw values), homoscedasticity, and the sample size. For large N, rank tests
  lose little and gain robustness; for small N, a rank test can be the only honest
  choice. State which you chose and why.

## Reporting standard

For every test reported:

1. **Test name and its assumptions**, and how they were checked.
2. **n per group**, not just total N.
3. **Effect size with CI** — Cohen's d (Hedges' g for small n), rank-biserial,
   odds ratio, hazard ratio, R². The effect size is the finding; the p-value is
   the compatibility measure.
4. **Exact p-value**, not "p < 0.05". Three decimals minimum; below 0.001 report
   "p < 0.001".
5. **One-tailed only if pre-specified**, stated as such. A one-tailed test chosen
   after seeing the direction is a two-tailed test with half the honesty.
6. **Multiple-testing correction** applied to the declared family, and the method
   named.
7. **Variance across seeds or replicates** reported, not a single lucky run.

## What referees reject

- A p-value without an effect size or an interval.
- "Trend toward significance" for p = 0.07.
- Post-hoc subgroups not declared before the analysis (HARKing).
- A normality test used as a gate at N = 12 (it has no power) or at N = 5000
  (it flags everything). Inspect the residuals instead.
- A paired test on unpaired data, or an unpaired test on paired data (the latter
  is conservative but wasteful; say so if you do it).
- Pooling repeated measurements as if independent (inflates n and the significance).
- Reporting only the p-value for a model comparison; report the metric difference
  with its interval.

## For model comparison specifically

- Compare on the same held-out folds; a paired comparison across folds.
- Report the per-fold distribution, not just the mean.
- Bootstrap the metric difference on the test set for an interval when folds are
  few.
- State whether the comparison is confirmatory (hypothesis pre-registered) or
  exploratory (hypothesis formed after seeing results).
