---
name: fda-database
description: Query openFDA for drug labels, adverse events, recalls, and device data. Use for pharmacovigilance and regulatory evidence assessment.
category: databases
tags: [fda, pharmacovigilance, adverse-events, labels, regulatory]
disable-model-invocation: true
---

# openFDA

openFDA exposes FDA data: drug labels, adverse event reports (FAERS), recalls,
and device reports. Its strength is scale; its critical limitation is that
spontaneous reporting data cannot establish incidence or causation.

## The API

```python
import requests

# Drug label
r = requests.get("https://api.fda.gov/drug/label.json",
                 params={"search": "openfda.brand_name:Tylenol", "limit": 1}).json()

# Adverse events
r = requests.get("https://api.fda.gov/drug/event.json",
                 params={"search": "patient.drug.openfda.brand_name:Tylenol+AND+patient.reaction.meddrapt:NAUSEA",
                         "count": "patient.reaction.meddrapt.exact"}).json()

# Recalls
r = requests.get("https://api.fda.gov/drug/enforcement.json",
                 params={"search": "status:Ongoing", "limit": 10}).json()
```

## FAERS (adverse events) interpretation

**The single most important rule: report counts are not incidence rates.**

- **Spontaneous reporting** suffers from under-reporting (the "notoriety bias"
  — famous drugs get reported more), stimulated reporting, and no denominator.
- **A count is a signal, not a rate.** Do not compute "X% of patients
  experienced this."
- **Disproportionality analysis** (PRR, ROR, EBGM) is the standard signal
  detection method; report the metric and its confidence interval.
- **Confounding by indication** is pervasive: the event may be the disease, not
  the drug.
- **Duplicates** exist in FAERS; deduplication changes counts.

## Drug labels

- Labels reflect **approved indications, dosing, warnings, and
  contraindications.**
- **Off-label use** is legal and common but is not in the label; state when
  recommending outside labelling.
- **Label revisions** over time track safety findings; record the version/date.

## Recalls and enforcement

- **Classification (I/II/III)** reflects the risk severity.
- **A recall is a regulatory action, not an epidemiological finding.**

## Signal detection workflow

1. Define the drug (name, UNII, application number).
2. Define the event (MedDRA preferred term).
3. Query counts by disproportionality metric.
4. Check the time trend and the reporting source.
5. **Check the literature** for the signal's status — is it known, refuted, or
   under study?
6. Report as a signal requiring confirmation, never as a causal finding.

## Reporting

State: the API query exactly, the retrieval date, the database (FAERS, label,
enforcement), the count and the disproportionality metric with its interval, the
denominator caveat, the deduplication method, the confounders considered, and
the conclusion framed as a signal, not a rate or a cause.

## Anti-patterns

- Computing incidence from report counts.
- Calling a signal a causal association.
- Ignoring the reporting-bias and notoriety effects.
- Using a label statement as evidence of effectiveness for an off-label use.
