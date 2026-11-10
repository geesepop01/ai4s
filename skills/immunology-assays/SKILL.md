---
name: immunology-assays
description: Design and interpret immunology assays — ELISA, flow cytometry, ELISpot, cytokine panels, and immune phenotyping. Use for immune measurement and immunological research.
category: medicine
tags: [immunology, elisa, flow-cytometry, cytokines, elispot, assays]
disable-model-invocation: true
---

# Immunology Assays

Immune measurements are prone to specific, well-known artifacts: plate effects,
cytokine pleiotropy, gating subjectivity, and the difference between frequency
and function. This skill covers the design and interpretation discipline.

## ELISA / immunoassay

- **Standard curve on every plate**, 8 points, 4- or 5-parameter fit. Never
  interpolate from a previous plate.
- **Spike-and-recovery** and **linearity of dilution** to detect matrix effects.
  Recovery 80–120% is the usual acceptance band.
- **Duplicates at minimum**, and report the CV. CV > 20% between duplicates →
  the well is suspect.
- **Sensitivity/LOD/LOQ** stated, and values below them reported as such, not as
  numbers.
- **Hook effect** at high analyte concentration: a very high sample can read low.
  Dilute and re-run suspiciously low samples.

## Cytokine panels

- **Multiplex panels** have cross-reactivity; report the panel and its
  validation.
- **Cytokines are pleiotropic and context-dependent.** IL-6 is not "pro-
  inflammatory" in all contexts. Report the finding, not a label.
- **Multiple testing:** a 30-plex panel is 30 tests. Correct for multiplicity
  and state the family.
- **Serum vs plasma vs supernatant** give different values. State the matrix.

## Flow cytometry

- **Controls:** unstained, single-stained (for compensation), FMO (fluorescence
  minus one) for every gate set by threshold. Isotype controls are less useful
  than FMO.
- **Compensation** must be computed from single-stained controls on the same
  instrument settings. Miscompensation creates false double-positives.
- **Gating:** report the full gating strategy as a figure. A gate is a decision;
  it must be reproducible.
- **Report both frequency and absolute count** where the clinical/biological
  claim depends on it; frequency alone can be misleading when one population
  changes.
- **Viability dye** to exclude dead cells — dead cells bind antibody
  non-specifically.
- **Batch normalization** across acquisition days (beads, reference sample).

## ELISpot / functional assays

- **Spots are counted with a stated threshold** and an automated counter where
  possible. Manual counting is a source of batch bias.
- **Report background subtraction** and the criteria for a positive response
  (e.g. > 2× background and > 10 spots/10⁶ cells).
- **Frequency ≠ function.** A high frequency of cytokine-producing cells is not
  the same as a strong functional response; measure both where the claim needs
  it.

## Common artifacts

| Artifact | Control |
|---|---|
| Plate/edge effects | Randomize, include controls on every plate |
| Matrix effect in ELISA | Spike-recovery, dilution linearity |
| Non-specific binding | Fc block, viability dye, FMO controls |
| Batch drift | Reference sample, bead normalization |
| Freeze-thaw degradation | Aliquot once, record the number of cycles |

## Reporting

State: the assay and kit/catalog numbers, the sample matrix and handling, the
standard curve and its fit, the LOD/LOQ, the replicate structure and CVs, the
gating strategy (for flow) as a figure, the compensation and controls, the
background subtraction and positivity criteria, and the multiplicity correction
for panels.
