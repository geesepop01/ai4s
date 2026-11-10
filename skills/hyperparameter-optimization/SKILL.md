---
name: hyperparameter-optimization
description: Optimize hyperparameters systematically — search spaces, search strategies, budgets, and reporting. Use when model performance depends on tuning that must be done honestly.
category: ml
tags: [hyperparameter-tuning, optimization, search, hpo, experiments]
disable-model-invocation: true
---

# Hyperparameter Optimization

HPO is a multiple-comparisons problem. The more configurations you try, the more
the best one is a lucky draw. The discipline is in the budget, the search, and
the reporting.

## The search space

- **Define it before searching,** from priors or a small pilot. A space defined
  after seeing results is post-hoc.
- **Log scale** for learning rates and regularization.
- **Conditional spaces** (e.g. `n_layers` then `units[i] per layer`).
- **State the ranges** in the report.

## Search strategies

| Method | Strength | Cost |
|---|---|---|
| Random search | Strong baseline; parallel | Cheap |
| Grid search | Exhaustive on small spaces | Explodes with dimension |
| Bayesian (Optuna, Hyperopt) | Sample-efficient | Sequential |
| ASHA/Hyperband | Early stopping bad configs | Efficient on large spaces |
| Population-based | Non-stationary | Complex |

**Random search is the right baseline.** It beats grid search in high
dimensions.

## Budget and overfitting

- **The validation set is being tuned to.** The more configs, the more the
  validation set is overfit. Report the number of trials.
- **Nested cross-validation** when the data is small: tune inside the inner
  loop, evaluate on the outer.
- **A held-out test set is touched once**, at the end, on the frozen best config.
- **Report the whole search**, not only the winner. The distribution of results
  is informative.

## Fairness of comparison

- **Same budget** for every method being compared. A tuned model vs a default
  baseline is not a fair comparison.
- **Same data splits, same seeds protocol.**
- **Compute budget stated** in wall clock or GPU hours.

## Reproducibility

```python
import optuna
study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=42))
study.optimize(objective, n_trials=200)
```

- **Record the search space, the sampler, the seed, and every trial's result.**
- **The best config and its trial number** in the report.

## Reporting

State: the search space and its justification, the search method and its
parameters, the number of trials and the total budget, the objective and the
data split it used, the best configuration and its measured performance, the
distribution of trial results, the test-set result of the frozen config, and the
comparison to a random-search baseline at the same budget.

## Anti-patterns

- Tuning on the test set.
- Reporting the best trial without the number of trials.
- Comparing tuned vs untuned models.
- A search space defined after seeing the results.
