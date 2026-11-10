---
name: proteomics
description: Analyze proteomics data — mass spectrometry, protein identification, quantification, and post-translational modifications. Use for MS-based protein analysis.
category: biology
tags: [proteomics, mass-spectrometry, quantification, peptides, modifications]
disable-model-invocation: true
---

# Proteomics

Protein-level inference from peptide-level measurements. The protein inference
and the FDR control are what make a proteomics result credible.

## The pipeline

```
raw MS → peak processing (MaxQuant, DIA-NN, FragPipe) → peptide identification
  → protein inference → quantification → differential analysis
```

## Identification

- **Database search** (Andromeda, Comet, MS-GF+) with the database and its
  version. Include decoys for FDR.
- **FDR control** at the peptide and protein level (target-decoy, 1% FDR).
  Report the FDR and how it was computed.
- **Variable modifications** (oxidation, acetylation) must be specified; missed
  cleavages allowed.
- **Semi-tryptic** searches increase identifications but also false positives.

## Protein inference

- **The protein inference problem:** peptides map to multiple proteins (protein
  groups). Report the inference method (razor peptides, unique peptides).
- **A protein identified by shared peptides only is a group, not a single
  protein.** Report it as a protein group.

## Quantification

| Method | Level | Notes |
|---|---|---|
| Label-free (LFQ) | Peptide/protein | Requires careful normalization |
| TMT/iTRAQ | Peptide | Ratio compression; batch effects |
| SILAC | Peptide | Metabolic labeling, very accurate |
| DIA (SWATH) | Peptide | Deep coverage, consistent |

- **Normalization** is essential; state the method.
- **Missing values** (missing not at random) — imputation changes results; state
  the method and its assumptions.
- **The protein is the unit**, not the peptide. Aggregate with the stated method.

## Post-translational modifications

- **Enrichment** (phospho, glyco) before MS; the enrichment efficiency affects
  what is seen.
- **Localization probability** (Ascore, PTMProphet) for the modified site; a
  modification without localization is a class, not a site.
- **Occupancy** is not measured by standard quantification; do not report
  stoichiometry from abundance.

## Statistical analysis

- **Per-protein tests** with FDR correction (BH).
- **Mixed models** for repeated measures.
- **Pathway analysis** on the ranked list (see `pathway-analysis`).

## Reporting

State: the MS instrument and acquisition method, the search engine and its
parameters, the database and version, the FDR control and its level, the protein
inference method, the quantification method and normalization, the missing-value
handling, the number of proteins quantified, the statistical test with FDR, and
the PTM localization confidence where relevant.

## Common errors

- No FDR control.
- Protein groups reported as single proteins.
- Missing-value imputation without stating the method.
- PTM site claims without localization probability.
- Normalization omitted or unreported.
