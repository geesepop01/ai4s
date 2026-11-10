---
name: cheminformatics
description: Cheminformatics toolkit with RDKit. Use for molecular property calculation, SMILES manipulation, molecular fingerprints, similarity search, substructure matching, and molecule visualization.
category: chemistry
tags: [chemistry, rdkit, molecules, smiles, fingerprints, drug-discovery]
disable-model-invocation: true
---

# Cheminformatics (RDKit)

## Overview

RDKit is the standard open-source toolkit for cheminformatics. Use it for molecular
property calculation, fingerprint generation, similarity search, and substructure matching.

## Installation

```bash
pip install rdkit-pypi
```

## Core Operations

### Molecule Creation and Properties

```python
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, rdMolDescriptors

# Create molecule from SMILES
mol = Chem.MolFromSmiles('CC(=O)Oc1ccccc1C(=O)O')  # Aspirin
print(f"Atoms: {mol.GetNumAtoms()}")
print(f"Molecular Weight: {Descriptors.MolWt(mol):.1f}")
print(f"LogP: {Descriptors.MolLogP(mol):.2f}")
print(f"H-bond donors: {Lipinski.NumHDonors(mol)}")
print(f"H-bond acceptors: {Lipinski.NumHAcceptors(mol)}")
print(f"Rotatable bonds: {Descriptors.NumRotatableBonds(mol)}")

# Lipinski Rule of Five
def lipinski_check(mol):
    mw = Descriptors.MolWt(mol)
    logp = Descriptors.MolLogP(mol)
    hbd = Lipinski.NumHDonors(mol)
    hba = Lipinski.NumHAcceptors(mol)
    violations = sum([mw > 500, logp > 5, hbd > 5, hba > 10])
    return violations, {'MW': mw, 'LogP': logp, 'HBD': hbd, 'HBA': hba}

violations, props = lipinski_check(mol)
print(f"Lipinski violations: {violations}/4")
```

### Fingerprints and Similarity

```python
from rdkit import DataStructs
from rdkit.Chem import AllChem

# Generate Morgan fingerprints (ECFP-like)
mol1 = Chem.MolFromSmiles('CC(=O)Oc1ccccc1C(=O)O')  # Aspirin
mol2 = Chem.MolFromSmiles('CC(=O)Nc1ccc(O)cc1')  # Acetaminophen

fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, radius=2, nBits=2048)
fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, radius=2, nBits=2048)

# Tanimoto similarity
similarity = DataStructs.TanimotoSimilarity(fp1, fp2)
print(f"Tanimoto similarity: {similarity:.3f}")

# Compare against a library
molecules = [Chem.MolFromSmiles(smi) for smi in ['CCO', 'CCCO', 'c1ccccc1']]
fps = [AllChem.GetMorganFingerprintAsBitVect(m, 2, nBits=2048) for m in molecules]
sims = [DataStructs.TanimotoSimilarity(fp1, fp) for fp in fps]
print("Similarities:", [f"{s:.3f}" for s in sims])
```

### Substructure Search

```python
from rdkit import Chem

# Find molecules containing a substructure
pattern = Chem.MolFromSmiles('c1ccccc1')  # Benzene ring
molecules = [
    ('Aspirin', 'CC(=O)Oc1ccccc1C(=O)O'),
    ('Acetaminophen', 'CC(=O)Nc1ccc(O)cc1'),
    ('Caffeine', 'Cn1c(=O)c2c(ncn2C)n(C)c1=O'),
]

for name, smi in molecules:
    mol = Chem.MolFromSmiles(smi)
    if mol.HasSubstructMatch(pattern):
        matches = mol.GetSubstructMatch(pattern)
        print(f"{name}: contains benzene ring at atoms {matches}")
    else:
        print(f"{name}: no benzene ring")
```

### SMILES Manipulation

```python
from rdkit import Chem
from rdkit.Chem import AllChem, Draw

# Canonical SMILES
smi = 'C(=O)OCC'  # Non-canonical
mol = Chem.MolFromSmiles(smi)
canonical = Chem.MolToSmiles(mol)
print(f"Canonical: {canonical}")

# Generate 3D coordinates
mol = Chem.MolFromSmiles('CC(=O)Oc1ccccc1C(=O)O')
mol = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol, AllChem.ETKDG())
AllChem.MMFFOptimizeMolecule(mol)

# Save as SDF
writer = Chem.SDWriter('molecule.sdf')
writer.write(mol)
writer.close()
```

### Molecule Visualization

```python
from rdkit import Chem
from rdkit.Chem import Draw

mols = [Chem.MolFromSmiles(smi) for smi in ['CCO', 'CCCO', 'c1ccccc1']]
img = Draw.MolsToGridImage(mols, molsPerRow=3, subImgSize=(300, 300))
img.save('molecules.png')
```

## Best Practices

1. Always use canonical SMILES for comparisons
2. Handle sanitization failures gracefully (try/except around MolFromSmiles)
3. Use Morgan fingerprints (radius=2, 2048 bits) as default
4. Apply Lipinski's Rule of Five for drug-likeness filtering
5. Use Tanimoto similarity as the default similarity metric
6. For large libraries, use fingerprint-based screening before detailed comparison
