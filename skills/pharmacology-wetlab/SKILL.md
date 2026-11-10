---
name: pharmacology-wetlab
description: Design and interpret pharmacology and wet-lab experiments — dose-response, assays, viability, IC50/EC50, and experimental controls. Use for in-vitro and preclinical experimental work.
category: medicine
tags: [pharmacology, wet-lab, assays, dose-response, ic50, in-vitro]
disable-model-invocation: true
---

# Pharmacology & Wet-Lab

Wet-lab results are only as good as the assay's controls, the dose-response
design, and the distinction between potency, efficacy, and selectivity.

## Dose-response

The core measurement. Design it properly:

- **8–12 concentrations**, log-spaced, spanning 2–3 logs below to 2 logs above
  the expected EC50.
- **Replicates:** at least 3 independent biological replicates; technical
  replicates within each.
- **Fit the four-parameter logistic:**

```python
from scipy.optimize import curve_fit
def four_pl(x, bottom, top, log_ic50, hill):
    return bottom + (top - bottom) / (1 + 10**((log_ic50 - x) * hill))
popt, pcov = curve_fit(four_pl, np.log10(conc), response, p0=[0, 100, -6, 1])
ic50 = 10**popt[2]
```

- **Report IC50/EC50 with its confidence interval** and the Hill slope. A
  Hill slope far from 1 is informative and must be reported.
- **Potency ≠ efficacy.** IC50 is potency; Emax is efficacy. A compound can be
  potent and weak.

## Assay quality

| Parameter | What it tells you |
|---|---|
| Z' factor | assay quality: Z' > 0.5 is excellent, 0–0.5 marginal |
| Signal-to-background | dynamic range |
| Positive/negative controls | assay is working |
| Intra/inter-assay CV | reproducibility |

`Z' = 1 - 3(σ_p + σ_n)/|μ_p - μ_n|` — compute it before trusting any plate.

## Controls (non-negotiable)

- **Negative control:** vehicle (DMSO), the baseline every value is normalized to.
- **Positive control:** a known active compound at a known dose.
- **Blank:** no cells / no substrate, to define background.
- **Cytotoxicity counter-screen:** a compound that kills cells "inhibits" every
  assay. Run viability alongside every functional assay.
- **Orthogonal assay:** confirm the hit in a different assay format before
  believing it.

## Experimental design

- **Randomize plate positions.** Edge effects are real; distribute conditions
  across the plate.
- **Blind the analysis** where feasible.
- **Batch effects:** run controls on every plate; normalize to the plate's own
  controls.
- **Pre-specify the exclusion criteria** (e.g. "wells with CV > 20% excluded")
  before looking at results.

## Interpretation boundaries

- **In vitro ≠ in vivo.** Micromolar potency in cells does not predict clinical
  effect. Say so.
- **Selectivity must be measured**, not assumed from one target's IC50.
- **Free drug concentration** depends on protein binding and solubility; total
  concentration overstates the active fraction. Report free where it matters.
- **A single IC50 is a point estimate.** The CI is the result.

## Reporting

State: the assay format and its Z' factor, the cell line/source and passage
number, the concentration range and solvent, the number and type of replicates,
the fitted model and its parameters with CIs, the Hill slope, the controls and
their results, the viability counter-screen, and the free-vs-total concentration
where relevant.
