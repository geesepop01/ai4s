---
name: admet-prediction
description: Predict and interpret ADMET properties — absorption, distribution, metabolism, excretion, toxicity. Use for drug-likeness assessment and compound triage.
category: chemistry
tags: [admet, toxicity, pk, drug-likeness, predictions]
disable-model-invocation: true
---

# ADMET Prediction

ADMET predictions are models with applicability domains. A prediction outside
the training domain is an extrapolation, not a number.

## The properties

| Category | Property | Key question |
|---|---|---|
| Absorption | Caco-2, PAMPA, HIA, oral bioavailability | Does it get in? |
| Distribution | PPB, Vd, BBB penetration | Where does it go? |
| Metabolism | CYP inhibition/induction, metabolic stability | Is it cleared? By what? |
| Excretion | Clearance, half-life, renal/hepatic | How fast does it leave? |
| Toxicity | hERG, Ames, DILI, LD50, skin sensitization | Does it harm? |

## Tools

- **pkCSM, SwissADME, admetSAR, pkCSM** — web-based, fast triage.
- **DeepChem / ADMET-AI / Therapeutics Data Commons (TDC)** — programmatic.
- **QikProp (Schrödinger)** — commercial, industry standard.
- **RDKit descriptors + trained models** — custom, must be validated.

```python
from tdc import ADME
data = ADME(name="Caco2_Wang")
# Use TDC's benchmark splits to see applicability
```

## Applicability domain (the critical step)

- **Every prediction comes with a training set.** State its chemical space,
  size, and the model's reported error (RMSE, MAE, R² on the test set).
- **Check the compound's distance to the training set** (nearest-neighbor
  similarity in the model's descriptor space). Outside the domain → report as
  extrapolation.
- **Confidence intervals** where the model provides them; a point prediction
  without an interval is not a decision-grade number.

## Interpretation rules

- **Predicted values are estimates with method error**, often 2–10× in
  concentration terms. Report as ranges or categories where possible.
- **Pass/fail thresholds** (e.g. Lipinski, hERG IC50 < 10 µM) are heuristics.
  Report the underlying value, not only the flag.
- **CYP inhibition** predictions are mechanism-blind; a predicted inhibitor may
  not be a clinical DDI risk.
- **Ames/DILI predictions** have high false-positive rates; a positive is a
  flag for testing, not a verdict.

## Triaging a series

Use ADMET for **relative** ranking within a chemical series, not absolute
decisions:

1. Compute the panel across the series.
2. Flag compounds outside the applicability domain.
3. Rank by the properties that matter for the program (e.g. solubility +
   metabolic stability + hERG).
4. Report the flags and their basis, and recommend experimental confirmation.

## Reporting

State: the tool and its version, the model's training set and its reported error,
the applicability check for the compounds predicted, the predicted values with
their units and any confidence, the thresholds applied and their basis, and the
explicit statement that predictions require experimental confirmation.

## Anti-patterns

- Reporting a predicted value as a measured property.
- Ignoring the applicability domain.
- Making a go/no-go decision on a single predicted ADMET value.
- Using pass/fail flags without the underlying number.
