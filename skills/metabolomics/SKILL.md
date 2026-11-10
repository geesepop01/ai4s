---
name: metabolomics
description: Analyze metabolomics data — LC-MS/GC-MS processing, identification, quantification, and pathway analysis. Use for untargeted and targeted metabolomics.
category: biology
tags: [metabolomics, mass-spectrometry, metabolites, identification, nmr]
disable-model-invocation: true
---

# Metabolomics

Metabolomics identifies and quantifies small molecules. Feature detection,
identification confidence, and batch correction determine what the data can
support.

## The pipeline

```
raw → peak picking/alignment (MZmine, XCMS, MS-DIAL) → blank subtraction →
  normalization → identification → statistics → pathway analysis
```

## Feature detection

- **Peak picking parameters** (S/N threshold, peak width) determine what is
  detected. Report them.
- **Alignment** across samples; report the RT and m/z tolerances.
- **Blank subtraction:** features in blanks are contaminants.
- **Isotope/adduct grouping:** one compound gives several features. Group them
  (CAMERA, MS-DIAL) before counting metabolites.

## Identification (MSI levels)

| Level | Evidence | Confidence |
|---|---|---|
| 1 | Standard, 2+ orthogonal properties (RT, MS/MS) | Confirmed |
| 2 | MS/MS spectral library match | Putative |
| 3 | Class/diagnostic evidence | Putative class |
| 4 | Unknown feature | Unknown |

**Report the MSI level for every named metabolite.** Level 2 is not confirmation.

## Quantification

- **Untargeted:** relative quantification (peak area), normalized to internal
  standards or total signal. Report the normalization.
- **Targeted:** absolute quantification with calibration curves and isotope
  standards. Report the curve and its range.
- **Missing values** are common (below detection); imputation changes results.

## Batch correction and QC

- **Pooled QC samples** every N injections; QC-based signal correction
  (QC-RLSC).
- **Randomized run order.**
- **Internal standards** for retention time and signal drift.
- **Report the CV in QCs**; a feature with high QC CV is unreliable.

## Statistics

- **Multivariate (PCA, PLS-DA)** for overview; **report cross-validation and
  permutation tests** for PLS-DA (overfits easily).
- **Univariate** with FDR correction.
- **The subject/sample is n.**

## Pathway analysis

Use the identified metabolites with their MSI levels weighted; a pathway
enriched from level-4 features is not a finding. Report the pathway database and
the background (all detected features, not the whole metabolome).

## Reporting

State: the platform and acquisition, the peak detection and alignment parameters,
the blank subtraction, the normalization and batch correction, the QC sample CV,
the MSI identification levels, the quantification method, the statistical
analysis with cross-validation and FDR, the number of features and identified
metabolites, and the pathway background.

## Common errors

- Naming metabolites from accurate mass alone (MSI 3–4).
- No QC-based batch correction.
- PLS-DA without cross-validation or permutation testing.
- Counting features as metabolites without adduct/isotope grouping.
