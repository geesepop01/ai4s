---
name: molecule-visualization
description: Visualize molecules and molecular properties for analysis and communication. Use for 2D/3D depictions, property mapping, and molecular figures.
category: visualization
tags: [molecules, depiction, 3d, properties, chemistry]
disable-model-invocation: true
---

# Molecule Visualization

Molecular figures must be chemically accurate (see `molecular-visualization` for
structures) and, when properties are shown, must map the property correctly to
the atoms.

## 2D property mapping

```python
from rdkit import Chem
from rdkit.Chem import Draw, AllChem
from rdkit.Chem.Draw import rdMolDraw2D

mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")
AllChem.Compute2DCoords(mol)

# Highlight atoms by a property (e.g. contribution to LogP)
contribs = [0.1, -0.3, 0.5, ...]  # per-atom values
d = rdMolDraw2D.MolDraw2DCairo(500, 400)
rdMolDraw2D.PrepareAndDrawMolecule(d, mol, highlightAtoms=list(range(mol.GetNumAtoms())),
                                   highlightAtomColors={i: (1,0,0,0.3) for i in range(mol.GetNumAtoms())})
d.FinishDrawing()
```

## Conformers and 3D

- **Ensemble depiction** for flexible molecules: show 2–3 representative
  conformers, not one.
- **Pharmacophore overlay** when comparing a series: aligned on the shared core.
- **Color by property** (electrostatic potential, partial charge) with a
  legend and its scale.

## Series visualization

- **Grid layout** with a consistent depiction and an R-group table.
- **SAR table** with structure + property columns; the reader should see the
  structure-activity relationship in one view.
- **Scaffold highlighting** to show what is constant and what varies.

## Interaction visualization

For protein-ligand complexes (see `molecular-visualization`):

- **2D interaction diagram** (LigPlot+, PLIP) showing H-bonds, hydrophobic
  contacts, salt bridges.
- **3D view** with the ligand as thick sticks, key residues as thin sticks,
  H-bonds as dashed lines with distances.
- **Label distances** in Å for the interactions you claim.

## Property surfaces

- **Electrostatic potential** (from QM or force-field charges) on the molecular
  surface; state the method and the charge model.
- **Lipophilicity (LogP) mapping** — contribution per atom is method-dependent.

## Accuracy rules

- Correct valence, stereochemistry, and protonation state at the relevant pH.
- Consistent bond depiction and font size across panels.
- Legend for every color and every highlight.
- Any property mapped to atoms states its computation method.

## Before shipping

- [ ] Structure is chemically correct (stereo, protonation).
- [ ] Property mapping method stated.
- [ ] Legend and color scale present.
- [ ] Labels legible at final size.
- [ ] Consistent depiction across a series.
