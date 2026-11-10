---
name: pkpd-modeling
description: Model pharmacokinetics and pharmacodynamics — compartment models, exposure-response, population PK, and dose optimization. Use for drug disposition and dose-finding analyses.
category: medicine
tags: [pkpd, pharmacokinetics, compartment, dose-response, poppk]
disable-model-invocation: true
---

# PK/PD Modeling

PK describes what the body does to the drug; PD describes what the drug does to
the body. Linking them correctly is what turns concentrations into a dosing
recommendation.

## Pharmacokinetics

**One-compartment IV bolus:**
```
C(t) = C0 · e^(-kel·t)        t½ = 0.693/kel
```

**One-compartment oral:**
```
C(t) = (F·D·ka)/(V·(ka-kel)) · (e^(-kel·t) - e^(-ka·t))
```

**Two-compartment:** biexponential; α (distribution) and β (elimination) phases.
Do not fit a two-compartment model to data that only covers the elimination
phase.

**Standard PK parameters:**
```
AUC     exposure (trapezoidal or model-derived)
Cmax    peak concentration
Tmax    time to peak
CL      clearance = Dose/AUC
Vd      volume of distribution = CL/kel
t½      half-life = 0.693·Vd/CL
```

## Fitting

```python
from scipy.optimize import curve_fit
def two_comp(t, A, alpha, B, beta):
    return A*np.exp(-alpha*t) + B*np.exp(-beta*t)
popt, pcov = curve_fit(two_comp, time, conc, sigma=conc_err, p0=[...])
```

- **Weighting matters.** Concentration data is often proportional-error; use
  `1/y²` weighting or a log-transform. Ordinary least squares on raw
  concentrations overweights the high values.
- **Report parameter uncertainty and correlation.** CL and Vd are often strongly
  correlated; report the covariance.
- **Goodness of fit:** residuals (CWRES), observed vs predicted, VPC.

## Pharmacodynamics

| Model | Use |
|---|---|
| Emax / Hill | Direct effect: E = E0 + Emax·C/(EC50 + C) |
| Indirect response | Turnover models for delayed effects |
| Effect compartment | Hysteresis (effect lags concentration) |
| Signal transduction | Multi-step cascade |

**Hysteresis loops** in the C–E plot indicate a delay; fit an effect-compartment
model rather than ignoring the loop.

## Population PK (PopPK)

- **Nonlinear mixed-effects** (NONMEM, Monolix, nlmixr): fixed effects (typical
  value) and random effects (inter-individual variability, residual error).
- **Covariates** (weight, renal function, genotype) explain variability; test
  them with a pre-specified forward/backward approach and report their effect.
- **Report:** the structural model, the error model, IIV (as ω² or CV%), the
  covariate relationships with their significance, and the VPC.

## Exposure–response and dose selection

- Link AUC/Cmin/Cmax to the PD effect or to efficacy/toxicity.
- **Target exposure** derives from the concentration that produces the desired
  effect with acceptable toxicity; the dose is chosen to reach it in the target
  population.
- **Report the dose with its uncertainty** and the fraction of patients below
  target.

## Reporting

State: the structural model and its parameters (with units), the error model and
weighting, the fitting method, parameter estimates with uncertainty and
correlation, the goodness-of-fit plots, the covariates tested, the population
studied and its characteristics, and the assumptions in any dose extrapolation.
