---
name: statistical-modeling
description: Build statistical models — regression, mixed models, GLMs, survival models, and model diagnostics. Use when the analysis requires a fitted model rather than a summary statistic.
category: statistics
tags: [regression, mixed-models, glm, survival, modeling]
disable-model-invocation: true
---

# Statistical Modeling

A statistical model is a set of assumptions made explicit. The model is right
when its assumptions hold; the diagnostics are how you check.

## Choosing the model from the design

| Outcome | Design | Model |
|---|---|---|
| Continuous | independent groups | Linear regression / ANOVA |
| Continuous | repeated/nested | Linear mixed model (random intercepts/slopes) |
| Binary | independent | Logistic regression |
| Binary | clustered | GLMM with binomial family |
| Count | independent | Poisson / negative binomial (check overdispersion) |
| Time-to-event | censored | Cox PH / parametric survival |
| Ordinal | ordered categories | Ordinal logistic (proportional odds) |
| Proportion | bounded [0,1] | Beta regression / binomial GLM |
| Multivariate | several correlated outcomes | MANOVA / multivariate mixed model |

## Linear models

```python
import statsmodels.formula.api as smf
m = smf.mixedlm("y ~ group * time", data=df, groups=df["subject"],
                re_formula="~time")
res = m.fit()
print(res.summary())
```

**Diagnostics (always):**
- Residuals vs fitted (homoscedasticity, nonlinearity).
- Q-Q plot (normality of residuals).
- Scale-location plot (variance).
- Cook's distance (influential points).
- VIF (multicollinearity) for models with several predictors.

**Violations and their remedies:** heteroscedasticity → robust SE (HC3) or
weighted least squares; non-normality of residuals → transform or robust
regression; nonlinearity → splines or a different functional form.

## Mixed models

The tool for nested/repeated data:

- **Random intercepts** capture baseline differences per subject/group.
- **Random slopes** capture different responses per subject. Add when the design
  supports it; over-parameterization fails to converge.
- **Fixed effects** are the population-level effects you report.
- **Satterthwaite/Kenward-Roger** degrees of freedom for small samples.
- **Report the variance components** (ICC), not just the fixed effects. The ICC
  is the answer to "how much of the variation is between subjects."

## GLMs and link functions

`g(E[y]) = Xβ` where g is the link. Report the link and interpret on the
appropriate scale: logit coefficients are log-odds; exponentiate for odds ratios
and say so. **Do not interpret raw GLM coefficients as the response scale.**

## Survival analysis

- **Kaplan–Meier** with the log-rank test for group comparison.
- **Cox PH** for covariate adjustment; **check the proportional hazards
  assumption** (Schoenfeld residuals). If violated, use time-varying coefficients
  or stratification.
- **Censoring** is informative or not; state the assumption. Report the number at
  risk.
- **Report hazard ratios with CIs**, and the median survival per group.

## Model comparison

- Nested: likelihood ratio test, with the χ² and p.
- Non-nested: AIC/BIC, with ΔAIC reported.
- **Out-of-sample** comparison when prediction is the goal; in-sample fit always
  favors complexity.
- Report the comparison, not only the selected model.

## Reporting

State: the model formula and its terms, the link and the error distribution, the
random effects structure, the estimation method, the diagnostics and how
violations were handled, the parameter estimates with CIs, the variance
components, the sample size and the number of clusters, and the model comparison
if several were considered.
