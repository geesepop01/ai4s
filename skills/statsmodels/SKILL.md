---
name: statsmodels
description: Use statsmodels for regression, hypothesis testing, time series, and statistical diagnostics in Python. Use when a classical statistical model or test is needed with full diagnostic output.
category: statistics
tags: [statsmodels, regression, python, diagnostics, econometrics]
---

# statsmodels

statsmodels is the standard Python library for classical statistics: full
summary tables, diagnostics, and established tests. Use it when the answer needs
to be a statistically qualified result, not a prediction.

## The core patterns

```python
import statsmodels.api as sm
import statsmodels.formula.api as smf
import pandas as pd

# OLS with formula (patsy) — handles categorical variables, interactions
m = smf.ols("y ~ C(group) + age + C(group):age", data=df).fit()
print(m.summary())            # coefficients, SEs, t, p, CI, R², diagnostics

# Diagnostics
sm.stats.diagnostic.het_breuschpagan(m.resid, m.model.exdata)
sm.stats.stattools.durbin_watson(m.resid)
infl = m.get_influence(); cooks = infl.cooks_distance[0]
```

## What to use for what

| Need | API |
|---|---|
| Linear regression | `smf.ols` |
| Logistic / GLM | `smf.glm(family=sm.families.Binomial())` |
| Mixed models | `smf.mixedlm` |
| ANOVA (Type II/III) | `sm.stats.anova_lm` |
| Robust regression | `sm.RLM` (Huber, Tukey) |
| Survival | `smf.phreg` (Cox PH) |
| Time series | `sm.tsa.ARIMA`, `SARIMAX`, `VAR`, `ExponentialSmoothing` |
| Nonparametric | `sm.stats.multitest`, `scipy.stats` |
| Multiple testing | `sm.stats.multipletests(method="fdr_bh")` |

## Diagnostics to always run

- **Breusch–Pagan / White** for heteroscedasticity.
- **Durbin–Watson** for autocorrelation in residuals.
- **Q-Q plot** (`sm.qqplot`) for normality of residuals.
- **Cook's distance** for influence.
- **VIF** (`variance_inflation_factor`) for multicollinearity.
- **Ramsey RESET** for functional form.

## Multiple testing

```python
from statsmodels.stats.multitest import multipletests
reject, pvals_corrected, _, _ = multipletests(pvals, alpha=0.05, method="fdr_bh")
```

Report the method (BH, Bonferroni, Holm) and the family of tests it applied to.

## Time series specifics

- **Check stationarity** (ADF, KPSS) before fitting ARIMA; difference if needed.
- **Order selection** by AIC plus residual diagnostics (Ljung–Box on residuals).
- **Seasonal decomposition** to see structure before modeling.
- **Report the forecast with its interval**, and the model's residual
  diagnostics.

## Reporting rules

- Report **coefficients with SE and CI**, not just p-values.
- For GLMs, **interpret on the response scale** (odds ratios, rate ratios) and
  say which scale is being reported.
- Report **N and the number of clusters** for mixed models.
- Include the **model formula** in the methods; a reader must be able to refit.
- Report the **diagnostics** and what you did about violations.

## When not to use it

- Prediction tasks where out-of-sample performance is the goal → use scikit-learn
  with cross-validation.
- Large-scale ML where the model is not the inference target.
- Bayesian inference with informative priors → PyMC/Stan (see
  `bayesian-inference`).

statsmodels is for **inference**: what is the effect, how big, how uncertain.
