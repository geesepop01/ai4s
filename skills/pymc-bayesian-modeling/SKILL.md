---
name: pymc-bayesian-modeling
description: Build Bayesian models with PyMC — hierarchical models, MCMC sampling, model comparison, and posterior predictive checks. Use for probabilistic modeling where uncertainty and priors matter.
category: statistics
tags: [pymc, bayesian, mcmc, hierarchical, probabilistic]
disable-model-invocation: true
---

# PyMC Bayesian Modeling

PyMC specifies models declaratively and samples them with NUTS. The skill is
not in writing the model; it is in checking that the posterior means what you
think it means.

## A complete model

```python
import pymc as pm
import arviz as az
import numpy as np

with pm.Model() as model:
    # Priors
    mu = pm.Normal("mu", mu=0, sigma=10)
    sigma = pm.HalfNormal("sigma", sigma=5)
    # Hierarchical: group-level effects
    sigma_group = pm.HalfNormal("sigma_group", sigma=2)
    mu_group = pm.Normal("mu_group", mu=mu, sigma=sigma_group, shape=n_groups)

    # Likelihood
    y_obs = pm.Normal("y_obs", mu=mu_group[group_idx], sigma=sigma, observed=y)

    # Inference
    idata = pm.sample(2000, tune=1000, chains=4, target_accept=0.95,
                      random_seed=42, return_inferencedata=True)
```

## Diagnostics (mandatory)

```python
az.summary(idata, var_names=["mu", "sigma", "sigma_group"])  # r_hat, ess
az.plot_trace(idata); az.plot_posterior(idata)
az.plot_ppc(idata)                       # posterior predictive check
print(idata.sample_stats["diverging"].sum())   # must be 0 or near
```

| Check | Requirement |
|---|---|
| R-hat | < 1.01 for every parameter |
| ESS (bulk/tail) | > 400 per quantity reported |
| Divergences | 0. Any divergence → reparameterize, do not just raise target_accept |
| Trace plots | visually mixed, no trends |
| Posterior predictive | model reproduces the data's relevant features |

## Priors

- **Weakly informative is the default**: wide enough to permit the data, narrow
  enough to identify.
- **Informative priors are legitimate** when they come from evidence — cite it.
- **Sensitivity analysis**: refit under alternative reasonable priors and report
  how the posterior moves. This is what makes an informative prior honest.
- **Reparameterize rather than truncate:** a positive quantity on the log scale
  with a Normal prior is better behaved than a truncated Normal.

## Hierarchical models

Partial pooling is the main reason to reach for Bayesian methods:

```
y_ij ~ Normal(mu_j, sigma)
mu_j ~ Normal(mu_pop, tau)        # group means shrunk toward the population
```

Report: the population mean, the between-group SD (τ), and the per-group
posteriors. The shrinkage is the point — it is what makes small groups
informative.

## Model comparison

- **LOO-PSIS** (`az.loo`) is the default; report `elpd_loo` with its SE.
- **WAIC** when LOO is unstable.
- **Bayes factors** only with careful prior specification; they are prior
  sensitive and often the wrong tool.
- Report the difference with its uncertainty, not a ranking.

## Reporting

State: the model graph (equations), every prior with its justification, the
sampler settings (chains, tune, target_accept, seed), the diagnostics (R-hat,
ESS, divergences), the posterior summaries (median and 95% CrI), the posterior
predictive check, and the prior sensitivity analysis.

## Anti-patterns

- Reporting a posterior without diagnostics.
- Treating a credible interval as a confidence interval (see `bayesian-inference`).
- Choosing a prior to get the desired posterior.
- Ignoring divergences.
- Claiming a model is "better" from a small elpd difference without its SE.
