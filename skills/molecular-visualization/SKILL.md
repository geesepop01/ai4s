---
name: molecular-visualization
description: Visualize molecules, proteins, and chemical structures for analysis and publication — 2D depictions, 3D conformers, structure overlays, and binding-site views. Use for any molecular figure or structural inspection.
category: visualization
tags: [molecules, structures, rdkit, pymol, 3d, chemistry]
disable-model-invocation: true
---

# Molecular Visualization

A molecular figure must be chemically accurate and visually legible. This skill
covers 2D depictions, 3D structural views, and the publication rules for both.

## 2D depictions (RDKit)

```python
from rdkit import Chem
from rdkit.Chem import Draw, AllChem, Descriptors

mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")  # aspirin
AllChem.Compute2DCoords(mol)

# Single molecule with atom indices
Draw.MolToImage(mol, size=(400, 400), kekulize=True)

# Series with labels
mols = [Chem.MolFromSmiles(s) for s in smiles_list]
img = Draw.MolsToGridImage(mols, molsPerRow=4, subImgSize=(300, 300),
                           legends=[f"{i}: {name}" for i, name in enumerate(names)])
img.save("figures/compounds.png")
```

**Rules:** consistent bond lengths and font sizes across a series; atom labels
only where needed (heteroatoms and specified positions); a legend mapping
substructure highlights to their meaning.

## 3D structures

**From a PDB/mmCIF file** (PyMOL, NGLview, or MDAnalysis):

```python
import nglview as nv
from rdkit import Chem
from rdkit.Chem import AllChem

mol = Chem.AddHs(Chem.MolFromSmiles(smiles))
AllChem.EmbedMolecule(mol, randomSeed=42)
AllChem.MMFFOptimizeMolecule(mol)
Chem.MolToMolFile(mol, "conformer.sdf")
```

**PyMOL for publication structural views:**

```
fetch 1tup
hide cartoon
show sticks, resn HOH around 5
spectrum b, blue_white_red, chain A
ray 2400, 1800
png figures/active_site.png, dpi=300
```

## Choosing the view

| Question | View |
|---|---|
| What does the ligand look like? | 2D depiction, or 3D stick with implicit H |
| How does the ligand bind? | Binding-site residues as sticks, ligand as thick sticks, surface clipped |
| Are two structures similar? | Superposition with RMSD label; color by chain or by confidence |
| What varies across a series? | 2D grid with a consistent depiction; R-groups highlighted |
| Where is the pocket? | Surface colored by hydrophobicity/electrostatics, ligand in sticks |

## Publication rules

- **Resolution:** render at 300+ DPI; PNG for slides, TIFF/PDF for print.
- **Color:** use colorblind-safe schemes; do not encode meaning by color alone —
  add labels or shapes. For structures, chain colors and property gradients must
  have a legend.
- **Consistent scale** across a series of panels. Do not let a viewer compare two
  structures that are rendered at different zoom.
- **Lighting and depth cueing** improve readability; flat renders are hard to
  parse. But do not let shading obscure an atom you are claiming something about.
- **Label the important features** — residue numbers, distances, mutation sites —
  in the figure, not only in the caption.

## Structure data hygiene

- Record the PDB accession and the exact chain/residue range depicted.
- For predicted structures (AlphaFold), state the model version and the pLDDT
  confidence; do not present a low-confidence loop as a finding.
- For docking poses, state the pose rank and the scoring function; a single pose
  is not evidence of a binding mode.

## Before shipping a molecular figure

- [ ] Chemistry correct: valence, stereochemistry, protonation state at the
      relevant pH.
- [ ] Consistent depiction style across panels.
- [ ] Labels legible at final size.
- [ ] Legend present for every color and every highlight.
- [ ] Source structure accession and version stated in the caption.
