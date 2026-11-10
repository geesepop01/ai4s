---
name: crispr-design
description: Design and analyze CRISPR experiments — guide RNA design, off-target assessment, editing outcomes, and screening analysis. Use for genome editing and CRISPR screens.
category: biology
tags: [crispr, grna, genome-editing, screens, knockout]
disable-model-invocation: true
---

# CRISPR Design

CRISPR experiments fail at the design stage: bad guides, off-targets, or a
screen analysis that confuses essentiality with the phenotype.

## Guide RNA design

```python
# Benchling, CHOPCHOP, CRISPRscan, or the Broad's tools
# Key parameters:
# - On-target score (Rule Set 2, DeepCRISPR)
# - Off-target score (CFD, MIT specificity score)
# - Position relative to the functional domain / start codon
# - GC content 40-70%
# - Avoid homopolymers and poly-T (Pol III terminator)
```

- **Position matters:** for knockout, target early constitutive exons shared by
  all isoforms; avoid the first ~10% and the last ~10% of the coding sequence
  (alternative start/stop can rescue).
- **For CRISPRi/a:** target the TSS (window -50 to +300 for CRISPRi).
- **Design 3–5 guides per gene** for redundancy in a screen.

## Off-target assessment

- **In silico:** CFD score, Cas-OFFinder; consider sites with up to 3–4
  mismatches, especially in the PAM-proximal seed region.
- **Empirical:** GUIDE-seq, CIRCLE-seq, DISCOVER-seq for genome-wide off-target
  mapping when the application demands it.
- **Report the top off-target sites** and their scores.

## Editing outcomes

- **NHEJ indels** are heterogeneous; quantify the spectrum, not just "edited."
- **HDR** is inefficient without a donor and cell-cycle manipulation.
- **Base editors / prime editors** have their own bystander and off-target
  profiles (RNA off-targets for base editors).
- **Verify by amplicon sequencing** and report the editing efficiency and the
  allele spectrum.

## Screen analysis (MAGeCK, BAGEL)

```bash
mageck test -t treated.fastq -c control.fastq --norm-method median -k library.csv
```

- **The library and its representation** matter: low-coverage guides are noisy.
- **Essential gene control** (BAGEL): a screen that cannot recover known
  essentials is not working.
- **Multiple guides per gene** — the gene-level score aggregates them.
- **False discovery** correction at the gene level.

## Experimental controls

- **Non-targeting guides** (negative control).
- **Safe-targeting guides** (cutting without target disruption).
- **Positive controls** (known essential genes, known phenotype genes).
- **Multiple guides per gene** and rescue experiments (cDNA resistant to the
  guide) for validation.

## Reporting

State: the design tool and its scores, the guide sequences and their positions,
the off-target assessment and its method, the delivery method and the editing
efficiency measured by sequencing, the allele spectrum, the screen coverage and
the analysis tool with its normalization, the control guides and their behavior,
and the validation (rescue, multiple guides, orthogonal method).

## Common errors

- Targeting an exon not shared by all isoforms.
- No off-target assessment.
- Editing efficiency claimed from a reporter, not the endogenous locus.
- Screen analysis without essential-gene recovery as a sanity check.
- No rescue experiment for a phenotype claim.
