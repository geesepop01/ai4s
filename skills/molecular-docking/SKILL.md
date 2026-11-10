---
name: molecular-docking
description: Perform and evaluate molecular docking — protein/ligand preparation, docking protocols, pose validation, and scoring interpretation. Use for structure-based virtual screening.
category: chemistry
tags: [docking, virtual-screening, binding, poses, scoring]
---

# Molecular Docking

Docking predicts binding poses and scores them. Both are approximations: the
pose is a search result and the score is a crude energy estimate. Neither is a
binding affinity.

## The workflow

```
protein preparation → pocket definition → ligand preparation → docking
  → pose clustering → visual inspection → rescoring/validation
```

## Protein preparation

- **Structure choice:** high resolution, relevant conformation, ligand-bound
  pocket if possible (induced fit matters).
- **Protonation** at the assay pH; His tautomers change H-bond networks.
- **Missing residues/loops** in the pocket are fatal; check.
- **Cofactors, waters, and ions:** conserved waters in the pocket often matter.
  Decide explicitly and state it.
- **Remove the co-crystallized ligand** (keep it for validation) and minimize
  the protein with the pocket restrained.

## Ligand preparation

- **Protonation and tautomer** at the target pH (see `rdkit`).
- **3D conformers** generated with a defined method and seed.
- **Stereochemistry** specified; undefined stereocenters should be enumerated.
- **Charge states** consistent with the docking tool.

## Docking

```bash
# AutoDock Vina
vina --receptor protein.pdbqt --ligand ligand.pdbqt \
     --center_x 12.3 --center_y 45.6 --center_z 78.9 \
     --size_x 20 --size_y 20 --size_z 20 \
     --exhaustiveness 32 --num_modes 9 --out out.pdbqt
```

- **Grid box** centered on the known binding site and sized to cover it. A box
  too small misses poses; too large wastes search.
- **Exhaustiveness** high enough for reproducibility (run twice; poses should be
  stable).
- **Report the software and version**, the parameters, and the search settings.

## Pose validation

**A docking run is only credible if the protocol reproduces a known pose:**

1. **Redock the co-crystallized ligand.** RMSD < 2 Å is the standard criterion.
   If the protocol cannot reproduce the crystal pose, it cannot be trusted on
   new ligands.
2. **Pose clustering.** Report the dominant cluster and its population.
3. **Visual inspection** of the top poses: H-bonds, hydrophobic contacts,
   clashes, buried unsatisfied polar atoms.
4. **Scoring is not affinity.** A score is a ranking heuristic; do not report it
   as kcal/mol of binding energy.

## Scoring and rescoring

- **Vina/Glide score** ranks within one protocol; cross-protocol comparison is
  invalid.
- **Rescoring** (MM-GBSA, MM-PBSA) improves ranking but still carries large
  error. Report it as a relative score with its limitations.
- **Ensemble docking** (multiple receptor conformations) accounts for protein
  flexibility; report which conformations.

## Reporting

State: the protein structure and its preparation (protonation, minimization,
water/cofactor decisions), the ligand preparation (tautomer, protonation,
stereo, seed), the docking software and version with parameters, the grid box,
the redocking RMSD for protocol validation, the pose cluster analysis, the
visual inspection criteria, and the explicit statement that docking scores are
not binding affinities.

## Anti-patterns

- Reporting a docking score as a binding energy.
- No redocking validation.
- Ignoring protonation state.
- Presenting one pose as "the" binding mode without clustering or inspection.
