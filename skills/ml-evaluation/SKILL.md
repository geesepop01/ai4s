---
name: ml-evaluation
description: ML model evaluation and benchmarking. Use for metrics computation, cross-validation, ablation studies, error analysis, and statistical significance testing.
category: ml
tags: [ml, evaluation, metrics, cross-validation, ablation, statistical-testing]
disable-model-invocation: true
---

# ML Evaluation

## Overview

Rigorous evaluation is where ML research earns or loses credibility. This skill covers
metrics, validation strategies, ablation studies, and statistical significance.

## Core Principle

A metric without a baseline is meaningless. Always report against:
1. A trivial baseline (majority class, mean prediction, random)
2. A strong baseline (previous SOTA, simple model)
3. Your model

## Metrics by Task Type

### Classification

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, classification_report,
    confusion_matrix, ConfusionMatrixDisplay
)

# Standard metrics
print(classification_report(y_true, y_pred))

# For imbalanced datasets (use AUPRC, not accuracy)
auprc = average_precision_score(y_true, y_scores)
auroc = roc_auc_score(y_true, y_scores)
print(f"AUPRC: {auprc:.3f}, AUROC: {auroc:.3f}")

# Confusion matrix visualization
cm = confusion_matrix(y_true, y_pred)
disp = ConfusionMatrixDisplay(cm, display_labels=['Negative', 'Positive'])
disp.plot(cmap='Blues')
```

### Regression

```python
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

rmse = np.sqrt(mean_squared_error(y_true, y_pred))
mae = mean_absolute_error(y_true, y_pred)
r2 = r2_score(y_true, y_pred)
print(f"RMSE: {rmse:.4f}, MAE: {mae:.4f}, R²: {r2:.4f}")
```

### Ranking / Retrieval

```python
from sklearn.metrics import ndcg_score, average_precision_score

# NDCG@k
ndcg = ndcg_score(y_true_scores.reshape(1, -1), y_pred_scores.reshape(1, -1), k=10)

# Mean Average Precision
map_score = average_precision_score(y_true_binary, y_pred_scores)
```

## Cross-Validation

```python
from sklearn.model_selection import (
    cross_val_score, StratifiedKFold, GroupKFold, TimeSeriesSplit
)

# Standard stratified CV
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='f1_weighted')
print(f"CV F1: {scores.mean():.3f} ± {scores.std():.3f}")

# Group-aware CV (no data leakage between groups)
cv = GroupKFold(n_splits=5)
scores = cross_val_score(model, X, y, cv=cv, groups=groups)

# Time series CV (no future leakage)
cv = TimeSeriesSplit(n_splits=5)
scores = cross_val_score(model, X, y, cv=cv)
```

## Statistical Significance

```python
from scipy import stats
import numpy as np

# Paired t-test for model comparison (same CV folds)
scores_a = cross_val_score(model_a, X, y, cv=5)
scores_b = cross_val_score(model_b, X, y, cv=5)
t_stat, p_value = stats.ttest_rel(scores_a, scores_b)
print(f"t={t_stat:.3f}, p={p_value:.4f}")
print(f"Significant at α=0.05: {p_value < 0.05}")

# Bootstrap confidence intervals
def bootstrap_ci(y_true, y_pred, metric_fn, n_bootstrap=1000, ci=0.95):
    scores = []
    n = len(y_true)
    for _ in range(n_bootstrap):
        idx = np.random.choice(n, n, replace=True)
        scores.append(metric_fn(y_true[idx], y_pred[idx]))
    lower = np.percentile(scores, (1 - ci) / 2 * 100)
    upper = np.percentile(scores, (1 + ci) / 2 * 100)
    return np.mean(scores), lower, upper

mean_score, ci_low, ci_high = bootstrap_ci(y_true, y_pred, f1_score)
print(f"F1: {mean_score:.3f} [{ci_low:.3f}, {ci_high:.3f}]")
```

## Ablation Studies

```python
# Systematic ablation: remove one component at a time
configs = {
    'full_model': {'dropout': 0.3, 'batch_norm': True, 'attention': True},
    'no_dropout': {'dropout': 0.0, 'batch_norm': True, 'attention': True},
    'no_bn': {'dropout': 0.3, 'batch_norm': False, 'attention': True},
    'no_attention': {'dropout': 0.3, 'batch_norm': True, 'attention': False},
}

results = {}
for name, config in configs.items():
    model = build_model(**config)
    scores = cross_val_score(model, X, y, cv=5)
    results[name] = {'mean': scores.mean(), 'std': scores.std()}

# Report ablation table
print(f"{'Config':<20} {'F1':>8} {'±':>6} {'Delta':>8}")
baseline = results['full_model']['mean']
for name, r in results.items():
    delta = r['mean'] - baseline
    print(f"{name:<20} {r['mean']:.3f}  {r['std']:.3f}  {delta:+.3f}")
```

## Error Analysis

```python
# Find and categorize errors
errors = X_test[y_pred != y_test].copy()
errors['true_label'] = y_test[y_pred != y_test]
errors['pred_label'] = y_pred[y_pred != y_test]
errors['confidence'] = y_pred_proba.max(axis=1)[y_pred != y_test]

# Error distribution
print("Error distribution:")
print(errors.groupby(['true_label', 'pred_label']).size())

# Hardest examples (highest confidence but wrong)
hard = errors.nlargest(10, 'confidence')
print("\nHardest errors (high confidence, wrong prediction):")
print(hard[['true_label', 'pred_label', 'confidence']])
```

## Best Practices

1. **Never evaluate on training data** — always held-out or CV
2. **Report variance** — multiple seeds or bootstrap CIs
3. **Always run baselines** — a metric in isolation is meaningless
4. **Use appropriate metrics** — AUPRC for imbalanced, calibration for probabilities
5. **Ablate** — if you can't isolate the contribution, you don't understand it
6. **Error analysis** — inspect worst cases, find systematic patterns
7. **Statistical tests** — don't claim significance without testing
8. **Calibration plots** — for probabilistic outputs, check if confidence matches accuracy
