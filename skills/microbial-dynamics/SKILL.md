---
name: microbial-dynamics
description: Model and analyze microbial growth, competition, and population dynamics. Use for microbiology, fermentation, and microbial ecology modeling.
category: biology
tags: [microbial, growth, population-dynamics, fermentation, ecology]
disable-model-invocation: true
---

# Microbial Dynamics

Microbial population dynamics are governed by growth kinetics, resource
limitation, and interactions. A growth curve is not a growth rate until the
phase is identified and the model is fit to the right segment.

## Growth phases

```
lag → exponential → deceleration → stationary → death
```

**Only the exponential phase gives the specific growth rate** `μ = d(ln N)/dt`.
Fitting a logistic curve to the whole time course and reporting μ from it mixes
phases.

## Growth models

| Model | Equation | Use |
|---|---|---|
| Exponential | N = N0·e^(μt) | Exponential phase only |
| Logistic | dN/dt = μN(1 - N/K) | Single-substrate limitation |
| Gompertz | asymmetric sigmoid | Asymmetric growth curves |
| Monod | μ = μmax·S/(Ks + S) | Substrate-limited growth |
| Baranyi | lag + exponential + stationary | Full curve, with lag parameter |
| Diauxic | two sequential substrates | Glucose then lactose-type shifts |

```python
from scipy.optimize import curve_fit
def baranyi(t, mu_max, lag, A, m):
    # simplified Baranyi-Roberts
    ...
# Report mu_max (h^-1), lag (h), and their CIs
```

**Report lag time, μmax, and carrying capacity with confidence intervals** —
each answers a different question.

## Competition and interactions

- **Lotka-Volterra:** `dN_i/dt = r_i N_i (1 - Σ α_ij N_j / K_i)`. The
  interaction coefficients α_ij encode competition/facilitation.
- **Resource competition** (Tilman's R*): the species that reduces the limiting
  resource to the lowest level wins. Test with chemostat experiments.
- **Cross-feeding and syntrophy:** model as explicit metabolite exchange; a
  co-culture outperforming the sum of monocultures is evidence of facilitation.

## Chemostat and continuous culture

```
dN/dt = (μ(S) - D)N
dS/dt = D(Sin - S) - μ(S)N/Y
```
D = dilution rate. At steady state, μ = D. Washout occurs when D > μmax. The
chemostat is the cleanest system for measuring μ and Y (yield).

## Measurement and errors

- **OD600 is not cell count.** Convert with a calibration curve for each strain
  and each instrument; OD saturates at high density and is affected by cell
  size/morphology.
- **Viable counts (CFU)** measure culturable cells, not total.
- **Replicates:** independent cultures, not repeated readings of one culture.
- **Lag estimation is sensitive** to the sampling frequency in the early phase.

## Modeling checks

- **Residuals** and the fit to the growth phase actually used.
- **Parameter identifiability:** μmax and Ks are often correlated from batch data
  alone; a chemostat or substrate-variation experiment separates them.
- **Model comparison:** logistic vs Gompertz vs Baranyi — report the comparison,
  not just the chosen model.

## Reporting

State: the organism and strain, the medium and conditions (temperature, pH,
aeration), the measurement method and its calibration, the growth phase used for
each estimate, the model and its parameters with CIs, the replicate structure,
and the limits of the conditions tested.
