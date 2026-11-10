---
name: clinical-research
description: Clinical and regulatory research standards. Use for trial reporting, endpoint definitions, adverse event coding, evidence grading, de-identification, and clinical document structure.
category: clinical
tags: [clinical, trials, regulatory,consort, adverse-events, de-identification, evidence]
disable-model-invocation: true
---

# Clinical Research

## Overview

Clinical work carries obligations that laboratory work does not — patient privacy,
regulatory reporting standards, and pre-registered endpoints. This skill covers the
reporting and safety conventions.

**Scope note.** This skill supports research analysis and reporting. It does not
provide medical advice, diagnosis, or treatment recommendations for any individual.

## De-identification comes first

Before loading any patient-derived data:

- **Never** put direct identifiers in analysis code, logs, filenames, or outputs —
  names, MRNs, dates of birth, addresses, phone numbers, emails, device IDs.
- Dates are quasi-identifiers. Shift them per patient by a random offset and keep
  the offset map separate from the analytic dataset.
- Free-text fields are the highest-risk surface — they leak identifiers that
  structured columns do not.
- Check the HIPAA Safe Harbor 18-identifier list, or apply the Expert
  Determination standard.
- Verify de-identification **after** processing, not only before. Joins and
  merges can reintroduce identifiers.

If you cannot confirm a dataset is de-identified, stop and say so.

## Study reporting standards

Match the checklist to the design — reviewers and journals expect the specific one:

| Design | Standard |
|---|---|
| Randomised controlled trial | CONSORT |
| Observational cohort, case-control, cross-sectional | STROBE |
| Systematic review and meta-analysis | PRISMA |
| Diagnostic accuracy study | STARD |
| Case report | CARE |
| Quality improvement | SQUIRE |
| Prediction model | TRIPOD |

## Pre-specification

The single most important methodological protection in clinical research:

- **Primary endpoint** — one, pre-specified, with a definition that is unambiguous
  about timing, measurement instrument, and analysis population.
- **Secondary endpoints** — named in advance, reported as secondary.
- **Analysis population** — intention-to-treat, per-protocol, or as-treated,
  decided in advance.
- **Stopping rules** and interim analyses — pre-specified, with alpha spending.

Analyses invented after seeing the data are **exploratory**. Labelling them
confirmatory is the central statistical sin of clinical research.

## Effect measures

Report the measure that matches the design and is interpretable clinically:

| Outcome type | Measure |
|---|---|
| Binary | risk ratio, odds ratio, risk difference, number needed to treat |
| Time-to-event | hazard ratio with Kaplan–Meier curves |
| Continuous | mean difference, standardised mean difference |
| Count/rate | rate ratio |

Always report **absolute** alongside **relative** effects. A 50% relative risk
reduction from 2% to 1% is a 1 percentage-point gain, and presenting only the
relative figure is misleading.

## Survival analysis

```python
import numpy as np
import pandas as pd
from lifelines import KaplanMeierFitter, CoxPHFitter
from lifelines.statistics import logrank_test

kmf = KaplanMeierFitter()
for label, group in df.groupby("arm"):
    kmf.fit(group["time"], event_observed=group["event"], label=label)
    kmf.plot_survival_function(ci_show=True)

result = logrank_test(
    df.loc[df.arm == "treatment", "time"], df.loc[df.arm == "control", "time"],
    event_observed_A=df.loc[df.arm == "treatment", "event"],
    event_observed_B=df.loc[df.arm == "control", "event"],
)
print("log-rank p =", result.p_value)

cph = CoxPHFitter()
cph.fit(df[["time", "event", "age", "stage", "arm"]], duration_col="time", event_col="event")
cph.print_summary()
```

Check the proportional hazards assumption (`cph.check_assumptions`) before
trusting a hazard ratio. A violated assumption means the HR is not a single number.

## Censoring

- Censoring must be **non-informative** — the reason for leaving the study must not
  relate to the outcome.
- Distinguish censored from event in the data model; conflating them is a common
  and silent bug.
- Report how many were censored and why, by arm.

## Adverse events

- Code events to **MedDRA** terms; report by System Organ Class and Preferred Term.
- Grade severity consistently (CTCAE for oncology).
- Report **serious** adverse events separately from all adverse events.
- Compare arms on event **rates per patient-year** where exposure differs.
- Never report a safety signal only when it reaches significance — absence of a
  significant difference is not evidence of safety.

## Subgroup analyses

- Pre-specify subgroups; label the rest as exploratory.
- Report the **interaction test**, not the within-subgroup p-values alone.
- Beware the multiplicity explosion — 10 subgroups at α=0.05 yields a spurious
  "significant" finding more often than not.
- A forest plot with the overall effect marked makes over-reading harder.

## Evidence grading

When synthesising, grade each claim:

- **GRADE** — high, moderate, low, very low — driven by risk of bias,
  inconsistency, indirectness, imprecision, and publication bias.
- **Levels of evidence** — systematic review > RCT > cohort > case-control >
  case series > expert opinion.
- Downgrade for small samples, surrogate endpoints, and single-centre designs.

## Common pitfalls

| Pitfall | Why it invalidates the result |
|---|---|
| Outcome switching | The reported endpoint was chosen after seeing results |
| Surrogate endpoint presented as clinical benefit | A biomarker move is not a patient benefit |
| Per-protocol analysis as primary | Breaks randomisation, reintroduces confounding |
| Immortal time bias | Exposure classification uses post-baseline information |
| Regression to the mean | Extreme baseline groups improve without intervention |
| Survivorship bias | Only surviving/retained patients are analysed |
| Composite endpoint without components | A significant composite can hide a null driver |
| Ignoring clustering | Multi-site or repeated-measure data needs mixed models |

## Reporting template

```
Design, setting, and participants
  - Design, dates, sites, eligibility, sample size justification
Interventions / exposures
Outcomes
  - Primary (pre-specified), secondary, safety
Statistical analysis
  - Populations, tests, correction, missing-data handling
Results
  - Flow of participants, baseline table, primary result with CI, harms
Limitations
  - Bias sources, generalisability, unmeasured confounding
```
