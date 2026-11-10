---
name: statistical-analysis
description: Core statistical methods for research. Use for hypothesis testing, effect sizes, confidence intervals, multiple testing correction, power analysis, and common statistical tests.
category: statistics
tags: [statistics, hypothesis-testing, effect-size, confidence-interval, p-value]
---

# Statistical Analysis

## Overview

This skill covers the core statistical methods every researcher needs. Choose the right
test for your data, report effect sizes alongside p-values, and correct for multiple
comparisons.

## Choosing the Right Test

### Decision Table

| Comparison | Normal Data | Non-Normal Data |
|-----------|------------|-----------------|
| 2 independent groups | Independent t-test | Mann-Whitney U |
| 2 paired groups | Paired t-test | Wilcoxon signed-rank |
| 3+ independent groups | One-way ANOVA | Kruskal-Wallis |
| 3+ paired groups | Repeated measures ANOVA | Friedman test |
| Association | Pearson r | Spearman ρ |
| Categorical × Categorical | Chi-squared | Fisher's exact |

## Core Tests

```python
import numpy as np
from scipy import stats

# Independent t-test
t_stat, p_value = stats.ttest_ind(group_a, group_b)
cohens_d = (group_a.mean() - group_b.mean()) / np.sqrt(
    (group_a.std()**2 + group_b.std()**2) / 2
)
print(f"t={t_stat:.3f}, p={p_value:.4f}, Cohen's d={cohens_d:.3f}")

# Mann-Whitney U (non-parametric)
u_stat, p_value = stats.mannwhitneyu(group_a, group_b, alternative='two-sided')

# Paired t-test
t_stat, p_value = stats.ttest_rel(before, after)

# Wilcoxon signed-rank (non-parametric paired)
w_stat, p_value = stats.wilcoxon(before, after)

# One-way ANOVA
f_stat, p_value = stats.f_oneway(group1, group2, group3)

# Kruskal-Wallis (non-parametric ANOVA)
h_stat, p_value = stats.kruskal(group1, group2, group3)

# Post-hoc: Tukey HSD (after ANOVA)
from statsmodels.stats.multicomp import pairwise_tukeyhsd
tukey = pairwise_tukeyhsd(values, groups, alpha=0.05)
print(tukey)

# Pearson correlation
r, p_value = stats.pearsonr(x, y)
print(f"Pearson r={r:.3f}, p={p_value:.4f}")

# Spearman correlation
rho, p_value = stats.spearmanr(x, y)

# Chi-squared test
chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)

# Fisher's exact test (for 2x2 tables)
odds_ratio, p_value = stats.fisher_exact(contingency_table)
```

## Effect Sizes

```python
# Cohen's d (mean difference in SD units)
def cohens_d(a, b):
    pooled_std = np.sqrt((a.std()**2 + b.std()**2) / 2)
    return (a.mean() - b.mean()) / pooled_std

# Interpretation: 0.2 = small, 0.5 = medium, 0.8 = large

# Eta-squared (proportion of variance explained, for ANOVA)
def eta_squared(f_stat, df_between, df_within):
    return (f_stat * df_between) / (f_stat * df_between + df_within)

# R-squared (for regression)
from sklearn.metrics import r2_score
r2 = r2_score(y_true, y_pred)

# Odds ratio (for categorical data)
odds_ratio, ci_low, ci_high = stats.fisher_exact(table)
```

## Multiple Testing Correction

```python
from statsmodels.stats.multitest import multipletests

# Benjamini-Hochberg (FDR correction)
p_values = np.array([0.001, 0.01, 0.03, 0.05, 0.08, 0.12])
rejected, p_adjusted, _, _ = multipletests(p_values, alpha=0.05, method='fdr_bh')
print("BH-corrected p-values:", p_adjusted)
print("Rejected:", rejected)

# Bonferroni correction (more conservative)
rejected, p_adjusted, _, _ = multipletests(p_values, alpha=0.05, method='bonferroni')

# Available methods: 'bonferroni', 'sidak', 'holm-sidak', 'holm', 'simes-hochberg',
#                    'hommel', 'fdr_bh', 'fdr_by', 'fdr_tsbh', 'fdr_tsbky'
```

## Confidence Intervals

```python
import numpy as np
from scipy import stats

# CI for a mean
def ci_mean(data, confidence=0.95):
    n = len(data)
    mean = np.mean(data)
    se = stats.sem(data)
    h = se * stats.t.ppf((1 + confidence) / 2, n - 1)
    return mean, mean - h, mean + h

mean, ci_low, ci_high = ci_mean(data)
print(f"Mean: {mean:.2f} [{ci_low:.2f}, {ci_high:.2f}]")

# CI for a proportion
from statsmodels.stats.proportion import proportion_confint
ci_low, ci_high = proportion_confint(count=45, nobs=100, alpha=0.05, method='wilson')
print(f"Proportion: 0.45 [{ci_low:.3f}, {ci_high:.3f}]")

# Bootstrap CI (for any statistic)
def bootstrap_ci(data, stat_fn=np.mean, n_bootstrap=10000, ci=0.95):
    boot_stats = [stat_fn(np.random.choice(data, len(data), replace=True))
                  for _ in range(n_bootstrap)]
    lower = np.percentile(boot_stats, (1 - ci) / 2 * 100)
    upper = np.percentile(boot_stats, (1 + ci) / 2 * 100)
    return np.mean(boot_stats), lower, upper
```

## Power Analysis

```python
from statsmodels.stats.power import TTestIndPower

# Sample size for two-sample t-test
power_analysis = TTestIndPower()
n_per_group = power_analysis.solve_power(
    effect_size=0.5,  # Cohen's d
    alpha=0.05,
    power=0.80,
    alternative='two-sided'
)
print(f"Required n per group: {int(np.ceil(n_per_group))}")

# Power for given sample size
power = power_analysis.solve_power(
    effect_size=0.5,
    nobs1=50,
    alpha=0.05,
    alternative='two-sided'
)
print(f"Power: {power:.3f}")
```

## Assumptions Checking

```python
# Normality test
stat, p_value = stats.shapiro(data)
print(f"Shapiro-Wilk: p={p_value:.4f} ({'Normal' if p_value > 0.05 else 'Not normal'})")

# Equal variances (Levene's test)
stat, p_value = stats.levene(group_a, group_b)
print(f"Levene's: p={p_value:.4f} ({'Equal variances' if p_value > 0.05 else 'Unequal variances'})")

# QQ plot for visual normality check
import matplotlib.pyplot as plt
stats.probplot(data, dist="norm", plot=plt)
plt.savefig('qq_plot.png', dpi=300)
```

## Reporting Template

For any statistical test, report:
1. **Test name** (e.g., "Independent samples t-test")
2. **Test statistic** (e.g., "t(48) = 3.42")
3. **p-value** (e.g., "p = 0.001")
4. **Effect size** (e.g., "Cohen's d = 0.97")
5. **Confidence interval** (e.g., "95% CI [0.41, 1.53]")
6. **Sample size** (e.g., "n = 25 per group")

## Best Practices

1. **Check assumptions** before choosing a test (normality, equal variances, independence)
2. **Report effect sizes**, not just p-values — a statistically significant result with tiny effect is uninteresting
3. **Correct for multiple comparisons** when testing multiple hypotheses
4. **Use confidence intervals** to communicate uncertainty
5. **Sample size matters** — small samples have low power; large samples detect trivial effects
6. **One-tailed vs two-tailed** — use two-tailed unless you have strong a priori directional hypothesis
7. **Non-parametric alternatives** when assumptions are violated (but note they have less power)
