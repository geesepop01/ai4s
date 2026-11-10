---
name: bayesian-inference
description: Bayesian statistical modeling and inference — priors, posteriors, MCMC diagnostics, model comparison, and posterior predictive checks. Use when uncertainty quantification, small samples, or hierarchical structure matter more than a p-value.
category: statistics
tags: [bayesian, mcmc, priors, posterior, hierarchical]
disable-model-invocation: true
---

# Bayesian Inference

Bayesian inference answers a different question than a p-value: not "how
surprising is this data under the null" but "given the data and what I knew
before, what should I now believe about the parameters."

## When to reach for it

- **Small samples** where asymptotic approximations are unreliable.
- **Hierarchical structure** — subjects nested in sites, repeated measures,
  multi-level designs — where partial pooling is the honest model.
- **Direct uncertainty statements** needed: "there is a 92% probability the
  effect exceeds 2 points" rather than "p < 0.05."
- **Model comparison** where several plausible models must be weighed, not chosen.
- **Prior knowledge** is real and should be used: previous studies, physical
  constraints, known bounds.

## The model record

```markdown
# Bayesian model: <name>

Likelihood: <distribution of the data given parameters>
Parameters: <each, with its meaning and scale>
Priors: <each, with the source of the prior and whether it is informative>
Hierarchical structure: <levels, and what is pooled>
Inference: <MCMC sampler, chains, iterations, warmup, seed>
Diagnostics: <R-hat, ESS, divergences, trace inspection>
Comparison: <LOO / WAIC / Bayes factor, as applicable>
```

## Priors

- **Weakly informative is the default.** A prior wide enough to allow anything
  the data can support, narrow enough to keep the sampler sane.
- **Informative priors are fine when they come from evidence.** Cite the source
  and its strength. A prior is data you are adding; treat it with the same
  honesty.
- **Never choose a prior to get the answer you want.** Report a sensitivity
  analysis: how does the posterior move under reasonable alternative priors?
- **Reparameterize rather than constrain.** A positive parameter is often better
  modeled on the log scale with a normal prior than with a hard truncation.

## Inference and diagnostics

- **Chains:** at least 4, from dispersed initial values.
- **R-hat < 1.01** for every parameter. Higher means the chains did not mix.
- **Effective sample size (ESS):** enough for the quantity you report; 400+ per
  quantity is a common floor.
- **Divergences:** any divergence is a problem with the geometry; reparameterize
  before interpreting. Raising `target_accept` is a bandage, not a fix.
- **Trace plots:** look at them. Summary statistics hide the pathologies.
- **Posterior predictive checks:** simulate data from the posterior and compare
  to the observed data on the features that matter. If the model cannot
  reproduce the data, the posterior is meaningless.

## Reporting

Report the **posterior median and a credible interval** (95% by convention),
stated as: "the effect is 2.3, 95% CI [1.1, 3.5]." Report the probability of
direction when it is the useful quantity: "P(Δ > 0) = 0.97."

For model comparison, report **LOO-ELPD or WAIC with its standard error**, not a
single ranking number. A difference smaller than its SE is not a difference.

## Frequentist comparison

A Bayesian credible interval is not a frequentist confidence interval. Do not
mix the languages:

| Bayesian | Frequentist |
|---|---|
| "95% probability the parameter lies in [a, b]" | "95% of such intervals would contain the parameter" |
| P(Δ > 0) = 0.97 | p-value for H₀: Δ = 0 |
| Prior + likelihood → posterior | Sampling distribution of the estimator |

Report which framework you used, and do not translate one into the other.

## Tools

- **PyMC** — flexible, Pythonic, NUTS by default. Good default.
- **Stan / cmdstanpy** — fastest and best-diagnosed for hard models.
- **NumPyro / JAX** — for large data or GPU-accelerated sampling.
- **Bambi** — formula interface over PyMC for standard regression structures.
- **ArviZ** — diagnostics, posterior predictive checks, LOO, plots.
