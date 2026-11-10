---
name: nmr-compound-inference
description: Analyze NMR spectra and infer compound identity — peak assignment, library comparison, and structure elucidation. Use for NMR-based identification and characterization.
category: chemistry
tags: [nmr, spectroscopy, structure-elucidation, identification, peaks]
disable-model-invocation: true
---

# NMR Compound Inference

NMR is the most structurally informative routine technique. Inference from a
spectrum requires accounting for the solvent, referencing, and the fact that
many compounds share a pattern.

## The data

```python
import nmrglue as ng
import numpy as np

dic, data = ng.bruker.read_pdata("1/pdata/1")   # processed
uc = ng.fileiobase.uc_from_udic(dic)
ppm_scale = uc.ppm_scale()
```

**Record:** nucleus (1H, 13C), frequency, solvent, temperature, referencing
(TMS or residual solvent), pulse sequence, and processing (window function,
zero-filling).

## Peak picking and integration

- **Reference the spectrum correctly** (TMS at 0, or residual solvent: DMSO
  2.50, CDCl3 7.26, MeOD 3.31). A referencing error shifts everything.
- **Integration** gives relative proton counts; normalize to a known group.
- **Coupling constants (J)** in Hz carry structural information (cis/trans,
  axial/equatorial, ortho/meta coupling).
- **Multiplicity** and **multiplet structure** constrain the fragment.

## Interpretation

| Region (1H) | Typical assignment |
|---|---|
| 0.5–2.0 | Alkyl CH |
| 2.0–3.0 | Allylic/α-carbonyl |
| 3.3–4.5 | O-CH, N-CH |
| 6.5–8.5 | Aromatic |
| 9.5–10.5 | Aldehyde |
| 10–13 | Carboxylic acid (broad) |

**Chemical shift is diagnostic but not unique.** Confirm with 2D (COSY, HSQC,
HMBC) when the structure is the question.

## Library comparison

- **Compare to reference spectra** (BMRB, HMDB, SDBS, nmrshiftdb2).
- **Match multiple peaks, not one.** A single peak match is not identification.
- **Solvent and concentration shift peaks**; a reference in a different solvent
  is approximate.
- **Report the match quality:** number of matched peaks, chemical shift
  tolerance, and the residual.

## Structure elucidation

1. **Degree of unsaturation** from the molecular formula (MS provides this).
2. **1H integration and multiplicity** → fragment counts.
3. **13C/DEPT** → carbon types.
4. **COSY** → 1H-1H connectivity.
5. **HSQC** → 1H-13C one-bond.
6. **HMBC** → 1H-13C two/three-bond (connects fragments).
7. **Assemble and verify** against the full data.

**A structure proposed from 1H alone is a hypothesis.** Report the evidence level.

## Reporting

State: the nucleus, solvent, referencing standard, temperature, the peak list
with chemical shifts, multiplicities, J values, and integrals, the library
comparison with its match quality, the proposed structure and its evidence level
(1H only / +2D / +HRMS), and the alternative structures that fit the data.

## Anti-patterns

- Identifying a compound from one matching peak.
- Ignoring solvent effects when comparing to a library.
- Reporting a structure without stating its evidence level.
- Unreferenced chemical shifts.
