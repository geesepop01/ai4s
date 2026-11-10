---
name: clinvar-database
description: Query ClinVar for variant clinical significance with proper interpretation of submissions, conflicts, and review status. Use for any clinical variant interpretation.
category: databases
tags: [clinvar, variants, clinical, pathogenicity, interpretation]
disable-model-invocation: true
---

# ClinVar

ClinVar aggregates variant-disease assertions from submitters. Its value is the
submission record; its trap is treating the aggregate classification as a
definitive truth.

## The API

```python
import requests

# Variant summary
r = requests.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
                 params={"db": "clinvar", "term": "BRCA1[gene] AND pathogenic[clinsig]",
                         "retmode": "json"}).json()

# Structured variant data
r = requests.get("https://api.ncbi.nlm.nih.gov/variation/v0/refsnp/80357520").json()
```

## The classification hierarchy

```
Pathogenic
Likely pathogenic
Uncertain significance (VUS)
Likely benign
Benign
```

Plus: `Conflicting classifications`, `association`, `risk factor`, `drug
response`, `protective`, `affects`.

**Critical rules:**

- **VUS is not "probably fine."** A variant of uncertain significance means the
  evidence is insufficient. Do not collapse VUS into benign for a count.
- **Conflicting is a category, not an error.** Report the conflict and the
  number of submissions on each side.
- **Pathogenic for what?** The classification is for a specific disease and
  inheritance. A variant pathogenic for one condition may be irrelevant to
  another.

## Review status matters

| Stars | Meaning |
|---|---|
| ★★★★ | Practice guideline |
| ★★★ | Reviewed by expert panel |
| ★★ | Multiple submitters, no conflicts |
| ★ | Single submitter or conflicting |
| 0 | No assertion criteria provided |

**A one-star classification is not a three-star classification.** Report the
review status with any clinical claim.

## Evidence behind the classification

- **The assertion criteria** each submitter used (ACMG/AMP guidelines are the
  standard).
- **The submitter and the date.** Classifications change over time; an old
  submission may be superseded.
- **The condition** and the mode of inheritance.
- **Functional data, segregation, population frequency** — the evidence
  supporting the classification.

## Population frequency cross-check

A variant can be "pathogenic" in ClinVar and common in gnomAD; the frequency
constrains the classification (a common variant is rarely fully penetrant for a
severe rare disease). Check gnomAD frequency and ancestry distribution.

## Reporting

State: the variant identifier (rsID or VCV) with its version, the condition and
inheritance, the classification **and** its review status (stars), the number of
submissions and any conflict, the submitter(s) and date(s), the population
frequency from gnomAD with the ancestry breakdown, and the classification's
scope (it is condition-specific).

## Anti-patterns

- Reporting a classification without its review status.
- Treating VUS as benign or as pathogenic.
- Reporting "pathogenic" without naming the condition.
- Ignoring population frequency that contradicts a penetrance claim.
- Using a superseded RCV where the current VCV exists.
