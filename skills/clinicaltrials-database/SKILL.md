---
name: clinicaltrials-database
description: Query ClinicalTrials.gov for trial registry data — study design, outcomes, enrollment, and results. Use for evidence on trial design, endpoints, and landscape analysis.
category: databases
tags: [clinical-trials, registry, endpoints, evidence, trial-design]
disable-model-invocation: true
---

# ClinicalTrials.gov

The registry records what was planned; the results section records what was
found. The gap between them is a research finding in itself.

## The API

```python
import requests

r = requests.get("https://clinicaltrials.gov/api/v2/studies",
                 params={"query.cond": "autism",
                         "query.intr": "intervention",
                         "filter.overallStatus": "RECRUITING",
                         "pageSize": 100}).json()
for study in r["studies"]:
    p = study["protocolSection"]
    print(p["identificationModule"]["nctId"], p["statusModule"]["overallStatus"])
```

## Study design fields

- **Phase:** 0/I/II/III/IV, and early phase 1. Each answers a different question.
- **Allocation:** randomized vs non-randomized.
- **Masking:** open label, single, double, triple. Blinding is a design property
  that predicts bias.
- **Primary vs secondary outcomes.** Pre-specified primary outcomes are the
  confirmatory ones; secondary/exploratory outcomes are hypothesis-generating.
- **Enrollment (actual vs anticipated).** Actual enrollment is in the results.

## Endpoint interpretation

- **Pre-specified endpoints** are what the trial is powered for. A result on an
  endpoint not in the registry is post-hoc.
- **Outcome measures are named and timed.** "Improvement at 12 weeks" vs
  "improvement" are different outcomes.
- **Surrogate vs clinical endpoint.** A biomarker change is not a clinical
  benefit unless validated as a surrogate.

## Results data

- **Reported results are submitted by the sponsor** and vary in completeness.
- **Compare the results to the pre-specified plan.** Unreported primary
  outcomes are a finding (compare to the registry entry's date).
- **Adverse events** are reported by arm; check the denominator (events per
  patient vs per event).

## Landscape analysis

- **Status counts** by phase and condition reveal the pipeline.
- **Terminated/withdrawn studies** and their stated reasons are informative.
- **Time from registration to completion** is a field-level metric.
- **Geographic distribution** and enrollment size.

## Reporting

State: the query and the date, the NCT IDs, the design (phase, allocation,
masking), the pre-specified primary outcome(s), the enrollment, the status, the
results availability, and — for any claim about effectiveness — whether it comes
from a pre-specified primary endpoint in a completed trial.

## Anti-patterns

- Citing a trial's results without checking the pre-specified primary outcome.
- Treating a secondary or exploratory endpoint as confirmatory.
- Counting registered trials as evidence of efficacy.
- Ignoring the results/registry discrepancy.
- Citing "results" for a study with no posted results.
