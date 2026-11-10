---
name: structure-prediction
description: Predict and validate protein structures — AlphaFold, ESMFold, RoseTTAFold, and model quality assessment. Use for structure prediction with correct confidence interpretation.
category: chemistry
tags: [alphafold, structure-prediction, protein-folding, plddt, modeling]
disable-model-invocation: true
---

# Structure Prediction

Structure prediction outputs are models with per-residue confidence. The
confidence, not the model, is what licenses a structural claim.

## Tools

| Tool | Strength | Output |
|---|---|---|
| AlphaFold2/3 (ColabFold, local) | Accuracy, complexes (AF3), ligands (AF3) | Model + pLDDT + PAE |
| ESMFold | Fast, large scale | Model + pLDDT |
| RoseTTAFold / RFDiffusion | Complexes, design | Model + confidence |
| Swiss-Model | Homology modeling | Model + GMQE/QMEAN |
| I-TASSER / MODELLER | Comparative modeling | Model + DOPE |

## The confidence metrics

- **pLDDT** (per-residue, 0–100): > 90 high, 70–90 confident, 50–70 low,
  < 50 likely disordered.
- **PAE** (predicted aligned error): inter-domain confidence — high PAE between
  domains means the relative orientation is uncertain.
- **pTM** (predicted TM-score): overall fold confidence.

**Never describe a region with pLDDT < 70 as a structural finding.** State the
pLDDT for any region discussed.

## Using a predicted structure

1. **Check the confidence** before anything else. A model with low confidence in
   the active site is not usable for docking.
2. **Verify against experimental homologs** where they exist. Superpose and
   report RMSD/TM-score.
3. **Predicted structures have no ligands, cofactors, or PTMs** unless
   explicitly modeled (AF3 can include them).
4. **Disordered regions** (low pLDDT) are often functional — do not delete them
   and call the model complete.

## Template-based modeling

- **Homology modeling** requires > 30% sequence identity for a reliable fold;
  the alignment is the critical step.
- **Loop modeling** is the weakest part; report loop confidence.
- **Protonation and side-chain placement** affect any downstream computation.

## Validation

- **Stereochemistry:** Ramachandran, rotamers, clashes (MolProbity).
- **Physical plausibility:** buried unsatisfied polar atoms, packing.
- **Against experimental data** where available: SAXS, cross-linking, mutagenesis,
  HDX.
- **A model that fails a known experimental constraint is wrong**, regardless of
  the confidence score.

## Reporting

State: the tool and its version, the input sequence and any templates used, the
per-residue confidence (pLDDT) with a figure, the PAE for multi-domain claims,
the validation metrics (MolProbity, comparison to homologs), the regions of low
confidence and their handling, and the explicit distinction between predicted
and experimental structures.

## Anti-patterns

- Presenting a predicted structure as an experimental one.
- Making a structural claim about a low-pLDDT region.
- Ignoring PAE for inter-domain orientation claims.
- Docking to a model without checking the pocket's confidence.
