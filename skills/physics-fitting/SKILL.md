---
name: physics-fitting
description: Fit physical models to data with proper uncertainty, model selection, and physical constraints. Use for parameter estimation, curve fitting, and comparing physical models to measurements.
category: physics
tags: [fitting, curve-fitting, parameter-estimation, models, uncertainty]
disable-model-invocation: true
---

# Physics Fitting

Fitting a physical model to data is an inference problem. The fit is not the
result; the parameters and their uncertainties, and the evidence that the model
is adequate, are.

## The fitting discipline

1. **Write the model explicitly,** with each parameter's physical meaning and
   units.
2. **Choose the fit based on the noise model**, not on convenience:
   - Gaussian noise → least squares (χ²).
   - Poisson (counts) → Poisson likelihood.
   - Unknown/heteroscedastic → robust loss (Huber), or explicit likelihood with
     per-point variance.
3. **Propagate the measurement uncertainties.** Weighted least squares when the
   σ_i are known; report them.
4. **Fit in the space where the noise is Gaussian.** Fitting y when the noise is
   multiplicative (constant relative error) should be a fit in log y.

## Implementation

```python
from scipy.optimize import curve_fit
import numpy as np

def model(x, A, tau, y0):
    return A * np.exp(-x / tau) + y0

popt, pcov = curve_fit(model, x, y, sigma=yerr, absolute_sigma=True, p0=[1, 1, 0])
perr = np.sqrt(np.diag(pcov))
print(f"A = {popt[0]:.3f} ± {perr[0]:.3f}")
```

**`absolute_sigma=True`** matters: it makes the covariance absolute rather than
scaled to the residual. If you have real error bars, use it.

**Bayesian route** (preferred when priors are real or the model is hierarchical):
see `bayesian-inference`. The posterior gives the full parameter distribution,
including correlations.

## Checking the fit

- **Residuals vs x.** Structure in the residuals means the model is wrong, not
  that the noise is weird.
- **χ²/ν ≈ 1.** Much less: errors overestimated or overfitting. Much more: model
  wrong or errors underestimated. Report the reduced χ².
- **Parameter correlations.** `pcov` off-diagonals near ±1 mean the parameters
  are not separately determined. Report it.
- **Autocorrelation of residuals** if the data is a series.
- **Influence:** does one point dominate? Leave-one-out check.

## Model comparison

- **Nested models:** F-test or likelihood ratio; report the Δχ² and the p-value.
- **Non-nested:** AIC/BIC or Bayes factors. Report ΔAIC, not just the winner.
- **Extra parameters must earn their place** with out-of-sample evidence, not
  with in-sample fit improvement.
- Report both candidate models when the evidence is not decisive.

## Physical constraints

- **Bounds:** `bounds=([0, 0, -np.inf], [np.inf, np.inf, np.inf])` for positive
  parameters. A negative amplitude for a positive physical quantity is a sign
  the model or the data is wrong.
- **Symmetry and conservation:** if the physics requires a relation between
  parameters, impose it rather than fitting them independently.
- **Extrapolation:** a fit is evidence only over the fitted range. State the
  range; do not extrapolate without the physics that justifies it.

## Reporting

State: the model and each parameter's meaning/units, the fit method and the
noise model, the parameters with uncertainties and their correlation if large,
the reduced χ², the residual plot (or its description), the fit range, the
comparison to alternative models, and the extrapolation limits.
